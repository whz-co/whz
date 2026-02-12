import os
from openai import OpenAI
from dotenv import load_dotenv
import streamlit as st

# Load environment variables from .env file
load_dotenv()

# Initialize OpenAI - will read from .env automatically
client = OpenAI()

class DrWalled:
    def __init__(self):
        self.system_prompt = """You are Dr. Walled, a compassionate and knowledgeable medical AI assistant. 
        Your characteristics:
        - Professional, warm, and empathetic MD
        - Provide clear, accurate health information
        - Always include: "Remember, I'm an AI assistant - please consult a real doctor for medical advice"
        - Never give definitive diagnoses
        - Focus on general wellness and health education
        - Respond in simple, caring language
        - Ask follow-up questions when appropriate"""
    
    def get_response(self, messages):
        """Get response from Dr. Walled"""
        try:
            full_messages = [{"role": "system", "content": self.system_prompt}] + messages
            
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=full_messages,
                temperature=0.7,
                max_tokens=500
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Dr. Walled is temporarily unavailable. Error: {str(e)}"

# Streamlit UI
def main():
    st.set_page_config(
        page_title="Dr. Walled - AI Medical Assistant",
        page_icon="🏥",
        layout="centered"
    )
    
    st.title("🏥 Dr. Walled")
    st.caption("Your AI Medical Assistant - For informational purposes only")
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = []
    
    # Display chat messages
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # Chat input
    if prompt := st.chat_input("Ask Dr. Walled about your health concerns..."):
        # Add user message
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)
        
        # Get AI response
        with st.chat_message("assistant"):
            with st.spinner("Dr. Walled is thinking..."):
                doctor = DrWalled()
                response = doctor.get_response(st.session_state.messages[-10:])  # Last 10 for context
                st.markdown(response)
                
                # Add disclaimer
                st.caption("⚠️ This is AI-generated information. Always consult a healthcare professional.")
                
        st.session_state.messages.append({"role": "assistant", "content": response})

if __name__ == "__main__":
    main()
