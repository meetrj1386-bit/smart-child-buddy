// utils/aiReportGenerator.js
// GPT-4 powered intelligent report generation

export class AIReportGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  }

  // Main function to generate comprehensive AI report
  async generateComprehensiveReport(assessmentData, responses, questions, uploadedReports = null) {
    console.log("🤖 Starting AI-powered comprehensive report generation...");
    
    // Step 1: Smart scoring with reverse questions
    const { analyzeResponsesWithSmartScoring, mapResponsesToReflexesWithSmartScoring } = 
      await import('./smartScoringSystem');
    
    const smartAnalysis = analyzeResponsesWithSmartScoring(responses, questions);
    const reflexAnalysis = mapResponsesToReflexesWithSmartScoring(responses, questions);
    
    // Step 2: Prepare context for AI
    const context = this.prepareAIContext(assessmentData, smartAnalysis, reflexAnalysis, uploadedReports);
    
    // Step 3: Generate AI narrative
    const aiNarrative = await this.generateAINarrative(context);
    
    // Step 4: Generate reflex integration plan
    const reflexPlan = await this.generateReflexIntegrationPlan(reflexAnalysis, assessmentData.child_age);
    
    // Step 5: Generate month-by-month roadmap
    const roadmap = await this.generateMonthlyRoadmap(smartAnalysis, reflexAnalysis, assessmentData);
    
    // Step 6: Compile final report
    const comprehensiveReport = {
      metadata: {
        generatedAt: new Date().toISOString(),
        childAge: assessmentData.child_age,
        assessmentId: assessmentData.id,
        aiGenerated: true
      },
      
      executiveSummary: {
        aiNarrative: aiNarrative,
        overallStatus: this.determineOverallStatus(smartAnalysis, reflexAnalysis),
        developmentalAge: this.calculateDevelopmentalAge(smartAnalysis, assessmentData.child_age),
        keyFindings: this.extractKeyFindings(smartAnalysis, reflexAnalysis),
        urgentActions: this.identifyUrgentActions(smartAnalysis, reflexAnalysis)
      },
      
      detailedAnalysis: {
        categoryBreakdown: this.formatCategoryAnalysis(smartAnalysis),
        redFlags: smartAnalysis.redFlags,
        strengths: smartAnalysis.strengths,
        smartScores: smartAnalysis.categoryScores
      },
      
      reflexIntegration: {
        summary: reflexAnalysis.summary,
        detectedReflexes: reflexAnalysis.reflexes,
        priorityReflexes: reflexAnalysis.priorityReflexes,
        integrationPlan: reflexPlan,
        expectedTimeline: this.generateReflexTimeline(reflexAnalysis)
      },
      
      interventionPlan: {
        immediate: this.generateImmediateInterventions(smartAnalysis, reflexAnalysis),
        monthlyRoadmap: roadmap,
        homeProgram: this.generateHomeProgram(smartAnalysis, reflexAnalysis),
        professionalSupport: this.recommendProfessionals(smartAnalysis, reflexAnalysis)
      },
      
      parentGuidance: {
        understanding: this.generateParentEducation(reflexAnalysis),
        dailyTips: this.generateDailyTips(smartAnalysis, reflexAnalysis),
        warningSignsToWatch: this.identifyWarningSigns(smartAnalysis),
        whenToSeekHelp: this.generateHelpGuidelines(smartAnalysis, reflexAnalysis)
      },
      
      additionalConsiderations: {
        uploadedReportsAnalysis: uploadedReports ? await this.analyzeUploadedReports(uploadedReports) : null,
        parentConcerns: assessmentData.main_concerns,
        recommendations: this.generateFinalRecommendations(smartAnalysis, reflexAnalysis)
      }
    };
    
    return comprehensiveReport;
  }

  // Prepare context for AI
  prepareAIContext(assessmentData, smartAnalysis, reflexAnalysis, uploadedReports) {
    return {
      child: {
        name: assessmentData.child_first_name,
        age: assessmentData.child_age,
        gender: assessmentData.child_gender,
        concerns: assessmentData.main_concerns,
        birthHistory: assessmentData.child_birth_history,
        diagnoses: assessmentData.child_diagnoses,
        medications: assessmentData.child_medications
      },
      assessment: {
        scores: smartAnalysis.categoryScores,
        redFlags: smartAnalysis.redFlags,
        strengths: smartAnalysis.strengths
      },
      reflexes: reflexAnalysis.reflexes,
      uploadedReports: uploadedReports
    };
  }

  // Generate AI narrative using GPT
  async generateAINarrative(context) {
    if (!this.apiKey) {
      return this.generateFallbackNarrative(context);
    }

    const prompt = `
    As a pediatric developmental specialist, analyze this child's assessment and provide a comprehensive narrative summary.
    
    Child Information:
    - Age: ${context.child.age} years
    - Gender: ${context.child.gender}
    - Parent Concerns: ${context.child.concerns || 'None specified'}
    - Birth History: ${context.child.birthHistory || 'Not provided'}
    - Diagnoses: ${context.child.diagnoses?.join(', ') || 'None'}
    
    Assessment Results:
    ${JSON.stringify(context.assessment.scores, null, 2)}
    
    Red Flags Identified:
    ${context.assessment.redFlags.map(rf => `- ${rf.issue}`).join('\n')}
    
    Retained Primitive Reflexes:
    ${context.reflexes.map(r => `- ${r.name}: ${r.retentionLevel}% retention`).join('\n')}
    
    Please provide:
    1. A comprehensive interpretation of these results
    2. How retained reflexes are impacting development
    3. The relationship between symptoms and underlying neurological patterns
    4. Priority areas for intervention
    5. Prognosis with and without intervention
    
    Write in a professional but parent-friendly tone. Be specific and actionable.
    `;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a pediatric developmental specialist with expertise in primitive reflex integration, sensory processing, and child development. Provide detailed, evidence-based analysis while being compassionate and parent-friendly.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('AI narrative generation failed:', error);
    }

    return this.generateFallbackNarrative(context);
  }

  // Generate reflex integration plan
  async generateReflexIntegrationPlan(reflexAnalysis, childAge) {
    const plan = {};
    
    reflexAnalysis.reflexes.forEach(reflex => {
      plan[reflex.name] = {
        retentionLevel: reflex.retentionLevel,
        impact: reflex.impact,
        category: reflex.category,
        
        exercises: {
          daily: this.selectDailyExercises(reflex, childAge),
          weekly: this.selectWeeklyActivities(reflex, childAge),
          environmental: this.getEnvironmentalModifications(reflex)
        },
        
        timeline: {
          month1: {
            goal: `Reduce ${reflex.name} retention by 20%`,
            frequency: '2-3 times daily, 5 minutes each',
            exercises: reflex.exercises.slice(0, 2),
            signs: this.getProgressMarkers(reflex, 1)
          },
          month2: {
            goal: `Achieve 40% reduction in retention`,
            frequency: '2 times daily, 7 minutes each',
            exercises: reflex.exercises.slice(1, 3),
            signs: this.getProgressMarkers(reflex, 2)
          },
          month3: {
            goal: `Achieve 60% or greater reduction`,
            frequency: 'Daily maintenance, 10 minutes',
            exercises: reflex.exercises.slice(2, 4),
            signs: this.getProgressMarkers(reflex, 3)
          }
        },
        
        parentTips: this.generateReflexSpecificTips(reflex),
        warningSignsOfRegression: this.getReflexRegressionSigns(reflex)
      };
    });
    
    return plan;
  }

  // Generate monthly roadmap
  async generateMonthlyRoadmap(smartAnalysis, reflexAnalysis, assessmentData) {
    const roadmap = {
      month1: {
        theme: 'Foundation & Stabilization',
        focus: this.determinePrimaryFocus(smartAnalysis, reflexAnalysis),
        
        reflexGoals: reflexAnalysis.priorityReflexes.slice(0, 2).map(r => ({
          reflex: r,
          targetReduction: '20%',
          dailyTime: '15 minutes'
        })),
        
        developmentalGoals: this.extractDevelopmentalGoals(smartAnalysis, 1),
        
        weeklySchedule: this.createWeeklySchedule(reflexAnalysis, smartAnalysis, 1),
        
        parentEducation: [
          'Understanding primitive reflexes',
          'Creating sensory-friendly environment',
          'Establishing routines'
        ],
        
        expectedOutcomes: [
          'Improved awareness of body position',
          'Reduced anxiety/startle responses',
          'Better sleep patterns'
        ]
      },
      
      month2: {
        theme: 'Integration & Progress',
        focus: 'Building on foundation, introducing complex movements',
        
        reflexGoals: reflexAnalysis.priorityReflexes.map(r => ({
          reflex: r,
          targetReduction: '40%',
          dailyTime: '20 minutes'
        })),
        
        developmentalGoals: this.extractDevelopmentalGoals(smartAnalysis, 2),
        
        weeklySchedule: this.createWeeklySchedule(reflexAnalysis, smartAnalysis, 2),
        
        parentEducation: [
          'Recognizing integration signs',
          'Adjusting exercises for progress',
          'Supporting emotional regulation'
        ],
        
        expectedOutcomes: [
          'Improved coordination',
          'Better attention span',
          'Enhanced motor planning'
        ]
      },
      
      month3: {
        theme: 'Mastery & Maintenance',
        focus: 'Consolidating gains, preventing regression',
        
        reflexGoals: reflexAnalysis.reflexes.map(r => ({
          reflex: r.name,
          targetReduction: '60%+',
          dailyTime: '15 minutes maintenance'
        })),
        
        developmentalGoals: this.extractDevelopmentalGoals(smartAnalysis, 3),
        
        weeklySchedule: this.createWeeklySchedule(reflexAnalysis, smartAnalysis, 3),
        
        parentEducation: [
          'Maintaining progress long-term',
          'Transitioning to play-based integration',
          'Preparing for re-assessment'
        ],
        
        expectedOutcomes: [
          'Sustained improvements',
          'Age-appropriate skills emerging',
          'Increased confidence and independence'
        ]
      }
    };
    
    return roadmap;
  }

  // Helper functions
  determinePrimaryFocus(smartAnalysis, reflexAnalysis) {
    // Determine what to focus on first based on analysis
    const priorities = [];
    
    // Check for high-retention reflexes
    if (reflexAnalysis.priorityReflexes.length > 0) {
      const topReflex = reflexAnalysis.reflexes[0];
      if (topReflex && topReflex.retentionLevel >= 70) {
        return `${topReflex.name} integration - Critical for development`;
      }
    }
    
    // Check for severely delayed categories
    const delayedCategories = Object.entries(smartAnalysis.categoryScores)
      .filter(([_, data]) => data.percentage < 40)
      .sort((a, b) => a[1].percentage - b[1].percentage);
    
    if (delayedCategories.length > 0) {
      return `${delayedCategories[0][0]} development - Significant delays detected`;
    }
    
    // Check for multiple red flags
    if (smartAnalysis.redFlags.length >= 5) {
      return 'Address multiple red flags through structured intervention';
    }
    
    // Default focus
    return 'Foundation skill building and reflex integration';
  }
  
  determineOverallStatus(smartAnalysis, reflexAnalysis) {
    const avgScore = Object.values(smartAnalysis.categoryScores)
      .reduce((sum, cat) => sum + cat.percentage, 0) / Object.keys(smartAnalysis.categoryScores).length;
    
    const reflexCount = reflexAnalysis.priorityReflexes.length;
    const redFlagCount = smartAnalysis.redFlags.length;
    
    if (avgScore >= 80 && reflexCount === 0 && redFlagCount === 0) {
      return 'Excellent - Development on track';
    } else if (avgScore >= 70 && reflexCount <= 1 && redFlagCount <= 2) {
      return 'Good - Minor areas for improvement';
    } else if (avgScore >= 50 && reflexCount <= 3) {
      return 'Moderate Concerns - Intervention recommended';
    } else {
      return 'Significant Concerns - Immediate intervention needed';
    }
  }

  calculateDevelopmentalAge(smartAnalysis, chronologicalAge) {
    const avgPercentage = Object.values(smartAnalysis.categoryScores)
      .reduce((sum, cat) => sum + cat.percentage, 0) / Object.keys(smartAnalysis.categoryScores).length;
    
    // Rough calculation: Each 10% below 100% = 6 months behind
    const monthsBehind = Math.round((100 - avgPercentage) * 0.6);
    const developmentalAge = chronologicalAge - (monthsBehind / 12);
    
    return Math.max(0, Math.round(developmentalAge * 10) / 10);
  }

  extractKeyFindings(smartAnalysis, reflexAnalysis) {
    const findings = [];
    
    // Add reflex findings
    if (reflexAnalysis.priorityReflexes.length > 0) {
      findings.push(`Retained primitive reflexes affecting development: ${reflexAnalysis.priorityReflexes.join(', ')}`);
    }
    
    // Add category findings
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 50) {
        findings.push(`${category}: Significant delays detected (${data.percentage}%)`);
      } else if (data.concerns.length > 0) {
        findings.push(`${category}: ${data.concerns.length} red flags identified`);
      }
    });
    
    // Add strength findings
    if (smartAnalysis.strengths.length > 0) {
      findings.push(`Strengths identified in: ${smartAnalysis.strengths.map(s => s.category).join(', ')}`);
    }
    
    return findings;
  }

  extractKeyFindings(smartAnalysis, reflexAnalysis) {
    const findings = [];
    
    // Add reflex findings
    if (reflexAnalysis.priorityReflexes.length > 0) {
      findings.push(`Retained primitive reflexes affecting development: ${reflexAnalysis.priorityReflexes.join(', ')}`);
    }
    
    // Add category findings
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 50) {
        findings.push(`${category}: Significant delays detected (${data.percentage}%)`);
      } else if (data.concerns.length > 0) {
        findings.push(`${category}: ${data.concerns.length} red flags identified`);
      }
    });
    
    // Add strength findings
    if (smartAnalysis.strengths.length > 0) {
      findings.push(`Strengths identified in: ${smartAnalysis.strengths.map(s => s.category).join(', ')}`);
    }
    
    return findings;
  }
  
  formatCategoryAnalysis(smartAnalysis) {
    const formatted = {};
    
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      formatted[category] = {
        score: data.percentage,
        interpretation: data.interpretation,
        concerns: data.concerns,
        strengths: data.strengths,
        recommendations: data.recommendations || [],
        details: {
          rawScore: data.rawScore,
          maxScore: data.maxScore,
          redFlags: data.concerns.filter(c => c.severity === 'high').length,
          achievements: data.strengths.length
        }
      };
    });
    
    return formatted;
  }

  identifyUrgentActions(smartAnalysis, reflexAnalysis) {
    const urgent = [];
    
    // Check for safety concerns
    smartAnalysis.redFlags.forEach(flag => {
      if (flag.issue.includes('safety') || flag.issue.includes('danger')) {
        urgent.push({
          action: 'Address safety concern',
          detail: flag.issue,
          timeline: 'Immediately'
        });
      }
    });
    
    // Check for high reflex retention
    reflexAnalysis.reflexes.forEach(reflex => {
      if (reflex.retentionLevel >= 70) {
        urgent.push({
          action: `Begin ${reflex.name} integration`,
          detail: `High retention (${reflex.retentionLevel}%) affecting ${reflex.category}`,
          timeline: 'Within 1 week'
        });
      }
    });
    
    // Check for multiple delays
    const delayedCategories = Object.entries(smartAnalysis.categoryScores)
      .filter(([_, data]) => data.percentage < 50)
      .map(([cat, _]) => cat);
    
    if (delayedCategories.length >= 3) {
      urgent.push({
        action: 'Schedule comprehensive evaluation',
        detail: `Multiple developmental areas affected: ${delayedCategories.join(', ')}`,
        timeline: 'Within 2 weeks'
      });
    }
    
    return urgent;
  }

  // Additional helper methods...
  selectDailyExercises(reflex, childAge) {
    // Age-appropriate exercise selection
    const exercises = reflex.exercises.filter(ex => {
      if (childAge <= 3 && ex.includes('complex')) return false;
      if (childAge >= 6 && ex.includes('baby')) return false;
      return true;
    });
    return exercises.slice(0, 3);
  }

  selectWeeklyActivities(reflex, childAge) {
    // Fun activities that integrate reflex work
    const activities = {
      moro: ['Swimming', 'Trampoline with supervision', 'Yoga for kids'],
      palmar: ['Rock climbing', 'Pottery/clay work', 'Cooking activities'],
      atnr: ['Martial arts', 'Dance classes', 'Ball sports'],
      spinalGalant: ['Swimming backstroke', 'Gymnastics', 'Horseback riding'],
      tlr: ['Playground activities', 'Balance beam', 'Scooter riding'],
      stnr: ['Animal walks obstacle course', 'Swimming', 'Climbing']
    };
    
    return activities[reflex.name.toLowerCase().split(' ')[0]] || ['Occupational therapy activities'];
  }

  getEnvironmentalModifications(reflex) {
    const modifications = {
      moro: [
        'Reduce sudden noises',
        'Use weighted blanket for sleep',
        'Create calm-down corner',
        'Dim lights in evening'
      ],
      palmar: [
        'Provide fidget tools',
        'Use pencil grips',
        'Textured surfaces for exploration',
        'Hand strengthening toys'
      ],
      spinalGalant: [
        'Avoid tight waistbands',
        'Use wobble cushion for sitting',
        'Provide movement breaks',
        'Consider standing desk option'
      ]
    };
    
    return modifications[reflex.name.toLowerCase().split(' ')[0]] || [];
  }

  getProgressMarkers(reflex, month) {
    const baseMarkers = [
      'Reduced frequency of reflex response',
      'Improved motor control',
      'Better emotional regulation'
    ];
    
    const monthSpecific = {
      1: ['Initial awareness of body position', 'Slight reduction in symptoms'],
      2: ['Noticeable improvement in daily activities', 'Better coordination'],
      3: ['Significant reduction in reflex indicators', 'Age-appropriate skills emerging']
    };
    
    return [...baseMarkers, ...monthSpecific[month]];
  }

  generateReflexSpecificTips(reflex) {
    return [
      `Make exercises fun - turn them into games`,
      `Practice when child is calm and alert`,
      `Stop if child becomes distressed`,
      `Celebrate small improvements`,
      `Keep a progress journal`
    ];
  }

  getReflexRegressionSigns(reflex) {
    return [
      'Return of previous symptoms',
      'Increased clumsiness or falls',
      'Behavioral regression',
      'Sleep disturbances',
      'Increased anxiety or emotional outbursts'
    ];
  }

  generateFallbackNarrative(context) {
    return `Based on the assessment of ${context.child.name}, age ${context.child.age}, several important findings have emerged. The evaluation reveals both strengths and areas requiring support across multiple developmental domains. ${context.reflexes.length > 0 ? `Notably, ${context.reflexes.length} retained primitive reflexes were identified, which may be impacting overall development.` : ''} A comprehensive intervention plan focusing on both remediation and skill building is recommended.`;
  }

  createWeeklySchedule(reflexAnalysis, smartAnalysis, month) {
    return {
      monday: 'Reflex integration exercises (15 min) + Fine motor activities',
      tuesday: 'Gross motor play + Balance activities',
      wednesday: 'Reflex integration + Sensory play',
      thursday: 'Cross-lateral movements + Academic readiness',
      friday: 'Fun integration games + Social skills',
      weekend: 'Family activities incorporating therapeutic movements'
    };
  }

  extractDevelopmentalGoals(smartAnalysis, month) {
    const goals = [];
    
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 70) {
        goals.push({
          category: category,
          currentLevel: `${data.percentage}%`,
          targetLevel: `${Math.min(100, data.percentage + (month * 10))}%`,
          focus: data.concerns[0]?.category || 'General improvement'
        });
      }
    });
    
    return goals;
  }

  generateReflexTimeline(reflexAnalysis) {
    const timeline = {};
    
    reflexAnalysis.reflexes.forEach(reflex => {
      const retentionLevel = reflex.retentionLevel;
      let timeEstimate = '';
      
      if (retentionLevel >= 70) {
        timeEstimate = '4-6 months with daily exercises';
      } else if (retentionLevel >= 40) {
        timeEstimate = '2-4 months with regular practice';
      } else {
        timeEstimate = '1-2 months with consistent exercises';
      }
      
      timeline[reflex.name] = {
        currentRetention: `${retentionLevel}%`,
        estimatedTimeToIntegration: timeEstimate,
        monthlyTargets: {
          month1: `Reduce to ${Math.max(0, retentionLevel - 20)}%`,
          month2: `Reduce to ${Math.max(0, retentionLevel - 40)}%`,
          month3: `Reduce to ${Math.max(0, retentionLevel - 60)}%`
        }
      };
    });
    
    return timeline;
  }
  
  generateImmediateInterventions(smartAnalysis, reflexAnalysis) {
    const interventions = [];
    
    // Add reflex-based interventions
    if (reflexAnalysis.priorityReflexes.length > 0) {
      const topReflex = reflexAnalysis.reflexes[0];
      if (topReflex) {
        interventions.push({
          category: 'Reflex Integration',
          action: `Begin ${topReflex.name} exercises`,
          frequency: 'Daily, 2-3 times',
          duration: '5-10 minutes per session',
          exercises: topReflex.exercises ? topReflex.exercises.slice(0, 3) : [],
          expectedBenefit: 'Improved nervous system integration'
        });
      }
    }
    
    // Add category-based interventions
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 50) {
        interventions.push({
          category: category,
          action: `${category} support activities`,
          frequency: 'Daily',
          duration: '15 minutes',
          exercises: [`${category}-specific developmental activities`],
          expectedBenefit: `Improved ${category.toLowerCase()} skills`
        });
      }
    });
    
    // Add red flag interventions
    if (smartAnalysis.redFlags.length > 0) {
      interventions.push({
        category: 'Safety',
        action: 'Address red flag concerns',
        frequency: 'Ongoing monitoring',
        duration: 'Throughout day',
        exercises: ['Environmental modifications', 'Safety protocols'],
        expectedBenefit: 'Reduced risk and improved safety'
      });
    }
    
    return interventions;
  }
  
  generateHomeProgram(smartAnalysis, reflexAnalysis) {
    return {
      daily: {
        morning: 'Sensory wake-up routine (5 min)',
        afternoon: 'Reflex integration exercises (10 min)',
        evening: 'Calming activities and deep pressure (10 min)'
      },
      weekly: {
        outdoorPlay: '3-4 times, 30 minutes minimum',
        structuredActivities: '2-3 therapy-based games',
        socialInteraction: 'Planned playdates or group activities'
      }
    };
  }

  recommendProfessionals(smartAnalysis, reflexAnalysis) {
    const recommendations = [];
    
    if (reflexAnalysis.priorityReflexes.length >= 2) {
      recommendations.push({
        specialist: 'Occupational Therapist (Reflex Integration Specialist)',
        reason: 'Multiple retained primitive reflexes',
        urgency: 'High',
        frequency: 'Weekly initially, then biweekly'
      });
    }
    
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 50) {
        if (category.includes('Speech')) {
          recommendations.push({
            specialist: 'Speech-Language Pathologist',
            reason: `Speech delays (${data.percentage}% of age expectations)`,
            urgency: 'High',
            frequency: 'Twice weekly'
          });
        }
        if (category.includes('Motor')) {
          recommendations.push({
            specialist: 'Physical Therapist',
            reason: `Motor delays identified`,
            urgency: 'Moderate',
            frequency: 'Weekly'
          });
        }
      }
    });
    
    return recommendations;
  }

  generateParentEducation(reflexAnalysis) {
    return {
      understanding: 'Primitive reflexes are automatic movements that should integrate in infancy. When retained, they can interfere with development.',
      yourChildsReflexes: reflexAnalysis.reflexes.map(r => ({
        reflex: r.name,
        whatItMeans: r.impact,
        howToHelp: r.exercises[0]
      })),
      resources: [
        'Recommended book: "Reflexes, Learning and Behavior" by Sally Goddard',
        'Online course: Understanding Primitive Reflexes',
        'Support group: Parents of Children with Retained Reflexes'
      ]
    };
  }

  generateDailyTips(smartAnalysis, reflexAnalysis) {
    const tips = [
      'Establish consistent routines',
      'Provide sensory breaks every 45 minutes',
      'Use visual schedules and timers',
      'Celebrate small victories',
      'Maintain a calm environment'
    ];
    
    // Add specific tips based on findings
    if (reflexAnalysis.priorityReflexes.includes('moro')) {
      tips.push('Reduce sudden noises and transitions');
    }
    if (smartAnalysis.redFlags.some(f => f.issue.includes('attention'))) {
      tips.push('Break tasks into smaller steps');
    }
    
    return tips;
  }

  identifyWarningSigns(smartAnalysis) {
    return smartAnalysis.redFlags.map(flag => ({
      sign: flag.issue,
      category: flag.category,
      action: 'Monitor and document frequency'
    }));
  }

  identifyWarningSigns(smartAnalysis) {
    const signs = [];
    
    // Add red flags as warning signs
    smartAnalysis.redFlags.forEach(flag => {
      signs.push({
        sign: flag.issue,
        category: flag.category,
        action: 'Monitor and document frequency'
      });
    });
    
    // Add concerning patterns
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      if (data.percentage < 50) {
        signs.push({
          sign: `Delays in ${category} development`,
          category: category,
          action: 'Track progress monthly'
        });
      }
      
      if (data.concerns.length >= 3) {
        signs.push({
          sign: `Multiple concerns in ${category}`,
          category: category,
          action: 'Consider professional evaluation'
        });
      }
    });
    
    return signs;
  }

  generateHelpGuidelines(smartAnalysis, reflexAnalysis) {
    const guidelines = [];
    
    if (smartAnalysis.redFlags.length >= 5) {
      guidelines.push('Multiple red flags present - seek evaluation within 2 weeks');
    }
    
    if (reflexAnalysis.priorityReflexes.length >= 3) {
      guidelines.push('Multiple retained reflexes - occupational therapy evaluation recommended');
    }
    
    guidelines.push('If regression occurs in any area, contact healthcare provider');
    guidelines.push('Document concerns with video when possible');
    
    return guidelines;
  }

  async analyzeUploadedReports(uploadedReports) {
    // Analyze uploaded documents using AI
    // This would process PDFs, images, etc.
    return {
      summary: 'Analysis of uploaded documents',
      findings: [],
      recommendations: []
    };
  }

  generateFinalRecommendations(smartAnalysis, reflexAnalysis) {
    return {
      immediate: this.identifyUrgentActions(smartAnalysis, reflexAnalysis),
      shortTerm: 'Begin reflex integration program with daily exercises',
      longTerm: 'Monitor progress monthly and adjust interventions',
      followUp: 'Re-assessment recommended in 3 months'
    };
  }
}

export default AIReportGenerator;