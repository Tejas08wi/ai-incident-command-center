from typing import TypedDict

from langgraph.graph import StateGraph, START, END


class AgentState(TypedDict):
    message: str


def first_node(state: AgentState):
    print("Inside first node")

    return {
        "message": state["message"] + " - processed"
    }


graph = StateGraph(AgentState)

graph.add_node("first", first_node)

graph.add_edge(START, "first")
graph.add_edge("first", END)

app = graph.compile()

result = app.invoke({
    "message": "Hello"
})

print(result)