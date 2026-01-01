#!/usr/bin/env python3
"""
Main Python script for the Outsmart catalogue system.
Handles data processing, Ollama integration, and catalogue management.
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import click
import pandas as pd
import requests
import yaml
from dotenv import load_dotenv
from rich.console import Console
from rich.logging import RichHandler
from rich.progress import Progress, SpinnerColumn, TextColumn

try:
    import ollama
except ImportError:
    print(
        "Warning: ollama package not installed. Run 'pip install ollama' to enable AI features."
    )
    ollama = None

# Load environment variables
load_dotenv()

# Setup logging
console = Console()
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s",
    datefmt="[%X]",
    handlers=[RichHandler(console=console)],
)
logger = logging.getLogger("outsmart-catalogue")


class CatalogueManager:
    """Main catalogue management class."""

    def __init__(self, data_dir: Path = None):
        self.data_dir = data_dir or Path(__file__).parent.parent / "data"
        self.assets_dir = self.data_dir.parent / "assets"
        self.config_file = self.data_dir / "config.yaml"
        self.catalogue_file = self.data_dir / "catalogue.json"

        # Ensure directories exist
        self.data_dir.mkdir(exist_ok=True)
        self.assets_dir.mkdir(exist_ok=True)

        self.config = self._load_config()

    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        default_config = {
            "ollama": {
                "host": os.getenv("OLLAMA_HOST", "http://localhost:11434"),
                "model": os.getenv("OLLAMA_MODEL", "llama2"),
                "temperature": 0.7,
            },
            "catalogue": {
                "auto_refresh": True,
                "batch_size": 100,
                "supported_formats": [
                    ".jpg",
                    ".jpeg",
                    ".png",
                    ".mp3",
                    ".wav",
                    ".mp4",
                    ".mov",
                ],
            },
            "validation": {
                "strict_mode": True,
                "required_fields": ["name", "type", "path", "created_at"],
            },
        }

        if self.config_file.exists():
            try:
                with open(self.config_file, "r", encoding="utf-8") as f:
                    user_config = yaml.safe_load(f)
                    if user_config:
                        default_config.update(user_config)
            except Exception as e:
                logger.warning(f"Failed to load config file: {e}")
        else:
            # Create default config file
            with open(self.config_file, "w", encoding="utf-8") as f:
                yaml.dump(default_config, f, default_flow_style=False)

        return default_config

    def _save_catalogue(self, catalogue_data: Dict[str, Any]) -> None:
        """Save catalogue data to JSON file."""
        with open(self.catalogue_file, "w", encoding="utf-8") as f:
            json.dump(catalogue_data, f, indent=2, ensure_ascii=False)

    def _load_catalogue(self) -> Dict[str, Any]:
        """Load existing catalogue data."""
        if self.catalogue_file.exists():
            try:
                with open(self.catalogue_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Failed to load catalogue: {e}")

        return {
            "metadata": {
                "version": "1.0.0",
                "created_at": datetime.now().isoformat(),
                "last_updated": datetime.now().isoformat(),
            },
            "assets": [],
        }

    async def scan_assets(self) -> List[Dict[str, Any]]:
        """Scan the assets directory for files."""
        logger.info(f"Scanning assets directory: {self.assets_dir}")

        assets = []
        supported_formats = set(self.config["catalogue"]["supported_formats"])

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            task = progress.add_task("Scanning files...", total=None)

            for file_path in self.assets_dir.rglob("*"):
                if (
                    file_path.is_file()
                    and file_path.suffix.lower() in supported_formats
                ):
                    try:
                        stat = file_path.stat()
                        asset = {
                            "name": file_path.name,
                            "path": str(file_path.relative_to(self.assets_dir)),
                            "type": self._get_asset_type(file_path),
                            "size": stat.st_size,
                            "created_at": datetime.fromtimestamp(
                                stat.st_ctime
                            ).isoformat(),
                            "modified_at": datetime.fromtimestamp(
                                stat.st_mtime
                            ).isoformat(),
                            "extension": file_path.suffix.lower(),
                            "metadata": {},
                        }

                        # Add type-specific metadata
                        if asset["type"] == "image":
                            asset["metadata"] = await self._analyze_image(file_path)
                        elif asset["type"] == "audio":
                            asset["metadata"] = await self._analyze_audio(file_path)
                        elif asset["type"] == "video":
                            asset["metadata"] = await self._analyze_video(file_path)

                        assets.append(asset)
                        progress.update(
                            task, description=f"Found {len(assets)} assets..."
                        )

                    except Exception as e:
                        logger.warning(f"Failed to process {file_path}: {e}")

        logger.info(f"Found {len(assets)} assets")
        return assets

    def _get_asset_type(self, file_path: Path) -> str:
        """Determine asset type from file extension."""
        ext = file_path.suffix.lower()

        if ext in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"]:
            return "image"
        elif ext in [".mp3", ".wav", ".flac", ".aac", ".ogg"]:
            return "audio"
        elif ext in [".mp4", ".mov", ".avi", ".mkv", ".webm"]:
            return "video"
        else:
            return "unknown"

    async def _analyze_image(self, file_path: Path) -> Dict[str, Any]:
        """Analyze image file and extract metadata."""
        metadata = {}

        try:
            # Basic image analysis (would need PIL/Pillow for full implementation)
            metadata["analyzed_at"] = datetime.now().isoformat()
            metadata["analysis_type"] = "basic"

            # Placeholder for image analysis
            # In a real implementation, you would use PIL/Pillow:
            # from PIL import Image
            # with Image.open(file_path) as img:
            #     metadata["dimensions"] = img.size
            #     metadata["mode"] = img.mode
            #     metadata["format"] = img.format

        except Exception as e:
            logger.debug(f"Failed to analyze image {file_path}: {e}")

        return metadata

    async def _analyze_audio(self, file_path: Path) -> Dict[str, Any]:
        """Analyze audio file and extract metadata."""
        metadata = {}

        try:
            metadata["analyzed_at"] = datetime.now().isoformat()
            metadata["analysis_type"] = "basic"

            # Placeholder for audio analysis
            # In a real implementation, you would use libraries like mutagen or librosa

        except Exception as e:
            logger.debug(f"Failed to analyze audio {file_path}: {e}")

        return metadata

    async def _analyze_video(self, file_path: Path) -> Dict[str, Any]:
        """Analyze video file and extract metadata."""
        metadata = {}

        try:
            metadata["analyzed_at"] = datetime.now().isoformat()
            metadata["analysis_type"] = "basic"

            # Placeholder for video analysis
            # In a real implementation, you would use ffmpeg-python or similar

        except Exception as e:
            logger.debug(f"Failed to analyze video {file_path}: {e}")

        return metadata

    async def generate_descriptions(self, assets: List[Dict[str, Any]]) -> None:
        """Generate AI descriptions for assets using Ollama."""
        if not ollama:
            logger.warning("Ollama not available. Skipping AI description generation.")
            return

        try:
            # Test Ollama connection
            response = requests.get(f"{self.config['ollama']['host']}/api/tags")
            if response.status_code != 200:
                logger.warning(
                    "Ollama server not accessible. Skipping AI descriptions."
                )
                return

        except Exception as e:
            logger.warning(f"Failed to connect to Ollama: {e}")
            return

        logger.info("Generating AI descriptions with Ollama...")

        with Progress(console=console) as progress:
            task = progress.add_task("Generating descriptions...", total=len(assets))

            for asset in assets:
                try:
                    if asset["type"] in ["image", "audio", "video"]:
                        prompt = self._create_description_prompt(asset)

                        response = ollama.generate(
                            model=self.config["ollama"]["model"],
                            prompt=prompt,
                            options={
                                "temperature": self.config["ollama"]["temperature"]
                            },
                        )

                        asset["ai_description"] = response["response"].strip()
                        asset["ai_generated_at"] = datetime.now().isoformat()

                except Exception as e:
                    logger.debug(
                        f"Failed to generate description for {asset['name']}: {e}"
                    )

                progress.update(task, advance=1)

    def _create_description_prompt(self, asset: Dict[str, Any]) -> str:
        """Create a prompt for AI description generation."""
        asset_type = asset["type"]
        name = asset["name"]

        if asset_type == "image":
            return f"Describe what this image file named '{name}' might contain based on its filename and context. Be concise and descriptive."
        elif asset_type == "audio":
            return f"Describe what this audio file named '{name}' might be based on its filename. Consider if it could be music, sound effects, or voice recording."
        elif asset_type == "video":
            return f"Describe what this video file named '{name}' might contain based on its filename and context."
        else:
            return f"Describe what this file named '{name}' might be used for."

    async def validate_catalogue(self, catalogue_data: Dict[str, Any]) -> bool:
        """Validate catalogue data structure."""
        logger.info("Validating catalogue data...")

        required_fields = self.config["validation"]["required_fields"]
        strict_mode = self.config["validation"]["strict_mode"]

        if "assets" not in catalogue_data:
            logger.error("Catalogue missing 'assets' field")
            return False

        invalid_assets = []

        for i, asset in enumerate(catalogue_data["assets"]):
            missing_fields = [field for field in required_fields if field not in asset]
            if missing_fields:
                invalid_assets.append((i, asset.get("name", "unknown"), missing_fields))

        if invalid_assets:
            logger.error(f"Found {len(invalid_assets)} invalid assets:")
            for idx, name, missing in invalid_assets:
                logger.error(f"  Asset {idx} ({name}): missing {missing}")

            if strict_mode:
                return False

        logger.info("Catalogue validation completed successfully")
        return True

    async def refresh_catalogue(self) -> None:
        """Refresh the entire catalogue."""
        logger.info("Starting catalogue refresh...")

        # Load existing catalogue
        catalogue_data = self._load_catalogue()

        # Scan for new assets
        assets = await self.scan_assets()

        # Generate AI descriptions if enabled
        if self.config.get("ai_descriptions", {}).get("enabled", False):
            await self.generate_descriptions(assets)

        # Update catalogue data
        catalogue_data["assets"] = assets
        catalogue_data["metadata"]["last_updated"] = datetime.now().isoformat()
        catalogue_data["metadata"]["asset_count"] = len(assets)

        # Validate catalogue
        if await self.validate_catalogue(catalogue_data):
            self._save_catalogue(catalogue_data)
            logger.info(f"Catalogue refreshed successfully with {len(assets)} assets")
        else:
            logger.error("Catalogue validation failed. Not saving.")

    def get_stats(self) -> Dict[str, Any]:
        """Get catalogue statistics."""
        catalogue_data = self._load_catalogue()
        assets = catalogue_data.get("assets", [])

        stats = {
            "total_assets": len(assets),
            "by_type": {},
            "total_size": 0,
            "last_updated": catalogue_data.get("metadata", {}).get(
                "last_updated", "never"
            ),
        }

        for asset in assets:
            asset_type = asset.get("type", "unknown")
            stats["by_type"][asset_type] = stats["by_type"].get(asset_type, 0) + 1
            stats["total_size"] += asset.get("size", 0)

        return stats


@click.group()
def cli():
    """Outsmart Catalogue Management System."""
    pass


@cli.command()
@click.option("--data-dir", type=click.Path(), help="Data directory path")
def refresh(data_dir):
    """Refresh the asset catalogue."""
    manager = CatalogueManager(Path(data_dir) if data_dir else None)
    asyncio.run(manager.refresh_catalogue())


@cli.command()
@click.option("--data-dir", type=click.Path(), help="Data directory path")
def stats(data_dir):
    """Show catalogue statistics."""
    manager = CatalogueManager(Path(data_dir) if data_dir else None)
    stats = manager.get_stats()

    console.print("\n[bold blue]Catalogue Statistics[/bold blue]")
    console.print(f"Total Assets: {stats['total_assets']}")
    console.print(f"Total Size: {stats['total_size']:,} bytes")
    console.print(f"Last Updated: {stats['last_updated']}")

    if stats["by_type"]:
        console.print("\n[bold]Assets by Type:[/bold]")
        for asset_type, count in stats["by_type"].items():
            console.print(f"  {asset_type}: {count}")


@cli.command()
@click.option("--host", default="http://localhost:11434", help="Ollama host URL")
@click.option("--model", default="llama2", help="Ollama model to use")
def test_ollama(host, model):
    """Test Ollama connection and model availability."""
    try:
        response = requests.get(f"{host}/api/tags")
        if response.status_code == 200:
            models = response.json().get("models", [])
            console.print(f"[green]✓[/green] Connected to Ollama at {host}")
            console.print(f"Available models: {len(models)}")

            model_names = [m.get("name", "") for m in models]
            if model in model_names:
                console.print(f"[green]✓[/green] Model '{model}' is available")
            else:
                console.print(f"[red]✗[/red] Model '{model}' not found")
                console.print(f"Available models: {', '.join(model_names)}")
        else:
            console.print(
                f"[red]✗[/red] Failed to connect to Ollama: {response.status_code}"
            )

    except Exception as e:
        console.print(f"[red]✗[/red] Connection failed: {e}")


@cli.command()
@click.option("--data-dir", type=click.Path(), help="Data directory path")
def validate(data_dir):
    """Validate catalogue data."""
    manager = CatalogueManager(Path(data_dir) if data_dir else None)
    catalogue_data = manager._load_catalogue()

    result = asyncio.run(manager.validate_catalogue(catalogue_data))

    if result:
        console.print("[green]✓[/green] Catalogue validation passed")
    else:
        console.print("[red]✗[/red] Catalogue validation failed")
        sys.exit(1)


if __name__ == "__main__":
    cli()
