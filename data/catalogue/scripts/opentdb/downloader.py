#!/usr/bin/env python3
"""
OpenTDB (Open Trivia Database) Question Downloader

This script downloads all trivia questions from the OpenTDB API and organizes them by category.
It implements proper rate limiting, session token management, and error handling.

Usage:
    python downloader.py [--output-dir PATH] [--reset-tokens] [--dry-run]

Features:
- Downloads all questions from all categories
- Respects API rate limits (1 request per 5 seconds)
- Uses session tokens to avoid duplicates
- Organizes data by category
- Resume capability for interrupted downloads
- Comprehensive logging and progress tracking
"""

import asyncio
import json
import logging
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from urllib.parse import urlencode

import aiohttp
import click
from asyncio_throttle import Throttler
from pydantic import BaseModel, Field
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import (
    BarColumn,
    Progress,
    SpinnerColumn,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
)
from rich.table import Table

# Configure rich console and logging
console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=console, rich_tracebacks=True)],
)
logger = logging.getLogger(__name__)


class Category(BaseModel):
    """OpenTDB Category model"""

    id: int
    name: str
    added_at: Optional[str] = None


class QuestionCount(BaseModel):
    """Question count for a category"""

    category_id: int
    total_question_count: int
    total_easy_question_count: int
    total_medium_question_count: int
    total_hard_question_count: int


class Question(BaseModel):
    """OpenTDB Question model"""

    category: str
    type: str  # "multiple" or "boolean"
    difficulty: str  # "easy", "medium", "hard"
    question: str
    correct_answer: str
    incorrect_answers: List[str]


class APIResponse(BaseModel):
    """OpenTDB API Response model"""

    response_code: int
    results: List[Dict] = Field(default_factory=list)


class DownloadStats(BaseModel):
    """Download statistics"""

    total_categories: int = 0
    completed_categories: int = 0
    total_questions: int = 0
    downloaded_questions: int = 0
    failed_requests: int = 0
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    end_time: Optional[datetime] = None


class OpenTDBDownloader:
    """
    OpenTDB API downloader with rate limiting and session management
    """

    BASE_URL = "https://opentdb.com/api.php"
    CATEGORY_URL = "https://opentdb.com/api_category.php"
    COUNT_URL = "https://opentdb.com/api_count.php"
    TOKEN_URL = "https://opentdb.com/api_token.php"

    # API constraints
    MAX_QUESTIONS_PER_REQUEST = 50
    RATE_LIMIT_SECONDS = 5.1  # Slightly above 5s to be safe

    # Response codes
    RESPONSE_CODES = {
        0: "Success",
        1: "No Results",
        2: "Invalid Parameter",
        3: "Token Not Found",
        4: "Token Empty",
        5: "Rate Limited",
    }

    def __init__(self, output_dir: Path, reset_tokens: bool = False):
        self.output_dir = output_dir
        self.reset_tokens = reset_tokens
        self.session_tokens: Dict[int, str] = {}
        self.stats = DownloadStats()

        # Create output directories
        self.categories_dir = output_dir / "categories"
        self.metadata_dir = output_dir / "metadata"
        self.tokens_dir = output_dir / "tokens"

        for dir_path in [self.categories_dir, self.metadata_dir, self.tokens_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

        # Rate limiter: 1 request per 5+ seconds
        self.throttler = Throttler(rate_limit=1, period=self.RATE_LIMIT_SECONDS)

    async def _make_request(
        self, session: aiohttp.ClientSession, url: str, params: Dict = None
    ) -> Dict:
        """Make a rate-limited HTTP request"""
        async with self.throttler:
            try:
                async with session.get(url, params=params or {}) as response:
                    if response.status == 200:
                        data = await response.json()
                        return data
                    else:
                        logger.error(f"HTTP {response.status} for {url}")
                        return {}
            except Exception as e:
                logger.error(f"Request failed for {url}: {e}")
                self.stats.failed_requests += 1
                return {}

    async def get_session_token(
        self, session: aiohttp.ClientSession, category_id: int = None
    ) -> Tuple[Optional[str], bool]:
        """Get or retrieve a global session token. Returns (token, is_new_token)"""
        token_file = self.tokens_dir / "global_token.json"

        if not self.reset_tokens and token_file.exists():
            try:
                with open(token_file, "r", encoding="utf-8") as f:
                    token_data = json.load(f)
                    token = token_data.get("token")
                    if token:
                        return token, False  # Existing token found
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(
                    f"Failed to load token from {token_file}: {e}. Requesting a new one."
                )

        # If we are here, we need a new token.
        logger.info("Requesting new session token...")
        params = {"command": "request"}
        response = await self._make_request(session, self.TOKEN_URL, params)

        if response and response.get("response_code") == 0:
            token = response.get("token")
            # Save token
            token_data = {
                "token": token,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "note": "This token is global and tracks questions across all categories",
            }
            with open(token_file, "w", encoding="utf-8") as f:
                json.dump(token_data, f, indent=2)

            return token, True  # New token generated

        logger.error(f"Failed to get session token: {response}")
        return None, True  # Failed to get a new token

    async def reset_session_token(
        self, session: aiohttp.ClientSession, token: str
    ) -> bool:
        """Reset a session token"""
        params = {"command": "reset", "token": token}
        response = await self._make_request(session, self.TOKEN_URL, params)
        return response.get("response_code") == 0

    async def get_categories(self, session: aiohttp.ClientSession) -> List[Category]:
        """Fetch all available categories and update the local list."""
        logger.info("Fetching categories from API...")

        response = await self._make_request(session, self.CATEGORY_URL)
        if not response or "trivia_categories" not in response:
            logger.error("Failed to fetch categories from API")
            return []

        fetched_categories_data = response["trivia_categories"]
        categories_file = self.metadata_dir / "categories.json"

        final_categories: Dict[int, Category] = {}

        if categories_file.exists():
            try:
                with open(categories_file, "r", encoding="utf-8") as f:
                    existing_data = json.load(f)
                for cat_data in existing_data:
                    final_categories[cat_data["id"]] = Category(**cat_data)
                logger.info(f"Loaded {len(final_categories)} existing categories.")
            except (json.JSONDecodeError, IOError) as e:
                logger.warning(
                    f"Could not read or parse {categories_file}, will create a new one. Error: {e}"
                )

        new_categories_added = 0
        now_iso = datetime.now(timezone.utc).isoformat()

        for cat_data in fetched_categories_data:
            if cat_data["id"] not in final_categories:
                cat_data["added_at"] = now_iso
                final_categories[cat_data["id"]] = Category(**cat_data)
                new_categories_added += 1

        if new_categories_added > 0:
            logger.info(f"Added {new_categories_added} new categories.")
            sorted_categories = sorted(final_categories.values(), key=lambda c: c.id)
            with open(categories_file, "w", encoding="utf-8") as f:
                json.dump(
                    [cat.dict(exclude_none=True) for cat in sorted_categories],
                    f,
                    indent=2,
                )
        else:
            logger.info("No new categories found.")

        sorted_list = sorted(final_categories.values(), key=lambda c: c.id)
        logger.info(f"Found/updated to {len(sorted_list)} total categories.")
        return sorted_list

    async def get_question_count(
        self, session: aiohttp.ClientSession, category_id: int
    ) -> Optional[QuestionCount]:
        """Get question count for a specific category"""
        params = {"category": category_id}
        response = await self._make_request(session, self.COUNT_URL, params)

        if response and "category_question_count" in response:
            count_data = response["category_question_count"]
            return QuestionCount(
                category_id=category_id,
                total_question_count=count_data["total_question_count"],
                total_easy_question_count=count_data["total_easy_question_count"],
                total_medium_question_count=count_data["total_medium_question_count"],
                total_hard_question_count=count_data["total_hard_question_count"],
            )

        return None

    async def download_questions(
        self,
        session: aiohttp.ClientSession,
        category_id: int,
        token: str,
        difficulty: str = None,
    ) -> List[Dict]:
        """Download all available questions for a specific category.

        This method downloads questions in batches of 50 until:
        - API returns code 1 (No Results) - category exhausted
        - API returns code 4 (Token Empty) - token exhausted
        - API returns empty results with success code - no more available

        Note: Session tokens track questions across ALL categories to prevent duplicates.
        Do NOT reset tokens mid-download as this will cause duplicate downloads.
        """
        questions: List[Dict] = []
        if not token:
            logger.error(f"No token provided for category {category_id}")
            return []

        logger.info(
            f"Category {category_id}: Starting recursive download with token {token[:10]}..."
        )
        batch_count = 0
        max_retries = 3
        retry_backoff_base = 10  # seconds

        while True:
            batch_count += 1
            logger.info(f"Category {category_id}: Requesting batch #{batch_count}...")
            params = {
                "amount": self.MAX_QUESTIONS_PER_REQUEST,
                "category": category_id,
                "encode": "base64",
                "token": token,
            }
            if difficulty:
                params["difficulty"] = difficulty

            # Retry logic for rate limits and network errors
            retry_count = 0
            response = None
            response_code = -1

            while retry_count <= max_retries:
                response = await self._make_request(session, self.BASE_URL, params)
                response_code = response.get("response_code", -1)
                batch_questions = response.get("results", [])

                # If we got a valid response (not a network/rate limit error), break retry loop
                if response_code != -1:
                    break

                # Rate limit or network error - retry with backoff
                retry_count += 1
                if retry_count <= max_retries:
                    backoff_time = retry_backoff_base * (2 ** (retry_count - 1))
                    logger.warning(
                        f"Category {category_id}: Rate limit or network error on batch #{batch_count}. "
                        f"Retry {retry_count}/{max_retries} after {backoff_time}s..."
                    )
                    await asyncio.sleep(backoff_time)
                else:
                    logger.error(
                        f"Category {category_id}: ✗ Failed after {max_retries} retries. Stopping download."
                    )
                    break

            # If we exhausted retries, stop the download
            if retry_count > max_retries and response_code == -1:
                break

            batch_questions = response.get("results", [])

            logger.info(
                f"Category {category_id}: Batch #{batch_count} - "
                f"Response code: {response_code}, Results: {len(batch_questions)} questions"
            )

            if response_code == 0:
                if batch_questions:
                    questions.extend(batch_questions)
                    logger.info(
                        f"Category {category_id}: ✓ Downloaded batch of {len(batch_questions)} questions "
                        f"(total so far: {len(questions)})"
                    )
                    logger.info(f"Category {category_id}: Continuing to next batch...")
                else:
                    # Empty response with success code - no more questions available
                    logger.info(
                        f"Category {category_id}: ⚠ API returned empty results with success code - "
                        f"all questions retrieved (total: {len(questions)})"
                    )
                    break
            elif response_code == 1:  # No more results for this category
                logger.info(
                    f"Category {category_id}: ⚠ API returned code 1 'No Results' - category exhausted "
                    f"(downloaded {len(questions)} questions)"
                )
                break
            elif response_code == 4:  # Token empty - exhausted the token pool
                logger.info(
                    f"Category {category_id}: Session token exhausted (code 4) after {len(questions)} questions. "
                    f"This is normal - token can only serve a limited number of questions per 6-hour window."
                )
                break
            else:
                error_msg = self.RESPONSE_CODES.get(
                    response_code, f"Unknown error code {response_code}"
                )
                logger.error(
                    f"Category {category_id}: ✗ API error - Response code {response_code}: {error_msg}"
                )
                break

        logger.info(
            f"Category {category_id}: Download complete - "
            f"Total: {len(questions)} questions in {batch_count} batches"
        )
        return questions

    def sanitize_filename(self, name: str) -> str:
        """Sanitize category name for filename"""
        import re

        # Remove special characters and replace spaces with underscores
        sanitized = re.sub(r"[^\w\s-]", "", name).strip()
        sanitized = re.sub(r"[-\s]+", "_", sanitized)
        return sanitized.lower()

    async def download_category(
        self, session: aiohttp.ClientSession, category: Category, progress
    ) -> Dict:
        """
        Download questions for a category, handling incremental updates and de-duplication.
        If a new session token is generated, it will wipe existing data for that category
        to start fresh, preventing conflicts between sessions.
        """
        category_name = self.sanitize_filename(category.name)
        category_dir = self.categories_dir / category_name
        category_dir.mkdir(exist_ok=True)
        output_file = category_dir / "questions.json"

        # Get token status first to decide if we need to wipe old data.
        token, is_new_token = await self.get_session_token(session, category.id)
        if not token:
            logger.error(
                f"Could not get a session token for {category.name}. Skipping."
            )
            # Add a failed task to the progress bar for visibility
            task_id = progress.add_task(
                f"[red]Token failed: {category.name}", total=1, completed=1
            )
            return {}

        # If a new token was generated, we must start with a clean slate for this category.
        if is_new_token and output_file.exists():
            logger.warning(
                f"New session token generated. Erasing existing data file for '{category.name}' "
                "to ensure a clean download session."
            )
            output_file.unlink()

        # Load existing data and de-duplicate it on the fly.
        category_data = {}
        existing_questions_set = set()
        if output_file.exists():
            try:
                logger.info(f"Loading existing data for '{category.name}'.")
                with open(output_file, "r", encoding="utf-8") as f:
                    category_data = json.load(f)

                # De-duplicate existing questions to fix any past corruption
                unique_questions = []
                seen_questions = set()
                for q in category_data.get("questions", []):
                    question_text = q.get("question")
                    if question_text and question_text not in seen_questions:
                        unique_questions.append(q)
                        seen_questions.add(question_text)

                num_original = len(category_data.get("questions", []))
                num_unique = len(unique_questions)
                if num_unique < num_original:
                    logger.info(
                        f"Cleaned {num_original - num_unique} duplicate questions from '{category.name}'."
                    )

                category_data["questions"] = unique_questions
                existing_questions_set = seen_questions
                logger.info(
                    f"Found {len(existing_questions_set)} existing unique questions."
                )

            except (json.JSONDecodeError, IOError) as e:
                logger.error(
                    f"Could not read or parse {output_file}, starting fresh. Error: {e}"
                )
                category_data = {}

        # Initialize data if file didn't exist or was corrupt.
        if not category_data:
            category_data = {
                "category_id": category.id,
                "category_name": category.name,
                "questions": [],
                "statistics": {
                    "total_questions": 0,
                    "by_difficulty": {"easy": 0, "medium": 0, "hard": 0},
                    "by_type": {"multiple": 0, "boolean": 0},
                },
            }

        category_data["download_timestamp"] = datetime.now(timezone.utc).isoformat()

        task_id = progress.add_task(
            f"[cyan]Downloading new questions for {category.name}...", total=None
        )

        # Download new questions using the obtained token
        new_questions_raw = await self.download_questions(session, category.id, token)

        newly_added_count = 0
        if new_questions_raw:
            for q_data in new_questions_raw:
                try:
                    import base64

                    decoded_question = {
                        k: base64.b64decode(v).decode("utf-8")
                        if isinstance(v, str)
                        else [base64.b64decode(ans).decode("utf-8") for ans in v]
                        if isinstance(v, list)
                        else v
                        for k, v in q_data.items()
                    }

                    if decoded_question["question"] not in existing_questions_set:
                        category_data["questions"].append(decoded_question)
                        existing_questions_set.add(decoded_question["question"])
                        newly_added_count += 1
                except Exception as e:
                    logger.error(f"Failed to decode or process question: {e}")

        if newly_added_count > 0:
            logger.info(
                f"Added {newly_added_count} new unique questions for '{category.name}'."
            )
        else:
            logger.info(f"No new unique questions found for '{category.name}'.")

        # Recalculate statistics to ensure they are always accurate
        stats = {
            "total_questions": len(category_data["questions"]),
            "by_difficulty": {"easy": 0, "medium": 0, "hard": 0},
            "by_type": {"multiple": 0, "boolean": 0},
        }
        for q in category_data["questions"]:
            if q["difficulty"] in stats["by_difficulty"]:
                stats["by_difficulty"][q["difficulty"]] += 1
            if q["type"] in stats["by_type"]:
                stats["by_type"][q["type"]] += 1
        category_data["statistics"] = stats

        # Save the updated, clean data
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(category_data, f, indent=2, ensure_ascii=False)

        progress.update(task_id, completed=True, description=f"[green]{category.name}")

        self.stats.completed_categories += 1
        self.stats.downloaded_questions += newly_added_count
        return category_data

    async def download_all(self) -> DownloadStats:
        """Download all questions from all categories"""
        logger.info("Starting OpenTDB download process...")

        async with aiohttp.ClientSession() as session:
            # Get all categories
            categories = await self.get_categories(session)
            if not categories:
                logger.error("No categories found, aborting download")
                return self.stats

            self.stats.total_categories = len(categories)

            # Set up progress tracking
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
                TimeElapsedColumn(),
                TimeRemainingColumn(),
                console=console,
            ) as progress:
                main_task = progress.add_task(
                    f"[green]Downloading {len(categories)} categories...",
                    total=len(categories),
                )

                # Download each category
                all_category_data = []
                for category in categories:
                    try:
                        category_data = await self.download_category(
                            session, category, progress
                        )
                        all_category_data.append(category_data)
                        progress.advance(main_task)

                    except Exception as e:
                        logger.error(
                            f"Failed to download category {category.name}: {e}"
                        )
                        self.stats.failed_requests += 1
                        progress.advance(main_task)

                progress.update(main_task, description="[green]Download completed!")

        # Save summary metadata
        self.stats.end_time = datetime.now(timezone.utc)
        summary = {
            "download_stats": self.stats.dict(),
            "categories_summary": [
                {
                    "name": data["category_name"],
                    "id": data["category_id"],
                    "question_count": data["statistics"]["total_questions"],
                    "statistics": data["statistics"],
                }
                for data in all_category_data
            ],
            "total_questions": sum(
                data["statistics"]["total_questions"] for data in all_category_data
            ),
        }

        summary_file = self.metadata_dir / "download_summary.json"
        with open(summary_file, "w") as f:
            json.dump(summary, f, indent=2, default=str)

        return self.stats

    async def download_single_category(self, category_id: int) -> DownloadStats:
        """Download all questions from a specific category"""
        logger.info(f"Starting download for category ID: {category_id}")

        async with aiohttp.ClientSession() as session:
            # Get all categories to find the specific one
            categories = await self.get_categories(session)
            if not categories:
                logger.error("No categories found, aborting download")
                return self.stats

            # Find the requested category
            target_category = None
            for category in categories:
                if category.id == category_id:
                    target_category = category
                    break

            if not target_category:
                logger.error(f"Category ID {category_id} not found")
                console.print(f"[red]Error: Category ID {category_id} not found[/red]")
                console.print("\n[yellow]Available categories:[/yellow]")
                for cat in categories:
                    console.print(f"  {cat.id}: {cat.name}")
                return self.stats

            self.stats.total_categories = 1
            console.print(f"\n[cyan]Category: {target_category.name}[/cyan]")

            # Get available question count for this category
            question_count = await self.get_question_count(session, category_id)
            if question_count:
                console.print(
                    f"[cyan]Available questions: {question_count.total_question_count}[/cyan]"
                )
                console.print(f"  - Easy: {question_count.total_easy_question_count}")
                console.print(
                    f"  - Medium: {question_count.total_medium_question_count}"
                )
                console.print(f"  - Hard: {question_count.total_hard_question_count}")

            # Set up progress tracking
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                BarColumn(),
                TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
                TimeElapsedColumn(),
                TimeRemainingColumn(),
                console=console,
            ) as progress:
                try:
                    category_data = await self.download_category(
                        session, target_category, progress
                    )

                    console.print(
                        f"\n[green]✓ Downloaded {category_data['statistics']['total_questions']} questions[/green]"
                    )

                    # Compare with available
                    if question_count:
                        downloaded = category_data["statistics"]["total_questions"]
                        available = question_count.total_question_count
                        if downloaded < available:
                            console.print(
                                f"[yellow]⚠ Only downloaded {downloaded}/{available} questions ({downloaded / available * 100:.1f}%)[/yellow]"
                            )
                        elif downloaded == available:
                            console.print(
                                f"[green]✓ All available questions downloaded![/green]"
                            )

                except Exception as e:
                    logger.error(
                        f"Failed to download category {target_category.name}: {e}"
                    )
                    self.stats.failed_requests += 1

        # Save summary metadata
        self.stats.end_time = datetime.now(timezone.utc)

        return self.stats

    def display_summary(self, stats: DownloadStats):
        """Display download summary"""
        duration = stats.end_time - stats.start_time if stats.end_time else None

        table = Table(title="OpenTDB Download Summary")
        table.add_column("Metric", style="cyan", no_wrap=True)
        table.add_column("Value", style="magenta")

        table.add_row("Total Categories", str(stats.total_categories))
        table.add_row("Completed Categories", str(stats.completed_categories))
        table.add_row("Total Questions Downloaded", str(stats.downloaded_questions))
        table.add_row("Failed Requests", str(stats.failed_requests))

        if duration:
            table.add_row("Duration", str(duration).split(".")[0])

        console.print(table)

        if stats.downloaded_questions > 0:
            console.print(
                f"\n✅ Successfully downloaded {stats.downloaded_questions} questions!"
            )
            console.print(f"📁 Data saved to: {self.output_dir}")
        else:
            console.print("\n❌ No questions were downloaded.")


@click.command()
@click.option(
    "--output-dir",
    type=click.Path(path_type=Path),
    default=Path(__file__).parent.parent.parent / "raw" / "opentdb",
    help="Output directory for downloaded data",
)
@click.option(
    "--reset-tokens", is_flag=True, help="Reset all session tokens before downloading"
)
@click.option(
    "--dry-run",
    is_flag=True,
    help="Show what would be downloaded without actually downloading",
)
@click.option(
    "--category",
    type=int,
    default=None,
    help="Download only a specific category by ID (e.g., 9 for General Knowledge)",
)
def main(output_dir: Path, reset_tokens: bool, dry_run: bool, category: int):
    """
    Download trivia questions from OpenTDB API.

    This script will download all available questions from all categories,
    or a specific category if --category is provided.
    Respects rate limits and organizes the data by category.
    """

    console.print("[bold blue]OpenTDB Question Downloader[/bold blue]")
    console.print(f"Output directory: {output_dir}")

    if category:
        console.print(f"[cyan]Downloading only category ID: {category}[/cyan]")

    if dry_run:
        console.print("[yellow]DRY RUN MODE - No data will be downloaded[/yellow]")
        return

    # Create downloader and run
    downloader = OpenTDBDownloader(output_dir, reset_tokens)

    try:
        if category:
            stats = asyncio.run(downloader.download_single_category(category))
        else:
            stats = asyncio.run(downloader.download_all())
        downloader.display_summary(stats)

    except KeyboardInterrupt:
        console.print("\n[red]Download interrupted by user[/red]")
    except Exception as e:
        console.print(f"\n[red]Download failed: {e}[/red]")
        logger.exception("Download failed")


if __name__ == "__main__":
    main()
