from pydantic import BaseModel
from typing import List


class ResumeAnalysisRequest(BaseModel):
    resume_file: bytes
    jd_data: str


class ResumeAnalysisResponseModel(BaseModel):


    skill_requirements: str
    
    ats_score: float
    overall_score: float
    weaknesses_and_suggestions: str
    
    improvements: str