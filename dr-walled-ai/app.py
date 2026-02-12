import os
from openai import OpenAI
import streamlit as st

# Get API key from Streamlit secrets (NOT from .env on GitHub!)
client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

st.set_page_config(page_title="Dr. Walled", page_icon="🏥")
st.title("🏥 Dr. Walled - AI Medical Assistant")
st.caption("Your compassionate AI health companion")

# Initialize chat
if "messages" not in st.session_state:
    st.session_state.messages = []

# Show chat history
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])

# Chat input
if question := st.chat_input("Ask Dr. Walled anything about your health..."):
    with st.chat_message("user"):
        st.write(question)
    
    with st.chat_message("assistant"):
        with st.spinner("Dr. Walled is thinking..."):
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are Dr. Walled, a caring medical AI. Be warm, professional, and always remind users to consult real doctors."},
                    {"role": "user", "content": question}
                ]
            )
            answer = response.choices[0].message.content
            st.write(answer)
            st.caption("⚠️ I'm AI - please see a real doctor for medical advice")
    
    st.session_state.messages.append({"role": "user", "content": question})
    st.session_state.messages.append({"role": "assistant", "content": answer})

with st.sidebar:
    st.header("About")
    st.write("Dr. Walled - 24/7 AI Health Assistant")
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()
