from dotenv import load_dotenv
from langchain_groq import ChatGroq
import os


from langchain_huggingface import ChatHuggingFace,HuggingFaceEndpoint
load_dotenv(r'.env')
groq_api_key = os.environ['GROQ_API_KEY']

llm1 = ChatGroq(
    model='openai/gpt-oss-20b',#openai/gpt-oss-20b
    api_key=groq_api_key,
    temperature=0,
    max_tokens=2000
)

llm2 = ChatGroq(
    model='llama-3.1-8b-instant',#openai/gpt-oss-20b
    api_key=groq_api_key,
    temperature=0,
    max_tokens=2000
)
# llm = ChatOllama(
#     model = 'gemma:2b',
#     temperature=0
# )
# model = HuggingFaceEndpoint(
#     repo_id="mistralai/Mistral-7B-Instruct-v0.2",
#     task="text-generation"
# )

bot = HuggingFaceEndpoint(
    model="openai/gpt-oss-20b",
    task="conversational",
    temperature=0
)

llm3 = ChatHuggingFace(llm=bot)