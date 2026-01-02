#!/usr/bin/env python3
"""
Entry point for running the OpenTDB downloader as a module.

Usage:
    python -m opentdb
    python -m opentdb --help
    python -m opentdb --output-dir ./custom_output --reset-tokens
"""

from .downloader import main

if __name__ == "__main__":
    main()
