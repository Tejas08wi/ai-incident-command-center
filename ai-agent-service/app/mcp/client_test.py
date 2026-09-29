import os
import anyio
import httpx2

from dotenv import load_dotenv
from mcp import Client
from mcp.client.streamable_http import streamable_http_client

load_dotenv()

MCP_SERVER_URL = "http://127.0.0.1:8001/mcp"


async def main():

    token = os.getenv("MCP_TEST_TOKEN")

    if not token:
        raise ValueError(
            "MCP_TEST_TOKEN is not configured."
        )

    async with httpx2.AsyncClient(
        headers={
            "Authorization": f"Bearer {token}"
        }
    ) as http_client:

        transport = streamable_http_client(
            MCP_SERVER_URL,
            http_client=http_client
        )

        async with Client(transport) as client:

            print("----- MCP SERVER -----")
            print(client.server_info)

            print("\n----- AVAILABLE TOOLS -----")

            tools = await client.list_tools()

            for tool in tools.tools:
                print(
                    f"- {tool.name}: "
                    f"{tool.description}"
                )

            print("\n----- TEST 1: INCIDENT DETAILS -----")

            incident_result = await client.call_tool(
                "get_incident_details",
                {
                    "incident_id": 1
                }
            )

            print(incident_result)

            print("\n----- TEST 2: SERVICE HEALTH -----")

            health_result = await client.call_tool(
                "check_service_health",
                {
                    "service_name": "payment-service"
                }
            )

            print(health_result)

            print("\n----- TEST 3: SERVICE LOGS -----")

            logs_result = await client.call_tool(
                "get_service_logs",
                {
                    "service_name": "payment-service"
                }
            )

            print(logs_result)


if __name__ == "__main__":
    anyio.run(main)