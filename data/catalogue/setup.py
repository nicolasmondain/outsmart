#!/usr/bin/env python3
"""
Setup script for the OpenTDB downloader package.
"""

from pathlib import Path

from setuptools import find_packages, setup

# Read the README file
this_directory = Path(__file__).parent
long_description = (
    (this_directory / "README.md").read_text()
    if (this_directory / "README.md").exists()
    else ""
)

# Read requirements
requirements = []
if (this_directory / "requirements.txt").exists():
    with open(this_directory / "requirements.txt") as f:
        requirements = [
            line.strip() for line in f if line.strip() and not line.startswith("#")
        ]

setup(
    name="outsmart-opentdb-downloader",
    version="1.0.0",
    description="OpenTDB trivia questions downloader with rate limiting and organization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    author="Outsmart Team",
    author_email="hello@outsmart.app",
    url="https://github.com/outsmart/outsmart",
    packages=find_packages(where="scripts"),
    package_dir={"": "scripts"},
    python_requires=">=3.8",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.4.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.11.0",
            "flake8>=6.1.0",
            "mypy>=1.7.0",
        ]
    },
    entry_points={
        "console_scripts": [
            "opentdb-downloader=opentdb.downloader:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Education",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Topic :: Education",
        "Topic :: Internet :: WWW/HTTP :: Dynamic Content",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    keywords="opentdb trivia questions api downloader education",
    project_urls={
        "Bug Reports": "https://github.com/outsmart/outsmart/issues",
        "Source": "https://github.com/outsmart/outsmart/tree/main/data/catalogue",
        "Documentation": "https://github.com/outsmart/outsmart/wiki",
    },
    include_package_data=True,
    zip_safe=False,
)
