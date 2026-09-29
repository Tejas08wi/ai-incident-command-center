from dotenv import load_dotenv

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.routes.agent_routes import router as agent_router
from app.exceptions.ai_exceptions import AIServiceUnavailableError


load_dotenv()


app = FastAPI(
    title="AI Incident Command Center - AI Agent Service",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AIServiceUnavailableError)
async def ai_service_unavailable_handler(
        request: Request,
        exc: AIServiceUnavailableError):

    return JSONResponse(
        status_code=503,
        content={
            "status": "AI_SERVICE_UNAVAILABLE",
            "message": exc.message
        }
    )


app.include_router(agent_router)


@app.get("/health")
def health_check():

    return {
        "status": "UP",
        "service": "AI Agent Service"
    }