
from typing import TypedDict

class ResumeAnalysisState(TypedDict):
    resume_path: str
    jd_data: str

    skill_requirements: str
    
    resume_text: str
    ats_score: float
    overall_score: float
    weaknesses_and_suggestions: str
    

    skill_res_score: str

    improvements: str