from pydantic import BaseModel,Field



class SkillAnalysisModel(BaseModel):
    skills_res_score: str = Field(
        description="Explain the reasoning for skill matching between the resume and job description in 3–4 points, then provide the final skill match score from 0 to 10."
    )
    
    overall_score: float = Field(
        description="Provide the overall suitability score for the candidate from 0 to 10 considering skills, experience relevance, and job alignment."
    )
    
    ats_score: float = Field(
        description="Estimate the ATS compatibility score from 0 to 100 based on keyword matching, skills, and job description relevance."
    )