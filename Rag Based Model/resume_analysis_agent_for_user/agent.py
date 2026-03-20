from langgraph.graph import StateGraph,START,END
from .state import ResumeAnalysisState
from .nodes import (
    extract_requirements_from_jd,
    extract_data_from_resume,
    calculate_ats_score,
    find_weakness_and_suggestion,
    improvements_needed,
    merge_extraction_state 
)

graph = StateGraph(ResumeAnalysisState)



graph.add_node('extract_data_from_resume',extract_data_from_resume)
graph.add_node('extract_requirements_from_jd',extract_requirements_from_jd)
graph.add_node('calculate_ats_score',calculate_ats_score)
graph.add_node('find_weakness_and_suggestion',find_weakness_and_suggestion)
graph.add_node('improvements_needed',improvements_needed)
graph.add_node('merge_extraction_state',merge_extraction_state)

graph.add_edge(START,'extract_data_from_resume')
graph.add_edge(START,'extract_requirements_from_jd')


graph.add_edge('extract_data_from_resume','merge_extraction_state')
graph.add_edge('extract_requirements_from_jd','merge_extraction_state')

graph.add_edge('merge_extraction_state','calculate_ats_score')
graph.add_edge('merge_extraction_state','improvements_needed')
graph.add_edge('merge_extraction_state','find_weakness_and_suggestion')

graph.add_edge('calculate_ats_score',END)
graph.add_edge('improvements_needed',END)
graph.add_edge('find_weakness_and_suggestion',END)

resume_analysis_agent = graph.compile()