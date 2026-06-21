import pandas as pd
import json
from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Query
from app.models.schemas import DataUploadResponse
from app.services.data_service import data_service

router = APIRouter(prefix="/api/data", tags=["Data"])


@router.get("/datasets")
async def list_datasets():
    return data_service.list_datasets()


@router.post("/upload", response_model=DataUploadResponse)
async def upload_data(file: UploadFile = File(...)):
    try:
        content = await file.read()

        if file.filename.endswith(".csv"):
            df = pd.read_csv(pd.io.common.BytesIO(content))
        elif file.filename.endswith(".json"):
            df = pd.read_json(pd.io.common.BytesIO(content))
        elif file.filename.endswith((".xls", ".xlsx")):
            df = pd.read_excel(pd.io.common.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format. Use CSV, JSON, or Excel.")

        name = data_service.upload_dataframe(df, file.filename.rsplit(".", 1)[0])
        preview = data_service.get_preview(name)
        summary = data_service.get_summary(name)

        return DataUploadResponse(
            filename=file.filename,
            rows=len(df),
            columns=list(df.columns),
            preview=preview,
            summary=summary,
            data_source=name,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-sample")
async def generate_sample_data(domain: str = Form("urban_mobility")):
    try:
        name = data_service.generate_sample_data(domain)
        return {
            "data_source": name,
            "message": f"Sample dataset '{name}' created for domain: {domain}",
            "preview": data_service.get_preview(name),
            "summary": data_service.get_summary(name),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/preview/{name}")
async def get_preview(name: str, n: int = Query(10, ge=1, le=100)):
    preview = data_service.get_preview(name)
    if not preview:
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    return preview


@router.get("/summary/{name}")
async def get_summary(name: str):
    summary = data_service.get_summary(name)
    if "error" in summary:
        raise HTTPException(status_code=404, detail=summary["error"])
    return summary
