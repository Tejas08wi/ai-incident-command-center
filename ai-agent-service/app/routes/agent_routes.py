import os
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from functools import lru_cache
from app.models.agent_models import AgentRequest, AgentResponse
from app.services.agent_service import AgentService
from app.services.incident_client import IncidentClient
from app.services.llm_service import LLMService
from pydantic import BaseModel
from app.mcp.mcp_client import MCPClient
from fastapi import APIRouter, Depends

class ApprovalRequest(BaseModel):

    approval: str


router = APIRouter(
    prefix="/api/agent",
    tags=["Agent"]
)

security = HTTPBearer()

@lru_cache()
def get_agent_service() -> AgentService:

    base_url = os.getenv(
        "SPRING_BOOT_BASE_URL",
        "http://localhost:8081"
    )

    mcp_server_url = os.getenv(
        "MCP_SERVER_URL",
        "http://127.0.0.1:8001/mcp"
    )

    incident_client = IncidentClient(base_url)
    llm_service = LLMService()
    mcp_client = MCPClient(mcp_server_url)

    return AgentService(
        incident_client,
        llm_service,
        mcp_client
    )

@router.post("/test", response_model=AgentResponse)
def test_agent(
    request: AgentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    service: AgentService = Depends(get_agent_service)
):
    token = credentials.credentials

    return service.process_message(
        request,
        token
    )


@router.get("/incident/{incident_id}")
def get_incident(
    incident_id: int,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    service: AgentService = Depends(get_agent_service)
):
    token = credentials.credentials

    return service.get_incident(
        incident_id,
        token
    )

@router.get("/checkpoint/{thread_id}")
def get_checkpoint(
    thread_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    service: AgentService = Depends(get_agent_service)
):
    return service.get_checkpoint_state(
        thread_id
    )

@router.post("/resume/{thread_id}")
def resume_agent(
    thread_id: str,
    request: ApprovalRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    service: AgentService = Depends(get_agent_service)
):

    if request.approval not in ["approve", "reject"]:

        return {
            "message": "Approval must be 'approve' or 'reject'.",
            "status": "invalid_approval"
        }

    return service.resume_investigation(
        thread_id,
        request.approval,
        credentials.credentials
    )