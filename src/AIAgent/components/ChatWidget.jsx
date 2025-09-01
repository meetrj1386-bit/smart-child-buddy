// src/AIAgent/components/ChatWidget.jsx

import React, { useState } from 'react';
import reflexBuddyAI from '../core/ReflexBuddyAI';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  
  const sendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    setMessages(prev => [...prev, 
      { role: 'user', content: input }
    ]);
    
    const userInput = input;
    setInput('');
    
    // Get AI response
    const response = await reflexBuddyAI.chat(userInput);
    setMessages(prev => [...prev, 
      { role: 'assistant', content: response.message }
    ]);
  };

  if (!isOpen) {
    // Floating button
    return (
      <div 
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-lg cursor-pointer flex items-center justify-center hover:scale-110 transition z-50"
        onClick={() => setIsOpen(true)}
      >
        <span className="text-white text-2xl">💬</span>
      </div>
    );
  }

  // Chat window
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-t-2xl flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">ReflexBuddy AI</h3>
          <p className="text-xs text-purple-100">Ask about child development</p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white text-xl hover:bg-white/20 rounded-full w-8 h-8"
        >
          ×
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p className="text-lg mb-2">👋 Hi! I can help with:</p>
            <ul className="text-sm space-y-1">
              <li>• Identifying primitive reflexes</li>
              <li>• Suggesting exercises</li>
              <li>• Understanding behaviors</li>
            </ul>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
              msg.role === 'user' 
                ? 'bg-purple-100 text-purple-900' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about symptoms..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;