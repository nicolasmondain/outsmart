# OpenTDB Question Downloader

A Python-based downloader for the Open Trivia Database (OpenTDB) API that downloads all trivia questions and organizes them by category.

## Overview

This tool downloads all available trivia questions from the [OpenTDB API](https://opentdb.com/) and saves them in a structured format. It includes proper rate limiting, session token management, error handling, and progress tracking.

## Features

- ✅ **Complete Download**: Downloads all questions from all 24+ categories
- ✅ **Rate Limited**: Respects API limits (1 request per 5+ seconds)
- ✅ **Session Tokens**: Avoids duplicate questions using session tokens
- ✅ **Resume Capability**: Can resume interrupted downloads
- ✅ **Progress Tracking**: Real-time progress bars and statistics
- ✅ **Data Organization**: Organizes questions by category with metadata
- ✅ **Error Handling**: Robust error handling and retry logic
- ✅ **Base64 Decoding**: Properly decodes special characters

## Installation

### Prerequisites

- Python 3.8+
- pip (Python package manager)

### Install Dependencies

```bash
# From the catalogue directory
pip install -r requirements.txt
```

### Optional: Install as Package

```bash
# Install in development mode
pip install -e .
```

## Usage

### Basic Usage

```bash
# Download all questions to default location (raw/opentdb/)
python scripts/opentdb/downloader.py

# Or using the module
python -m opentdb
```

### Advanced Options

```bash
# Custom output directory
python scripts/opentdb/downloader.py --output-dir /path/to/output

# Reset session tokens (forces fresh download)
python scripts/opentdb/downloader.py --reset-tokens

# Dry run (see what would be downloaded)
python scripts/opentdb/downloader.py --dry-run

# Show help
python scripts/opentdb/downloader.py --help
```

### Using Nx Commands

```bash
# Install Python dependencies
npx nx run catalogue:python:install

# Download all questions
npx nx run catalogue:opentdb:download

# Download with reset tokens
npx nx run catalogue:opentdb:download-reset

# Dry run
npx nx run catalogue:opentdb:dry-run

# Check download status
npx nx run catalogue:opentdb:status

# Clean downloaded data
npx nx run catalogue:opentdb:clean
```

## Output Structure

The downloaded data is organized as follows:

```
raw/opentdb/
├── categories/
│   ├── general_knowledge/
│   │   └── questions.json
│   ├── entertainment_books/
│   │   └── questions.json
│   ├── entertainment_film/
│   │   └── questions.json
│   └── ... (one folder per category)
├── metadata/
│   ├── categories.json          # List of all categories
│   └── download_summary.json    # Download statistics
└── tokens/
    ├── token_general.json       # Session tokens
    └── token_9.json            # Category-specific tokens
```

### Question Format

Each `questions.json` file contains:

```json
{
  "category_id": 9,
  "category_name": "General Knowledge",
  "download_timestamp": "2024-01-01T12:00:00Z",
  "questions": [
    {
      "category": "General Knowledge",
      "type": "multiple",
      "difficulty": "easy",
      "question": "What is the capital of France?",
      "correct_answer": "Paris",
      "incorrect_answers": ["London", "Berlin", "Madrid"]
    }
  ],
  "statistics": {
    "total_questions": 1,
    "by_difficulty": {
      "easy": 1,
      "medium": 0,
      "hard": 0
    },
    "by_type": {
      "multiple": 1,
      "boolean": 0
    }
  }
}
```

## API Information

### Rate Limiting

The OpenTDB API enforces the following limits:
- Maximum 50 questions per request
- 1 request per 5 seconds per IP address
- Session tokens expire after 6 hours of inactivity

This downloader respects these limits by:
- Making requests at 5.1-second intervals
- Using session tokens to avoid duplicates
- Handling rate limit responses gracefully

### Categories

The API provides questions in 24+ categories including:
- General Knowledge
- Entertainment (Books, Film, Music, TV, Games)
- Science (Nature, Computers, Mathematics)
- Sports, Geography, History, Politics
- Art, Celebrities, Animals, Vehicles

### Response Codes

The API returns response codes:
- `0`: Success
- `1`: No Results (category exhausted)
- `2`: Invalid Parameter
- `3`: Token Not Found
- `4`: Token Empty (reset needed)
- `5`: Rate Limited

## Development

### Code Style

```bash
# Format code
black scripts/

# Lint code
flake8 scripts/

# Run both
npx nx run catalogue:lint:python
npx nx run catalogue:format:python
```

### Testing

```bash
# Run tests
pytest scripts/ -v

# Or using Nx
npx nx run catalogue:test:python
```

### Project Structure

```
scripts/opentdb/
├── __init__.py          # Package initialization
├── __main__.py          # Module entry point
└── downloader.py        # Main downloader script
```

## Troubleshooting

### Common Issues

**Rate Limited (Error Code 5)**
```bash
# Wait 5+ seconds between requests (automatic)
# Check your internet connection
```

**Token Empty (Error Code 4)**
```bash
# Tokens are automatically reset
# Use --reset-tokens to force fresh tokens
python scripts/opentdb/downloader.py --reset-tokens
```

**No Results (Error Code 1)**
```bash
# Category is exhausted - this is normal
# Check download_summary.json for statistics
```

**Network Issues**
```bash
# Check internet connection
# API might be temporarily down
# Try again later
```

### Debugging

Enable debug logging by modifying the script:

```python
logging.basicConfig(level=logging.DEBUG)
```

Or use the verbose output during download.

## Statistics

As of January 2024, OpenTDB contains approximately:
- 4,000+ total questions
- 24+ categories
- Questions in Easy, Medium, and Hard difficulties
- Both Multiple Choice and True/False formats

Download times vary based on:
- Internet connection speed
- API response times
- Total questions available (changes over time)

Expected download time: **15-30 minutes** for complete database.

## License

This project is licensed under the MIT License. The OpenTDB data is available under Creative Commons Attribution-ShareAlike 4.0 International License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and formatting
6. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/outsmart/issues)
- **OpenTDB API**: [Official Documentation](https://opentdb.com/api_config.php)
- **Questions**: Contact the Outsmart team

---

**Made with ❤️ by the Outsmart Team**

Educational tool for downloading and organizing trivia questions for learning and development purposes.