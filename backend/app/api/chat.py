import uuid
from fastapi import APIRouter, HTTPException
from app.models.schemas import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.services.data_service import data_service

router = APIRouter(prefix="/api/chat", tags=["Chat"])
ai_service = AIService()


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        conversation_id = request.conversation_id or uuid.uuid4().hex[:12]

        context = None
        if request.data_source:
            context = data_service.get_context_for_llm(request.data_source)

        reply = ai_service.chat(request.message, context)

        return ChatResponse(
            reply=reply,
            conversation_id=conversation_id,
            insights=None,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
