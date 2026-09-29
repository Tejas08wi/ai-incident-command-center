from langgraph.types import Command

from app.models.agent_models import AgentRequest, AgentResponse
from app.services.incident_client import IncidentClient
from app.services.llm_service import LLMService
from app.agents.incident_graph import create_incident_graph
from app.mcp.mcp_client import MCPClient
from app.exceptions.ai_exceptions import AIServiceUnavailableError

class AgentService:

    def __init__(
        self,
        incident_client: IncidentClient,
        llm_service: LLMService,
        mcp_client: MCPClient
    ):
        self.incident_client = incident_client
        self.llm_service = llm_service
        self.mcp_client = mcp_client

        self.graph = create_incident_graph(
            self.llm_service,
            self.incident_client,
            self.mcp_client
        )

    def process_message(
            self,
            request: AgentRequest,
            token: str):

        try:

            result = self.graph.invoke(
                {
                    "message": request.message,
                    "token": token,
                    "request_type": "",
                    "incident_id": 0,
                    "incident": {},
                    "investigation_id": 0,
                    "previous_investigations": [],
                    "previous_investigation_evidence": [],
                    "analysis": "",
                    "next_action": "",
                    "response": "",
                    "investigation_history": [],
                    "tool_response": None,
                    "investigation_status": "NEW"
                },
                config={
                    "configurable": {
                        "thread_id": request.thread_id
                    }
                }
            )

            if "__interrupt__" in result:

                return AgentResponse(
                    message=str(result["__interrupt__"]),
                    status="approval_required"
                )

            return AgentResponse(
                message=result["response"],
                status="success"
            )

        except AIServiceUnavailableError as error:

            self._record_ai_failure(
                request.thread_id,
                str(error),
                token
            )

            raise

    def _record_ai_failure(
            self,
            thread_id: str,
            message: str,
            token: str):

        try:

            config = {
                "configurable": {
                    "thread_id": thread_id
                }
            }

            state = self.graph.get_state(config)

            investigation_id = state.values.get(
                "investigation_id"
            )

            if investigation_id is None:
                return

            self.incident_client.create_audit_log(
                investigation_id,
                "AI_SERVICE_ERROR",
                message,
                token
            )

        except Exception as audit_error:

            print(
                "Failed to record AI service error audit:",
                audit_error
            )

    def resume_investigation(
        self,
        thread_id: str,
        approval: str,
        token: str
):    
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }
    
        # Get the current checkpoint state
        state = self.graph.get_state(config)
    
        investigation_id = state.values.get(
            "investigation_id"
        )
    
        # Determine the audit event type
        event_type = (
            "HUMAN_APPROVED"
            if approval == "approve"
            else "HUMAN_REJECTED"
        )
    
        # Record the human decision
        self.incident_client.create_audit_log(
            investigation_id=investigation_id,
            event_type=event_type,
            message=f"Human decision: {approval}.",
            token=token
        )
    
        # Resume the interrupted investigation
        result = self.graph.invoke(
            Command(
                resume=approval
            ),
            config=config
        )
    
        print("===== RESUME RESULT =====")
        print(result)
    
        print("===== CHECKPOINT AFTER RESUME =====")
        updated_state = self.graph.get_state(config)
    
        print(updated_state.values)
        print(
            "NEXT:",
            updated_state.values.get("next_action")
        )
        print(
            "HISTORY:",
            updated_state.values.get(
                "investigation_history"
            )
        )
        print(
            "RESPONSE:",
            updated_state.values.get("response")
        )
    
        if "__interrupt__" in result:
            return {
                "message": str(result["__interrupt__"]),
                "status": "approval_required"
            }
    
        # Human rejected the investigation
        if approval == "reject":
            return {
                "message": result.get(
                    "response",
                    "Investigation was rejected by the human operator."
                ),
                "status": "rejected"
            }
    
        # Human approved the investigation
        return {
            "message": result.get(
                "response",
                "Investigation completed successfully."
            ),
            "status": "success"
        }

    def get_checkpoint_state(
        self,
        thread_id: str
    ):
        config = {
            "configurable": {
                "thread_id": thread_id
            }
        }

        state = self.graph.get_state(config)

        values = state.values

        return {
            "thread_id": thread_id,
            "incident_id": values.get(
                "incident_id"
            ),
            "investigation_id": values.get(
                "investigation_id"
            ),
            "investigation_status": values.get(
                "investigation_status"
            ),
            "next_action": values.get(
                "next_action"
            ),
            "analysis": values.get(
                "analysis"
            ),
            "investigation_history": values.get(
                "investigation_history"
            ),
            "response": values.get(
                "response"
            )
        }

    def get_incident(
        self,
        incident_id: int,
        token: str
    ):
        return self.incident_client.get_incident(
            incident_id,
            token
        )