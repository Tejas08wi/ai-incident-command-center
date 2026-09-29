import anyio
import httpx2

from mcp import Client
from mcp.client.streamable_http import streamable_http_client


class MCPClient:

    def __init__(
        self,
        server_url: str
    ):
        self.server_url = server_url

    async def _call_tool_async(
        self,
        tool_name: str,
        arguments: dict,
        token: str
    ):

        async with httpx2.AsyncClient(
            headers={
                "Authorization": f"Bearer {token}"
            }
        ) as http_client:

            transport = streamable_http_client(
                self.server_url,
                http_client=http_client
            )

            async with Client(transport) as client:

                result = await client.call_tool(
                    tool_name,
                    arguments
                )

                return result

    def call_tool(
        self,
        tool_name: str,
        arguments: dict,
        token: str
    ):

        return anyio.run(
            self._call_tool_async,
            tool_name,
            arguments,
            token
        )