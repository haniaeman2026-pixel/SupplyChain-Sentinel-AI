
from pydantic import BaseModel, Field
from typing import Optional


class CrisisRequest(BaseModel):
    crisis_type: str = Field(
        ...,
        description="Type of supply chain disruption"
    )

    description: str = Field(
        ...,
        min_length=5,
        max_length=2000
    )

    affected_product: Optional[str] = None
    affected_region: Optional[str] = None
    urgency: str = "High"


class ReviewRequest(BaseModel):
    report_id: str
    decision: str
    reviewer: str = "Admin"
    comments: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    application: str
    version: str
