// src/utils/developmentalAnalysis.js
// This analyzes responses and generates smart reports

import { DEVELOPMENTAL_HIERARCHY } from './developmentalHierarchy';
import { supabase } from './supabaseClient';

export class DevelopmentalAnalyzer {
  constructor(assessmentId, responses, childAge, questions) {
    this.assessmentId = assessmentId;
    this.responses = responses; // {questionId: 'Yes'|'No'|'Sometimes'}
    this.childAge = childAge;
    this.questions = questions; // All questions with metadata
    this.analysis = {};
  }

  // Main analysis function
  async analyzeAssessment() {
    console.log('🔬 Starting developmental analysis...');
    
    // Analyze each category
    for (const [category, categoryQuestions] of Object.entries(this.questions)) {
      this.analysis[category] = await this.analyzeCategory(category, categoryQuestions);
    }
    
    // Generate overall assessment
    this.analysis.overall = this.generateOverallAnalysis();
    
    // Save to database
    await this.saveAnalysis();
    
    // Generate report
    const report = await this.generateSmartReport();
    
    return { analysis: this.analysis, report };
  }

  // Analyze a single category
  analyzeCategory(category, questions) {
    const analysis = {
      category,
      scores: {
        foundation: { total: 0, answered: 0, percentage: 0 },
        current: { total: 0, answered: 0, percentage: 0 },
        emerging: { total: 0, answered: 0, percentage: 0 }
      },
      redFlags: [],
      strengths: [],
      concerns: [],
      developmentalAge: 0,
      rootCause: null,
      recommendations: []
    };

    // Count responses by level
    questions.forEach(q => {
      const response = this.responses[q.id];
      const level = q.skill_level || 'current';
      
      analysis.scores[level].total++;
      
      if (response === 'Yes') {
        analysis.scores[level].answered++;
      } else if (response === 'No' && q.red_flag) {
        // Red flag - critical skill missing
        analysis.redFlags.push({
          skill: q.skill_assessed,
          question: q.question_text,
          stage: q.developmental_stage,
          impact: q.why_important
        });
      }
    });

    // Calculate percentages
    Object.keys(analysis.scores).forEach(level => {
      const score = analysis.scores[level];
      score.percentage = score.total > 0 ? 
        Math.round((score.answered / score.total) * 100) : 0;
    });

    // Identify root cause based on pattern
    analysis.rootCause = this.identifyRootCause(analysis.scores, analysis.redFlags, category);
    
    // Calculate developmental age
    analysis.developmentalAge = this.calculateDevelopmentalAge(analysis.scores, category);
    
    // Generate strengths and concerns
    analysis.strengths = this.identifyStrengths(analysis.scores, questions);
    analysis.concerns = this.identifyConcerns(analysis.scores, questions, analysis.redFlags);
    
    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(
      analysis.rootCause, 
      analysis.concerns, 
      category
    );

    return analysis;
  }

  // Identify root cause of difficulties
  identifyRootCause(scores, redFlags, category) {
    // If foundation skills are weak, that's the root cause
    if (scores.foundation.percentage < 50) {
      return {
        level: 'foundation',
        description: `Missing prerequisite ${category.toLowerCase()} skills`,
        severity: 'high',
        intervention: 'Address foundation skills before advancing'
      };
    }
    
    // If foundation is good but current skills are weak
    if (scores.foundation.percentage >= 70 && scores.current.percentage < 50) {
      return {
        level: 'current',
        description: `Delayed in age-appropriate ${category.toLowerCase()} skills`,
        severity: 'moderate',
        intervention: 'Focus on current developmental level skills'
      };
    }
    
    // If red flags present
    if (redFlags.length > 0) {
      return {
        level: 'critical',
        description: `Critical ${category.toLowerCase()} skills missing`,
        severity: 'high',
        intervention: 'Immediate professional evaluation recommended'
      };
    }
    
    // If everything is strong
    if (scores.current.percentage >= 70) {
      return {
        level: 'none',
        description: 'Development on track',
        severity: 'none',
        intervention: 'Continue current activities and monitor'
      };
    }
    
    return null;
  }

  // Calculate developmental age for category
  calculateDevelopmentalAge(scores, category) {
    const hierarchy = DEVELOPMENTAL_HIERARCHY[category];
    if (!hierarchy) return this.childAge;
    
    // Find the highest level where child scores >70%
    let developmentalAge = 0;
    
    if (scores.foundation.percentage >= 70) {
      developmentalAge = 2; // Foundation skills = ~2 years
    }
    if (scores.current.percentage >= 70) {
      developmentalAge = this.childAge; // Current skills = chronological age
    }
    if (scores.emerging.percentage >= 50) {
      developmentalAge = this.childAge + 1; // Advanced development
    }
    
    return developmentalAge;
  }

  // Identify strengths
  identifyStrengths(scores, questions) {
    const strengths = [];
    
    if (scores.foundation.percentage >= 80) {
      strengths.push('Strong foundation skills');
    }
    if (scores.current.percentage >= 70) {
      strengths.push('Age-appropriate development');
    }
    if (scores.emerging.percentage >= 30) {
      strengths.push('Showing emerging advanced skills');
    }
    
    // Add specific strengths from "Yes" responses
    questions.forEach(q => {
      if (this.responses[q.id] === 'Yes' && q.skill_level === 'emerging') {
        strengths.push(`Advanced: ${q.skill_assessed}`);
      }
    });
    
    return strengths;
  }

  // Identify concerns
  identifyConcerns(scores, questions, redFlags) {
    const concerns = [];
    
    if (scores.foundation.percentage < 50) {
      concerns.push('Weak foundation skills need attention');
    }
    if (scores.current.percentage < 50) {
      concerns.push('Below age expectations');
    }
    
    // Add red flag concerns
    redFlags.forEach(flag => {
      concerns.push(`Missing critical skill: ${flag.skill}`);
    });
    
    // Add specific concerns from "No" responses
    questions.forEach(q => {
      if (this.responses[q.id] === 'No' && q.skill_level === 'foundation') {
        concerns.push(`Foundation gap: ${q.skill_assessed}`);
      }
    });
    
    return concerns;
  }

  // Generate targeted recommendations
  generateRecommendations(rootCause, concerns, category) {
    const recommendations = [];
    
    // Based on root cause
    if (rootCause?.level === 'foundation') {
      recommendations.push({
        priority: 'HIGH',
        action: `Start with basic ${category.toLowerCase()} exercises`,
        specific: this.getFoundationActivities(category),
        professional: true,
        timeline: 'Immediate'
      });
    } else if (rootCause?.level === 'current') {
      recommendations.push({
        priority: 'MEDIUM',
        action: `Focus on age-appropriate ${category.toLowerCase()} skills`,
        specific: this.getCurrentLevelActivities(category, this.childAge),
        professional: false,
        timeline: '3-6 months'
      });
    }
    
    // Add specific recommendations for concerns
    concerns.forEach(concern => {
      if (concern.includes('oral motor')) {
        recommendations.push({
          priority: 'HIGH',
          action: 'Oral motor exercises',
          specific: ['Bubble blowing', 'Straw drinking', 'Lip exercises'],
          professional: true,
          timeline: 'Daily practice'
        });
      }
      // Add more specific recommendations...
    });
    
    return recommendations;
  }

  // Get foundation activities
  getFoundationActivities(category) {
    const activities = {
      'Speech': [
        'Practice nasal breathing exercises',
        'Blow bubbles or whistles',
        'Mirror mouth movements together',
        'Tongue exercises (up, down, side to side)'
      ],
      'Gross Motor': [
        'Core strengthening exercises',
        'Balance activities (standing on one foot)',
        'Crawling games',
        'Simple obstacle courses'
      ],
      'Fine Motor': [
        'Play with playdough',
        'Transfer games with tweezers',
        'Finger painting',
        'Building with blocks'
      ],
      'Cognitive': [
        'Peek-a-boo and hiding games',
        'Sorting activities',
        'Simple puzzles',
        'Matching games'
      ],
      'Feeding': [
        'Oral motor exercises',
        'Texture exploration',
        'Self-feeding practice',
        'Cup drinking practice'
      ],
      'Behaviour': [
        'Emotion naming games',
        'Simple turn-taking activities',
        'Routine establishment',
        'Calm-down strategies'
      ]
    };
    
    return activities[category] || ['Consult with specialist'];
  }

  // Get current level activities
  getCurrentLevelActivities(category, age) {
    // Age-specific activities
    const activities = {
      'Speech': age <= 3 ? 
        ['Read books daily', 'Name objects during play', 'Sing songs'] :
        ['Story telling', 'Question games', 'Conversation practice'],
      'Gross Motor': age <= 3 ?
        ['Playground activities', 'Ball play', 'Dancing'] :
        ['Bike riding', 'Sports activities', 'Jump rope'],
      // Add more...
    };
    
    return activities[category] || ['Age-appropriate play'];
  }

  // Generate overall analysis
  generateOverallAnalysis() {
    const categoryResults = Object.values(this.analysis);
    
    // Count categories with concerns
    const concernedCategories = categoryResults.filter(c => 
      c.rootCause?.severity === 'high' || c.redFlags?.length > 0
    );
    
    // Calculate overall developmental age
    const avgDevelopmentalAge = categoryResults.reduce((sum, c) => 
      sum + (c.developmentalAge || this.childAge), 0
    ) / categoryResults.length;
    
    return {
      overallStatus: concernedCategories.length === 0 ? 'On Track' :
                     concernedCategories.length <= 2 ? 'Mild Concerns' :
                     'Significant Concerns',
      developmentalAge: Math.round(avgDevelopmentalAge * 10) / 10,
      chronologicalAge: this.childAge,
      priorityAreas: concernedCategories.map(c => c.category),
      strengths: categoryResults.filter(c => 
        c.scores?.current?.percentage >= 70
      ).map(c => c.category),
      immediateActions: concernedCategories.length > 0 ? 
        this.getImmediateActions(concernedCategories) : []
    };
  }

  // Get immediate action items
  getImmediateActions(concernedCategories) {
    const actions = [];
    
    concernedCategories.forEach(cat => {
      if (cat.redFlags?.length > 0) {
        actions.push({
          category: cat.category,
          action: `Schedule ${cat.category.toLowerCase()} evaluation`,
          urgency: 'Within 2 weeks'
        });
      }
      
      if (cat.rootCause?.level === 'foundation') {
        actions.push({
          category: cat.category,
          action: `Start foundation ${cat.category.toLowerCase()} activities`,
          urgency: 'Immediately'
        });
      }
    });
    
    return actions;
  }

  // Generate smart report
  async generateSmartReport() {
    const report = {
      summary: this.generateExecutiveSummary(),
      categoryDetails: {},
      actionPlan: this.generateActionPlan(),
      professionalReferrals: this.generateReferrals(),
      monthByMonthPlan: this.generateMonthlyPlan()
    };
    
    // Add category details
    Object.entries(this.analysis).forEach(([category, analysis]) => {
      if (category !== 'overall') {
        report.categoryDetails[category] = this.formatCategoryReport(analysis);
      }
    });
    
    return report;
  }

  // Generate executive summary
  generateExecutiveSummary() {
    const overall = this.analysis.overall;
    
    return `
## Assessment Summary for Age ${this.childAge}

**Overall Status**: ${overall.overallStatus}
**Developmental Age**: ${overall.developmentalAge} years
**Key Strengths**: ${overall.strengths.join(', ') || 'Developing'}
**Priority Areas**: ${overall.priorityAreas.join(', ') || 'None'}

${overall.overallStatus === 'On Track' ? 
  '✅ Your child is developing well across all areas!' :
  overall.overallStatus === 'Mild Concerns' ?
  '⚠️ Some areas need attention, but overall development is progressing.' :
  '🔴 Several areas need immediate attention and professional support.'}
    `.trim();
  }

  // Format category report
  formatCategoryReport(analysis) {
    return {
      scores: analysis.scores,
      developmentalAge: analysis.developmentalAge,
      interpretation: this.interpretScores(analysis.scores),
      strengths: analysis.strengths,
      concerns: analysis.concerns,
      rootCause: analysis.rootCause?.description,
      recommendations: analysis.recommendations.map(r => ({
        priority: r.priority,
        action: r.action,
        activities: r.specific,
        needsProfessional: r.professional
      }))
    };
  }

  // Interpret scores
  interpretScores(scores) {
    if (scores.foundation.percentage < 50) {
      return 'Foundation skills need immediate attention';
    }
    if (scores.current.percentage >= 70 && scores.emerging.percentage >= 30) {
      return 'Excellent development, showing advanced skills';
    }
    if (scores.current.percentage >= 70) {
      return 'Age-appropriate development';
    }
    if (scores.current.percentage >= 50) {
      return 'Developing, some areas need support';
    }
    return 'Significant delays, professional evaluation recommended';
  }

  // Generate action plan
  generateActionPlan() {
    const plan = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };
    
    Object.values(this.analysis).forEach(analysis => {
      if (analysis.recommendations) {
        analysis.recommendations.forEach(rec => {
          if (rec.priority === 'HIGH') {
            plan.immediate.push(rec);
          } else if (rec.priority === 'MEDIUM') {
            plan.shortTerm.push(rec);
          } else {
            plan.longTerm.push(rec);
          }
        });
      }
    });
    
    return plan;
  }

  // Generate referrals
  generateReferrals() {
    const referrals = [];
    
    Object.entries(this.analysis).forEach(([category, analysis]) => {
      if (analysis.redFlags?.length > 0 || analysis.rootCause?.severity === 'high') {
        referrals.push(this.getSpecialistReferral(category, analysis));
      }
    });
    
    return referrals;
  }

  // Get specialist referral
  getSpecialistReferral(category, analysis) {
    const specialists = {
      'Speech': {
        type: 'Speech-Language Pathologist',
        reason: analysis.rootCause?.description,
        urgency: analysis.redFlags.length > 0 ? 'Urgent' : 'Routine'
      },
      'Gross Motor': {
        type: 'Physical Therapist',
        reason: analysis.rootCause?.description,
        urgency: analysis.redFlags.length > 0 ? 'Urgent' : 'Routine'
      },
      'Fine Motor': {
        type: 'Occupational Therapist',
        reason: analysis.rootCause?.description,
        urgency: analysis.redFlags.length > 0 ? 'Urgent' : 'Routine'
      },
      'Cognitive': {
        type: 'Developmental Pediatrician',
        reason: analysis.rootCause?.description,
        urgency: 'Routine'
      },
      'Behaviour': {
        type: 'Child Psychologist',
        reason: analysis.rootCause?.description,
        urgency: 'Routine'
      },
      'Feeding': {
        type: 'Feeding Therapist or Speech-Language Pathologist',
        reason: analysis.rootCause?.description,
        urgency: analysis.redFlags.length > 0 ? 'Urgent' : 'Routine'
      }
    };
    
    return specialists[category] || { type: 'Pediatrician', urgency: 'Routine' };
  }

  // Generate month-by-month plan
  generateMonthlyPlan() {
    const plan = {
      month1: {
        focus: 'Foundation Skills',
        activities: [],
        goals: []
      },
      month2: {
        focus: 'Building on Basics',
        activities: [],
        goals: []
      },
      month3: {
        focus: 'Advancing Skills',
        activities: [],
        goals: []
      }
    };
    
    // Prioritize foundation concerns
    const priorityCategories = this.analysis.overall.priorityAreas;
    
    priorityCategories.forEach(category => {
      const activities = this.getFoundationActivities(category);
      plan.month1.activities.push(...activities.slice(0, 2));
      plan.month1.goals.push(`Improve ${category.toLowerCase()} foundation`);
      
      plan.month2.activities.push(...activities.slice(2, 4));
      plan.month2.goals.push(`Progress in ${category.toLowerCase()}`);
      
      const currentActivities = this.getCurrentLevelActivities(category, this.childAge);
      plan.month3.activities.push(...currentActivities.slice(0, 2));
      plan.month3.goals.push(`Reach age-appropriate ${category.toLowerCase()}`);
    });
    
    return plan;
  }

  // Save analysis to database
  async saveAnalysis() {
    try {
      for (const [category, analysis] of Object.entries(this.analysis)) {
        if (category !== 'overall') {
          await supabase.from('assessment_analysis').insert({
            assessment_id: this.assessmentId,
            category: category,
            foundation_score: analysis.scores.foundation.percentage,
            current_score: analysis.scores.current.percentage,
            emerging_score: analysis.scores.emerging.percentage,
            developmental_age: analysis.developmentalAge,
            strengths: analysis.strengths,
            concerns: analysis.concerns,
            recommendations: analysis.recommendations.map(r => r.action),
            root_cause: analysis.rootCause?.description
          });
        }
      }
      console.log('✅ Analysis saved to database');
    } catch (error) {
      console.error('Error saving analysis:', error);
    }
  }
}