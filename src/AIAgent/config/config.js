// src/AIAgent/config/config.js
export const AI_CONFIG = {
  appName: 'ReflexBuddy AI',
  version: '1.0.0',
  
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
    model: 'gpt-3.5-turbo', // Cheaper model to start
    maxTokens: 500,
    temperature: 0.7,
  },
  
  // When to use OpenAI vs local knowledge
  useOpenAI: {
    enabled: true, // Set to false to disable OpenAI
    forComplexQuestions: true,
    forFollowUps: true,
    fallbackOnly: false
  }
};

// Check if API key exists
if (!AI_CONFIG.openai.apiKey) {
  console.warn('⚠️ No OpenAI API key found. Add VITE_OPENAI_API_KEY to .env file');
  console.log('📝 AI will use local knowledge base only');
} else {
  console.log('✅ OpenAI API configured successfully');
}