from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import chat, data, analysis, predictions

app = FastAPI(
    title="Decision Intelligence Platform API",
    description="AI-powered platform for data analysis, insights, and decision support",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(data.router)
app.include_router(analysis.router)
app.include_router(predictions.router)


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Decision Intelligence Platform"}


@app.get("/api/info")
async def platform_info():
    return {
        "name": "Decision Intelligence Platform",
        "version": "1.0.0",
        "description": "AI-powered decision intelligence for communities and organizations",
        "capabilities": [
            "Conversational analytics and natural language queries",
            "Multi-format data upload and processing (CSV, JSON, Excel)",
            "Statistical analysis (correlation, trend, distribution)",
            "Anomaly detection and outlier analysis",
            "Cluster analysis for pattern discovery",
            "Time-series forecasting and predictions",
            "AI-powered insight generation with Google Gemini",
            "Automated recommendations and decision support",
        ],
        "sample_domains": [
            "urban_mobility", "community_wellness", "environmental",
            "public_safety", "education",
        ],
    }
