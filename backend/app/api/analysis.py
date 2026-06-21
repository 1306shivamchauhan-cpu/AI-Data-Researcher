from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services.analytics_service import analytics_service
from app.services.ai_service import AIService

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

VALID_ANALYSIS_TYPES = ["correlation", "trend", "distribution", "clustering", "outlier", "forecast", "comprehensive"]


@router.post("", response_model=AnalysisResponse)
async def analyze(request: AnalysisRequest):
    if request.analysis_type not in VALID_ANALYSIS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid analysis type. Choose from: {', '.join(VALID_ANALYSIS_TYPES)}"
        )

    try:
        result = analytics_service.analyze_dataset(
            data_source=request.data_source,
            analysis_type=request.analysis_type,
            target_column=request.target_column,
            parameters=request.parameters,
        )
        return AnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/types")
async def get_analysis_types():
    return {
        "types": [
            {"id": "correlation", "name": "Correlation Analysis", "description": "Find relationships between variables"},
            {"id": "trend", "name": "Trend Analysis", "description": "Identify upward/downward patterns over time"},
            {"id": "distribution", "name": "Distribution Analysis", "description": "Understand value spread and segments"},
            {"id": "clustering", "name": "Cluster Analysis", "description": "Discover natural groupings in data"},
            {"id": "outlier", "name": "Anomaly Detection", "description": "Identify unusual data points"},
            {"id": "forecast", "name": "Forecast Analysis", "description": "Predict future values and trends"},
            {"id": "comprehensive", "name": "Comprehensive Analysis", "description": "Full multi-dimensional analysis"},
        ]
    }
