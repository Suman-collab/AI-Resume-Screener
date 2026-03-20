import streamlit as st
import requests
import json



URL = "http://127.0.0.1:8000/analyze_resume"



st.title('Resume Analyser for Users')


uploaded_file = st.file_uploader('Upload Resume',type=['pdf','docx','txt'])

jd_data = st.text_area('Paste Job Description')


if st.button('Analyze Resume'):
    if uploaded_file and jd_data:

        with st.spinner('Analyzing resume... Please wait'):
            files = {
            'resume' : (
                uploaded_file.name,
                uploaded_file,
                uploaded_file.type
                )
            }
            data = {
            'jd_data' : jd_data
            }
            
            
            response = requests.post(URL,files=files,data=data)
        
        if response.status_code == 200:

            result = response.json()

            st.success("Analysis Completed ✅")

            # Scores
            st.subheader("📊 Scores")
            col1, col2 = st.columns(2)

            with col1:
                st.metric("ATS Score", result["ats_score"])

            with col2:
                st.metric("Overall Score", result["overall_score"])

            st.progress(int(result["ats_score"]))

            # Skill requirements
            st.subheader("🧠 Skill Requirements")
            st.text(result["skill_requirements"])

            # Weaknesses
            st.subheader("⚠ Weaknesses & Suggestions")
            st.write(result["weaknesses_and_suggestions"])

            # Convert improvements string → JSON

            st.subheader("🚀 Improvements")
            
            st.write(result["improvements"])


        else:
            st.error("Error from API ❌")
            st.error(response.text)