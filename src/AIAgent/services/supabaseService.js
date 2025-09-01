// src/AIAgent/services/supabaseService.js

import { supabase } from '../../utils/supabaseClient';

class AISupabaseService {
  constructor() {
    // Generate or get session ID
    this.sessionId = this.getOrCreateSessionId();
    console.log('📊 Supabase AI Service initialized with session:', this.sessionId);
  }
  
  // Get or create a session ID for this browser session
  getOrCreateSessionId() {
    let sessionId = sessionStorage.getItem('ai_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('ai_session_id', sessionId);
      this.createSession(sessionId);
    }
    return sessionId;
  }
  
  // Create a new session record
  async createSession(sessionId) {
    try {
      const { data, error } = await supabase
        .from('ai_sessions')
        .insert({
          session_id: sessionId,
          platform: 'web',
          user_info: {
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        });
      
      if (error) {
        console.error('Error creating session:', error);
      } else {
        console.log('✅ New AI session created');
      }
    } catch (err) {
      console.error('Session creation failed:', err);
    }
  }
  
  // Save a conversation exchange
  async saveConversation(userMessage, aiResponse, reflexData = {}) {
    try {
      console.log('💾 Saving conversation to Supabase...');
      
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          session_id: this.sessionId,
          user_message: userMessage,
          ai_response: aiResponse.message || aiResponse,
          reflexes_identified: aiResponse.reflexesFound || [],
          symptoms_found: aiResponse.symptomsIdentified || [],
          response_source: aiResponse.source || 'unknown',
          child_age: reflexData.childAge || null,
          platform: 'web',
          metadata: {
            timestamp: new Date().toISOString(),
            responseTime: aiResponse.responseTime,
            ...reflexData
          }
        });
      
      if (error) {
        console.error('❌ Error saving conversation:', error);
      } else {
        console.log('✅ Conversation saved to database');
        
        // Update session last message time
        await this.updateSessionActivity();
      }
      
      return { success: !error, data, error };
      
    } catch (err) {
      console.error('Failed to save conversation:', err);
      return { success: false, error: err };
    }
  }
  
  // Update session activity
// REPLACE ONLY THIS METHOD in supabaseService.js

async updateSessionActivity() {
  try {
    // First, get current session to get message count
    const { data: currentSession, error: fetchError } = await supabase
      .from('ai_sessions')
      .select('total_messages')
      .eq('session_id', this.sessionId)
      .single();
    
    if (fetchError) {
      console.error('Error fetching session:', fetchError);
      return;
    }
    
    // Now update with incremented count
    const newCount = (currentSession?.total_messages || 0) + 1;
    
    const { data, error } = await supabase
      .from('ai_sessions')
      .update({
        last_message_at: new Date().toISOString(),
        total_messages: newCount
      })
      .eq('session_id', this.sessionId);
      
    if (error) {
      console.error('Error updating session:', error);
    }
  } catch (err) {
    console.error('Session update failed:', err);
  }
}
  
  // Get conversation history for current session
  async getSessionHistory() {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('session_id', this.sessionId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching history:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Failed to fetch history:', err);
      return [];
    }
  }
  
  // Get analytics data
  async getAnalytics(days = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('ai_analytics')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching analytics:', error);
        return [];
      }
      
      return data || [];
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      return [];
    }
  }
}

// Export singleton instance
const aiSupabaseService = new AISupabaseService();
export default aiSupabaseService;