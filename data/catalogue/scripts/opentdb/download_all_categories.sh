#!/bin/bash

# Script to download all OpenTDB categories one by one
# This ensures each category is fully downloaded before moving to the next

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log file
LOG_FILE="${SCRIPT_DIR}/download_all_categories.log"
SUMMARY_FILE="${SCRIPT_DIR}/download_summary.txt"

# Category IDs (from OpenTDB API)
CATEGORIES=(9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32)

# Function to get category name
get_category_name() {
    case $1 in
        9) echo "General Knowledge" ;;
        10) echo "Entertainment: Books" ;;
        11) echo "Entertainment: Film" ;;
        12) echo "Entertainment: Music" ;;
        13) echo "Entertainment: Musicals & Theatres" ;;
        14) echo "Entertainment: Television" ;;
        15) echo "Entertainment: Video Games" ;;
        16) echo "Entertainment: Board Games" ;;
        17) echo "Science & Nature" ;;
        18) echo "Science: Computers" ;;
        19) echo "Science: Mathematics" ;;
        20) echo "Mythology" ;;
        21) echo "Sports" ;;
        22) echo "Geography" ;;
        23) echo "History" ;;
        24) echo "Politics" ;;
        25) echo "Art" ;;
        26) echo "Celebrities" ;;
        27) echo "Animals" ;;
        28) echo "Vehicles" ;;
        29) echo "Entertainment: Comics" ;;
        30) echo "Science: Gadgets" ;;
        31) echo "Entertainment: Japanese Anime & Manga" ;;
        32) echo "Entertainment: Cartoon & Animations" ;;
        *) echo "Unknown Category" ;;
    esac
}

# Initialize counters
total_categories=${#CATEGORIES[@]}
completed_categories=0
failed_categories=0
total_questions=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenTDB Category-by-Category Downloader${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total categories to download: ${CYAN}${total_categories}${NC}"
echo -e "Log file: ${CYAN}${LOG_FILE}${NC}"
echo ""

# Clear previous log
> "$LOG_FILE"
> "$SUMMARY_FILE"

# Start time
start_time=$(date +%s)

# Download each category
for category_id in "${CATEGORIES[@]}"; do
    category_name=$(get_category_name "$category_id")

    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}Category ${category_id}: ${category_name}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

    # Run the downloader for this specific category
    if python "${SCRIPT_DIR}/downloader.py" --category "$category_id" --reset-tokens >> "$LOG_FILE" 2>&1; then
        # Try to find the JSON file for this category
        category_dir="${SCRIPT_DIR}/../../raw/opentdb/categories"

        # Find the questions.json file for this category
        count=0
        for json_file in "$category_dir"/*/questions.json; do
            if [ -f "$json_file" ]; then
                cat_id=$(python3 -c "import json; data=json.load(open('$json_file')); print(data.get('category_id', 0))" 2>/dev/null || echo "0")
                if [ "$cat_id" = "$category_id" ]; then
                    count=$(python3 -c "import json; data=json.load(open('$json_file')); print(data['statistics']['total_questions'])" 2>/dev/null || echo "0")
                    break
                fi
            fi
        done

        echo -e "${GREEN}✓ Success: Downloaded ${count} questions${NC}"
        echo "✓ Category $category_id: $category_name ($count questions)" >> "$SUMMARY_FILE"
        completed_categories=$((completed_categories + 1))
        total_questions=$((total_questions + count))
    else
        echo -e "${RED}✗ Failed to download category $category_id${NC}"
        echo "✗ Category $category_id: $category_name (FAILED)" >> "$SUMMARY_FILE"
        failed_categories=$((failed_categories + 1))
    fi

    # Progress
    echo -e "\n${BLUE}Progress: ${completed_categories}/${total_categories} completed, ${failed_categories} failed${NC}"

    # Small delay to respect rate limits
    if [ $category_id -ne 32 ]; then
        echo -e "${YELLOW}Waiting 3 seconds before next category...${NC}"
        sleep 3
    fi
done

# End time
end_time=$(date +%s)
duration=$((end_time - start_time))
hours=$((duration / 3600))
minutes=$(( (duration % 3600) / 60 ))
seconds=$((duration % 60))
duration_formatted=$(printf '%02d:%02d:%02d' $hours $minutes $seconds)

# Generate summary header
echo -e "\n\n${BLUE}========================================${NC}"
echo -e "${BLUE}        DOWNLOAD SUMMARY${NC}"
echo -e "${BLUE}========================================${NC}"

summary_header="
OpenTDB Category-by-Category Download Summary
Generated: $(date)

Statistics:
-----------
Total Categories:      ${total_categories}
Completed:             ${completed_categories}
Failed:                ${failed_categories}
Total Questions:       ${total_questions}
Duration:              ${duration_formatted}

Results:
--------
"

# Prepend summary header to file
tmp_file=$(mktemp)
echo "$summary_header" > "$tmp_file"
cat "$SUMMARY_FILE" >> "$tmp_file"
mv "$tmp_file" "$SUMMARY_FILE"

# Display summary
cat "$SUMMARY_FILE"

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}Download process completed!${NC}"
echo -e "${CYAN}Summary saved to: ${SUMMARY_FILE}${NC}"
echo -e "${CYAN}Full log available at: ${LOG_FILE}${NC}"
echo -e "${BLUE}========================================${NC}"

# Exit with error if any category failed
if [ $failed_categories -gt 0 ]; then
    echo -e "\n${RED}Warning: $failed_categories categories failed to download${NC}"
    exit 1
else
    echo -e "\n${GREEN}All categories downloaded successfully!${NC}"
    exit 0
fi
