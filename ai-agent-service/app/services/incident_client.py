
import httpx

from fastapi import HTTPException

class IncidentClient:

    def __init__(self, base_url: str):
        self.base_url = base_url

    def get_incident(self, incident_id: int, token: str):
        url = f"{self.base_url}/api/incidents/{incident_id}"
    
        headers = {
            "Authorization": f"Bearer {token}"
        }
    
        try:
            response = httpx.get(
                url,
                headers=headers
            )
    
            response.raise_for_status()
    
            return response.json()
    
        except httpx.HTTPStatusError as error:
    
            if error.response.status_code == 401:
                raise HTTPException(
                    status_code=401,
                    detail="Authentication failed."
                )
    
            if error.response.status_code == 403:
                raise HTTPException(
                    status_code=403,
                    detail="Access denied."
                )
    
            if error.response.status_code == 404:
                raise HTTPException(
                    status_code=404,
                    detail=f"Incident with ID {incident_id} not found."
                )
    
            raise HTTPException(
                status_code=error.response.status_code,
                detail="Unable to retrieve incident."
            )
    
        except httpx.RequestError:
            raise HTTPException(
                status_code=503,
                detail="Unable to communicate with the Spring Boot backend."
            )
        
    def get_service_logs(
        self,
        service_name: str,
        token: str
):    
    
        url = (
            f"{self.base_url}/api/logs/service/"
            f"{service_name}"
        )
    
        headers = {
            "Authorization": f"Bearer {token}"
        }
    
        result = self._get_with_retry(
            url,
            headers
        )
    
        if isinstance(result, dict) and result.get("success") is False:
            result["service"] = service_name
            result["error"] = (
                f"Unable to retrieve logs "
                f"for service '{service_name}': "
                f"{result.get('error', 'Unknown error')}"
            )
    
        return result

    def get_service_health(
        self,
        service_name: str,
        token: str
):    
    
        url = (
            f"{self.base_url}/api/health/service/"
            f"{service_name}"
        )
    
        headers = {
            "Authorization": f"Bearer {token}"
        }
    
        result = self._get_with_retry(
            url,
            headers
        )
    
        if isinstance(result, dict) and result.get("success") is False:
            result["service"] = service_name
            result["error"] = (
                f"Unable to retrieve health information "
                f"for service '{service_name}': "
                f"{result.get('error', 'Unknown error')}"
            )
    
        return result

    def create_investigation(self, incident_id: int, token: str):

        url = (
            f"{self.base_url}/api/investigations/incident/"
            f"{incident_id}"
        )

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = httpx.post(
            url,
            headers=headers
        )

        response.raise_for_status()

        return response.json()

    def add_investigation_evidence(
        self,
        investigation_id: int,
        tool_name: str,
        arguments: str,
        result: str,
        token: str
    ):

        url = (
            f"{self.base_url}/api/investigations/"
            f"{investigation_id}/evidence"
        )

        headers = {
            "Authorization": f"Bearer {token}"
        }

        params = {
            "toolName": tool_name,
            "arguments": arguments,
            "result": result
        }

        response = httpx.post(
            url,
            headers=headers,
            params=params
        )

        response.raise_for_status()

        return response.json()

    def complete_investigation(
        self,
        investigation_id: int,
        final_analysis: str,
        token: str
    ):

        url = (
            f"{self.base_url}/api/investigations/"
            f"{investigation_id}/complete"
        )

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = httpx.put(
            url,
            headers=headers,
            content=final_analysis
        )

        response.raise_for_status()

        return response.json()

    def reject_investigation(
        self,
        investigation_id: int,
        token: str
):    
        url = (
            f"{self.base_url}/api/investigations/"
            f"{investigation_id}/reject"
        )
    
        headers = {
            "Authorization": f"Bearer {token}"
        }
    
        response = httpx.put(
            url,
            headers=headers
        )
    
        response.raise_for_status()
    
        return response.json()

    def get_investigations_by_incident(
        self,
        incident_id: int,
        token: str
    ):

        url = (
            f"{self.base_url}/api/investigations/incident/"
            f"{incident_id}"
        )

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = httpx.get(
            url,
            headers=headers
        )

        response.raise_for_status()

        return response.json()

    def get_investigation_evidence(
        self,
        investigation_id: int,
        token: str
    ):

        url = (
            f"{self.base_url}/api/investigations/"
            f"{investigation_id}/evidence"
        )

        headers = {
            "Authorization": f"Bearer {token}"
        }

        response = httpx.get(
            url,
            headers=headers
        )

        response.raise_for_status()

        return response.json()


    def create_audit_log(
        self,
        investigation_id: int,
        event_type: str,
        message: str,
        token: str
):    
    
        url = (
            f"{self.base_url}/api/investigations/"
            f"{investigation_id}/audit-logs"
        )
    
        headers = {
            "Authorization": f"Bearer {token}"
        }
    
        params = {
            "eventType": event_type,
            "message": message
        }
    
        response = httpx.post(
            url,
            headers=headers,
            params=params
        )
    
        response.raise_for_status()
    
        return response.json()
    
    def _get_with_retry(
        self,
        url: str,
        headers: dict,
        max_retries: int = 1
):    
    
        for attempt in range(max_retries + 1):
    
            try:
    
                response = httpx.get(
                    url,
                    headers=headers
                )
    
                if response.is_success:
                    return response.json()
    
                if (
                    response.status_code in [500, 502, 503, 504]
                    and attempt < max_retries
                ):
                    continue
    
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": "Request failed."
                }
    
            except httpx.RequestError as error:
    
                if attempt < max_retries:
                    continue
    
                return {
                    "success": False,
                    "status_code": None,
                    "error": str(error)
                }