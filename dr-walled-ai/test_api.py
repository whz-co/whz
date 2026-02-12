from openai import OpenAI
import streamlit as st

# Test with your actual key
client = OpenAI(api_key="sk-your-actual-key-here")  # Put your real key here temporarily

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Say 'API works!'"}],
        max_tokens=10
    )
    print("✅ SUCCESS:", response.choices[0].message.content)
except Exception as e:
    print("❌ ERROR:", e)
