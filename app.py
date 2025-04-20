import os
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import torch
from transformers import GPT2LMHeadModel, GPT2Tokenizer

app = Flask(__name__, template_folder='templates')
CORS(app)

# Initialize model and tokenizer
model_name = "gpt2"  # Using default GPT-2 model
tokenizer = GPT2Tokenizer.from_pretrained(model_name)
model = GPT2LMHeadModel.from_pretrained(model_name)

class HRChatbot:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer

    def get_response(self, question):
        # System message to set the context
        system_message = """You are a professional HR Assistant. Your responses should be:
        1. Clear and concise
        2. Professional and helpful
        3. Based on standard HR practices
        4. Empathetic and supportive
        5. Include specific steps when applicable
        """

        # Common HR responses for frequent questions
        common_responses = {
            "company policies": """Our company policies include:
            1. Code of Conduct: Professional behavior and ethical standards
            2. Remote Work: Flexible work arrangements with manager approval
            3. Dress Code: Business casual, with specific guidelines for client meetings
            4. Attendance: Standard 9-5 with flexible hours option
            5. Workplace Safety: Regular training and emergency procedures
            For detailed information, please refer to the employee handbook or contact HR.""",
            
            "time off": """To request time off:
            1. Submit request through the HR portal at least 2 weeks in advance
            2. Include dates and reason for leave
            3. Await manager approval
            4. Receive confirmation email
            For urgent requests, contact your manager directly.""",
            
            "benefits": """Employee benefits include:
            1. Health Insurance: Medical, dental, and vision coverage
            2. 401(k): Company matching up to 5%
            3. PTO: 15 days annually, increasing with tenure
            4. Parental Leave: 12 weeks paid leave
            5. Wellness Program: Gym membership and mental health support
            For enrollment or questions, contact benefits@company.com""",
            
            "update information": """To update your information:
            1. Log into the HR portal
            2. Navigate to 'My Profile'
            3. Select the information to update
            4. Submit changes for verification
            For urgent updates, contact HR directly."""
        }

        # Check if question matches common topics
        question_lower = question.lower()
        for topic, response in common_responses.items():
            if topic in question_lower:
                return response

        # For other questions, use a more focused prompt
        prompt = f"""{system_message}

        Question: {question}

        Please provide a professional HR response. Focus on being helpful and specific. If you need more information to provide a complete answer, ask for clarification.

        Response:"""

        # Generate response with improved parameters
        inputs = self.tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)
        outputs = self.model.generate(
            inputs,
            max_new_tokens=150,
            num_return_sequences=1,
            no_repeat_ngram_size=3,
            temperature=0.7,
            top_p=0.9,
            top_k=50,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Clean up the response
        response = response.replace(prompt, "").strip()
        
        # Remove any remaining context or system messages
        response = response.split("Question:")[0].strip()
        response = response.split("Response:")[-1].strip()
        
        # Validate response
        if not response or len(response) < 10:
            return "I apologize, but I couldn't generate a relevant answer. Could you please rephrase your question or provide more details?"
        
        # Ensure response ends properly
        if not response.endswith(('.', '!', '?')):
            response += '.'
            
        # Add professional closing if needed
        if not any(phrase in response.lower() for phrase in ['contact hr', 'reach out', 'let me know']):
            response += " If you need any clarification or have additional questions, please don't hesitate to contact the HR department."
            
        return response

chatbot = HRChatbot(model, tokenizer)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '')
        
        if not question:
            return jsonify({'error': 'No question provided'}), 400
            
        response = chatbot.get_response(question)
        return jsonify({'response': response})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
