# AI Data Researcher — Decision Intelligence Platform

**Live App:** [ai-data-researcher.vercel.app](https://ai-data-researcher.vercel.app)

AI-powered analytics platform with conversational chat, data upload (CSV/JSON/Excel), 6 statistical analysis types, ML forecasting, and interactive dashboards.

## Stack

- **Backend:** FastAPI (Python)
- **Frontend:** React + Vite + Tailwind CSS
- **Fonts:** Manrope (headings), Inter (body), JetBrains Mono (data)

## Quick Start

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

## Features

- AI chat with data-aware responses
- Upload CSV, JSON, Excel files
- 5 built-in sample datasets
- Correlation, trend, distribution, clustering, anomaly, forecast analysis
- ML-powered time series forecasting
- Interactive charts (Recharts)
- Custom cursor & pixel reveal animations
