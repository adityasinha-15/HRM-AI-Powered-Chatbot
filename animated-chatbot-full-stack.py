# Backend (app.py)
from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import GPT2LMHeadModel, GPT2Tokenizer
import torch

app = Flask(__name__)
CORS(app)

model_dir = "hr_gpt2_model1"
model = GPT2LMHeadModel.from_pretrained(model_dir)
tokenizer = GPT2Tokenizer.from_pretrained(model_dir)

class HRChatbot:
    def __init__(self, model, tokenizer):
        self.model = model
        self.tokenizer = tokenizer
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model.to(self.device)
        self.model.eval()

    def get_response(self, question):
        prompt = f"Human: {question}\nAI:"
        input_ids = self.tokenizer.encode(prompt, return_tensors='pt').to(self.device)
        attention_mask = torch.ones_like(input_ids).to(self.device)
        
        try:
            with torch.no_grad():
                output = self.model.generate(
                    input_ids,
                    attention_mask=attention_mask,
                    max_length=150,
                    num_return_sequences=1,
                    no_repeat_ngram_size=2,
                    do_sample=True,
                    top_k=50,
                    top_p=0.95,
                    temperature=0.7,
                    pad_token_id=self.tokenizer.eos_token_id
                )
            
            response = self.tokenizer.decode(output[0], skip_special_tokens=True)
            answer = response.split("AI:")[-1].strip()
            
            return answer if answer else "I'm sorry, I couldn't generate a relevant answer. Please try rephrasing your question."
        except Exception as e:
            return f"I apologize, but I encountered an error while processing your request. Error: {str(e)}"

chatbot = HRChatbot(model, tokenizer)

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    question = data.get('question', '')
    response = chatbot.get_response(question)
    return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)

# Frontend (App.js)
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MoreVertical, Send, Home, ArrowLeftRight, CreditCard, Settings, User } from 'lucide-react';

const ChatMessage = ({ message, isUser }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
  >
    <div className={`max-w-[70%] p-3 rounded-lg ${isUser ? 'bg-purple-500 text-white' : 'bg-white'}`}>
      <p>{message.text}</p>
      <span className="text-xs text-gray-400 mt-1 block">{message.time}</span>
    </div>
  </motion.div>
);

const App = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = async () => {
    if (inputMessage.trim() === '') return;

    const newMessage = { text: inputMessage, isUser: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMessage]);
    setInputMessage('');

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: inputMessage }),
      });
      const data = await response.json();
      const botMessage = { text: data.response, isUser: false, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prevMessages => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-purple-100">
      <div className="w-[390px] h-[844px] bg-white rounded-[40px] overflow-hidden shadow-xl relative">
        <AnimatePresence>
          {!showChat ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 h-full flex flex-col"
            >
              <div className="flex items-center mb-6">
                <ChevronLeft className="w-6 h-6 text-purple-500" />
                <h1 className="text-xl font-semibold ml-4">Chat with our support team</h1>
              </div>
              <div className="flex-grow flex flex-col justify-center items-center text-center">
                <h2 className="text-3xl font-bold mb-4">How can we help you?</h2>
                <p className="text-gray-600 mb-8">
                  We are available 24/7 to help clarify any confusion you have on our product and ensure that you have a seamless experience throughout the process
                </p>
                <div className="bg-purple-100 rounded-full p-4 mb-6">
                  <Send className="w-8 h-8 text-purple-500" />
                </div>
                <p className="text-sm text-gray-500 mb-2">Send us an email:</p>
                <p className="text-purple-600 font-semibold">Info@customerchatbot.io</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-purple-600 border border-purple-600 rounded-full py-3 px-6 flex items-center justify-center"
                onClick={() => setShowChat(true)}
              >
                <Send className="w-5 h-5 mr-2" />
                Contact Live Chat
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="bg-white p-4 flex items-center justify-between border-b">
                <div className="flex items-center">
                  <ChevronLeft className="w-6 h-6 text-purple-500" onClick={() => setShowChat(false)} />
                  <h2 className="text-xl font-semibold ml-4">Chat with NOVA</h2>
                </div>
                <MoreVertical className="w-6 h-6 text-gray-500" />
              </div>
              <div className="flex-grow overflow-y-auto p-4 bg-purple-50">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <ChatMessage key={index} message={message} isUser={message.isUser} />
                  ))}
                </AnimatePresence>
              </div>
              <div className="bg-white p-4 border-t">
                <div className="flex items-center bg-gray-100 rounded-full p-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-grow bg-transparent outline-none px-2"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                  >
                    <Send className="w-6 h-6 text-purple-500" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between">
          <Home className="w-6 h-6 text-gray-400" />
          <ArrowLeftRight className="w-6 h-6 text-gray-400" />
          <CreditCard className="w-6 h-6 text-gray-400" />
          <Settings className="w-6 h-6 text-purple-500" />
          <User className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default App;
