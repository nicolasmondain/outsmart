#!/bin/bash

# Script to download all OpenTDB categories one by one
# This ensures each category is fully downloaded before moving to the next

set -e  # Exit on error
set -o pipefail  # Pipe failures propagate

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Log files
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${SCRIPT_DIR}/download_all_${TIMESTAMP}.log"
SUMMARY_FILE="${SCRIPT_DIR}/download_summary_${TIMESTAMP}.txt"

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

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

# Initialize counters
total_categories=${#CATEGORIES[@]}
completed_categories=0
failed_categories=0
total_questions=0

# Initialize log files
echo "OpenTDB Download All Categories - Started at $(date)" > "$LOG_FILE"
echo "=================================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OpenTDB Category-by-Category Downloader${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
log_info "Total categories to download: ${total_categories}"
log_info "Log file: ${LOG_FILE}"
log_info "Summary will be saved to: ${SUMMARY_FILE}"
echo ""

# Start time
start_time=$(date +%s)

# Download each category
for i in "${!CATEGORIES[@]}"; do
    category_id="${CATEGORIES[$i]}"
    category_name=$(get_category_name "$category_id")
    progress_num=$((i + 1))

    echo "" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"
    echo -e "${CYAN}[${progress_num}/${total_categories}] Category ${category_id}: ${category_name}${NC}" | tee -a "$LOG_FILE"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}" | tee -a "$LOG_FILE"

    # Run the downloader for this specific category
    # Use tee to show output AND log it
    log_info "Starting download for category ${category_id}..."

    if python3 "${SCRIPT_DIR}/downloader.py" --category "$category_id" --reset-tokens 2>&1 | tee -a "$LOG_FILE"; then
        # Extract downloaded count from the JSON file
        category_dir="${SCRIPT_DIR}/../../raw/opentdb/categories"

        # Find the questions.json file for this category
        count=0
        available=0
        found=false

        for json_file in "$category_dir"/*/questions.json; do
            if [ -f "$json_file" ]; then
                cat_id=$(python3 -c "import json; data=json.load(open('$json_file')); print(data.get('category_id', 0))" 2>/dev/null || echo "0")
                if [ "$cat_id" = "$category_id" ]; then
                    count=$(python3 -c "import json; data=json.load(open('$json_file')); print(data['statistics']['total_questions'])" 2>/dev/null || echo "0")
                    found=true
                    break
                fi
            fi
        done

        if [ "$found" = true ]; then
            if [ "$count" -gt 0 ]; then
                log_success "Category ${category_id} completed: ${count} questions downloaded"
                echo "✓ Category ${category_id}: ${category_name} - ${count} questions" >> "$SUMMARY_FILE"
                completed_categories=$((completed_categories + 1))
                total_questions=$((total_questions + count))
            else
                log_error "Category ${category_id} (${category_name}) contains 0 questions. This is treated as a failure."
                echo "✗ Category ${category_id}: ${category_name} - FAILED (0 questions)" >> "$SUMMARY_FILE"
                failed_categories=$((failed_categories + 1))
            fi
        else
            log_error "No data file found for category ${category_id}: ${category_name}. This is treated as a failure."
            echo "✗ Category ${category_id}: ${category_name} - FAILED (no data file)" >> "$SUMMARY_FILE"
            failed_categories=$((failed_categories + 1))
        fi
    else
        log_error "Failed to download category ${category_id}: ${category_name}"
        echo "✗ Category ${category_id}: ${category_name} - FAILED" >> "$SUMMARY_FILE"
        failed_categories=$((failed_categories + 1))
    fi

    # Progress summary
    echo "" | tee -a "$LOG_FILE"
    log_info "Progress: ${completed_categories}/${total_categories} completed, ${failed_categories} failed, ${total_questions} questions total"

    # Small delay to respect rate limits between categories
    if [ $category_id -ne 32 ]; then
        log_info "Waiting 5 seconds before next category..."
        sleep 5
    fi
done

# End time
end_time=$(date +%s)
duration=$((end_time - start_time))
hours=$((duration / 3600))
minutes=$(( (duration % 3600) / 60 ))
seconds=$((duration % 60))
duration_formatted=$(printf '%02d:%02d:%02d' $hours $minutes $seconds)

# Generate final summary
echo "" | tee -a "$LOG_FILE"
echo -e "${BLUE}========================================${NC}" | tee -a "$LOG_FILE"
echo -e "${BLUE}        DOWNLOAD SUMMARY${NC}" | tee -a "$LOG_FILE"
echo -e "${BLUE}========================================${NC}" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

summary_text="
OpenTDB Category-by-Category Download Summary
Generated: $(date)
Log file: ${LOG_FILE}

Statistics:
-----------
Total Categories:      ${total_categories}
Successfully Completed: ${completed_categories}
Failed:                ${failed_categories}
Total Questions:       ${total_questions}
Duration:              ${duration_formatted}

Results by Category:
--------------------
"

# Prepend summary header to file
tmp_file=$(mktemp)
echo "$summary_text" > "$tmp_file"
cat "$SUMMARY_FILE" >> "$tmp_file"
mv "$tmp_file" "$SUMMARY_FILE"

# Display summary
log_info "Total Categories: ${total_categories}"
log_info "Successfully Completed: ${completed_categories}"
if [ $failed_categories -gt 0 ]; then
    log_warn "Failed: ${failed_categories}"
else
    log_success "Failed: 0"
fi
log_info "Total Questions Downloaded: ${total_questions}"
log_info "Duration: ${duration_formatted}"

echo "" | tee -a "$LOG_FILE"
echo -e "${CYAN}Detailed results saved to: ${SUMMARY_FILE}${NC}" | tee -a "$LOG_FILE"

echo "" | tee -a "$LOG_FILE"
echo -e "${BLUE}========================================${NC}" | tee -a "$LOG_FILE"

# Final status
if [ $failed_categories -gt 0 ]; then
    log_error "Download completed with ${failed_categories} failures"
    echo "" | tee -a "$LOG_FILE"
    log_info "Check ${LOG_FILE} for details"
    exit 1
else
    log_success "All categories downloaded successfully!"
    echo "" | tee -a "$LOG_FILE"
    log_info "Total questions: ${total_questions}"
    exit 0
fi
