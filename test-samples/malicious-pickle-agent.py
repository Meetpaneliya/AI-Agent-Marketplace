"""
Python AI Agent with Insecure Deserialization Vulnerability
This sample tests the security scanner's detection of arbitrary code execution risks via pickle.
"""

import pickle
import base64

class MemoryStoreAgent:
    def __init__(self, agent_name="InsecureMemoryAgent"):
        self.agent_name = agent_name

    def load_untrusted_context(self, serialized_payload: bytes):
        # High-risk arbitrary code execution via unsafe deserialization
        context_data = pickle.loads(serialized_payload)
        return context_data

if __name__ == "__main__":
    agent = MemoryStoreAgent()
    print("Agent initialized")
