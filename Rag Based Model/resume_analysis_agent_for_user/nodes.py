from .state import ResumeAnalysisState
from langchain_classic.output_parsers import PydanticOutputParser
from langchain_core.output_parsers import StrOutputParser
from .models import SkillAnalysisModel
from .prompts import ats_calc_prompt,improvement_prompt,suggestion_prompt,skill_extraction_prompt_from_jd
from ..llms import llm1,llm2,llm3
from langchain_community.document_loaders import PyPDFLoader,Docx2txtLoader




def calculate_ats_score(state: ResumeAnalysisState):
    resume_text = state['resume_text']
    skill_requirements = state['jd_data']


    parser = PydanticOutputParser(pydantic_object=SkillAnalysisModel)


    chain = ats_calc_prompt | llm2 | parser

    response = chain.invoke(
        {
            'resume_text' : resume_text,
            'jd_data' : skill_requirements,
            'format_instructions' : parser.get_format_instructions()
        }
    )


    return {
        'skills_res_score' : response.skills_res_score,
        'overall_score' : response.overall_score,
        'ats_score' : response.ats_score
    }



def find_weakness_and_suggestion(state: ResumeAnalysisState):

    jd_data = state['jd_data']
    resume_text = state['resume_text']

    parser = StrOutputParser()

    chain = suggestion_prompt | llm2 | parser

    response = chain.invoke({
        'resume_text' : resume_text,
        'jd_data' : jd_data
    })
    return {
        'weaknesses_and_suggestions' : response
    }


def improvements_needed(state: ResumeAnalysisState):
    jd_data = state['jd_data']
    resume_text = state['resume_text']

    parser = StrOutputParser()

    chain = improvement_prompt | llm1 | parser

    response = chain.invoke(
        {
            'resume_text' : resume_text,
            'jd_data' : jd_data
        }
    )
    return {
        'improvements' : response
    }


def merge_extraction_state(state):
    """
    This node does nothing but ensures the state from 
    both extraction nodes is merged before downstream nodes run.
    """
    return state



def extract_data_from_resume(state: ResumeAnalysisState):
    file = state['resume_path']
    if hasattr(file, "name"):
        ext = file.name.split(".")[-1].lower()
    else:
        ext = file.split(".")[-1].lower()

    if ext == "pdf":
        loader = PyPDFLoader(file)
    elif ext == "docx":
        loader = Docx2txtLoader(file)
    elif ext == "txt":
        with open(file, "r", encoding="utf-8") as f:
            return f.read()
    else:
        return ""

    text = ""
    for doc in loader.load():
        text += doc.page_content

    return {
        'resume_text' : text
    }




def extract_requirements_from_jd(
    state: ResumeAnalysisState
):
    jd = state['jd_data']

    parser = StrOutputParser()
    chain = skill_extraction_prompt_from_jd | llm2 | parser

    response = chain.invoke({
        'jd_data' : jd
    })
    return {
        'skill_requirements' : response
    }
