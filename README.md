# AI Data Researcher — Decision Intelligence Platform

AI-powered analytics platform with conversational chat, data upload (CSV/JSON/Excel), 6 statistical analysis types, ML forecasting, and interactive dashboards.

## Demo

![Dashboard](https://img.shields.io/badge/Open_App-Run_Locally-brightgreen?style=for-the-badge)

> Clone and run locally — see [Quick Start](#quick-start) below.

## Stack

| Layer    | Tech                                      |
| -------- | ----------------------------------------- |
| Backend  | FastAPI, pandas, scikit-learn, Google Gemini |
| Frontend | React, Vite, Tailwind CSS, Recharts       |
| Fonts    | Manrope (headings), Inter (body), JetBrains Mono (data) |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+

### 1. Clone the repo

```bash
git clone https://github.com/1306shivamchauhan-cpu/AI-Data-Researcher.git
cd AI-Data-Researcher
```

### 2. Start the backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`

### 3. Start the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173` — open it in your browser.

## Features

- **AI Chat** — conversational analytics with data-aware responses
- **Data Upload** — CSV, JSON, Excel files with preview and summary
- **5 Sample Datasets** — urban mobility, community wellness, environmental, public safety, education
- **6 Analysis Types** — correlation, trend, distribution, clustering, anomaly detection, forecasting
- **ML Forecasting** — RandomForest-based time series predictions
- **Interactive Charts** — bar, line, scatter, heatmap, histogram (Recharts)
- **Pixel Reveal Animations** — custom cursor, particle effects, glassmorphism UI

## Project Structure

```
AI-Data-Researcher/
├── backend/
│   ├── app/
│   │   ├── api/            # Route handlers
│   │   ├── services/       # AI, analytics, data logic
│   │   ├── models/         # Pydantic schemas
│   │   ├── config.py       # Environment config
│   │   └── main.py         # FastAPI app entry
│   ├── data/               # Sample datasets
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # API client
│   │   └── index.css       # Tailwind + animations
│   ├── index.html
│   └── package.json
└── README.md
```
