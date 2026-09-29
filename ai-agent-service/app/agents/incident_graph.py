from typing import TypedDict

from langgraph.graph import StateGraph, START, END

from app.services.llm_service import LLMService
from app.services.incident_client import IncidentClient
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.types import interrupt
from app.mcp.mcp_client import MCPClient

from app.tools.incident_tools import (
    get_incident_details,
    check_service_health
)

MAX_PREVIOUS_INVESTIGATIONS = 3
MAX_EVIDENCE_PER_INVESTIGATION = 10

class AgentState(TypedDict):

    # =========================
    # Request State
    # =========================
    message: str
    token: str
    request_type: str

    # =========================
    # Incident State
    # =========================
    incident_id: int
    incident: dict

    # =========================
    # Investigation State
    # =========================
    investigation_id: int
    previous_investigations: list
    previous_investigation_evidence: list
    analysis: str
    next_action: str
    investigation_status: str
    investigation_history: list
    tool_response: object

    # =========================
    # Response State
    # =========================
    response: str

def create_evidence_record(
    tool_name: str,
    arguments: dict,
    result: dict
) -> dict:

    return {
        "source": tool_name,
        "arguments": arguments,
        "result": result
    }


def extract_incident_id_node(state: AgentState):

    words = state["message"].split()

    for word in words:
        if word.isdigit():
            return {
                "incident_id": int(word)
            }

    return {
        "incident_id": 0
    }


def get_incident_node(
    state: AgentState,
    incident_client: IncidentClient
):

    incident = incident_client.get_incident(
        state["incident_id"],
        state["token"]
    )

    return {
        "incident": incident
    }

def create_investigation_node(
    state: AgentState,
    incident_client: IncidentClient
):
    investigation = incident_client.create_investigation(
        state["incident_id"],
        state["token"]
    )

    incident_client.create_audit_log(
    investigation_id=investigation["id"],
    event_type="INVESTIGATION_STARTED",
    message="Investigation started.",
    token=state["token"]
)

    return {
        "investigation_id": investigation["id"],
        "investigation_status": "IN_PROGRESS"
    }

def load_investigation_history_node(
    state: AgentState,
    incident_client: IncidentClient
):
    investigations = incident_client.get_investigations_by_incident(
        state["incident_id"],
        state["token"]
    )

    recent_investigations = investigations[
        :MAX_PREVIOUS_INVESTIGATIONS
    ]

    return {
        "previous_investigations": recent_investigations
    }

def load_previous_investigation_evidence_node(
    state: AgentState,
    incident_client: IncidentClient
):
    previous_investigations = state.get(
        "previous_investigations",
        []
    )

    previous_evidence = []

    for investigation in previous_investigations:

        investigation_id = investigation["id"]

        evidence = incident_client.get_investigation_evidence(
            investigation_id,
            state["token"]
        )

        evidence = evidence[:MAX_EVIDENCE_PER_INVESTIGATION]

        previous_evidence.append({
            "investigation_id": investigation_id,
            "investigation": investigation,
            "evidence": evidence
        })

    return {
        "previous_investigation_evidence": previous_evidence
    }

def analyze_incident_node(
    state: AgentState,
    llm_service: LLMService
):

    previous_investigations = state.get(
        "previous_investigations",
        []
    )

    previous_investigation_evidence = state.get(
        "previous_investigation_evidence",
        []
    )

    prompt = f"""
You are investigating a production incident.

Your task is to analyze the current incident using:
1. Current incident data
2. Relevant historical investigation context
3. Evidence collected during previous investigations

You must remain strictly evidence-based.


CURRENT INCIDENT

{state["incident"]}


RECENT PREVIOUS INVESTIGATIONS

{previous_investigations}


EVIDENCE FROM PREVIOUS INVESTIGATIONS

{previous_investigation_evidence}


IMPORTANT DISTINCTION BETWEEN CURRENT AND HISTORICAL DATA

Current incident data represents the current state of the incident.

Historical investigations and historical evidence represent
observations collected during previous investigations.

Historical evidence may be useful for understanding the incident,
but it must NOT automatically be treated as current evidence.

Do not assume that a historical observation is still true unless
current evidence confirms it.


EVIDENCE RULES

- Use only information contained in the incident data and evidence
  provided above.

- Do not invent facts.

- Do not invent logs.

- Do not invent metrics.

- Do not invent timestamps.

- Do not invent service states.

- Do not invent configuration values.

- Do not invent historical events.

- Do not claim that a root cause has been confirmed unless the
  available evidence proves it.

- Clearly distinguish confirmed observations from hypotheses.

- Do not treat correlation as causation.

- If evidence is insufficient to determine the root cause,
  explicitly state that the root cause has not been confirmed.

- Do not infer continuous persistence from observations that were
  collected at different timestamps unless the evidence explicitly
  establishes continuity.

- Do not describe an issue as persistent, systemic, structural,
  continuous, or permanent unless the available evidence supports
  that conclusion.

- When observations are separated in time, describe them as
  observations at those specific timestamps rather than assuming
  the condition existed continuously between them.


AVAILABLE INVESTIGATION CAPABILITIES

The investigation system currently has ONLY these tools:

1. get_incident_details
2. check_service_health
3. get_service_logs

These are the complete set of available investigation tools.


TOOL RESTRICTIONS

- Do not recommend, name, or reference any tool other than the
  three tools listed above.

- Do not invent tool names.

- Do not suggest hypothetical tools.

- Do not assume that deployment-history tools exist.

- Do not assume that dependency-discovery tools exist.

- Do not assume that configuration-inspection tools exist.

- Do not assume that database-inspection tools exist.

- Do not assume that infrastructure-monitoring tools exist.

- Do not describe unavailable capabilities as if they exist.

- If additional diagnostic information is required but none of the
  three available tools can provide it, explicitly state:

  "The current system does not have a tool capable of collecting
  this information."


INVESTIGATION GUIDANCE

Your analysis should:

1. Identify what is directly known from the current incident.

2. Identify useful historical observations.

3. Identify possible causes as hypotheses only.

4. Identify what evidence is still missing.

5. Determine whether one of the three available investigation tools
   could provide useful additional evidence.

6. Prefer collecting new evidence when existing evidence is
   insufficient.

7. Do not recommend repeating a tool unnecessarily if the same
   investigation already collected sufficient evidence from it.

8. If the available tools cannot provide the required information,
   explicitly state the limitation instead of inventing another tool.


OUTPUT

Provide:

1. A short analysis of the incident.

2. Possible causes.

3. Immediate actions.

Clearly distinguish:

- Current incident facts
- Historical evidence
- Hypotheses
- Evidence that is still missing
- Recommended actions

Do not claim that a hypothesis is a confirmed root cause.

Do not mention tools that do not exist in the system.
"""

    analysis = llm_service.generate_response(prompt)

    return {
        "analysis": analysis
    }

def decide_next_action_node(state: AgentState):

    incident = state["incident"]

    status = incident.get("status", "").upper()
    severity = incident.get("severity", "").upper()

    if status == "OPEN" and severity in ["CRITICAL", "HIGH"]:
        return {
            "next_action": "investigate"
        }

    return {
        "next_action": "respond"
    }


def route_after_decision(state: AgentState):

    if state["next_action"] == "investigate":
        return "investigate"

    return "respond"


def route_after_approval(state: AgentState):

    if state["next_action"] == "continue_investigation":
        return "continue"

    return "reject"


def select_investigation_tool_node(
    state: AgentState,
    llm_service: LLMService
):
    current_history = state.get(
        "investigation_history",
        []
    )

    historical_evidence = state.get(
        "previous_investigation_evidence",
        []
    )

    used_tools = [
        item["source"]
        for item in current_history
    ]

    prompt = f"""
You are investigating a production incident.

Incident ID:
{state["incident_id"]}

Current incident:
{state["incident"]}

Historical investigations:
{state.get("previous_investigations", [])}

Historical evidence from previous investigations:
{historical_evidence}

Evidence collected during the CURRENT investigation:
{current_history}

Tools already used during the CURRENT investigation:
{used_tools}

Available tools:
- get_incident_details
- check_service_health
- get_service_logs

Important distinction:

Historical evidence is evidence collected during
previous investigations.

Current investigation evidence is evidence collected
during this investigation.

Rules:

1. Do not treat historical evidence as newly collected
   evidence.

2. Use historical evidence to understand what has already
   been observed.

3. Do not repeat a current investigation tool that has
   already been used.

4. A tool may still be useful in the current investigation
   if historical evidence is old or insufficient.

5. Prefer collecting new evidence when it can confirm,
   update, or challenge historical findings.

6. Do not invent tools.

7. For service-specific tools such as
   check_service_health and get_service_logs:

   - Use service names explicitly mentioned in the
     current incident or collected evidence.
   - Do not invent related infrastructure or dependency
     names.
   - Do not assume that a database, queue, cache, or
     downstream service exists unless it is mentioned
     in the available evidence.

8. If the available evidence is already sufficient,
   do not call another tool.

Select the most useful next investigation step.
"""

    response = llm_service.generate_tool_response(
        prompt
    )

    return {
        "tool_response": response,
        "investigation_status": "INVESTIGATING"
    }

def normalize_mcp_result(tool_result):
    if isinstance(tool_result, dict):
        return tool_result

    if hasattr(tool_result, "content"):
        text_parts = []

        for item in tool_result.content:
            if hasattr(item, "text"):
                text_parts.append(item.text)

        if text_parts:
            import json

            combined_text = "\n".join(text_parts)

            try:
                if len(text_parts) == 1:
                    return json.loads(text_parts[0])

                return [
                    json.loads(text)
                    for text in text_parts
                ]

            except json.JSONDecodeError:
                return {
                    "raw_result": combined_text
                }

    return {
        "raw_result": str(tool_result)
    }

def execute_investigation_tool_node(
    state: AgentState,
    incident_client: IncidentClient,
    llm_service: LLMService,
    mcp_client: MCPClient
):
    response = state["tool_response"]

    if not response.tool_calls:
        return {
            "investigation_history": state.get(
                "investigation_history",
                []
            )
        }

    tool_call = response.tool_calls[0]

    try:

        raw_tool_result = mcp_client.call_tool(
            tool_name=tool_call["name"],
            arguments=tool_call["args"],
            token=state["token"]
        )
        tool_result = normalize_mcp_result(raw_tool_result)

        audit_event_type = "TOOL_EXECUTED"

    except Exception as error:

        tool_result = {
            "success": False,
            "tool": tool_call["name"],
            "arguments": tool_call["args"],
            "error": str(error)
        }

        audit_event_type = "TOOL_FAILED"

    history = state.get(
        "investigation_history",
        []
    )

    evidence = create_evidence_record(
        tool_name=tool_call["name"],
        arguments=tool_call["args"],
        result=tool_result
    )

    history = history + [evidence]

    # Persist evidence in Spring/MySQL
    incident_client.add_investigation_evidence(
        investigation_id=state["investigation_id"],
        tool_name=tool_call["name"],
        arguments=str(tool_call["args"]),
        result=str(tool_result),
        token=state["token"]
    )

    # Persist audit log in Spring/MySQL
    incident_client.create_audit_log(
        investigation_id=state["investigation_id"],
        event_type=audit_event_type,
        message=(
            f"Tool '{tool_call['name']}' "
            f"was executed with arguments "
            f"{tool_call['args']}."
        ),
        token=state["token"]
    )

    return {
        "investigation_history": history,
        "investigation_status": "EVALUATING_EVIDENCE"
    }

def route_investigation(state: AgentState):

    if state["next_action"] == "continue_investigation":
        return "continue"

    return "final"

def finalize_investigation_node(
    state: AgentState,
    llm_service: LLMService,
    incident_client: IncidentClient
):
    history = state.get("investigation_history", [])

    evidence_summary = build_evidence_summary(history)

    prompt = f"""
You are the final investigator for a production incident.

Your job is to produce a cautious, evidence-based investigation
conclusion using ONLY the incident data and investigation evidence
provided below.

Incident:
{state["incident"]}

Investigation evidence:
{evidence_summary}

Previously executed tools in this investigation:
{[item.get("source") for item in history]}


STRUCTURE

Your conclusion MUST use exactly these sections:

### Confirmed Facts

List only facts directly supported by the incident data
or collected tool results.

Do not include assumptions or interpretations as confirmed facts.


### Hypotheses

List possible explanations for the incident.

Every item in this section MUST clearly be presented as a hypothesis,
not as a confirmed root cause.

Do not claim that a hypothesis is the actual root cause unless
the provided evidence proves it.


### Recommended Next Steps

List practical actions that would help verify the hypotheses
or mitigate the incident.

Recommendations MUST be based on the available evidence.


IMPORTANT EVIDENCE RULES

- Base your conclusion ONLY on the incident data and investigation
  evidence provided above.

- Do not invent tool results.

- Do not invent metrics.

- Do not invent logs.

- Do not invent configurations.

- Do not invent timestamps.

- Do not invent service states.

- Do not invent historical events.

- Do not treat correlation as causation.

- Do not claim a root cause unless the evidence proves it.

- Clearly distinguish confirmed facts from hypotheses.

- Do not claim that a problem is persistent, systemic, or confirmed
  unless the provided evidence establishes this.

- If the evidence is insufficient to determine the root cause,
  explicitly say that the root cause has not been confirmed.


AVAILABLE INVESTIGATION TOOLS

The ONLY investigation tools that exist in this system are:

1. get_incident_details
2. check_service_health
3. get_service_logs

You MUST NOT name, recommend, reference, or invent any other
investigation tool.

Do not refer to hypothetical tools.

Do not suggest tools that are not listed above.

Do not describe unavailable tools as if they exist.


TOOL REUSE RULE

The following tools have already been executed during this
investigation:

{[item.get("source") for item in history]}

Do NOT recommend executing a tool that has already been executed
unless there is a specific evidence-based reason that fresh data
from that tool is required.

If a tool has already provided the required evidence, do not
recommend running it again merely to repeat the same observation.


LIMITATION RULE

If additional diagnostic information is required but none of the
three available tools can provide that information, explicitly state:

"The current system does not have a tool capable of collecting
this information."

Do not replace this limitation with an invented tool name.


FINAL RESPONSE RULES

- Be concise but sufficiently detailed.

- Use only the three required sections.

- Do not add sections such as "Root Cause", "Available Tools",
  "Tool Recommendations", or "Additional Investigation".

- Confirmed Facts must contain only evidence-backed facts.

- Hypotheses must remain hypotheses.

- Recommended Next Steps must be practical and supported by
  the available evidence.

- Do not claim that additional information exists when it was
  not collected.

- Do not recommend unavailable capabilities.

- Do not call any tools.
"""

    response = llm_service.generate_response(prompt)

    final_analysis = (
        state["analysis"]
        + "\n\n"
        + "Investigation Evidence:\n"
        + evidence_summary
        + "\n\n"
        + "Gemini Investigation:\n"
        + response
    )

    # Persist final investigation result
    incident_client.complete_investigation(
        investigation_id=state["investigation_id"],
        final_analysis=final_analysis,
        token=state["token"]
    )
    incident_client.create_audit_log(
    investigation_id=state["investigation_id"],
    event_type="INVESTIGATION_COMPLETED",
    message="Investigation completed.",
    token=state["token"]
)

    return {
        "analysis": final_analysis,
        "investigation_status": "FINALIZED"
    }

def generate_response_node(state: AgentState):

    response = f"""
Incident ID: {state["incident_id"]}

Analysis:
{state["analysis"]}
"""

    return {
        "response": response.strip(),
        "investigation_status": "COMPLETED"
    }


def prepare_request_node(state: AgentState):

    message = state["message"].strip()

    return {
        "message": message
    }


def analyze_request_node(state: AgentState):

    message = state["message"].lower()

    if "incident" in message:

        request_type = "incident"

        analysis = (
            "The user wants to work with an incident."
        )

    else:

        request_type = "general"

        analysis = (
            "The user has asked a general question."
        )

    return {
        "request_type": request_type,
        "analysis": analysis
    }


def route_request(state: AgentState):

    if state["request_type"] == "incident":
        return "incident"

    return "general"


def generate_general_response_node(
    state: AgentState,
    llm_service: LLMService
):

    prompt = f"""
Answer the user's question clearly and helpfully.

User question:
{state["message"]}
"""

    response = llm_service.generate_response(
        prompt
    )

    return {
        "response": response
    }
def should_continue_investigation_node(
    state: AgentState,
    llm_service: LLMService
):
    
    history = state.get(
        "investigation_history",
        []
    )
    
    used_tools = [
        item["source"]
        for item in history
    ]
    
    # Safety limit
    if len(history) >= 3:
        return {
            "next_action": "final"
        }
    
    # Service logs are an important diagnostic source.
    # Do not finalize before collecting them.
    if "get_service_logs" not in used_tools:
        return {
            "next_action": "continue_investigation"
        }
    
    prompt = f"""
You are deciding whether a production incident needs
more investigation.

Incident:
{state["incident"]}

Evidence collected so far:
{history}

Available investigation tools:
- get_incident_details
- check_service_health
- get_service_logs

Decide whether the available evidence is sufficient
to produce a useful incident investigation conclusion.

Return exactly one word:

CONTINUE

if another investigation tool would provide useful
additional evidence.

Or:

FINAL

if the evidence is sufficient and no more tool calls
are necessary.

Do not call any tools.
"""

    response = llm_service.generate_response(
        prompt
    )

    decision = response.strip().upper()

    if decision == "CONTINUE":
        return {
            "next_action": "continue_investigation"
        }

    return {
        "next_action": "final"
    }

def human_approval_node(state: AgentState):

    approval = interrupt({
        "type": "investigation_approval",
        "message": (
            "The agent wants to continue the investigation "
            "and execute another investigation tool."
        ),
        "incident_id": state["incident_id"],
        "current_evidence": state.get(
            "investigation_history",
            []
        ),
        "next_action": state.get(
            "next_action"
        )
    })

    if approval == "approve":
        return {
            "next_action": "continue_investigation"
        }

    return {
        "next_action": "reject"
    }

def reject_investigation_node(
    state: AgentState,
    incident_client: IncidentClient
):
    incident_client.reject_investigation(
        investigation_id=state["investigation_id"],
        token=state["token"]
    )

    incident_client.create_audit_log(
        investigation_id=state["investigation_id"],
        event_type="INVESTIGATION_REJECTED",
        message="Investigation rejected by the human operator.",
        token=state["token"]
    )

    return {
        "investigation_status": "REJECTED",
        "response": (
            "Investigation was rejected by the human operator."
        )
    }

def build_evidence_summary(history: list) -> str:

    if not history:
        return "No investigation evidence was collected."

    lines = []

    for index, evidence in enumerate(history, start=1):

        lines.append(
            f"""
Evidence {index}
Source: {evidence["source"]}
Arguments: {evidence["arguments"]}
Result: {evidence["result"]}
"""
        )

    return "\n".join(lines)

def create_incident_graph(
    llm_service: LLMService,
    incident_client: IncidentClient,
    mcp_client: MCPClient
):

    graph = StateGraph(AgentState)

    # -------------------------
    # General response node
    # -------------------------
    graph.add_node(
    "should_continue_investigation",
    lambda state:
        should_continue_investigation_node(
            state,
            llm_service
        )
)

    graph.add_node(
    "load_investigation_history",
    lambda state:
        load_investigation_history_node(
            state,
            incident_client
        )
)
    graph.add_node(
    "load_previous_investigation_evidence",
    lambda state:
        load_previous_investigation_evidence_node(
            state,
            incident_client
        )
)
    
    graph.add_node(
        "generate_general_response",
        lambda state:
            generate_general_response_node(
                state,
                llm_service
            )
    )
    graph.add_node(
    "create_investigation",
    lambda state: create_investigation_node(
        state,
        incident_client
    )
)

    # -------------------------
    # Decision node
    # -------------------------

    graph.add_node(
        "decide_next_action",
        decide_next_action_node
    )

    # -------------------------
    # Investigation node
    # -------------------------
        
    graph.add_node(
        "select_investigation_tool",
        lambda state:
            select_investigation_tool_node(
                state,
                llm_service
            )
    )
    
    graph.add_node(
        "execute_investigation_tool",
        lambda state:
            execute_investigation_tool_node(
                state,
                incident_client,
                llm_service,
                mcp_client
            )
    )
    graph.add_node(
    "human_approval",
    human_approval_node
)
    graph.add_node(
    "reject_investigation",
    lambda state:
        reject_investigation_node(
            state,
            incident_client
        )
)
    
    graph.add_node(
        "finalize_investigation",
        lambda state:
            finalize_investigation_node(
                state,
                llm_service,
                incident_client
            )
    )
    
    # -------------------------
    # Prepare request
    # -------------------------

    graph.add_node(
        "prepare_request",
        prepare_request_node
    )

    # -------------------------
    # Extract incident ID
    # -------------------------

    graph.add_node(
        "extract_incident_id",
        extract_incident_id_node
    )

    # -------------------------
    # Get incident from Spring Boot
    # -------------------------

    graph.add_node(
        "get_incident",
        lambda state:
            get_incident_node(
                state,
                incident_client
            )
    )

    # -------------------------
    # Analyze incident using Gemini
    # -------------------------

    graph.add_node(
        "analyze_incident",
        lambda state:
            analyze_incident_node(
                state,
                llm_service
            )
    )

    # -------------------------
    # Generate final response
    # -------------------------

    graph.add_node(
        "generate_response",
        generate_response_node
    )

    # -------------------------
    # Analyze user request
    # -------------------------

    graph.add_node(
        "analyze_request",
        analyze_request_node
    )

    # -------------------------
    # Initial flow
    # -------------------------

    graph.add_edge(
        START,
        "prepare_request"
    )

    graph.add_edge(
        "prepare_request",
        "analyze_request"
    )

    # -------------------------
    # Request routing
    # -------------------------

    graph.add_conditional_edges(
        "analyze_request",
        route_request,
        {
            "incident": "extract_incident_id",
            "general": "generate_general_response"
        }
    )

    # -------------------------
    # Incident flow
    # -------------------------

    graph.add_edge(
    "extract_incident_id",
    "get_incident"
)

    graph.add_edge(
    "get_incident",
    "load_investigation_history"
)

    graph.add_edge(
        "load_investigation_history",
        "load_previous_investigation_evidence"
    )
    
    graph.add_edge(
        "load_previous_investigation_evidence",
        "create_investigation"
    )
    
    graph.add_edge(
        "create_investigation",
        "analyze_incident"
    )

    graph.add_edge(
        "analyze_incident",
        "decide_next_action"
    )

    # -------------------------
    # Decision routing
    # -------------------------

    graph.add_conditional_edges(
        "decide_next_action",
        route_after_decision,
        {
            "investigate": "human_approval",
            "respond": "generate_response"
        }
    )
    graph.add_edge(
        "select_investigation_tool",
        "execute_investigation_tool"
    )
    
    graph.add_edge(
    "execute_investigation_tool",
    "should_continue_investigation"
)

    graph.add_conditional_edges(
        "should_continue_investigation",
        route_investigation,
        {
            "continue": "select_investigation_tool",
            "final": "finalize_investigation"
        }
    )
    graph.add_conditional_edges(
    "human_approval",
    route_after_approval,
    {
        "continue": "select_investigation_tool",
        "reject": "reject_investigation"
    }
)
    
    
    graph.add_edge(
        "finalize_investigation",
        "generate_response"
    )

    # -------------------------
    # End points
    # -------------------------

    graph.add_edge(
        "generate_response",
        END
    )

    graph.add_edge(
        "generate_general_response",
        END
    )

    graph.add_edge(
        "reject_investigation",
        END
    )

    checkpointer = InMemorySaver()

    return graph.compile(
        checkpointer=checkpointer
)