# Outsmart: human vs ai

Outsmart: human vs ai is a quiz game that pits your knowledge and reflexes against a powerful AI. It's not just about what you know—it's about how fast you can prove it. This project transforms a classic knowledge duel into a tense, fast-paced battle of wits where speed is your greatest asset.

## 🧠 The Vision: Speed vs. Savoir-Faire

In a traditional quiz, an AI would be unbeatable. Outsmart levels the playing field with a simple, clever mechanic: **the fastest correct answer wins.**

- **The Human Advantage**: Players can identify keywords in a question and react in a fraction of a second, long before an AI would have "finished reading" it.
- **The AI's Challenge**: The AI must simulate reading and thinking, giving you a narrow window of opportunity to score.
- **The Risk of Rushing**: If you buzz in too quickly and answer incorrectly, the point goes to the AI, which rarely makes a mistake. This creates a compelling risk-reward dynamic.

## 🛠️ Technical Architecture & Strategy

To ensure a fast, scalable, and cost-effective experience, Outsmart is built on a "Pre-baked AI" or "Static Generation" strategy. Instead of querying a live, expensive AI for every question, we generate a massive, high-quality catalogue of questions and simulated AI responses offline.

### Key Components:

1.  **Monorepo (Nx)**: The entire project is managed within an Nx monorepo for streamlined development across the mobile app, web client, and data processing scripts.
2.  **Cross-Platform App (Ionic + Capacitor)**: A single TypeScript and React codebase delivers a native experience on iOS, Android, and the web.
3.  **Data Source (OpenTDB)**: We use the [Open Trivia Database](https://opentdb.com/) as a free, verified source for our initial question catalogue.
4.  **AI Simulation (Ollama)**: Using local LLMs like Llama 3 and Mistral via [Ollama](https://ollama.ai/), we run the entire OpenTDB catalogue through various models. This process "benchmarks" each AI, generating different response times and even occasional errors.
5.  **Static Catalogue**: The final output is a rich JSON file containing the questions, correct answers, and a pre-computed set of AI behaviors (e.g., "fast expert," "hesitant AI," "distracted AI"). This catalogue is bundled with the app, making gameplay instant and offline-capable.

This approach gives us:
- **Zero Latency**: Gameplay is instantaneous and not dependent on network conditions.
- **Zero Cost per Game**: No API calls means no spiraling costs if the game goes viral.
- **Quality Control**: All questions and AI-generated "personalities" can be vetted before release.

```
outsmart/
├── apps/
│   ├── mobile/             # Ionic + Capacitor + React (iOS, Android, Web)
│   ├── client/             # React Web Application (Future Landing Page)
│   └── server/             # Node.js Backend (For future features like leaderboards)
├── data/
│   ├── catalogue/          # Python scripts for downloading and processing catalogue data
│   │   ├── raw/            # Raw data from OpenTDB
│   │   └── scripts/        # Python scripts using Ollama to enrich the catalogue
│   └── assets/             # Shared assets (images, audio, etc.)
└── packages/               # Shared libraries (Future)
```

## 🏁 Quick Start

### Prerequisites

- **Node.js**: v22+
- **Python**: v3.8+
- **Ollama**: Required for regenerating the AI catalogue. [Install Ollama](https://ollama.ai/).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/outsmart.git
    cd outsmart
    ```

2.  **Install project dependencies:**
    ```bash
    npm install
    ```

3.  **(Optional) Setup the Data Catalogue Environment:**
    If you want to regenerate the question catalogue, you'll need to set up the Python environment.
    ```bash
    cd data/catalogue
    pip install -r requirements.txt
    cd ../..
    ```
    Then, pull the necessary Ollama models:
    ```bash
    ollama pull llama3.1:8b
    ollama pull gemma2:2b
    ```

### Running the App

The primary application is the mobile app, which can be run in the browser for quick development.

**Start the mobile app in a browser:**
```bash
npx nx serve mobile
```
The app will be available at `http://localhost:4200`.

**Run on a mobile device/emulator:**
First, add the desired platform (you only need to do this once):
```bash
# For Android
npx nx run mobile:cap:add:android

# For iOS
npx nx run mobile:cap:add:ios
```

Then, sync your web build and run the app:
```bash
# Sync changes
npx nx run mobile:cap:sync

# Run on device
npx nx run mobile:cap:run:android
npx nx run mobile:cap:run:ios
```

## 🤖 Generating the AI Catalogue

The core of the game's intelligence lies in the pre-generated catalogue. The scripts to create it are in `data/catalogue/scripts/opentdb/`.

1.  **Download Fresh Data**: Run `npx nx run catalogue:opentdb:download` to fetch a comprehensive set of questions from OpenTDB.
2.  **Enrich with AI**: Run `npx nx run catalogue:opentdb:benchmark` to process the raw data with Ollama, benchmarking different models to create varied AI opponents.
3.  **Consolidate for the App**: Run `npx nx run catalogue:opentdb:consolidate` to combine all the enriched data into a single `catalogue.json` file and place it in the mobile app's assets directory.

This process allows us to control the difficulty and "personality" of the AI opponents, creating a more engaging and replayable experience.

### Running the Benchmark
After downloading the data, you can run the AI benchmark script:

```bash
npx nx run catalogue:opentdb:benchmark
```

This will iterate through all the downloaded questions and use the configured Ollama models to generate AI response data. You can customize the models and other options by editing the `benchmark_ai.py` script.
