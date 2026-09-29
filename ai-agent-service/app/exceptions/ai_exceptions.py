class AIServiceUnavailableError(Exception):
    """Raised when the AI provider is temporarily unavailable."""

    def __init__(self, message: str = "AI service is temporarily unavailable."):
        self.message = message
        super().__init__(self.message)