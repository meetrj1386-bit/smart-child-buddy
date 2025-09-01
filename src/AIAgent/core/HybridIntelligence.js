// src/AIAgent/core/HybridIntelligence.js

import { supabase } from '../../utils/supabaseClient';
import openaiService from '../services/openaiService';

class HybridIntelligence {
  constructor() {
    this.cache = new Map(); // In-memory cache
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.confidenceThreshold = 0.8;
  }
  
  async understandMessage(message, context = {}) {
    const msgLower = message.toLowerCase().trim();
    console.log('🧠 Processing:', msgLower);
    
    // STEP 1: Check exact match cache (instant, free)
    const cached = this.checkCache(msgLower);
    if (cached) {
      console.log('✨ Cache hit!');
      return cached;
    }
    
    // STEP 2: Check database for similar patterns (fast, free)
    const dbMatch = await this.searchDatabase(msgLower, context);
    if (dbMatch && dbMatch.confidence >= this.confidenceThreshold) {
      console.log('📊 Database match! Confidence:', dbMatch.confidence);
      this.updateCache(msgLower, dbMatch);
      await this.incrementUsage(dbMatch.id);
      return dbMatch;
    }
    
    // STEP 3: Check keyword patterns (fast, free)
    const keywordMatch = this.checkKeywordPatterns(msgLower);
    if (keywordMatch) {
      console.log('🔑 Keyword match!');
      await this.savePattern(message, keywordMatch);
      return keywordMatch;
    }
    
    // STEP 4: Use AI classification (costs money, but we learn)
    console.log('🤖 Using AI...');
    const aiResult = await this.classifyWithAI(message, context);
    
    // SAVE TO DATABASE FOR FUTURE USE!
    await this.savePattern(message, aiResult);
    this.updateCache(msgLower, aiResult);
    
    return aiResult;
  }
  
  // Search database for similar messages
  async searchDatabase(message, context) {
    try {
      // First try exact match
      let { data: exact } = await supabase
        .from('message_patterns')
        .select('*')
        .eq('message_lower', message)
        .single();
      
      if (exact) {
        return {
          intent: exact.detected_intent,
          confidence: 1.0,
          response_type: exact.response_type,
          id: exact.id
        };
      }
      
      // Then try partial match (using PostgreSQL full-text search)
      const { data: partial } = await supabase
        .from('message_patterns')
        .select('*')
        .textSearch('message_lower', message.split(' ').join(' & '))
        .order('times_used', { ascending: false })
        .limit(5);
      
      if (partial && partial.length > 0) {
        // Calculate confidence based on similarity
        const best = this.findBestMatch(message, partial);
        if (best) {
          return {
            intent: best.detected_intent,
            confidence: best.similarity,
            response_type: best.response_type,
            id: best.id
          };
        }
      }
      
      // Try fuzzy match for typos
      const words = message.split(' ');
      const { data: fuzzy } = await supabase
        .from('message_patterns')
        .select('*')
        .or(words.map(w => `message_lower.ilike.%${w}%`).join(','))
        .order('times_used', { ascending: false })
        .limit(10);
      
      if (fuzzy && fuzzy.length > 0) {
        const best = this.findBestMatch(message, fuzzy);
        if (best && best.similarity > 0.6) {
          return {
            intent: best.detected_intent,
            confidence: best.similarity,
            response_type: best.response_type,
            id: best.id
          };
        }
      }
      
    } catch (error) {
      console.error('Database search error:', error);
    }
    
    return null;
  }
  
  // Find best matching pattern
  findBestMatch(input, candidates) {
    let best = null;
    let maxSimilarity = 0;
    
    for (const candidate of candidates) {
      const similarity = this.calculateSimilarity(
        input, 
        candidate.message_lower
      );
      
      // Weight by usage frequency
      const weighted = similarity * (1 + Math.log10(candidate.times_used + 1) * 0.1);
      
      if (weighted > maxSimilarity) {
        maxSimilarity = weighted;
        best = { ...candidate, similarity: weighted };
      }
    }
    
    return best;
  }
  
  // Calculate string similarity (0-1)
  calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.split(' '));
    const words2 = new Set(str2.split(' '));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    // Jaccard similarity
    return intersection.size / union.size;
  }
  
  // Keyword patterns (fallback)
  checkKeywordPatterns(message) {
    const patterns = [
      {
        keywords: ['exercise', 'activity', 'activities', 'practice', 'workout', 'do at home'],
        intent: 'EXERCISE_REQUEST',
        response_type: 'exercises'
      },
      {
        keywords: ['call', 'phone', 'speak to', 'talk to', 'contact', 'reach'],
        intent: 'CONTACT_REQUEST',
        response_type: 'contact'
      },
      {
        keywords: ['email', 'send', 'write to', 'message'],
        intent: 'EMAIL_REQUEST',
        response_type: 'email'
      },
      {
        keywords: ['assessment', 'evaluate', 'test', 'check my child', 'evaluation'],
        intent: 'ASSESSMENT_REQUEST',
        response_type: 'assessment'
      },
      {
        keywords: ['cost', 'price', 'pay', 'free', 'charge', 'how much', 'expensive'],
        intent: 'PRICING_QUESTION',
        response_type: 'pricing'
      },
      {
        keywords: ['tool', 'equipment', 'buy', 'need', 'purchase', 'where to get'],
        intent: 'TOOL_REQUEST',
        response_type: 'tools'
      }
    ];
    
    for (const pattern of patterns) {
      if (pattern.keywords.some(keyword => message.includes(keyword))) {
        return {
          intent: pattern.intent,
          confidence: 0.7,
          response_type: pattern.response_type
        };
      }
    }
    
    return null;
  }
  
  // Use AI when needed
  async classifyWithAI(message, context) {
    try {
      const prompt = `Classify this message into an intent and extract key information.
      
      Message: "${message}"
      ${context.childAge ? `Child Age: ${context.childAge}` : ''}
      
      Possible intents:
      - EXERCISE_REQUEST (wants exercises, activities)
      - ASSESSMENT_REQUEST (wants evaluation)
      - CONTACT_REQUEST (wants call/phone)
      - EMAIL_REQUEST (wants email)
      - PRICING_QUESTION (cost, price)
      - TOOL_REQUEST (equipment, materials)
      - CHILD_CONCERN (describing problem)
      - PROGRESS_REQUEST (tracking, monitoring)
      - HELP_REQUEST (general help)
      
      Return JSON only:
      {
        "intent": "INTENT_NAME",
        "confidence": 0.0-1.0,
        "entities": {
          "concern_type": "speech/motor/behavior/etc or null",
          "urgency": "low/medium/high",
          "specific_request": "what they specifically want"
        }
      }`;
      
      const response = await openaiService.chat([
        { role: 'system', content: 'You are an intent classifier. Return only valid JSON.' },
        { role: 'user', content: prompt }
      ]);
      
      const result = JSON.parse(response);
      
      return {
        intent: result.intent,
        confidence: result.confidence,
        response_type: this.mapIntentToResponse(result.intent),
        entities: result.entities
      };
      
    } catch (error) {
      console.error('AI classification error:', error);
      return {
        intent: 'UNKNOWN',
        confidence: 0,
        response_type: 'help'
      };
    }
  }
  
  // Save pattern to database for future use
  async savePattern(message, result) {
    try {
      await supabase
        .from('message_patterns')
        .insert({
          user_message: message,
          message_lower: message.toLowerCase().trim(),
          detected_intent: result.intent,
          confidence_score: result.confidence,
          response_type: result.response_type
        });
      
      console.log('💾 Pattern saved for future use');
    } catch (error) {
      console.error('Error saving pattern:', error);
    }
  }
  
  // Increment usage counter
  async incrementUsage(patternId) {
    try {
      await supabase.rpc('increment_pattern_usage', { pattern_id: patternId });
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }
  
  // Cache management
  checkCache(message) {
    const cached = this.cache.get(message);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  
  updateCache(message, data) {
    this.cache.set(message, {
      data: data,
      timestamp: Date.now()
    });
    
    // Limit cache size
    if (this.cache.size > 100) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }
  
  // Map intent to response type
  mapIntentToResponse(intent) {
    const mapping = {
      'EXERCISE_REQUEST': 'exercises',
      'ASSESSMENT_REQUEST': 'assessment',
      'CONTACT_REQUEST': 'contact',
      'EMAIL_REQUEST': 'email',
      'PRICING_QUESTION': 'pricing',
      'TOOL_REQUEST': 'tools',
      'CHILD_CONCERN': 'concern',
      'PROGRESS_REQUEST': 'progress',
      'HELP_REQUEST': 'help',
      'UNKNOWN': 'help'
    };
    
    return mapping[intent] || 'help';
  }
  
  // Learn from user feedback
  async recordFeedback(messageId, wasCorrect, satisfaction = null) {
    try {
      await supabase
        .from('message_patterns')
        .update({
          was_correct: wasCorrect,
          user_satisfaction: satisfaction
        })
        .eq('id', messageId);
      
      console.log('📈 Feedback recorded');
    } catch (error) {
      console.error('Error recording feedback:', error);
    }
  }
}

export default new HybridIntelligence();