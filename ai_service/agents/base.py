import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAgent(ABC):
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"eventhub_ai_service.{name}")
        self.logs: List[str] = []

    def log(self, message: str):
        formatted = f"[{self.name}] {message}"
        self.logger.info(message)
        self.logs.append(formatted)

    @abstractmethod
    def run(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent logic.
        Receives input parameters and returns the mutated or enriched dictionary payload.
        """
        pass
