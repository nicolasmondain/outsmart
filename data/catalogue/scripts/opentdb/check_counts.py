#!/usr/bin/env python3
"""
Check available vs downloaded question counts from OpenTDB API

This script fetches the actual available question counts from the API
and compares them with what was downloaded to identify discrepancies.
"""

import asyncio
import json
from pathlib import Path
from typing import Dict, List

import aiohttp
from rich.console import Console
from rich.table import Table

console = Console()


async def get_question_count(session: aiohttp.ClientSession, category_id: int) -> Dict:
    """Get question count for a specific category from API"""
    url = "https://opentdb.com/api_count.php"
    params = {"category": category_id}

    try:
        async with session.get(url, params=params) as response:
            if response.status == 200:
                data = await response.json()
                if "category_question_count" in data:
                    return data["category_question_count"]
    except Exception as e:
        console.print(
            f"[red]Error fetching count for category {category_id}: {e}[/red]"
        )

    return {"total_question_count": 0}


async def main():
    """Main function to check counts"""
    console.print("[bold blue]OpenTDB Question Count Checker[/bold blue]\n")

    # Load downloaded data
    base_dir = Path(__file__).parent.parent.parent / "raw" / "opentdb"
    summary_file = base_dir / "metadata" / "download_summary.json"

    if not summary_file.exists():
        console.print("[red]Error: download_summary.json not found![/red]")
        return

    with open(summary_file) as f:
        summary = json.load(f)

    # Create mapping of downloaded counts
    downloaded_counts = {}
    for cat in summary["categories_summary"]:
        downloaded_counts[cat["id"]] = cat["question_count"]

    # Fetch available counts from API
    console.print("Fetching available question counts from API...\n")

    async with aiohttp.ClientSession() as session:
        tasks = []
        category_ids = list(downloaded_counts.keys())

        for cat_id in category_ids:
            tasks.append(get_question_count(session, cat_id))
            await asyncio.sleep(0.5)  # Rate limiting

        available_counts = await asyncio.gather(*tasks)

    # Create comparison table
    table = Table(title="Question Count Comparison", show_lines=True)
    table.add_column("Category ID", justify="center", style="cyan")
    table.add_column("Category Name", style="magenta")
    table.add_column("Available", justify="right", style="green")
    table.add_column("Downloaded", justify="right", style="yellow")
    table.add_column("Missing", justify="right", style="red")
    table.add_column("% Complete", justify="right", style="blue")

    total_available = 0
    total_downloaded = 0
    total_missing = 0

    for i, cat_id in enumerate(category_ids):
        cat_info = next(
            (c for c in summary["categories_summary"] if c["id"] == cat_id), None
        )
        if not cat_info:
            continue

        available = available_counts[i].get("total_question_count", 0)
        downloaded = downloaded_counts[cat_id]
        missing = available - downloaded
        percentage = (downloaded / available * 100) if available > 0 else 0

        total_available += available
        total_downloaded += downloaded
        total_missing += missing

        # Color code based on completeness
        if missing > 0:
            missing_str = f"[red]{missing}[/red]"
            percentage_str = f"[red]{percentage:.1f}%[/red]"
        else:
            missing_str = f"[green]{missing}[/green]"
            percentage_str = f"[green]{percentage:.1f}%[/green]"

        table.add_row(
            str(cat_id),
            cat_info["name"],
            str(available),
            str(downloaded),
            missing_str,
            percentage_str,
        )

    console.print(table)

    # Summary
    console.print("\n[bold]Summary:[/bold]")
    console.print(f"Total Available: [green]{total_available}[/green]")
    console.print(f"Total Downloaded: [yellow]{total_downloaded}[/yellow]")
    console.print(f"Total Missing: [red]{total_missing}[/red]")
    console.print(
        f"Overall Completion: [blue]{(total_downloaded / total_available * 100):.1f}%[/blue]"
    )

    if total_missing > 0:
        console.print(f"\n[red]⚠️  Missing {total_missing} questions![/red]")
        console.print(
            "[yellow]The downloader has a bug that prevents downloading all questions.[/yellow]"
        )
    else:
        console.print("\n[green]✅ All available questions downloaded![/green]")


if __name__ == "__main__":
    asyncio.run(main())
