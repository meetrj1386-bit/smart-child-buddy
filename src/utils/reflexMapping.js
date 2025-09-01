// utils/reflexMapping.js
// Maps assessment responses to primitive reflexes and generates comprehensive reports

// Reflex definitions with symptoms and exercises
const PRIMITIVE_REFLEXES = {
  moro: {
    name: "Moro Reflex",
    description: "Startle reflex that should integrate by 4-6 months",
    symptoms: {
      'Speech': ['difficulty with volume control', 'easily startled by sounds'],
      'Gross Motor': ['poor balance', 'motion sickness', 'difficulty with ball games'],
      'Fine Motor': ['tight pencil grip', 'difficulty with fine motor control'],
      'Cognitive': ['difficulty concentrating', 'easily distracted', 'hypervigilance'],
      'Behaviour': ['anxiety', 'emotional outbursts', 'difficulty with transitions'],
      'Daily Living Skills': ['difficulty sleeping', 'sensitive to textures']
    },
    exercises: [
      "Starfish exercise - lie on back, spread arms and legs wide, then bring together",
      "Deep pressure hugs - firm, calming hugs several times daily",
      "Rocking in fetal position - helps integration",
      "Ball squeezes - squeeze and release stress ball",
      "Breathing exercises with arm movements"
    ]
  },
  
  palmar: {
    name: "Palmar Grasp Reflex",
    description: "Grasping reflex that should integrate by 5-6 months",
    symptoms: {
      'Speech': ['difficulty with articulation', 'messy eating'],
      'Fine Motor': ['poor pencil grip', 'difficulty with buttons/zippers', 'messy handwriting'],
      'Cognitive': ['difficulty with writing tasks', 'poor hand-eye coordination'],
      'Daily Living Skills': ['difficulty with utensils', 'difficulty dressing']
    },
    exercises: [
      "Squeeze and release activities with various textures",
      "Playdough manipulation and squeezing",
      "Finger exercises - touching thumb to each finger",
      "Hanging from monkey bars",
      "Stress ball exercises"
    ]
  },
  
  atnr: {
    name: "Asymmetrical Tonic Neck Reflex (ATNR)",
    description: "Fencing reflex that should integrate by 6 months",
    symptoms: {
      'Speech': ['difficulty with reading', 'losing place when reading'],
      'Gross Motor': ['poor bilateral coordination', 'difficulty crossing midline'],
      'Fine Motor': ['difficulty with handwriting', 'poor hand-eye coordination'],
      'Cognitive': ['difficulty with reading and writing', 'poor visual tracking'],
      'Behaviour': ['difficulty with focus', 'clumsiness']
    },
    exercises: [
      "Lizard crawl - crawling with opposite arm and leg",
      "Cross-lateral marching",
      "Drawing figure-8s and infinity symbols",
      "Ball throwing across body midline",
      "Windmill exercises"
    ]
  },
  
  spinalGalant: {
    name: "Spinal Galant Reflex",
    description: "Back reflex that should integrate by 9 months",
    symptoms: {
      'Behaviour': ['fidgeting', 'inability to sit still', 'bedwetting past age 5'],
      'Gross Motor': ['poor posture', 'hip rotation when walking'],
      'Daily Living Skills': ['difficulty with toilet training', 'sensitive to waistbands'],
      'Cognitive': ['difficulty concentrating when sitting']
    },
    exercises: [
      "Snow angels - lying on back, moving arms and legs",
      "Back brushing with soft brush",
      "Cobra pose from yoga",
      "Rolling like a log",
      "Swimming movements on floor"
    ]
  },
  
  tlr: {
    name: "Tonic Labyrinthine Reflex (TLR)",
    description: "Head position reflex that should integrate by 3.5 years",
    symptoms: {
      'Gross Motor': ['poor posture', 'poor balance', 'difficulty with stairs'],
      'Fine Motor': ['difficulty with desk work', 'slumped posture when writing'],
      'Cognitive': ['difficulty with spatial awareness', 'poor sense of time'],
      'Behaviour': ['low muscle tone', 'appears lazy or unmotivated']
    },
    exercises: [
      "Superman pose - lying on stomach, lifting arms and legs",
      "Rocking back and forth in hands and knees position",
      "Head lifts in various positions",
      "Balance board activities",
      "Vestibular swinging"
    ]
  },
  
  stnr: {
    name: "Symmetrical Tonic Neck Reflex (STNR)",
    description: "Crawling reflex that should integrate by 11 months",
    symptoms: {
      'Gross Motor': ['W-sitting', 'difficulty with crawling', 'poor posture'],
      'Fine Motor': ['difficulty copying from board', 'slumping when writing'],
      'Cognitive': ['difficulty with reading', 'poor attention when sitting'],
      'Behaviour': ['clumsiness', 'difficulty sitting still']
    },
    exercises: [
      "Cat-cow stretches from yoga",
      "Crawling games and races",
      "Wheelbarrow walking",
      "Rocking on hands and knees",
      "Prone extension exercises"
    ]
  }
};

// Map responses to reflex indicators
export function mapResponsesToReflexes(responses, questions) {
  const reflexIndicators = {
    moro: { present: 0, total: 0, symptoms: [] },
    palmar: { present: 0, total: 0, symptoms: [] },
    atnr: { present: 0, total: 0, symptoms: [] },
    spinalGalant: { present: 0, total: 0, symptoms: [] },
    tlr: { present: 0, total: 0, symptoms: [] },
    stnr: { present: 0, total: 0, symptoms: [] }
  };

  // Analyze each response for reflex indicators
  Object.entries(responses).forEach(([questionId, answer]) => {
    const question = findQuestionById(questionId, questions);
    if (!question) return;

    const category = question.category;
    const questionText = question.question_text.toLowerCase();

    // Check for Moro reflex indicators
    if (containsIndicators(questionText, ['startle', 'loud', 'anxious', 'balance', 'motion sick'])) {
      reflexIndicators.moro.total++;
      if (answer === 'Yes' || answer === 'Sometimes') {
        reflexIndicators.moro.present++;
        reflexIndicators.moro.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }

    // Check for Palmar reflex indicators
    if (containsIndicators(questionText, ['pencil', 'grip', 'handwriting', 'buttons', 'utensils'])) {
      reflexIndicators.palmar.total++;
      if (answer === 'No' || answer === 'Sometimes') {
        reflexIndicators.palmar.present++;
        reflexIndicators.palmar.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }

    // Check for ATNR indicators
    if (containsIndicators(questionText, ['crossing midline', 'bilateral', 'reading', 'tracking', 'handwriting'])) {
      reflexIndicators.atnr.total++;
      if (answer === 'No' || answer === 'Sometimes') {
        reflexIndicators.atnr.present++;
        reflexIndicators.atnr.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }

    // Check for Spinal Galant indicators
    if (containsIndicators(questionText, ['sit still', 'fidget', 'bedwetting', 'toilet', 'posture'])) {
      reflexIndicators.spinalGalant.total++;
      if (answer === 'Yes' || answer === 'Sometimes') {
        reflexIndicators.spinalGalant.present++;
        reflexIndicators.spinalGalant.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }

    // Check for TLR indicators
    if (containsIndicators(questionText, ['posture', 'balance', 'stairs', 'muscle tone', 'spatial'])) {
      reflexIndicators.tlr.total++;
      if (answer === 'No' || answer === 'Sometimes') {
        reflexIndicators.tlr.present++;
        reflexIndicators.tlr.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }

    // Check for STNR indicators
    if (containsIndicators(questionText, ['w-sitting', 'crawl', 'copy from board', 'slump'])) {
      reflexIndicators.stnr.total++;
      if (answer === 'No' || answer === 'Sometimes') {
        reflexIndicators.stnr.present++;
        reflexIndicators.stnr.symptoms.push({
          category,
          symptom: question.question_text,
          response: answer
        });
      }
    }
  });

  // Calculate retention percentages
  const reflexAnalysis = {
    summary: generateReflexSummary(reflexIndicators),
    details: []
  };

  Object.entries(reflexIndicators).forEach(([reflexKey, data]) => {
    if (data.total > 0) {
      const retentionPercentage = Math.round((data.present / data.total) * 100);
      reflexAnalysis.details.push({
        reflexName: PRIMITIVE_REFLEXES[reflexKey].name,
        retentionLevel: `${retentionPercentage}%`,
        symptoms: data.symptoms,
        exercises: PRIMITIVE_REFLEXES[reflexKey].exercises,
        impact: getReflexImpact(reflexKey, retentionPercentage),
        professionals: getRecommendedProfessionals(reflexKey, retentionPercentage)
      });
    }
  });

  // Sort by retention level (highest first)
  reflexAnalysis.details.sort((a, b) => 
    parseInt(b.retentionLevel) - parseInt(a.retentionLevel)
  );

  return reflexAnalysis;
}

// Helper function to find question by ID
function findQuestionById(questionId, questions) {
  for (const category in questions) {
    const found = questions[category].find(q => q.id === questionId);
    if (found) return found;
  }
  return null;
}

// Helper function to check for indicators
function containsIndicators(text, indicators) {
  return indicators.some(indicator => text.includes(indicator));
}

// Generate reflex summary
function generateReflexSummary(indicators) {
  const activeReflexes = Object.entries(indicators)
    .filter(([_, data]) => data.present > 0)
    .map(([reflexKey, data]) => ({
      name: PRIMITIVE_REFLEXES[reflexKey].name,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0
    }))
    .filter(r => r.percentage > 30);

  if (activeReflexes.length === 0) {
    return "Excellent! No significant retained primitive reflexes detected. Development is progressing well.";
  } else if (activeReflexes.length <= 2) {
    return `Mild reflex retention detected. Focus on ${activeReflexes.map(r => r.name).join(' and ')} integration exercises.`;
  } else {
    return `Multiple retained reflexes detected. A comprehensive integration program is recommended focusing on the nervous system foundation.`;
  }
}

// Get reflex impact description
function getReflexImpact(reflexKey, percentage) {
  const reflex = PRIMITIVE_REFLEXES[reflexKey];
  
  if (percentage >= 70) {
    return `High retention of ${reflex.name} is significantly impacting development. This reflex ${reflex.description}. Daily integration exercises are essential.`;
  } else if (percentage >= 40) {
    return `Moderate retention of ${reflex.name} may be affecting some areas of development. Regular integration exercises recommended.`;
  } else {
    return `Mild retention of ${reflex.name} detected. Include integration exercises in daily routine for optimal development.`;
  }
}

// Get recommended professionals based on reflex
function getRecommendedProfessionals(reflexKey, percentage) {
  const professionals = [];
  
  if (percentage >= 50) {
    professionals.push("Occupational Therapist (reflex integration specialist)");
  }
  
  switch(reflexKey) {
    case 'moro':
      professionals.push("Sensory Integration Therapist");
      if (percentage >= 70) professionals.push("Child Psychologist (for anxiety)");
      break;
    case 'palmar':
      professionals.push("Occupational Therapist (fine motor)");
      break;
    case 'atnr':
      professionals.push("Developmental Optometrist");
      professionals.push("Educational Therapist");
      break;
    case 'spinalGalant':
      if (percentage >= 60) professionals.push("Pediatric Urologist (if bedwetting)");
      break;
    case 'tlr':
    case 'stnr':
      professionals.push("Physical Therapist");
      break;
  }
  
  return professionals.length > 0 ? professionals : ["Pediatric Occupational Therapist"];
}

// Generate comprehensive smart report
export async function generateSmartReport(assessmentData, reflexAnalysis, developmentalAnalysis) {
  const report = {
    // Child Information
    childInfo: {
      name: `${assessmentData.child_first_name} ${assessmentData.child_last_name}`,
      age: assessmentData.child_age,
      gender: assessmentData.child_gender,
      assessmentDate: new Date().toLocaleDateString()
    },

    // Executive Summary
    executiveSummary: {
      overallStatus: developmentalAnalysis?.overall?.overallStatus || 'Assessment Complete',
      developmentalAge: developmentalAnalysis?.overall?.developmentalAge || assessmentData.child_age,
      topStrengths: extractTopStrengths(developmentalAnalysis),
      priorityAreas: extractPriorityAreas(developmentalAnalysis, reflexAnalysis)
    },

    // Reflex Analysis
    reflexAnalysis: reflexAnalysis || { summary: 'No reflex analysis available', details: [] },

    // Category Breakdown
    categoryBreakdown: formatCategoryBreakdown(developmentalAnalysis),

    // Action Plan
    actionPlan: generateActionPlan(reflexAnalysis, developmentalAnalysis),

    // Professional Recommendations
    professionalRecommendations: generateProfessionalRecommendations(reflexAnalysis, developmentalAnalysis),

    // Parent Message
    parentMessage: generateParentMessage(assessmentData, developmentalAnalysis),

    // AI Narrative (if available)
    aiNarrative: developmentalAnalysis?.overall?.summary || null
  };

  return report;
}

// Extract top strengths from analysis
function extractTopStrengths(analysis) {
  const strengths = [];
  
  if (analysis && analysis.overall) {
    if (analysis.overall.strengths && analysis.overall.strengths.length > 0) {
      strengths.push(...analysis.overall.strengths.slice(0, 3));
    }
  }
  
  // Add category-specific strengths
  if (analysis) {
    Object.entries(analysis).forEach(([category, data]) => {
      if (category !== 'overall' && data.scores) {
        if (data.scores.current?.percentage >= 70) {
          strengths.push(`Strong ${category} skills`);
        }
      }
    });
  }
  
  return strengths.length > 0 ? strengths.slice(0, 5) : ['Continued development', 'Engagement in assessment'];
}

// Extract priority areas
function extractPriorityAreas(developmentalAnalysis, reflexAnalysis) {
  const priorities = [];
  
  // Add developmental priorities
  if (developmentalAnalysis?.overall?.priorityAreas) {
    priorities.push(...developmentalAnalysis.overall.priorityAreas);
  }
  
  // Add reflex priorities
  if (reflexAnalysis?.details) {
    reflexAnalysis.details.forEach(reflex => {
      if (parseInt(reflex.retentionLevel) >= 50) {
        priorities.push(`${reflex.reflexName} integration`);
      }
    });
  }
  
  return priorities.length > 0 ? priorities.slice(0, 5) : ['Continue monitoring development'];
}

// Format category breakdown
function formatCategoryBreakdown(analysis) {
  const breakdown = {};
  
  if (analysis) {
    Object.entries(analysis).forEach(([category, data]) => {
      if (category !== 'overall' && data.scores) {
        breakdown[category] = {
          foundation: `${data.scores.foundation?.percentage || 0}%`,
          current: `${data.scores.current?.percentage || 0}%`,
          emerging: `${data.scores.emerging?.percentage || 0}%`,
          interpretation: data.interpretation || interpretScores(data.scores),
          recommendations: data.recommendations || []
        };
      }
    });
  }
  
  return breakdown;
}

// Interpret scores
function interpretScores(scores) {
  const current = scores.current?.percentage || 0;
  const foundation = scores.foundation?.percentage || 0;
  
  if (foundation < 50) {
    return 'Foundation skills need immediate attention';
  } else if (current >= 70) {
    return 'Age-appropriate development';
  } else if (current >= 50) {
    return 'Developing with some areas needing support';
  } else {
    return 'Significant support needed';
  }
}

// Generate action plan
function generateActionPlan(reflexAnalysis, developmentalAnalysis) {
  const plan = {
    immediate: [],
    month1: {
      focus: 'Foundation Building',
      reflexTarget: '',
      goals: [],
      activities: [],
      milestones: []
    },
    month2: {
      focus: 'Skill Development',
      reflexTarget: '',
      goals: [],
      activities: [],
      milestones: []
    },
    month3: {
      focus: 'Integration & Advancement',
      reflexTarget: '',
      goals: [],
      activities: [],
      milestones: []
    }
  };

  // Add immediate actions from reflexes
  if (reflexAnalysis?.details && reflexAnalysis.details.length > 0) {
    const topReflex = reflexAnalysis.details[0];
    plan.immediate.push({
      action: `Start ${topReflex.reflexName} integration`,
      frequency: 'Daily, 2-3 times',
      exercises: topReflex.exercises.slice(0, 3)
    });
    
    plan.month1.reflexTarget = topReflex.reflexName;
    plan.month1.activities = topReflex.exercises.slice(0, 3);
    plan.month1.goals = ['Reduce reflex retention by 20%', 'Establish daily routine'];
    plan.month1.milestones = ['Consistent daily practice', 'Improved symptoms'];
  }

  // Add month 2 and 3 plans
  if (reflexAnalysis?.details && reflexAnalysis.details.length > 1) {
    plan.month2.reflexTarget = reflexAnalysis.details[1].reflexName;
    plan.month2.activities = reflexAnalysis.details[1].exercises.slice(0, 3);
  }

  return plan;
}

// Generate professional recommendations
function generateProfessionalRecommendations(reflexAnalysis, developmentalAnalysis) {
  const recommendations = [];
  const addedSpecialists = new Set();

  // Add reflex-based recommendations
  if (reflexAnalysis?.details) {
    reflexAnalysis.details.forEach(reflex => {
      if (parseInt(reflex.retentionLevel) >= 50) {
        reflex.professionals.forEach(prof => {
          if (!addedSpecialists.has(prof)) {
            recommendations.push({
              specialist: prof,
              reason: `For ${reflex.reflexName} integration`,
              priority: parseInt(reflex.retentionLevel) >= 70 ? 'High Priority' : 'Moderate Priority'
            });
            addedSpecialists.add(prof);
          }
        });
      }
    });
  }

  // Add developmental recommendations
  if (developmentalAnalysis?.overall?.immediateActions) {
    developmentalAnalysis.overall.immediateActions.forEach(action => {
      if (action.urgency === 'Within 2 weeks' && !addedSpecialists.has(action.action)) {
        recommendations.push({
          specialist: extractSpecialistFromAction(action.action),
          reason: action.action,
          priority: 'High Priority'
        });
      }
    });
  }

  return recommendations;
}

// Extract specialist from action text
function extractSpecialistFromAction(action) {
  if (action.includes('speech')) return 'Speech-Language Pathologist';
  if (action.includes('motor')) return 'Occupational/Physical Therapist';
  if (action.includes('cognitive')) return 'Developmental Pediatrician';
  if (action.includes('behaviour')) return 'Child Psychologist';
  return 'Pediatric Specialist';
}

// Generate parent message
function generateParentMessage(assessmentData, analysis) {
  const childName = assessmentData.child_first_name;
  const status = analysis?.overall?.overallStatus || 'developing';
  
  let message = `Dear Parent,\n\n`;
  message += `Thank you for completing this comprehensive assessment for ${childName}. `;
  
  if (status === 'On Track') {
    message += `The results show that ${childName} is developing well across most areas. Continue providing the enriching environment and activities you're already doing.\n\n`;
  } else {
    message += `This assessment has identified some areas where ${childName} could benefit from additional support. Remember, every child develops at their own pace, and with the right support, significant improvements are possible.\n\n`;
  }
  
  message += `The exercises and activities recommended in this report are designed to be fun and engaging. Make them part of your daily routine, celebrating small victories along the way.\n\n`;
  message += `Remember: You are your child's most important teacher and advocate. Your consistent support and encouragement make all the difference.\n\n`;
  message += `If you have concerns, don't hesitate to reach out to the recommended professionals. Early intervention leads to the best outcomes.\n\n`;
  message += `Wishing you and ${childName} all the best on this developmental journey!`;
  
  return message;
}

export default {
  mapResponsesToReflexes,
  generateSmartReport,
  PRIMITIVE_REFLEXES
};