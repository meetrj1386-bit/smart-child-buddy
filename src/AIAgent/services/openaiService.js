// src/AIAgent/services/openaiService.js

//import { supabase } from '../../supabaseClient'; // Correct path to your existing client
import { supabase } from '../../utils/supabaseClient';

class OpenAIService {
  constructor() {
    this.supabase = supabase;
  }

  async chat(messages, options = {}) {
    try {
      console.log('🤖 Calling AI through Supabase...');
      
      // Extract system and user messages
      const systemMessage = messages.find(m => m.role === 'system')?.content || 'You are a helpful assistant';
      const userMessage = messages.find(m => m.role === 'user')?.content || messages[messages.length - 1].content;
      
      const { data, error } = await this.supabase.functions.invoke('openai-chat', {
        body: {
          systemMessage: systemMessage,
          prompt: userMessage
        }
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('✅ AI responded');
      return data.response;
      
    } catch (error) {
      console.error('❌ AI Error:', error);
      
      // Return fallback for specific cases
      const userMessage = messages.find(m => m.role === 'user')?.content || '';
      if (userMessage.includes('Parent message:')) {
        return JSON.stringify({
          isRelevantConcern: false,
          concerns: [],
          summary: "error processing"
        });
      }
      
      throw error;
    }
  }

  // Keep existing buildSystemPrompt method
  buildSystemPrompt(reflexKnowledge) {
    return {
      role: 'system',
      content: `You are ReflexBuddy AI, an expert in primitive reflexes and child development.
      
      Your knowledge includes these reflexes and their symptoms:
      ${JSON.stringify(reflexKnowledge.symptomMap, null, 2)}
      
      When parents describe symptoms:
      1. Identify likely primitive reflexes
      2. Explain in simple, parent-friendly language
      3. Suggest 1-2 specific exercises
      4. Always recommend professional evaluation
      5. Be encouraging and supportive
      
      Keep responses concise and actionable.`
    };
  }
}

export default new OpenAIService();