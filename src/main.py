import os
import asyncio
from dotenv import load_dotenv
from src.framework import SequentialAgent, ParallelAgent, Runner
from src.agents.po import create_po_agent
from src.agents.specialists import create_tech_lead_agent, create_secops_agent
from src.agents.gatekeeper import create_gatekeeper_agent
from src.schemas import FinalTicket

load_dotenv()

def save_ticket(ticket: FinalTicket):
    """Saves the final ticket to the tickets/ directory."""
    os.makedirs("tickets", exist_ok=True)
    filename = f"tickets/{ticket.summary.replace(' ', '_').lower()}.json"
    with open(filename, "w") as f:
        f.write(ticket.model_dump_json(indent=2))
    print(f"Ticket saved to {filename}")

async def main():
    print("Agile Sprint Guardian 2.0 Initialized")
    
    # Get input from user
    brain_dump = input("Enter your product requirement 'brain dump':\n")
    
    # Instantiate Agents
    po_agent = create_po_agent()
    tech_agent = create_tech_lead_agent()
    secops_agent = create_secops_agent()
    gatekeeper_agent = create_gatekeeper_agent()

    # Define the Workflow
    # Since our custom framework is simple, we need to manage the data flow slightly.
    # The SequentialAgent passes output of one to the next.
    # The ParallelAgent takes one input and gives a list of outputs.
    # The Gatekeeper needs ALL previous outputs.
    
    # Custom flow logic:
    # 1. PO Agent -> UserStory
    # 2. UserStory -> [TechEstimate, SecurityReview]
    # 3. [UserStory, TechEstimate, SecurityReview] -> Gatekeeper -> FinalTicket
    
    # We can wrap this in a custom "Orchestrator" class or just define it here.
    # To keep it compatible with the "SequentialAgent" pattern, we can create a wrapper 
    # that bundles the UserStory with the specialist outputs.
    
    class ContextAggregator:
        async def run(self, inputs):
            # inputs is [TechEstimate, SecurityReview] (from ParallelAgent)
            # But we lost the UserStory! 
            # We need a way to preserve context.
            # Let's do it explicitly in the main loop for clarity, 
            # or modify the ParallelAgent to accept a tuple.
            pass

    # Let's run it step-by-step using the Runner for the first part
    print("Running PO Agent...")
    user_story = await po_agent.run(brain_dump)
    print(f"User Story Created: {user_story.title}")
    
    print("Running Specialists...")
    specialists = ParallelAgent([tech_agent, secops_agent])
    specialist_results = await specialists.run(user_story)
    tech_estimate, security_review = specialist_results
    
    print("Running Gatekeeper...")
    # Gatekeeper needs all 3 inputs.
    gatekeeper_input = {
        "user_story": user_story,
        "tech_estimate": tech_estimate,
        "security_review": security_review
    }
    final_ticket = await gatekeeper_agent.run(gatekeeper_input)
    
    save_ticket(final_ticket)

if __name__ == "__main__":
    asyncio.run(main())
