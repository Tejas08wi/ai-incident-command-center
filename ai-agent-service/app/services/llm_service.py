import os
import time

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage

from app.exceptions.ai_exceptions import AIServiceUnavailableError
from app.tools.incident_tools import (
    get_incident_details,
    check_service_health,
    get_service_logs,
)

load_dotenv()


class LLMService:

    MAX_RETRIES = 1
    RETRY_DELAY_SECONDS = 2

    def __init__(self):

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-3.1-flash-lite",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        self.tools = [
            get_incident_details,
            check_service_health,
            get_service_logs
        ]

        self.llm_with_tools = self.llm.bind_tools(self.tools)

    def _is_transient_error(self, error: Exception) -> bool:

        error_code = getattr(error, "code", None)

        if error_code in {429, 500, 502, 503, 504}:
            return True

        error_message = str(error).lower()

        transient_indicators = [
            "429",
            "500",
            "502",
            "503",
            "504",
            "unavailable",
            "temporarily",
            "overloaded",
            "high demand",
            "resource exhausted",
        ]

        return any(
            indicator in error_message
            for indicator in transient_indicators
        )

    def _invoke_with_retry(self, llm, prompt: str):

        last_error = None

        for attempt in range(self.MAX_RETRIES + 1):

            try:
                return llm.invoke(prompt)

            except Exception as error:

                last_error = error

                if not self._is_transient_error(error):
                    raise

                if attempt < self.MAX_RETRIES:
                    time.sleep(self.RETRY_DELAY_SECONDS)

        raise AIServiceUnavailableError(
            "The Gemini AI service is temporarily unavailable. "
            "Please try the investigation again."
        ) from last_error

    def generate_response(self, prompt: str) -> str:

        response = self._invoke_with_retry(
            self.llm,
            prompt
        )

        if isinstance(response.content, str):
            return response.content

        if isinstance(response.content, list):

            text_parts = []

            for block in response.content:

                if (
                    isinstance(block, dict)
                    and block.get("type") == "text"
                ):
                    text_parts.append(
                        block.get("text", "")
                    )

            return "".join(text_parts)

        return str(response.content)

    def generate_tool_response(self, prompt: str):

        return self._invoke_with_retry(
            self.llm_with_tools,
            prompt
        )

    def execute_tool_call(
            self,
            tool_call,
            token,
            incident_client):

        tool_name = tool_call["name"]
        tool_args = tool_call["args"]

        if tool_name == "get_incident_details":

            return incident_client.get_incident(
                tool_args["incident_id"],
                token
            )

        if tool_name == "check_service_health":

            return incident_client.get_service_health(
                tool_args["service_name"],
                token
            )

        if tool_name == "get_service_logs":

            return incident_client.get_service_logs(
                tool_args["service_name"],
                token
            )

        raise ValueError(
            f"Unknown tool: {tool_name}"
        )

    def test_tool_call(self, prompt: str):

        response = self.generate_tool_response(prompt)

        print("GEMINI TOOL RESPONSE:")
        print(response)

        if hasattr(response, "tool_calls"):
            print("TOOL CALLS:")
            print(response.tool_calls)

        return response

    def generate_final_tool_response(
            self,
            prompt: str,
            tool_call,
            tool_result):

        final_prompt = f"""
You are an AI incident investigation assistant.

Original investigation prompt:
{prompt}

Tool selected:
{tool_call}

Tool result:
{tool_result}

Using the tool result, provide the next investigation reasoning step.
Do not invent facts that are not supported by the evidence.
"""

        return self._invoke_with_retry(
            self.llm,
            final_prompt
        )