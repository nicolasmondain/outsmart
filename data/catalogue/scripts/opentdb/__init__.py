"""
OpenTDB (Open Trivia Database) Downloader Package

This package provides tools to download and organize trivia questions from the OpenTDB API.

Usage:
    python -m opentdb
    python -m opentdb.downloader --help

Features:
- Downloads all questions from all categories
- Respects API rate limits
- Uses session tokens to avoid duplicates
- Organizes data by category
- Resume capability for interrupted downloads
"""

from .downloader import OpenTDBDownloader

__version__ = "1.0.0"
__all__ = ["OpenTDBDownloader"]


def main():
    """Entry point for the package"""
    from .downloader import main as downloader_main

    downloader_main()


if __name__ == "__main__":
    main()
