// TEST FILE: Add this to test if GPT is working
// Create a new file: src/utils/testGPT.js

export const testGPTConnection = async () => {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  
  console.log("Testing GPT Connection...");
  console.log("API Key exists:", !!OPENAI_API_KEY);
  console.log("Key starts with 'sk-':", OPENAI_API_KEY?.startsWith('sk-'));
  
  if (!OPENAI_API_KEY) {
    console.error("❌ No OpenAI API key found in environment variables");
    return false;
  }

  try {
    // Test with a simple prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "GPT is connected!" if you can read this.'
          }
        ],
        max_tokens: 10
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log("✅ GPT Response:", data.choices[0].message.content);
      console.log("✅ GPT Integration is working!");
      return true;
    } else {
      const error = await response.json();
      console.error("❌ GPT Error:", error);
      
      if (error.error?.code === 'invalid_api_key') {
        console.error("❌ Invalid API key. Please check your OpenAI API key.");
      } else if (error.error?.code === 'insufficient_quota') {
        console.error("❌ OpenAI account has insufficient credits. Please add credits.");
      }
      
      return false;
    }
  } catch (error) {
    console.error("❌ Network or other error:", error);
    return false;
  }
};

// HOW TO USE THIS TEST:
// 1. In your browser console (F12), run:
// import { testGPTConnection } from './src/utils/testGPT.js';
// testGPTConnection();

// OR

// 2. Add this to any component temporarily:
// import { testGPTConnection } from '../utils/testGPT';
// 
// useEffect(() => {
//   testGPTConnection();
// }, []);

// MOCK GPT FOR TESTING (No API costs)
export const mockGPTQuestions = (category, childAge) => {
  console.log("🔧 Using MOCK GPT questions (no API cost)");
  
  const mockQuestions = {
    'Speech': [
      "Can your child speak in sentences of 5-6 words?",
      "Does your child ask 'why' and 'how' questions?",
      "Can your child tell you what happened during their day?",
      "Does your child use past tense correctly?",
      "Can your child follow 3-step instructions?"
    ],
    'Gross Motor': [
      "Can your child hop on one foot for 5 hops?",
      "Does your child catch a ball with hands only?",
      "Can your child ride a tricycle or bicycle?",
      "Does your child jump forward with feet together?",
      "Can your child walk up stairs alternating feet?"
    ],
    'Fine Motor': [
      "Can your child hold a pencil with proper grip?",
      "Does your child cut along a straight line?",
      "Can your child button their own clothes?",
      "Does your child draw recognizable shapes?",
      "Can your child string small beads?"
    ]
  };

  const questions = mockQuestions[category] || mockQuestions['Speech'];
  
  return questions.slice(0, 7).map((q, idx) => ({
    id: `mock_${category}_${idx}_${Date.now()}`,
    question_text: q,
    category: category,
    skill_level: idx < 3 ? 'foundation' : idx < 5 ? 'intermediate' : 'advanced',
    min_age: Math.max(0, childAge - 2),
    max_age: childAge + 2,
    difficulty_order: idx + 1,
    is_mock: true
  }));
};

// To use mock instead of real GPT (for testing without costs):
// Replace: const gptQuestions = await callOpenAIDirectly(category, childAge, parentConcerns);
// With: const gptQuestions = mockGPTQuestions(category, childAge);