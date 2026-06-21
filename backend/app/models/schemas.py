from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    data_source: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    conversation_id: str
    insights: Optional[list[dict[str, Any]]] = None


class DataUploadResponse(BaseModel):
    filename: str
    rows: int
    columns: list[str]
    preview: list[dict[str, Any]]
    summary: dict[str, Any]
    data_source: str


class AnalysisRequest(BaseModel):
    data_source: str
    analysis_type: str
    target_column: Optional[str] = None
    parameters: Optional[dict[str, Any]] = None


class AnalysisResponse(BaseModel):
    title: str
    summary: str
    visualizations: list[dict[str, Any]]
    insights: list[str]
    recommendations: list[str]


class PredictionRequest(BaseModel):
    data_source: str
    target_column: str
    periods: int = 12
    frequency: str = "M"


class PredictionResponse(BaseModel):
    forecast: list[dict[str, Any]]
    confidence_upper: list[float]
    confidence_lower: list[float]
    metrics: dict[str, float]
    insights: list[str]
