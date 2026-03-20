
from langchain_classic.prompts import ChatPromptTemplate

skill_extraction_prompt_from_jd = ChatPromptTemplate.from_template("""

You are an expert recruitment assistant with deep knowledge of technical, soft, and domain-specific skills.

Your task is to **read the Job Description carefully** and extract all skills, tools, and requirements explicitly mentioned or clearly implied.

Categories to extract:
1. Technical Skills – programming languages, frameworks, databases, APIs, ML/AI concepts, algorithms.
2. Tools and Technologies – software tools, platforms, cloud services, DevOps tools, version control systems.
3. Soft Skills – communication, teamwork, leadership, problem-solving, critical thinking, adaptability, creativity.
4. Domain Knowledge – industry-specific knowledge such as AI, data science, finance, healthcare, engineering.
5. Other Requirements – certifications, degrees, methodologies, years of experience, specific achievements.

**Guidelines:**
- Extract only what is present or implied in the Job Description.
- Avoid adding skills not mentioned.
- Do not list duplicates.
- Use numbered lists for each category: 1., 2., 3., ...
- If a category has no skills, write "None".
- Be concise and precise; one skill per line.
- Do not include any explanation, comments, or extra text outside the format.

Return strictly in this format:

Technical Skills:
1. ...
2. ...

Tools and Technologies:
1. ...
2. ...

Soft Skills:
1. ...
2. ...

Domain Knowledge:
1. ...
2. ...

Other Requirements:
1. ...
2. ...

Job Description:
{jd_data}
""")




improvement_prompt = ChatPromptTemplate.from_template(
    '''
You are an expert AI resume improvement advisor.

Your task is to analyze the candidate's resume and the job requirements, then provide specific improvements that would make the resume stronger for this role.

Inputs:

Resume:
{resume_text}

Job Requirements:
{jd_data}

Instructions:
- Suggest practical improvements that would increase the candidate's chances of getting shortlisted.
- Focus on improving project descriptions, adding relevant skills, highlighting experience, and improving ATS compatibility.
- Suggestions should be specific and actionable.

Guidelines:
- Write improvements in numbered points.
- Focus on skill development, project enhancement, and resume optimization.
- Ensure suggestions are directly related to the job description.

Return the result strictly according to the structured schema and do not include extra text outside the field.
'''
)



suggestion_prompt = ChatPromptTemplate.from_template("""
You are an expert AI resume reviewer specializing in evaluating candidates for technical roles. Your task is to assess the resume against the job description and generate precise, actionable feedback.

Inputs:

Resume:
{resume_text}

Job Description:
{jd_data}

Instructions:
1. Identify all weaknesses, gaps, missing skills, unclear project relevance, or lack of experience compared to the job description.
2. For each identified weakness, provide a practical suggestion for improvement.
3. Structure your response strictly in two sections:
   Weaknesses: List each weakness as a separate point (full sentences or semicolons are allowed).
   Suggestions: Provide actionable suggestions corresponding to each weakness, in the same order.
4. Keep responses concise, professional, and directly relevant to the job.
5. Do NOT include any additional commentary, greetings, or text outside these two sections.
6. Example format:

Weaknesses: Candidate lacks Docker experience; limited cloud exposure; teamwork contributions unclear.
Suggestions: Learn Docker through online tutorials; participate in cloud-based projects; highlight teamwork and project outcomes clearly in the resume.
""")


ats_calc_prompt = ChatPromptTemplate.from_template("""
You are an intelligent Applicant Tracking System (ATS) used by recruiters.

Your task is to evaluate how well a candidate's resume matches the job requirements.

--------------------------------------------------

RESUME
{resume_text}

--------------------------------------------------

JOB REQUIREMENTS
{jd_data}

--------------------------------------------------

STEP 1 — DOMAIN IDENTIFICATION

Identify the primary professional domain of:

1. The resume
2. The job description

Examples of domains:
- Machine Learning
- Data Science
- Web Development
- Chemistry Research
- Physics Research
- Marketing
- Finance
- Human Resources
- Healthcare
- Education

If the domains are completely unrelated, the ATS score MUST be below 25.

--------------------------------------------------

STEP 2 — CATEGORY EVALUATION

Evaluate the candidate across these universal hiring criteria.

1. Domain Knowledge
   How well the candidate's field matches the job field.

2. Required Skills Match
   How many required skills from the job description appear in the resume.

3. Relevant Experience / Projects
   Whether the candidate has practical work, research, or projects related to the role.

4. Tools / Technologies
   Whether the candidate has used relevant tools, software, or methodologies.

5. Education / Certifications
   Whether education or training supports the job role.

6. Soft Skills & Collaboration
   Communication, teamwork, leadership, research ability, etc.

Score each category internally from 0 to 10.

--------------------------------------------------

STEP 3 — WEIGHTED ATS SCORE

Calculate the final ATS score using these weights:

Domain Knowledge → 25%  
Required Skills Match → 25%  
Relevant Experience → 20%  
Tools / Technologies → 10%  
Education / Certifications → 10%  
Soft Skills → 10%

Final ATS score must be between 0 and 100.

Avoid round numbers like 60, 70, or 80.

--------------------------------------------------

STEP 4 — OVERALL SCORE

overall_score = ats_score / 10

--------------------------------------------------

OUTPUT RULES

Return ONLY valid JSON.

Do NOT include explanations outside the JSON.

Output format:

{format_instructions}
""")



