from typing import List, Optional
from pydantic import BaseModel, Field

class UserStory(BaseModel):
    """Represents a cleaned and structured user story."""
    title: str = Field(..., description="A concise title for the user story.")
    description: str = Field(..., description="A detailed description of the user story.")
    acceptance_criteria: List[str] = Field(..., description="List of acceptance criteria.")
    priority: str = Field(..., description="Priority level (e.g., High, Medium, Low).")

class TechEstimate(BaseModel):
    """Represents the technical estimation for a user story."""
    story_points: int = Field(..., description="Estimated story points (Fibonacci sequence).")
    complexity: str = Field(..., description="Complexity level (e.g., Low, Medium, High).")
    technical_notes: str = Field(..., description="Technical implementation details and dependencies.")
    dependencies: List[str] = Field(default_factory=list, description="List of technical dependencies.")

class SecurityReview(BaseModel):
    """Represents the security review for a user story."""
    owasp_risks: List[str] = Field(default_factory=list, description="Identified OWASP Top 10 risks.")
    mitigation_strategies: List[str] = Field(default_factory=list, description="Strategies to mitigate identified risks.")
    approval_status: str = Field(..., description="Security approval status (Approved, Rejected, Needs Revision).")
    comments: str = Field(..., description="General security comments.")

class FinalTicket(BaseModel):
    """Represents the final, production-ready JIRA ticket."""
    summary: str = Field(..., description="JIRA ticket summary.")
    description: str = Field(..., description="Full JIRA ticket description including acceptance criteria, tech notes, and security review.")
    story_points: int = Field(..., description="Final story points.")
    labels: List[str] = Field(default_factory=list, description="JIRA labels.")
    priority: str = Field(..., description="JIRA priority.")
