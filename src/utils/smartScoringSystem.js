// utils/smartScoringSystem.js
// Intelligent scoring that understands positive vs negative indicators

// Define which questions are REVERSE SCORED (where "No" is good, "Yes" is bad)
const REVERSE_SCORED_PATTERNS = {
  // Oral Motor / Feeding Issues (Yes = Problem)
  feeding_problems: [
    'drool', 'gag', 'choke', 'spit', 'refuse food', 'picky eater',
    'mouth breathing', 'tongue thrust', 'open mouth posture'
  ],
  
  // Behavioral Red Flags (Yes = Problem)
  behavior_problems: [
    'tantrum', 'aggressive', 'hit', 'bite', 'destructive', 'defiant',
    'meltdown', 'scream', 'refuse', 'resist', 'avoid', 'fearful',
    'anxious', 'withdrawn', 'isolated', 'repetitive behavior'
  ],
  
  // Motor Difficulties (Yes = Problem)
  motor_problems: [
    'clumsy', 'fall', 'trip', 'stumble', 'poor balance', 'awkward',
    'difficulty with', 'cannot', 'unable to', 'struggles with',
    'avoids physical', 'tires easily', 'weak grip', 'drops things'
  ],
  
  // Sensory Issues (Yes = Problem)
  sensory_problems: [
    'sensitive to', 'bothered by', 'covers ears', 'avoids textures',
    'dislikes being touched', 'overwhelmed by', 'distressed by',
    'seeks excessive', 'craves movement', 'constantly moving'
  ],
  
  // Medical/Health Concerns (Yes = Problem)
  health_problems: [
    'bedwetting', 'accident', 'constipation', 'illness', 'infection',
    'allergy', 'seizure', 'headache', 'pain', 'discomfort'
  ],
  
  // Sleep Issues (Yes = Problem)
  sleep_problems: [
    'difficulty falling asleep', 'wakes frequently', 'nightmares',
    'night terrors', 'sleepwalks', 'restless sleep', 'snoring'
  ],
  
  // Learning Difficulties (Yes = Problem)
  learning_problems: [
    'difficulty learning', 'behind peers', 'delayed', 'slow to',
    'trouble with', 'confused by', 'forgets', 'loses focus'
  ]
};

// Define which questions are ALWAYS POSITIVE (where "Yes" is always good)
const POSITIVE_PATTERNS = {
  achievements: [
    'can your child', 'does your child', 'is your child able to',
    'has your child learned', 'does your child know how'
  ],
  
  skills: [
    'independently', 'without help', 'on their own', 'successfully',
    'consistently', 'easily', 'confidently'
  ],
  
  social_positive: [
    'make friends', 'play cooperatively', 'share', 'take turns',
    'show empathy', 'help others', 'follow rules'
  ]
};

// Smart scoring function
export function calculateSmartScore(questionText, answer) {
  const question = questionText.toLowerCase();
  
  // Check if it's a reverse-scored question (Yes = Bad)
  const isReverseScored = Object.values(REVERSE_SCORED_PATTERNS).some(patterns =>
    patterns.some(pattern => question.includes(pattern))
  );
  
  // Check if it's explicitly positive (Yes = Good)
  const isPositive = Object.values(POSITIVE_PATTERNS).some(patterns =>
    patterns.some(pattern => question.includes(pattern))
  );
  
  // Scoring logic
  if (isReverseScored && !isPositive) {
    // Reverse scored question
    if (answer === 'No') return 1.0;      // No is good = full point
    if (answer === 'Sometimes') return 0.3; // Sometimes is concerning
    if (answer === 'Yes') return 0;        // Yes is bad = no points
  } else {
    // Normal scored question (or explicitly positive)
    if (answer === 'Yes') return 1.0;      // Yes is good = full point
    if (answer === 'Sometimes') return 0.5; // Sometimes is partial
    if (answer === 'No') return 0;         // No is bad = no points
  }
  
  return 0;
}

// Identify question type for reporting
export function identifyQuestionType(questionText) {
  const question = questionText.toLowerCase();
  
  for (const [category, patterns] of Object.entries(REVERSE_SCORED_PATTERNS)) {
    if (patterns.some(pattern => question.includes(pattern))) {
      return {
        type: 'reverse',
        category: category,
        interpretation: 'Lower scores are better (Yes indicates a problem)'
      };
    }
  }
  
  for (const [category, patterns] of Object.entries(POSITIVE_PATTERNS)) {
    if (patterns.some(pattern => question.includes(pattern))) {
      return {
        type: 'positive',
        category: category,
        interpretation: 'Higher scores are better (Yes indicates achievement)'
      };
    }
  }
  
  // Default to positive if unclear
  return {
    type: 'positive',
    category: 'general',
    interpretation: 'Higher scores are better'
  };
}

// Enhanced scoring with reflex indicators
export function analyzeResponsesWithSmartScoring(responses, questions) {
  const analysis = {
    categoryScores: {},
    reflexIndicators: {},
    redFlags: [],
    strengths: [],
    detailedScores: {}
  };
  
  // Process each category
  Object.entries(questions).forEach(([category, categoryQuestions]) => {
    let totalScore = 0;
    let maxScore = 0;
    let reverseQuestions = [];
    let positiveAchievements = [];
    let concerningResponses = [];
    
    categoryQuestions.forEach(q => {
      const response = responses[q.id];
      if (!response) return;
      
      const questionType = identifyQuestionType(q.question_text);
      const score = calculateSmartScore(q.question_text, response);
      
      totalScore += score;
      maxScore += 1;
      
      // Track specific concerns and achievements
      if (questionType.type === 'reverse' && response === 'Yes') {
        concerningResponses.push({
          question: q.question_text,
          category: questionType.category,
          severity: 'high'
        });
        analysis.redFlags.push({
          category: category,
          issue: q.question_text,
          response: response
        });
      } else if (questionType.type === 'positive' && response === 'Yes') {
        positiveAchievements.push({
          skill: q.question_text,
          category: category
        });
      }
      
      // Store detailed scoring
      analysis.detailedScores[q.id] = {
        question: q.question_text,
        response: response,
        score: score,
        type: questionType.type,
        interpretation: questionType.interpretation
      };
    });
    
    // Calculate percentage with smart scoring
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    
    analysis.categoryScores[category] = {
      percentage: percentage,
      rawScore: totalScore,
      maxScore: maxScore,
      concerns: concerningResponses,
      strengths: positiveAchievements,
      interpretation: interpretCategoryScore(percentage, concerningResponses.length)
    };
    
    // Add to overall strengths if high score and no major concerns
    if (percentage >= 70 && concerningResponses.length === 0) {
      analysis.strengths.push({
        category: category,
        score: percentage,
        achievements: positiveAchievements
      });
    }
  });
  
  return analysis;
}

// Interpret category scores considering concerns
function interpretCategoryScore(percentage, concernCount) {
  if (concernCount >= 3) {
    return 'Significant concerns requiring immediate attention';
  } else if (concernCount >= 1) {
    return 'Some red flags present - professional evaluation recommended';
  } else if (percentage >= 80) {
    return 'Excellent development - well above age expectations';
  } else if (percentage >= 70) {
    return 'On track - age-appropriate development';
  } else if (percentage >= 50) {
    return 'Emerging skills - monitor and support development';
  } else {
    return 'Needs support - consider professional evaluation';
  }
}

// Map responses to specific reflexes with smart scoring
export function mapResponsesToReflexesWithSmartScoring(responses, questions) {
  const reflexMap = {
    moro: {
      name: 'Moro Reflex',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    palmar: {
      name: 'Palmar Grasp Reflex',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    atnr: {
      name: 'ATNR (Asymmetrical Tonic Neck Reflex)',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    spinalGalant: {
      name: 'Spinal Galant Reflex',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    tlr: {
      name: 'TLR (Tonic Labyrinthine Reflex)',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    stnr: {
      name: 'STNR (Symmetrical Tonic Neck Reflex)',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    rooting: {
      name: 'Rooting Reflex',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    },
    babinski: {
      name: 'Babinski Reflex',
      indicators: [],
      retentionScore: 0,
      maxScore: 0
    }
  };
  
  // Reflex indicator patterns (these are PROBLEMS when answered YES)
  const reflexPatterns = {
    moro: [
      'startle easily', 'anxious', 'motion sickness', 'poor balance',
      'difficulty with loud noises', 'emotional outbursts', 'hypervigilant',
      'difficulty with transitions', 'light sensitive', 'easily overwhelmed'
    ],
    palmar: [
      'poor pencil grip', 'messy handwriting', 'difficulty with utensils',
      'drops things', 'weak grip', 'difficulty with buttons', 'poor fine motor'
    ],
    atnr: [
      'difficulty crossing midline', 'poor handwriting', 'reading difficulties',
      'loses place when reading', 'poor bilateral coordination', 'one-sided dominance issues'
    ],
    spinalGalant: [
      'fidgety', 'can\'t sit still', 'bedwetting', 'hip rotation when walking',
      'sensitive to waistbands', 'poor concentration when sitting', 'restless'
    ],
    tlr: [
      'poor posture', 'slumps when sitting', 'W-sitting', 'motion sickness',
      'poor balance', 'difficulty with stairs', 'fear of heights', 'gravitational insecurity'
    ],
    stnr: [
      'poor posture when writing', 'difficulty copying from board', 'skips crawling',
      'W-sitting', 'difficulty swimming', 'poor hand-eye coordination'
    ],
    rooting: [
      'messy eating', 'drooling', 'thumb sucking beyond age 5', 'oral fixation',
      'difficulty with speech sounds', 'tongue thrust'
    ],
    babinski: [
      'toe walking', 'poor balance', 'delayed walking', 'unusual gait',
      'difficulty with shoes', 'sensitive feet'
    ]
  };
  
  // Analyze each response for reflex indicators
  Object.entries(questions).forEach(([category, categoryQuestions]) => {
    categoryQuestions.forEach(q => {
      const response = responses[q.id];
      if (!response) return;
      
      const questionLower = q.question_text.toLowerCase();
      
      // Check each reflex pattern
      Object.entries(reflexPatterns).forEach(([reflexKey, patterns]) => {
        const matchesPattern = patterns.some(pattern => questionLower.includes(pattern));
        
        if (matchesPattern) {
          reflexMap[reflexKey].maxScore += 1;
          
          // For reflex indicators, YES or SOMETIMES indicates retention
          if (response === 'Yes') {
            reflexMap[reflexKey].retentionScore += 1;
            reflexMap[reflexKey].indicators.push({
              question: q.question_text,
              response: response,
              category: category,
              severity: 'high'
            });
          } else if (response === 'Sometimes') {
            reflexMap[reflexKey].retentionScore += 0.5;
            reflexMap[reflexKey].indicators.push({
              question: q.question_text,
              response: response,
              category: category,
              severity: 'moderate'
            });
          }
        }
      });
    });
  });
  
  // Calculate retention percentages and generate analysis
  const reflexAnalysis = {
    summary: '',
    reflexes: [],
    priorityReflexes: [],
    interventionPlan: {}
  };
  
  Object.entries(reflexMap).forEach(([reflexKey, data]) => {
    if (data.maxScore > 0) {
      const retentionPercentage = Math.round((data.retentionScore / data.maxScore) * 100);
      
      if (retentionPercentage > 0) {
        const reflexInfo = {
          name: data.name,
          retentionLevel: retentionPercentage,
          indicators: data.indicators,
          impact: getReflexImpact(reflexKey, retentionPercentage),
          exercises: getReflexExercises(reflexKey),
          category: getReflexCategory(reflexKey)
        };
        
        reflexAnalysis.reflexes.push(reflexInfo);
        
        if (retentionPercentage >= 50) {
          reflexAnalysis.priorityReflexes.push(reflexKey);
        }
      }
    }
  });
  
  // Sort by retention level
  reflexAnalysis.reflexes.sort((a, b) => b.retentionLevel - a.retentionLevel);
  
  // Generate summary
  if (reflexAnalysis.priorityReflexes.length === 0) {
    reflexAnalysis.summary = 'Excellent! No significant primitive reflex retention detected.';
  } else if (reflexAnalysis.priorityReflexes.length <= 2) {
    reflexAnalysis.summary = `Mild reflex retention detected in ${reflexAnalysis.priorityReflexes.join(' and ')}. Targeted exercises recommended.`;
  } else {
    reflexAnalysis.summary = 'Multiple retained reflexes detected. Comprehensive integration program strongly recommended.';
  }
  
  return reflexAnalysis;
}

// Get reflex impact description
function getReflexImpact(reflexKey, percentage) {
  const impacts = {
    moro: 'Affects emotional regulation, anxiety levels, and sensory processing',
    palmar: 'Impacts fine motor skills, handwriting, and hand strength',
    atnr: 'Affects reading, writing, and bilateral coordination',
    spinalGalant: 'Impacts attention, bladder control, and ability to sit still',
    tlr: 'Affects posture, balance, and spatial awareness',
    stnr: 'Impacts posture during desk work and visual tracking',
    rooting: 'Affects oral motor skills and speech development',
    babinski: 'Impacts walking patterns and foot sensitivity'
  };
  
  const severity = percentage >= 70 ? 'Significantly' : percentage >= 40 ? 'Moderately' : 'Mildly';
  return `${severity} ${impacts[reflexKey] || 'affects development'}`;
}

// Get reflex exercises
function getReflexExercises(reflexKey) {
  const exercises = {
    moro: [
      'Starfish exercise - spread limbs wide then bring together',
      'Deep pressure hugs - firm, calming pressure',
      'Rocking in fetal position',
      'Breathing exercises with arm movements',
      'Progressive muscle relaxation'
    ],
    palmar: [
      'Squeeze and release stress balls',
      'Playdough manipulation',
      'Hanging from monkey bars',
      'Finger opposition exercises',
      'Hand massage with different textures'
    ],
    atnr: [
      'Cross-crawl exercises',
      'Figure-8 drawing with both hands',
      'Lazy-8 eye tracking',
      'Sword play crossing midline',
      'Ball throwing across body'
    ],
    spinalGalant: [
      'Snow angels on back',
      'Log rolling',
      'Back brushing technique',
      'Cat-cow yoga poses',
      'Swimming backstroke movements'
    ],
    tlr: [
      'Superman pose on stomach',
      'Airplane flying position',
      'Rocking on hands and knees',
      'Balance board activities',
      'Vestibular swinging'
    ],
    stnr: [
      'Cat-cow stretches',
      'Wheelbarrow walking',
      'Bear crawl',
      'Prone extension holds',
      'Table top position holds'
    ]
  };
  
  return exercises[reflexKey] || ['Consult with occupational therapist'];
}

// Get reflex category
function getReflexCategory(reflexKey) {
  const categories = {
    moro: 'Emotional/Sensory',
    palmar: 'Fine Motor',
    atnr: 'Academic/Coordination',
    spinalGalant: 'Attention/Bladder',
    tlr: 'Balance/Posture',
    stnr: 'Posture/Visual',
    rooting: 'Oral/Speech',
    babinski: 'Gait/Walking'
  };
  
  return categories[reflexKey] || 'General';
}

export default {
  calculateSmartScore,
  identifyQuestionType,
  analyzeResponsesWithSmartScoring,
  mapResponsesToReflexesWithSmartScoring
};