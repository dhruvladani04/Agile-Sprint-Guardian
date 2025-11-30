import asyncio
import os
import json
from dotenv import load_dotenv
from src.framework import SequentialAgent, ParallelAgent
from src.agents.po import create_po_agent
from src.agents.specialists import create_tech_lead_agent, create_secops_agent
from src.agents.qa import create_qa_agent
from src.agents.gatekeeper import create_gatekeeper_agent
from src.schemas import FinalTicket

load_dotenv()

async def reproduce():
    print("Starting reproduction script...")
    
    # Instantiate Agents
    po_agent = create_po_agent()
    tech_agent = create_tech_lead_agent()
    secops_agent = create_secops_agent()
    qa_agent = create_qa_agent()
    gatekeeper_agent = create_gatekeeper_agent()

    brain_dump = "Test Feature for Reproduction"
    
    # 1. PO Agent
    print("Running PO Agent...")
    user_story = await po_agent.run(brain_dump)
    print(f"User Story: {user_story.title}")
    
    # 2. Specialists (Parallel)
    print("Running Specialists...")
    specialists = ParallelAgent([tech_agent, secops_agent, qa_agent])
    specialist_results = await specialists.run(user_story)
    
    print(f"Specialist Results Length: {len(specialist_results)}")
    
    if len(specialist_results) != 3:
        print("ERROR: Expected 3 results, got", len(specialist_results))
        return

    tech_estimate, security_review, test_plan = specialist_results
    
    print("Test Plan Type:", type(test_plan))
    print("Test Plan Content:", test_plan)
    
    if hasattr(test_plan, 'model_dump'):
        print("Test Plan Dump:", test_plan.model_dump())
    else:
        print("ERROR: Test Plan is not a Pydantic model")

if __name__ == "__main__":
    asyncio.run(reproduce())
