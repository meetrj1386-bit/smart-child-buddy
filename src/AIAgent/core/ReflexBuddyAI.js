import { supabase } from '../../utils/supabaseClient';
import openaiService from '../services/openaiService';

class ReflexBuddyAI {
  constructor() {
    this.childInfo = null;
    this.identifiedConcerns = [];
    this.currentQuestions = [];
    this.currentQuestionIndex = 0;
    this.answers = [];
    this.conversationStage = 'initial';
    this.conversationId = null;
    this.assessmentData = null;
  }

  async chat(message, context = {}) {
    if (context.childAge) {
      this.childInfo = {
        age: context.childAge,
        name: context.childName || 'your child'
      };
    }
    
    if (context.previousStage === 'recommendations') {
      this.conversationStage = 'recommendations';
    }

    // Route based on stage
    if (this.conversationStage === 'questioning') {
      return this.handleAnswer(message);
    }
    
    if (this.conversationStage === 'recommendations') {
      return this.handleFollowUp(message);
    }

    return this.handleParentConcern(message);
  }

async handleParentConcern(message) {
  try {
    const understanding = await this.understandWithAI(message);
    console.log('AI understanding result:', understanding);
    
    // Handle service questions
    if (understanding.isServiceQuestion && understanding.serviceResponse) {
      return {
        success: true,
        message: understanding.serviceResponse + "\n\nWhat specific concerns do you have about your child?",
        stage: 'clarification'
      };
    }
    
    // Handle no concerns stated
    if (!understanding.isRelevantConcern || !understanding.concerns || understanding.concerns.length === 0) {
      return {
        success: true,
        message: "I help identify developmental delays through primitive reflex assessment. What specific challenges is your child facing?",
        stage: 'clarification'
      };
    }
    
    // Set identified concerns
    this.identifiedConcerns = understanding.concerns;
    console.log('Categories identified:', this.identifiedConcerns);
    
    // Get subcategories for questions
    const { data: patterns } = await supabase
      .from('concern_patterns')
      .select('category, subcategory')
      .in('category', this.identifiedConcerns);
    
    this.matchedConcernData = patterns || [];
    console.log('Subcategory data:', this.matchedConcernData);
    
    // Generate empathetic response
    let response = await this.generateEmpathyResponse(understanding);
    
    // Get questions from database
    const questions = await this.getQuestionsFromDB();
    console.log('Questions found:', questions.length);
    
    if (!questions || questions.length === 0) {
      return {
        success: true,
        message: response + "\n\nLet me connect you with a specialist who can help better.",
        stage: 'escalate'
      };
    }
    
    this.currentQuestions = questions;
    this.currentQuestionIndex = 0;
    this.conversationStage = 'questioning';
    
    //response += `\n\nI'll ask ${questions.length} quick questions that will help us understand better:\n\n`;
    response += `Question 1: ${questions[0].question_text}`;
    
    return {
      success: true,
      message: response,
      stage: 'questioning'
    };
    
  } catch (error) {
  console.error('Error:', error);
  return {
    success: true,
    message: "I apologize for the technical difficulty. Our team has been notified and will look into this.\n\nFor immediate assistance:\n📞 Type 'callback' to schedule a call\n📧 Email: support@smartchildbuddy.com\n\nYou can also try asking your question differently, or I can help with exercises, reflexes, or assessment information.",
    stage: 'error_recovery'
  };
} 
}

async handleUnknownRequest(message, context) {
  const fallbackResponses = [
    "I want to ensure you get accurate information. Let me connect you with our specialist team who can better address this specific question.",
    "That's a great question that would be best handled by our expert team. They can provide more detailed guidance.",
    "I'm not quite sure I understood that correctly, and I want to make sure you get the right help."
  ];
  
  const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  
  return {
    success: true,
    message: `${randomResponse}\n\nYou can:\n📞 Type 'callback' for expert consultation\n📧 Reach us at support@smartchildbuddy.com\n🔄 Or rephrase your question\n\nI can also help with:\n• Assessment questions\n• Reflex information\n• Exercise recommendations`,
    stage: 'fallback'
  };
}

async matchToDatabase(understanding) {
  // Get all patterns from database WITH subcategories
  const { data: patterns } = await supabase
    .from('concern_patterns')
    .select('category, subcategory, pattern_text');
  
  const matchedData = []; // Store both category AND subcategory
  
  // For each concern the AI extracted
  for (const concern of understanding.concerns) {
    const concernLower = concern.toLowerCase();
    
    // Check against ALL pattern_text entries in database
    patterns?.forEach(pattern => {
      if (pattern.pattern_text && Array.isArray(pattern.pattern_text)) {
        for (const text of pattern.pattern_text) {
          if (text && (
            text.toLowerCase().includes(concernLower) ||
            concernLower.includes(text.toLowerCase())
          )) {
            matchedData.push({
              category: pattern.category,
              subcategory: pattern.subcategory
            });
            console.log(`Matched "${concern}" to ${pattern.category}/${pattern.subcategory}`);
            break;
          }
        }
      }
    });
  }
  
  // Store both categories and subcategories for later use
  this.matchedConcernData = matchedData;
  
  // Return unique categories for backward compatibility
  const categories = [...new Set(matchedData.map(m => m.category))];
  console.log('Matched categories:', categories);
  console.log('With subcategories:', matchedData);
  
  return categories;
}
async getQuestionsFromDB() {
  const childAge = this.childInfo?.age || 5;
  const allQuestions = [];
  const questionIds = new Set();
  
  for (const match of this.matchedConcernData) {
    // Get foundational questions FIRST, then age-appropriate
    const { data: questions } = await supabase
      .from('assessment_questions')
      .select('*')
      .eq('category', match.category)
      .lte('min_age', childAge)
      .gte('max_age', childAge)
      .eq('is_active', true)
      .order('min_age', { ascending: true })  // Foundational first!
      .order('skill_level', { ascending: true }) // Basic skills first
      .order('developmental_level', { ascending: true }) // Lower developmental first
      .limit(6);  // 6 per category for 2 categories = 12 total
    
    questions?.forEach(q => {
      if (!questionIds.has(q.id)) {
        questionIds.add(q.id);
        allQuestions.push(q);
      }
    });
  }
  
  return allQuestions.slice(0, 12);
}

  async getSearchTermsForCategory(category) {
    // Get pattern text for this category from database
    const { data: patterns } = await supabase
      .from('concern_patterns')
      .select('pattern_text')
      .eq('category', category)
      .limit(1);
    
    if (patterns && patterns[0]?.pattern_text) {
      // Return first few pattern texts as search terms
      return patterns[0].pattern_text.slice(0, 3);
    }
    
    return [];
  }
  
  interleaveQuestions(questions) {
    const grouped = {};
    this.identifiedConcerns.forEach(cat => {
      grouped[cat] = questions.filter(q => q.category === cat);
    });
    
    const mixed = [];
    const maxLength = Math.max(...Object.values(grouped).map(arr => arr.length));
    
    for (let i = 0; i < maxLength; i++) {
      for (const cat of this.identifiedConcerns) {
        if (grouped[cat] && grouped[cat][i]) {
          mixed.push(grouped[cat][i]);
        }
      }
    }
    
    return mixed;
  }

 async handleAnswer(message) {
  // Use AI to interpret the response
  const interpretation = await this.interpretResponse(message);
  
  if (interpretation.type === 'answer') {
    // Store the answer
    this.answers.push({
      question: this.currentQuestions[this.currentQuestionIndex],
      answer: interpretation.answer
    });
    
    this.currentQuestionIndex++;
    
    // Check if assessment complete
    if (this.currentQuestionIndex >= this.currentQuestions.length) {
      return this.generateDynamicAnalysis();
    }
    
    // Next question
    const nextQ = this.currentQuestions[this.currentQuestionIndex];
    return {
      success: true,
      message: `Question ${this.currentQuestionIndex + 1} of ${this.currentQuestions.length}:\n${nextQ.question_text}`,
      stage: 'questioning'
    };
  } 
  else if (interpretation.type === 'new_concern') {
    // Note the concern but ask them to answer current question first
    this.additionalConcerns = this.additionalConcerns || [];
    this.additionalConcerns.push(interpretation.newConcern);
    
    return {
      success: true,
      message: `I'll note that additional concern. But first, regarding the current question:\n${this.currentQuestions[this.currentQuestionIndex].question_text}\n\nCould you answer: Yes, No, or Sometimes?`,
      stage: 'questioning'
    };
  }
else if (interpretation.type === 'question') {
  // Check what they're asking about
  const questionLower = message.toLowerCase();
  
  if (questionLower.includes('why') && questionLower.includes('question')) {
    // They want to know why we're asking questions
    return {
      success: true,
      message: `These questions help us identify which primitive reflexes may still be active in your child. Each question maps to specific reflexes:\n\n` +
               `For example, questions about speech help identify Rooting or ATNR reflexes.\n` +
               `Questions about behavior point to Moro or Spinal Galant reflexes.\n\n` +
               `Your answers create a pattern that shows us the root causes, not just symptoms.\n\n` +
               `For the current question: ${this.currentQuestions[this.currentQuestionIndex].question_text}\n` +
               `Is the answer Yes, No, or Sometimes?`,
      stage: 'questioning'
    };
  }
  
  // Generic clarification for other questions
  return {
    success: true,
    message: `This helps us understand your child's specific patterns.\n\n` +
             `For: ${this.currentQuestions[this.currentQuestionIndex].question_text}\n` +
             `Could you answer: Yes, No, or Sometimes?`,
    stage: 'questioning'
  };
}
}

async getSpecificReflexInfo(reflexName) {
  // Clean and prepare search term
  let searchTerm = reflexName
    .toLowerCase()
    .replace(/reflex/gi, '')
    .replace(/[^a-z0-9\s]/g, '') // Remove special chars
    .trim();
  
  console.log('Searching for reflex:', searchTerm);
  
  // Handle common variations and misspellings for YOUR specific reflexes
  const reflexMappings = {
    // ATNR variations
    'atnr': 'ATNR',
    'asymmetrical': 'ATNR',
    'asymetrical': 'ATNR',
    'asym tonic': 'ATNR',
    
    // STNR variations
    'stnr': 'STNR',
    'symmetrical': 'STNR',
    'symetrical': 'STNR',
    'sym tonic': 'STNR',
    
    // TLR variations
    'tlr': 'TLR',
    'tonic lab': 'TLR',
    'labyrinthine': 'TLR',
    'labrynthine': 'TLR',
    
    // Moro variations
    'moro': 'Moro',
    'morrow': 'Moro',
    'startle': 'Moro',
    
    // Palmar variations
    'palmar': 'Palmar',
    'palmer': 'Palmar',
    'grasp': 'Palmar',
    'hand grasp': 'Palmar',
    
    // Rooting variations
    'rooting': 'Rooting',
    'routing': 'Rooting',
    'suck': 'Rooting',
    'sucking': 'Rooting',
    
    // Spinal Galant variations
   'spinal galant': 'Spinal_Galant',
  'spinal gallant': 'Spinal_Galant',
  'spinal glant': 'Spinal_Galant',  // ADD THIS
  'galant': 'Spinal_Galant',
  'gallant': 'Spinal_Galant',
  'glant': 'Spinal_Galant',  // A
  
    // FPR variations
    'fpr': 'FPR',
    'fear paralysis': 'FPR',
    'fear': 'FPR',
    
    // Babinski variations
    'babinski': 'Babinski',
    'babinsky': 'Babinski',
    'toe': 'Babinski'
  };
  
  // Try to find matching reflex code
  let reflexCode = null;
  for (const [key, code] of Object.entries(reflexMappings)) {
    if (searchTerm.includes(key)) {
      reflexCode = code;
      break;
    }
  }
  
  // Query database
  let reflexInfo = null;
  let error = null;
  
  if (reflexCode) {
    // Direct code match
    ({ data: reflexInfo, error } = await supabase
      .from('reflex_library')
      .select('*')
      .eq('reflex_code', reflexCode)
      .single());
  } else {
    // Fuzzy search on name
    ({ data: reflexInfo, error } = await supabase
      .from('reflex_library')
      .select('*')
      .or(`reflex_name.ilike.%${searchTerm}%,reflex_code.ilike.%${searchTerm}%`)
      .single());
  }
  
  if (reflexInfo) {
    let response = `About ${reflexInfo.reflex_name}:\n\n`;
    response += `${reflexInfo.parent_friendly_explanation || reflexInfo.simple_description || 'This reflex affects child development.'}\n\n`;
    
    if (reflexInfo.retention_signs && reflexInfo.retention_signs.length > 0) {
      response += `Signs it may be retained:\n`;
      reflexInfo.retention_signs.slice(0, 5).forEach(sign => {
        response += `• ${sign}\n`;
      });
      response += `\n`;
    }
    
    if (reflexInfo.integration_timeline) {
      response += `Integration timeline: ${reflexInfo.integration_timeline}\n\n`;
    }
    
    response += `💪 Want exercises for this reflex? Type "exercises"\n`;
    response += `📚 Learn more: www.smartchildbuddy.com/reflexes`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }
  
  // If no specific reflex found, return general info
  console.log('No specific reflex found, returning general info');
  return this.getReflexInfo();
}

async getReflexInfo() {
  // General reflex information
  let response = `Understanding Primitive Reflexes:\n\n`;
  response += `Reflexes are automatic movements babies are born with (like grasping, startle response). `;
  response += `They should "turn off" as the brain develops (usually by age 1-3).\n\n`;
  response += `When these reflexes remain active past their time, they can interfere with:\n`;
  response += `• Learning and focus\n`;
  response += `• Speech and communication\n`;
  response += `• Behavior and emotions\n`;
  response += `• Motor skills and coordination\n\n`;
  
  // If we have assessment data, show their specific reflexes
  if (this.assessmentData && this.assessmentData.reflexNames) {
    response += `Based on your assessment, ${this.childInfo.name} may have these active reflexes:\n`;
    this.assessmentData.reflexNames.slice(0, 3).forEach(reflex => {
      response += `• ${reflex}\n`;
    });
    response += `\n`;
  }
  
  response += `📚 Learn more: www.smartchildbuddy.com/reflexes\n`;
  response += `💪 Get exercises? Type "exercises"`;
  
  return {
    success: true,
    message: response,
    stage: 'guidance'
  };
}

async interpretResponse(message) {
  const currentQuestion = this.currentQuestions[this.currentQuestionIndex].question_text;
  
  const prompt = `Current question asked: "${currentQuestion}"
  Parent responded: "${message}"
  
  Determine what the parent is doing:
  1. ANSWERING the question: Could be yes/no/sometimes in many variations
     - "yup", "yeah", "correct" → yes
     - "nope", "nah", "not really" → no  
     - "sometimes", "occasionally", "depends" → sometimes
  
  2. RAISING NEW CONCERN: "my child also has..." or "another problem is..."
  
  3. ASKING A QUESTION: "what does that mean?" or "why do you ask?"
  
  4. UNCLEAR: Can't determine intent
  
  Return JSON:
  {
    "type": "answer/new_concern/question/unclear",
    "answer": "yes/no/sometimes" (only if type is answer),
    "newConcern": "what new concern mentioned" (only if type is new_concern)
  }`;
  
  const response = await openaiService.chat([
    { role: 'system', content: 'Interpret parent responses flexibly. Map variations to yes/no/sometimes.' },
    { role: 'user', content: prompt }
  ]);
  
  let cleanedResponse = response;
  if (response.includes('```json')) {
    cleanedResponse = response.replace(/```json\s*/g, '').replace(/```/g, '');
  }
  cleanedResponse = cleanedResponse.trim();
  
  return JSON.parse(cleanedResponse);
}

async generateDynamicAnalysis() {
  // PART 1: KEEP THIS - Calculate scores and group concerns
  const noAnswers = this.answers.filter(a => a.answer === 'no');
  const sometimesAnswers = this.answers.filter(a => a.answer.includes('sometimes'));
  const yesAnswers = this.answers.filter(a => a.answer === 'yes');
  
  const concernScore = noAnswers.length + (sometimesAnswers.length * 0.5);
  const totalQuestions = this.answers.length;
  
  // THIS WAS MISSING - Group concerns by category
  const concernsByCategory = {};
  [...noAnswers, ...sometimesAnswers].forEach(a => {
    const cat = a.question.category;
    if (!concernsByCategory[cat]) {
      concernsByCategory[cat] = [];
    }
    concernsByCategory[cat].push({
      question: a.question.question_text,
      answer: a.answer,
      isNo: a.answer === 'no'
    });
  });
  
  // PART 2: KEEP THIS - Get reflexes from concern_patterns
  const therapies = new Set();
  const reflexes = new Set();
  const therapyDetails = [];
  
  for (const category of Object.keys(concernsByCategory)) {
    const { data: patterns } = await supabase
      .from('concern_patterns')
      .select('therapy_indicators, related_reflexes')
      .eq('category', category);
    
    patterns?.forEach(p => {
      if (p.therapy_indicators) {
        p.therapy_indicators.forEach(t => {
          therapies.add(t);
          therapyDetails.push({therapy: t, category: category});
        });
      }
      if (p.related_reflexes) {
        p.related_reflexes.forEach(r => reflexes.add(r));
      }
    });
  }
  
  // PART 3: NEW - Get specific issues from reflex_issues
  const specificInsights = [];
  for (const category of Object.keys(concernsByCategory)) {
    for (const reflexCode of reflexes) {
      const { data: reflexIssues } = await supabase
        .from('reflex_issues')
        .select('issues, priority')
        .eq('category_name', category)
        .eq('reflex_name', reflexCode)
        .limit(1);
      
      if (reflexIssues?.[0]) {
        specificInsights.push({
          category: category,
          reflex: reflexCode,
          issues: reflexIssues[0].issues
        });
      }
    }
  }
  
  // Store assessment data
  this.assessmentData = {
    concernsByCategory,
    therapies: Array.from(therapies),
    reflexes: Array.from(reflexes),
    specificInsights
  };
  
  // PART 4: Build response (clean format without asterisks)
  let response = `Thank you for sharing about ${this.childInfo.name}. `;
  response += `I understand your concerns, and I want you to know — you're not alone. `;
  response += `Many parents face similar challenges, and with the right support, kids like ${this.childInfo.name} make wonderful progress.\n\n`;
  
  response += `What we noticed:\n`;
  
  // Show specific issues
  const issuesByCategory = {};
  specificInsights.forEach(insight => {
    if (!issuesByCategory[insight.category]) {
      issuesByCategory[insight.category] = [];
    }
    issuesByCategory[insight.category].push(...insight.issues);
  });
  
  for (const [cat, issues] of Object.entries(issuesByCategory)) {
    const uniqueIssues = [...new Set(issues)];
    const noCount = concernsByCategory[cat].filter(c => c.isNo).length;
    
    if (noCount > 0) {
      response += `• ${this.childInfo.name} may need extra support with ${uniqueIssues.join(', ')}\n`;
    }
  }
  
  // Connect to reflexes
  response += `\nThese patterns often relate to:\n`;
  const uniqueReflexes = [...new Set(specificInsights.map(i => i.reflex))];
  
  for (const reflexCode of uniqueReflexes.slice(0, 3)) {
    const relatedIssues = specificInsights
      .filter(i => i.reflex === reflexCode)
      .flatMap(i => i.issues);
    const uniqueRelatedIssues = [...new Set(relatedIssues)];
    
    const { data: reflexInfo } = await supabase
      .from('reflex_library')
      .select('reflex_name')
      .eq('reflex_code', reflexCode)
      .single();
    
    response += `• ${reflexInfo?.reflex_name || reflexCode} → ${uniqueRelatedIssues.join(' & ')}\n`;
  }
  
  response += `\n💡 Working on these reflexes helps children progress faster in therapy.\n\n`;
  
  response += `Your next steps:\n`;
  response += `📋 Type "report" → Full assessment details\n`;
  response += `🔍 Type "reflexes" → Learn about root causes\n`;
  response += `💪 Type "exercises" → Daily activities\n`;
  response += `📞 Type "callback" → Speak to an expert\n`;
  
  this.conversationStage = 'recommendations';
  
  return {
    success: true,
    message: response,
    stage: 'recommendations'
  };
}

async routeToHandler(intent) {
  switch(intent.intent_type) {
    case 'asking_about_reflex':
      // CHECK FOR SPECIFIC REFLEX
      if (intent.specific_topic) {
        return this.getSpecificReflexInfo(intent.specific_topic);
      } else {
        return this.getReflexInfo();
      }
      
      const { data: serviceInfo } = await supabase
    .from('service_knowledge')
    .select('content')
    .or('keywords.cs.{assessment,evaluate,test,process}')
    .limit(3);
  
  let response = serviceInfo.map(s => s.content).join('\n\n');
  response += '\n\nWould you like to start an assessment for your child?';
  
  return {
    success: true,
    message: response,
    stage: 'guidance'
  };

    case 'asking_about_exercises':
      // Could also check for specific topic here
      if (intent.specific_topic) {
        return this.getExercisesForSpecific(intent.specific_topic);
      } else {
        return this.getExercisesFromDB();
      }
      
    case 'asking_about_timeline':
      return {
        success: true,
        message: "With daily exercises (5-10 minutes), most families see initial improvements in 4-6 weeks, with significant changes in 3-6 months.",
        stage: 'guidance'
      };
      
    case 'new_concern':
      this.conversationStage = 'initial';
      return this.handleParentConcern(intent.specific_topic || "Tell me more about this concern");
      
    case 'requesting_human_help':
      return {
        success: true,
        message: "I'll arrange for a specialist to contact you. Please share your preferred contact method and time.",
        stage: 'escalate'
      };

      case 'asking_about_service':
  return {
    success: true,
    message: `Yes! We provide comprehensive assessments:\n\n` +
             `• Quick Chat Assessment (5 mins) - What you just completed\n` +
             `• Full Detailed Assessment (20 mins) - More comprehensive analysis\n` +
             `• Progress Tracking - Monitor improvements over time\n\n` +
             `All assessments identify retained primitive reflexes that may be affecting development.\n\n` +
             `Would you like to do a more detailed assessment? Type "detailed assessment"`,
    stage: 'guidance'
  };
      
    default:
      return {
        success: true,
        message: "How can I help? You can ask about:\n• Exercises\n• Reflexes\n• Your assessment results\n• Next steps",
        stage: 'guidance'
      };
  }
}

async getExercisesForSpecific(topic) {
  // If topic is a reflex code/name, get exercises for that reflex
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('*')
    .or(`reflex_code.ilike.%${topic}%,target_area.ilike.%${topic}%`)
    .limit(5);
  
  if (exercises && exercises.length > 0) {
    let response = `Exercises for ${topic}:\n\n`;
    
    exercises.forEach((ex, index) => {
      response += `${index + 1}. ${ex.exercise_name}\n`;
      response += `${ex.instructions}\n`;
      response += `Duration: ${ex.duration || '30-60 seconds'}\n`;
      response += `Frequency: ${ex.frequency || 'Daily'}\n\n`;
    });
    
    response += `Start with 1-2 exercises daily. Consistency is key!\n`;
    response += `📹 Video guides: www.smartchildbuddy.com/exercises`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }
  
  // If no specific exercises found, use general exercises
  return this.getExercisesFromDB();
}
async getExercisesFromDB() {
  // Get exercises based on identified reflexes from assessment
  if (!this.assessmentData || !this.assessmentData.reflexes) {
    return {
      success: true,
      message: "To get personalized exercises, please complete an assessment first. Type 'start' to begin.",
      stage: 'guidance'
    };
  }
  
  const reflexCodes = this.assessmentData.reflexes;
  
  const { data: exercises } = await supabase
    .from('exercises')
    .select('*')
    .in('reflex_code', reflexCodes)
    .limit(5);
  
  if (exercises && exercises.length > 0) {
    let response = `Recommended exercises based on your assessment:\n\n`;
    
    exercises.forEach((ex, index) => {
      response += `${index + 1}. ${ex.exercise_name}\n`;
      response += `${ex.instructions}\n`;
      response += `Duration: ${ex.duration || '30-60 seconds'}\n\n`;
    });
    
    response += `Start with 1-2 exercises daily, gradually increase.\n`;
    response += `📹 Video guides: www.smartchildbuddy.com/exercises`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }
  
  return {
    success: true,
    message: "Exercises will be available after assessment. Type 'start' to begin assessment.",
    stage: 'guidance'
  };
}
async handleFollowUp(message) {
  
  const intent = await this.classifyIntent(message);
  
  if (!intent.understood) {

        this.uncertainResponses++;  // INCREMENT COUNTER


        
 if (this.uncertainResponses > 2) {
      return {
        success: true,
        message: "I notice we're having some communication challenges. Let me connect you directly with our team for better assistance.\n\nPlease type 'callback' or email support@smartchildbuddy.com\n\nOur specialists typically respond within 24 hours.",
        stage: 'escalate_to_human'
      };
    }
    
    return {
      success: true,
      message: "I want to make sure I give you the right information. Could you rephrase that, or would you like to:\n📞 Type 'callback' for a consultation\n💪 Ask about exercises\n🔍 Learn about reflexes",
      stage: 'clarification'
    };
  }
  // Pass the full intent object (with specific_topic) to router
    this.uncertainResponses = 0;

  return this.routeToHandler(intent);
}

async routeToHandler(intent) {
  switch(intent.intent_type) {
    case 'asking_about_reflex':
      if (intent.specific_topic) {
        // Asking about specific reflex like "Rooting"
        return this.getSpecificReflexInfo(intent.specific_topic);
      } else {
        // General reflex question
        return this.getReflexInfo();
      }
      
    case 'asking_about_exercises':
      if (intent.specific_topic) {
        // "exercises for ATNR" or "exercises for speech"
        return this.getExercisesForSpecific(intent.specific_topic);
      } else {
        // General exercise request
        return this.getExercisesFromDB();
      }
      
    case 'requesting_report':
      return this.getDetailedReport();
      
    case 'requesting_callback':
      return {
        success: true,
        message: "I'll arrange for a specialist to contact you. Please share your preferred contact method and time.",
        stage: 'callback_request'
      };
      
    case 'submitting_contact':
      // They're providing phone/email after callback request
      return this.processContactInfo(intent.extracted_info);
      
    case 'asking_about_timeline':
      return {
        success: true,
        message: "With daily exercises (5-10 minutes), most families see initial improvements in 4-6 weeks, with significant changes in 3-6 months.",
        stage: 'guidance'
      };
      
    case 'new_concern':
      this.conversationStage = 'initial';
      return this.handleParentConcern(intent.specific_topic || "Tell me more about this concern");
      
    case 'thanking':
      return {
        success: true,
        message: "You're welcome! Remember, consistency with exercises makes a big difference. Reach out anytime you need support.",
        stage: 'closing'
      };
      
    default:
      return {
        success: true,
        message: "How can I help? You can ask about:\n• Exercises\n• Reflexes\n• Your assessment results\n• Schedule a callback",
        stage: 'guidance'
      };
  }
}

async classifyIntent(message) {
  const prompt = `User message: "${message}"
  
  Context: User is in follow-up conversation after assessment.
  
  IMPORTANT: Be very flexible with spelling errors.
  
  If message contains "what is [word] reflex" or "tell me about [word]" where [word] could be a misspelled reflex name:
  - Intent: asking_about_reflex
  - Extract the word as specific_topic (even if misspelled)
  
  Examples:
  - "what is spinal Glant?" → asking_about_reflex, specific_topic: "spinal Glant"
  - "what is morrow reflex?" → asking_about_reflex, specific_topic: "morrow"
  - "tell me about ATNR" → asking_about_reflex, specific_topic: "ATNR"
  
  Possible intents:
  - asking_about_reflex (with specific_topic if mentioned)
  - asking_about_service
  - asking_about_exercises
  - requesting_report
  - requesting_callback
  - unclear
  
  Return JSON:
  {
    "understood": true/false,
    "intent_type": "...",
    "specific_topic": "extract reflex name even if misspelled"
  }`;
  
  const response = await openaiService.chat([
    { role: 'system', content: 'Classify user intent during follow-up conversation. Extract specific details mentioned.' },
    { role: 'user', content: prompt }
  ]);
  
  // Clean and parse response
  let cleanedResponse = response;
  if (response.includes('```json')) {
    cleanedResponse = response.replace(/```json\s*/g, '').replace(/```/g, '');
  }
  
  return JSON.parse(cleanedResponse.trim());
}

  async getExercisesFromDB() {
    if (!this.assessmentData) {
      return {
        success: true,
        message: "Let me first understand your child's needs. What concerns you?",
        stage: 'initial'
      };
    }
    
    const { data: exercises } = await supabase
      .from('exercise_library')
      .select('*')
      .eq('is_active', true)
      .lte('min_age', this.childInfo.age)
      .gte('max_age', this.childInfo.age)
      .eq('difficulty_level', 'beginner')
      .limit(5);
    
    let response = `Daily exercises for ${this.childInfo.name}:\n\n`;
    
    if (exercises && exercises.length > 0) {
      exercises.forEach((ex, i) => {
        response += `${i + 1}. ${ex.exercise_name}\n`;
        if (ex.how_to_do) {
          const instructions = ex.how_to_do.length > 100 
            ? ex.how_to_do.substring(0, 100) + '...'
            : ex.how_to_do;
          response += `${instructions}\n`;
        }
        response += `⏱ ${ex.duration || '5-10 min'} | `;
        response += `${ex.frequency || 'Daily'}\n`;
        if (ex.tips_for_success) {
          response += `💡 Tip: ${ex.tips_for_success.substring(0, 50)}...\n`;
        }
        response += `\n`;
      });
    } else {
      response += `Please visit our website for exercise options.\n\n`;
    }
    
    response += `📹 Video guides: www.smartchildbuddy.com/exercises\n`;
    response += `📊 Track progress? Type "track"`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }

  async getReflexInfo() {
    if (!this.assessmentData || !this.assessmentData.reflexes) {
      return {
        success: true,
        message: "Let me first assess which reflexes might be involved. What concerns you about your child?",
        stage: 'initial'
      };
    }
    
    let response = `Understanding Primitive Reflexes:\n\n`;
    response += `Reflexes are automatic movements babies are born with.\n`;
    response += `They should "turn off" as the brain develops.\n`;
    response += `When active past their time, they affect learning.\n\n`;
    response += `Likely active reflexes for ${this.childInfo.name}:\n\n`;
    
    const { data: reflexData } = await supabase
      .from('reflex_library')
      .select('reflex_code, reflex_name, simple_description')
      .in('reflex_code', this.assessmentData.reflexes.slice(0, 3));
    
    reflexData?.forEach(reflex => {
      response += `• ${reflex.reflex_name}: ${reflex.simple_description || 'affects development'}\n`;
    });
    
    response += `\n📚 Learn more: www.smartchildbuddy.com/reflexes\n`;
    response += `💪 Get exercises? Type "exercises"`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }

  async getDetailedReport() {
    if (!this.assessmentData) {
      return {
        success: true,
        message: "I need to complete an assessment first. What concerns you about your child?",
        stage: 'initial'
      };
    }
    
    let response = `Detailed Assessment Report\n`;
    response += `Child: ${this.childInfo.name}, Age: ${this.childInfo.age}\n\n`;
    response += `Assessment Results:\n`;
    response += `• Questions asked: ${this.answers.length}\n`;
    response += `• Areas of strength: ${this.answers.filter(a => a.answer === 'yes').length}\n`;
    response += `• Areas needing support: ${this.answers.filter(a => a.answer === 'no').length}\n`;
    response += `• Developing skills: ${this.answers.filter(a => a.answer.includes('sometimes')).length}\n\n`;
    response += `Recommended Action Plan:\n`;
    response += `1. Start daily exercises (5-10 min)\n`;
    response += `2. Consider therapy evaluation\n`;
    response += `3. Track progress weekly\n`;
    response += `4. Follow up in 4-6 weeks\n\n`;
    response += `📄 Full report: www.smartchildbuddy.com/report\n`;
    response += `📧 Email report? Type your email address`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }

  async getTherapistGuidance() {
    const therapies = this.assessmentData?.therapies || [];
    
    let response = `Finding the Right Therapist:\n\n`;
    
    if (therapies.length > 0) {
      response += `Based on assessment, consider:\n`;
      therapies.forEach(t => {
        response += `• ${t}\n`;
      });
    }
    
    response += `\nQuestions to ask therapists:\n`;
    response += `• Do you assess primitive reflexes?\n`;
    response += `• What's your approach with ${this.childInfo.age}-year-olds?\n`;
    response += `• How do parents practice at home?\n`;
    response += `• What improvements should we expect?\n\n`;
    response += `🔍 Find local therapists: www.smartchildbuddy.com/find\n`;
    response += `📍 Enter your zip code for nearby options`;
    
    return {
      success: true,
      message: response,
      stage: 'guidance'
    };
  }

async understandWithAI(message) {
  // Get service knowledge
  const { data: serviceKnowledge } = await supabase
    .from('service_knowledge')
    .select('*')
    .eq('is_active', true);
    
  const { data: patterns } = await supabase
    .from('concern_patterns')
    .select('category, pattern_text');
  
  const validCategories = [...new Set(patterns?.map(p => p.category) || [])];
  
  const prompt = `Parent message: "${message}"
  
  Service Knowledge Base:
  ${JSON.stringify(serviceKnowledge, null, 2)}
  
  Database patterns by category:
  ${patterns.map(p => `${p.category}: ${JSON.stringify(p.pattern_text)}`).join('\n')}
  
  STEP 1: Check if asking about our service
  - Look through service_knowledge keywords
  - If match found, compile relevant content from service_knowledge
  - Set isServiceQuestion: true and create serviceResponse
  
  STEP 2: Check for child concerns
  - If parent mentions actual child problems/concerns
  - Match to concern_patterns categories
  - Return ALL matching categories (no duplicates)
  
  IMPORTANT:
  - Only set isRelevantConcern: true if parent states actual child issues
  - Can be both service question AND concern (handle both)
  
  Return JSON:
  {
    "isRelevantConcern": true/false,
    "concerns": [matching categories if concerns stated],
    "isServiceQuestion": true/false,
    "serviceResponse": "compiled answer from service_knowledge if applicable",
    "summary": "what parent said"
  }`;
  
  const response = await openaiService.chat([
    { role: 'system', content: 'Check service_knowledge for service questions and concern_patterns for child issues. Can be both.' },
    { role: 'user', content: prompt }
  ]);
  
  let cleanedResponse = response;
  if (response.includes('```json')) {
    cleanedResponse = response.replace(/```json\s*/g, '').replace(/```/g, '');
  }
  cleanedResponse = cleanedResponse.trim();
  
  const result = JSON.parse(cleanedResponse);
  result.concerns = [...new Set(result.concerns)];
  
  console.log('AI understanding:', result);
  return result;
}

  /*async generateEmpathyResponse(understanding) {
    const concerns = understanding.concerns || [];
    const childName = this.childInfo?.name || 'your child';
    
    // Build warm, conversational response
    let response = `Thank you for sharing about ${childName}. `;
    
    // Acknowledge parent's feelings
    if (concerns.length >= 2) {
      response += `We understand how overwhelming it can be when your child faces multiple challenges. `;
    } else {
      response += `We understand how concerning this must be for you. `;
    }
    
    // Reassurance
  //  response += `But we want to assure you that every child is unique and develops at their own pace. `;
    response += `But With the right guidance and support, ${childName} can absolutely thrive.\n\n`;
    
    // Summarize what parent shared (using their words)
    response += `Looking at what you've shared, it seems ${childName} has challenges with `;
    
    if (concerns.length === 1) {
      response += `${concerns[0]}. `;
    } else if (concerns.length === 2) {
      response += `${concerns[0]} and ${concerns[1]}. `;
    } else {
      const concernsList = concerns.slice(0, -1).join(', ');
      const lastConcern = concerns[concerns.length - 1];
      response += `${concernsList}, and ${lastConcern}. `;
    }
    
    // Hint at root cause
    if (concerns.length >= 2) {
      response += `These areas often connect to the same underlying cause. `;
    }
    
    // Transition to questions
    response += `\n\nBefore we dive deeper into the probable root cause, let me ask a few more questions to better understand ${childName}'s specific situation.`;
    
    return response;
  }*/

// Keep signature the same so nothing else breaks
async generateEmpathyResponse(understanding = {}) {
  const concerns = understanding.concerns || [];
  const childName = this.childInfo?.name || 'your child';

  // Build a clean concern list: "Speech", "Speech and Behaviour", or "Speech, Behaviour and Feeding"
  let list = 'their development';
  if (concerns.length === 1) {
    list = concerns[0];
  } else if (concerns.length === 2) {
    list = `${concerns[0]} and ${concerns[1]}`;
  } else if (concerns.length > 2) {
    list = `${concerns.slice(0, -1).join(', ')} and ${concerns[concerns.length - 1]}`;
  }

  const linkage = concerns.length >= 2
    ? ' These areas often connect to the same underlying cause.'
    : '';

  // Exactly the two-sentence intro you asked for
  return (
    `Looking at what you've shared, it seems ${childName} has challenges with ${list}.` +
    `${linkage} Before we dive deeper into the probable root cause, let me ask a few more questions ` +
    `to better understand ${childName}'s specific situation.`
  );
}



}

export default ReflexBuddyAI;