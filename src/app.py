import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from src.framework import SequentialAgent, ParallelAgent
from src.agents.po import create_po_agent
from src.agents.specialists import create_tech_lead_agent, create_secops_agent
from src.agents.gatekeeper import create_gatekeeper_agent
from src.schemas import FinalTicket

load_dotenv()

app = FastAPI(title="Agile Sprint Guardian API")

# Allow CORS for dev (frontend running on localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    brain_dump: str

@app.post("/api/generate", response_model=FinalTicket)
async def generate_ticket(request: GenerateRequest):
    try:
        # Instantiate Agents
        po_agent = create_po_agent()
        tech_agent = create_tech_lead_agent()
        secops_agent = create_secops_agent()
        gatekeeper_agent = create_gatekeeper_agent()

        # Run Workflow
        # 1. PO Agent
        user_story = await po_agent.run(request.brain_dump)
        
        # 2. Specialists (Parallel)
        specialists = ParallelAgent([tech_agent, secops_agent])
        specialist_results = await specialists.run(user_story)
        tech_estimate, security_review = specialist_results
        
        # 3. Gatekeeper
        gatekeeper_input = {
            "user_story": user_story,
            "tech_estimate": tech_estimate,
            "security_review": security_review
        }
        final_ticket = await gatekeeper_agent.run(gatekeeper_input)
        
        # Save ticket locally as well
        os.makedirs("tickets", exist_ok=True)
        filename = f"tickets/{final_ticket.summary.replace(' ', '_').lower()}.json"
        with open(filename, "w") as f:
            f.write(final_ticket.model_dump_json(indent=2))
            
        return final_ticket

    except Exception as e:
        print(f"Error generating ticket: {e}")
        raise HTTPException(status_code=500, detail=str(e))

import json
from typing import List

@app.get("/api/tickets", response_model=List[FinalTicket])
async def list_tickets():
    tickets = []
    if not os.path.exists("tickets"):
        return tickets
    
    for filename in os.listdir("tickets"):
        if filename.endswith(".json"):
            try:
                with open(os.path.join("tickets", filename), "r") as f:
                    data = json.load(f)
                    tickets.append(FinalTicket(**data))
            except Exception as e:
                print(f"Error reading ticket {filename}: {e}")
    
    return tickets

@app.delete("/api/tickets/{summary}")
async def delete_ticket(summary: str):
    filename = f"tickets/{summary.replace(' ', '_').lower()}.json"
    if os.path.exists(filename):
        os.remove(filename)
        return {"message": "Ticket deleted successfully"}
    raise HTTPException(status_code=404, detail="Ticket not found")

# Serve static files (Frontend) - Only if dist exists
if os.path.exists("ui/dist"):
    app.mount("/", StaticFiles(directory="ui/dist", html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
