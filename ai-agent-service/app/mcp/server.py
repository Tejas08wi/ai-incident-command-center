from mcp.server.mcpserver import MCPServer, Context

from app.services.incident_client import IncidentClient


mcp = MCPServer("Incident Command Center")

incident_client = IncidentClient(
    "http://localhost:8081"
)


@mcp.tool()
def get_incident_details(
    incident_id: int,
    ctx: Context
):
    """
    Retrieve detailed information about a production incident.
    """

    headers = ctx.headers or {}

    authorization = headers.get("authorization")

    if not authorization:
        raise ValueError(
            "Missing Authorization header."
        )

    if not authorization.startswith("Bearer "):
        raise ValueError(
            "Invalid Authorization header."
        )

    token = authorization[len("Bearer "):]

    return incident_client.get_incident(
        incident_id,
        token
    )


@mcp.tool()
def check_service_health(
    service_name: str,
    ctx: Context
):
    """
    Check the health of a production service.
    """

    headers = ctx.headers or {}

    authorization = headers.get("authorization")

    if not authorization:
        raise ValueError(
            "Missing Authorization header."
        )

    if not authorization.startswith("Bearer "):
        raise ValueError(
            "Invalid Authorization header."
        )

    token = authorization[len("Bearer "):]

    return incident_client.get_service_health(
        service_name,
        token
    )


@mcp.tool()
def get_service_logs(
    service_name: str,
    ctx: Context
):
    """
    Retrieve recent error logs for a production service.
    """

    headers = ctx.headers or {}

    authorization = headers.get("authorization")

    if not authorization:
        raise ValueError(
            "Missing Authorization header."
        )

    if not authorization.startswith("Bearer "):
        raise ValueError(
            "Invalid Authorization header."
        )

    token = authorization[len("Bearer "):]

    return incident_client.get_service_logs(
        service_name,
        token
    )

if __name__ == "__main__":
    mcp.run(
        transport="streamable-http",
        host="127.0.0.1",
        port=8001
    )