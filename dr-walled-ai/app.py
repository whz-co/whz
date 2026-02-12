import os
from openai import OpenAI
import streamlit as st

# ============ FIXED: Better secrets handling ============
# Try multiple ways to get the API key
api_key = None

# Method 1: Streamlit secrets (for cloud deployment)
try:
    api_key = st.secrets["OPENAI_API_KEY"]
except:
    pass

# Method 2: Environment variable (for local testing)
if not api_key:
    api_key = os.getenv("OPENAI_API_KEY")

# Method 3: Show helpful error if no key found
if not api_key:
    st.error("""
    🚨 **API Key Not Found!** 
    
    Please add your OpenAI API key in one of these ways:
    
    1. **For Streamlit Cloud:** 
       - Go to app settings → Secrets
       - Add: `OPENAI_API_KEY = "sk-your-key-here"`
    
    2. **For local testing:**
       - Create `.env` file with: `OPENAI_API_KEY=sk-your-key-here`
    """)
    st.stop()

# Initialize OpenAI client
try:
    client = OpenAI(api_key=api_key)
except Exception as e:
    st.error(f"Error initializing OpenAI: {e}")
    st.stop()
# ========================================================

# Page setup
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
    # Show user question
    with st.chat_message("user"):
        st.write(question)
    
    # Get Dr. Walled's response
    with st.chat_message("assistant"):
        with st.spinner("Dr. Walled is thinking..."):
            try:
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are Dr. Walled, a caring medical AI. Be warm, professional, and always remind users to consult real doctors. Use simple language."},
                        {"role": "user", "content": question}
                    ],
                    max_tokens=500,
                    temperature=0.7
                )
                answer = response.choices[0].message.content
                st.write(answer)
                st.caption("⚠️ Remember: I'm AI - please see a real doctor for medical advice")
            except Exception as e:
                st.error(f"Error getting response: {e}")
                answer = "I'm having trouble responding right now. Please try again."
                st.write(answer)
    
    # Save conversation
    st.session_state.messages.append({"role": "user", "content": question})
    st.session_state.messages.append({"role": "assistant", "content": answer})

# Sidebar
with st.sidebar:
    st.header("About Dr. Walled")
    st.write("Your 24/7 AI health assistant for general wellness information.")
    
    # Show API status
    if api_key:
        st.success("✅ API Connected")
    else:
        st.error("❌ API Not Connected")
    
    st.divider()
    st.caption("⚠️ **Not a replacement for professional medical advice**")
    
    if st.button("Clear Chat"):
        st.session_state.messages = []
        st.rerun()
