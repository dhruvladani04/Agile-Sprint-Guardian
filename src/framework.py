import os
import asyncio
import json
from typing import List, Type, Any, Union, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

class Agent:
    def __init__(self, model: str, system_instruction: str, output_type: Type[BaseModel], name: str = "Agent"):
        self.model = model
        self.system_instruction = system_instruction
        self.output_type = output_type
        self.name = name
        api_key = os.environ.get("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in a .env file.")
        self.client = genai.Client(api_key=api_key)

    async def run(self, input_data: Any) -> Any:
        prompt = str(input_data)
        
        # Construct the request
        response = self.client.models.generate_content(
            model=self.model,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=self.system_instruction,
                response_mime_type="application/json",
                response_schema=self.output_type
            )
        )
        
        # Parse the output
        try:
            return response.parsed
        except Exception as e:
            print(f"Error parsing response: {e}")
            # Fallback text parsing if needed, but SDK should handle it
            return response.text

class SequentialAgent:
    def __init__(self, agents: List[Any], name: str = "Sequential"):
        self.agents = agents
        self.name = name

    async def run(self, input_data: Any) -> Any:
        current_input = input_data
        for agent in self.agents:
            print(f"[{self.name}] Running {getattr(agent, 'name', agent.__class__.__name__)}...")
            current_input = await agent.run(current_input)
        return current_input

class ParallelAgent:
    def __init__(self, agents: List[Any], name: str = "Parallel"):
        self.agents = agents
        self.name = name

    async def run(self, input_data: Any) -> List[Any]:
        print(f"[{self.name}] Running {len(self.agents)} agents in parallel...")
        tasks = [agent.run(input_data) for agent in self.agents]
        results = await asyncio.gather(*tasks)
        return results

class Runner:
    def __init__(self, agent: Any):
        self.agent = agent

    async def run(self, input: Any) -> Any:
        return await self.agent.run(input)
