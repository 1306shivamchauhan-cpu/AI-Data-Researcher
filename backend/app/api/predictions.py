from fastapi import APIRouter, HTTPException, Query
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.post("", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    try:
        if request.periods < 1 or request.periods > 100:
            raise HTTPException(status_code=400, detail="Periods must be between 1 and 100")

        result = analytics_service.generate_predictions(
            data_source=request.data_source,
            target_column=request.target_column,
            periods=request.periods,
            frequency=request.frequency,
        )

        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return PredictionResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
