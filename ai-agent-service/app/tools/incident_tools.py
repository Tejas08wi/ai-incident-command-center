from langchain_core.tools import tool


@tool
def get_incident_details(incident_id: int):
    """Retrieve detailed information about a production incident."""

    return {
        "incident_id": incident_id,
        "message": "Incident lookup requested."
    }


@tool
def check_service_health(service_name: str):
    """Check the health of a production service."""

    return {
        "service": service_name,
        "health": "degraded",
        "message": f"The {service_name} service requires further health investigation."
    }

@tool
def get_service_logs(service_name: str):
    """Retrieve recent error logs for a production service."""

    return {
        "service": service_name,
        "message": "Service log retrieval requested."
    }