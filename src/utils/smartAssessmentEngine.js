import { DEVELOPMENTAL_HIERARCHY, getQuestionsForAge } from './developmentalHierarchy';
import { supabase } from './supabaseClient';

export class SmartAssessmentEngine {
  constructor(childAge, parentConcerns, assessmentId) {
    this.childAge = childAge;
    this.parentConcerns = parentConcerns;
    this.assessmentId = assessmentId;
    this.questions = {};
    this.responses = {};
  }

  // Generate smart questions for all categories
  async generateAssessment() {
    const categories = ['Speech', 'Gross Motor', 'Fine Motor', 'Cognitive', 'Feeding', 'Behaviour'];
    
    // Add School Readiness for age 4+
    if (this.childAge >= 4) {
      categories.push('School Readiness');
    }
    
    for (const category of categories) {
      this.questions[category] = await this.generateCategoryQuestions(category);
    }
    
    return this.questions;
  }

  // Generate questions for a specific category
  async generateCategoryQuestions(category) {
    console.log(`🔍 Generating ${category} questions for age ${this.childAge}`);
    
    // Step 1: Get questions from hierarchy
    let questions = getQuestionsForAge(category, this.childAge);
    
    // Step 2: Try to get from database
    const dbQuestions = await this.fetchDatabaseQuestions(category);
    
    // Step 3: Merge and deduplicate
    questions = this.mergeQuestions(questions, dbQuestions);
    
    // Step 4: If not enough, generate with AI
    if (questions.length < 10) {
      const aiQuestions = await this.generateAIQuestions(
        category, 
        10 - questions.length
      );
      questions.push(...aiQuestions);
    }
    
    // Step 5: Sort by developmental level
    return this.sortQuestionsByLevel(questions);
  }

  // Fetch questions from database
  async fetchDatabaseQuestions(category) {
    try {
      const { data, error } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('category', category)
        .gte('max_age', this.childAge)
        .lte('min_age', this.childAge)
        .eq('is_active', true)
        .order('developmental_level', { ascending: true });
      
      if (error) throw error;
      
      return data.map(q => ({
        question: q.question_text,
        skill: q.skill_assessed,
        level: this.determineLevel(q.developmental_level),
        levelName: q.developmental_stage,
        redFlag: q.red_flag_if_no
      }));
    } catch (error) {
      console.error('Database fetch error:', error);
      return [];
    }
  }

  // Generate questions with AI
  async generateAIQuestions(category, count) {
    const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
    if (!OPENAI_API_KEY) return this.getFallbackQuestions(category, count);
    
    const prompt = this.createSmartPrompt(category, count);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a pediatric developmental specialist who understands developmental hierarchies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });
      
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return result.questions.map(q => ({
        question: q.question_text,
        skill: q.skill_assessed,
        level: q.level,
        levelName: q.level_name,
        redFlag: q.red_flag || false,
        whyImportant: q.why_important
      }));
      
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.getFallbackQuestions(category, count);
    }
  }

  // Create a smart prompt for AI
  createSmartPrompt(category, count) {
    const hierarchy = DEVELOPMENTAL_HIERARCHY[category];
    const levelContext = hierarchy ? 
      hierarchy.levels.map(l => `${l.name} (${l.ageRange[0]}-${l.ageRange[1]} years)`).join(', ') : 
      '';
    
    return `Generate ${count} developmental assessment questions for ${category}.
    
Child Age: ${this.childAge} years
Parent Concerns: ${this.parentConcerns || 'General assessment'}

Developmental Levels for ${category}: ${levelContext}

CRITICAL REQUIREMENTS:
1. Questions must follow developmental hierarchy (foundation → current → emerging)
2. For a ${this.childAge}-year-old, include:
   - Foundation skills they SHOULD have mastered
   - Current age-appropriate skills
   - Emerging skills (next milestones)
3. Each question must identify potential root causes
4. Mark red flags (skills that MUST be present by this age)

Return JSON:
{
  "questions": [
    {
      "question_text": "Can/Does your child...",
      "skill_assessed": "specific_skill_code",
      "level": "foundation|current|emerging",
      "level_name": "Developmental Stage Name",
      "why_important": "Why this matters",
      "red_flag": true/false
    }
  ]
}`;
  }

  // Sort questions by developmental level
  sortQuestionsByLevel(questions) {
    const levelOrder = { 'foundation': 0, 'current': 1, 'emerging': 2 };
    return questions.sort((a, b) => {
      const aOrder = levelOrder[a.level] || 3;
      const bOrder = levelOrder[b.level] || 3;
      return aOrder - bOrder;
    });
  }

  // Merge questions from different sources
  mergeQuestions(hierarchyQuestions, dbQuestions) {
    const merged = [...hierarchyQuestions];
    const existingSkills = new Set(hierarchyQuestions.map(q => q.skill));
    
    dbQuestions.forEach(q => {
      if (!existingSkills.has(q.skill)) {
        merged.push(q);
        existingSkills.add(q.skill);
      }
    });
    
    return merged;
  }

  // Determine level based on developmental stage
  determineLevel(developmentalLevel) {
    if (developmentalLevel <= 2) return 'foundation';
    if (developmentalLevel <= 4) return 'current';
    return 'emerging';
  }

  // Get fallback questions
  getFallbackQuestions(category, count) {
    const hierarchy = DEVELOPMENTAL_HIERARCHY[category];
    if (!hierarchy) return [];
    
    const questions = [];
    hierarchy.levels.forEach(level => {
      level.skills.slice(0, Math.ceil(count / 3)).forEach(skill => {
        questions.push({
          ...skill,
          level: this.determineLevel(level.level),
          levelName: level.name
        });
      });
    });
    
    return questions.slice(0, count);
  }
}