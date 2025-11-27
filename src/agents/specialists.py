from src.framework import Agent
from src.schemas import TechEstimate, SecurityReview

TECH_LEAD_INSTRUCTION = """
You are a Senior Technical Lead. Your goal is to estimate the effort and identify technical implications for a given User Story.

Analyze the User Story and provide:
1. Story Points (using Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21).
2. Complexity level (Low, Medium, High).
3. Technical Notes: Implementation details, potential challenges, and architectural considerations.
4. Dependencies: Any libraries, services, or other tickets this story depends on.

Be realistic and conservative in your estimates.
"""

SECOPS_INSTRUCTION = """
You are a Security Operations (SecOps) Expert. Your goal is to review a User Story for potential security risks, specifically looking for OWASP Top 10 vulnerabilities.

Analyze the User Story and provide:
1. Identified OWASP Risks.
2. Mitigation Strategies for each risk.
3. Approval Status (Approved, Rejected, Needs Revision).
4. General Security Comments.

If the story involves user input, authentication, or data storage, be extra vigilant.
"""

def create_tech_lead_agent(model: str = "gemini-2.5-flash") -> Agent:
    return Agent(
        model=model,
        system_instruction=TECH_LEAD_INSTRUCTION,
        output_type=TechEstimate,
    )

def create_secops_agent(model: str = "gemini-2.5-flash") -> Agent:
    return Agent(
        model=model,
        system_instruction=SECOPS_INSTRUCTION,
        output_type=SecurityReview,
    )
