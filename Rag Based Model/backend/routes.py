from fastapi import APIRouter,UploadFile,File,Form,status

from time import time

from typing import List
from fastapi.exceptions import HTTPException
from fastapi.responses import JSONResponse
from .schema import ResumeAnalysisRequest,ResumeAnalysisResponseModel
from ..resume_analysis_agent_for_user.agent import resume_analysis_agent


router = APIRouter()
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'txt'}



@router.post('/analyze_resume',response_model=ResumeAnalysisResponseModel)
async def analyze_resume(
    resume: UploadFile = File(...),
    jd_data: str = Form(...),

):
    ext = resume.filename.split('.')[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}. Only PDF< DOCX, and TXT files are allowed."
        )
    
    temp_path = f'temp_files/temp_{time()}{resume.filename}'
    with open(temp_path,'wb') as f:
        f.write(await resume.read())
    
    result =  resume_analysis_agent.invoke({
        'jd_data' : jd_data,
        'resume_path' : temp_path
    })
    return JSONResponse(content=ResumeAnalysisResponseModel(**result).model_dump())