// utils/comprehensiveReflexDatabase.js
// Complete reflex database based on your checklists

export const COMPREHENSIVE_REFLEX_DATABASE = {
  moro: {
    name: "Moro Reflex",
    description: "Startle reflex that should integrate by 4-6 months",
    integrationAge: "4-6 months",
    
    // Complete symptom list from your checklist
    symptoms: [
      "Motion sickness",
      "Poor eye contact",
      "Light/sound sensory sensitivity",
      "Allergies/chronic illness",
      "Adverse reactions to drugs",
      "Poor tolerance of change",
      "Anxiety/nervousness",
      "Mood swings",
      "Difficulty with ball games",
      "Fight/Flight/Freeze",
      "Stressful birth/traumatic birth/assisted birth/C-section birth",
      "Poor impulse control",
      "Cravings for sweets",
      "Frequent headaches",
      "Fatigues easily",
      "Sensitive to touch/unexpected touch",
      "Sensitive to feet leaving the ground",
      "Avoids head position changes (in bath, somersaults, etc.)",
      "Easily overreactions to 'little problems'",
      "Challenges calming down",
      "Easily distracted by surroundings",
      "Presents with ADD/ADHD tendencies",
      "Poor social skills",
      "Depression",
      "Poor decision making skills",
      "Requires control during games/lacks flexible thinking",
      "Challenges communicating feelings"
    ],
    
    // Map to developmental areas
    affectedAreas: {
      'Speech': ['Poor eye contact affects communication', 'Challenges communicating feelings'],
      'Gross Motor': ['Difficulty with ball games', 'Avoids head position changes', 'Motion sickness'],
      'Fine Motor': ['Tension affects fine motor control'],
      'Cognitive': ['Poor decision making', 'Lacks flexible thinking', 'ADD/ADHD tendencies'],
      'Behaviour': ['Anxiety/nervousness', 'Mood swings', 'Fight/flight/freeze', 'Poor impulse control'],
      'Sensory': ['Light/sound sensitivity', 'Sensitive to touch', 'Sensory overload'],
      'Social': ['Poor social skills', 'Challenges with emotional regulation']
    },
    
    // Comprehensive exercise list
    exercises: [
      {
        name: "Starfish Exercise",
        description: "Lie on back, spread arms and legs wide like a star, then bring together slowly",
        frequency: "3 times daily",
        duration: "5 repetitions"
      },
      {
        name: "Deep Pressure Hugs",
        description: "Firm, calming hugs with deep pressure input",
        frequency: "Multiple times daily",
        duration: "30 seconds each"
      },
      {
        name: "Fetal Position Rocking",
        description: "Rock gently in fetal position on back",
        frequency: "2 times daily",
        duration: "2-3 minutes"
      },
      {
        name: "Ball Squeezes",
        description: "Squeeze and release stress ball rhythmically",
        frequency: "Throughout day",
        duration: "10 squeezes x 3 sets"
      },
      {
        name: "Breathing with Arm Movements",
        description: "Deep breathing while raising arms overhead and lowering",
        frequency: "Morning and evening",
        duration: "10 breaths"
      },
      {
        name: "Weighted Blanket",
        description: "Use during sleep or quiet time for calming input",
        frequency: "Nightly",
        duration: "During sleep or 20 min quiet time"
      },
      {
        name: "Cross-lateral Movements",
        description: "Touch opposite knee to elbow in standing",
        frequency: "2 times daily",
        duration: "20 repetitions"
      }
    ],
    
    // Professional recommendations
    recommendedTherapies: [
      {
        type: "Occupational Therapy",
        reason: "Sensory integration, reflex integration program",
        priority: "HIGH"
      },
      {
        type: "Behavioral Therapy",
        reason: "Anxiety management, emotional regulation",
        priority: "MEDIUM"
      },
      {
        type: "Vision Therapy",
        reason: "Eye contact, visual processing",
        priority: "LOW"
      }
    ]
  },
  
  palmar: {
    name: "Palmar Grasp Reflex",
    description: "Grasping reflex that should integrate by 5-6 months",
    integrationAge: "5-6 months",
    
    symptoms: [
      "Poor handwriting",
      "Tactile sensitivity",
      "Decreased upper body strength",
      "Poor hand dominance",
      "Right/left confusion",
      "Speech/articulation challenges",
      "Decreased overall fine motor skills",
      "Overflow associated movements in tongue/opposite hand",
      "Hypersensitivity of the hand when touched",
      "Self-injurous behaviors",
      "Biting fingernails",
      "Thumb sucking beyond 1.5 years old",
      "Tightening of jaw with clenched fists",
      "Eats with hands rather than utensils"
    ],
    
    affectedAreas: {
      'Speech': ['Speech/articulation challenges', 'Overflow movements in tongue'],
      'Fine Motor': ['Poor handwriting', 'Decreased fine motor skills', 'Poor hand dominance'],
      'Cognitive': ['Right/left confusion', 'Difficulty with writing tasks'],
      'Behaviour': ['Self-injurous behaviors', 'Biting fingernails', 'Thumb sucking'],
      'Daily Living': ['Eats with hands rather than utensils', 'Difficulty with self-care'],
      'Sensory': ['Tactile sensitivity', 'Hypersensitivity when touched']
    },
    
    exercises: [
      {
        name: "Squeeze and Release Activities",
        description: "Use therapy putty, stress balls, or playdough",
        frequency: "3 times daily",
        duration: "5-10 minutes"
      },
      {
        name: "Finger Opposition Exercises",
        description: "Touch thumb to each finger sequentially",
        frequency: "5 times daily",
        duration: "20 repetitions each hand"
      },
      {
        name: "Hanging Activities",
        description: "Monkey bars, pull-up bar hanging",
        frequency: "Daily",
        duration: "Build up to 30 seconds"
      },
      {
        name: "Hand Massage",
        description: "Deep pressure massage to palms and fingers",
        frequency: "2 times daily",
        duration: "3 minutes each hand"
      },
      {
        name: "Finger Painting",
        description: "Sensory exploration with finger paints",
        frequency: "3 times weekly",
        duration: "15 minutes"
      },
      {
        name: "Pencil Grip Exercises",
        description: "Practice proper grip with adaptive tools",
        frequency: "During all writing activities",
        duration: "As needed"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Occupational Therapy",
        reason: "Fine motor development, handwriting remediation",
        priority: "HIGH"
      },
      {
        type: "Speech Therapy",
        reason: "Articulation, oral motor coordination",
        priority: "MEDIUM"
      }
    ]
  },
  
  rooting: {
    name: "Rooting/Suck Reflex",
    description: "Feeding reflex that should integrate by 4 months",
    integrationAge: "3-4 months",
    
    symptoms: [
      "Extreme picky eating",
      "Messy eater",
      "Speech/articulation challenges",
      "Chewing/swallowing deficit",
      "Excessive drooling",
      "Latch difficulties in infancy",
      "Tactile sensitivity to the face/cheeks",
      "Decreased oral motor skills",
      "Overflow associated movements in tongue/opposite hand",
      "Difficulty chewing/swallowing",
      "Tethered oral tissues"
    ],
    
    affectedAreas: {
      'Speech': ['Speech/articulation challenges', 'Decreased oral motor skills'],
      'Feeding': ['Extreme picky eating', 'Messy eater', 'Chewing/swallowing deficit'],
      'Sensory': ['Tactile sensitivity to face/cheeks', 'Oral sensory issues'],
      'Daily Living': ['Excessive drooling', 'Difficulty with eating']
    },
    
    exercises: [
      {
        name: "Oral Motor Exercises",
        description: "Blow bubbles, whistles, straws",
        frequency: "3 times daily",
        duration: "5 minutes"
      },
      {
        name: "Facial Massage",
        description: "Gentle massage around mouth and cheeks",
        frequency: "Before meals",
        duration: "2 minutes"
      },
      {
        name: "Chewy Tube Activities",
        description: "Chew on therapy tubes for jaw strengthening",
        frequency: "3 times daily",
        duration: "5 minutes"
      },
      {
        name: "Food Exploration",
        description: "Touch, smell, lick new foods without pressure to eat",
        frequency: "Daily at meals",
        duration: "During mealtimes"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Speech Therapy",
        reason: "Oral motor, feeding therapy",
        priority: "HIGH"
      },
      {
        type: "Occupational Therapy",
        reason: "Sensory feeding issues",
        priority: "MEDIUM"
      }
    ]
  },
  
  atnr: {
    name: "Asymmetrical Tonic Neck Reflex (ATNR)",
    description: "Fencing reflex that should integrate by 6 months",
    integrationAge: "6 months",
    
    symptoms: [
      "Poor handwriting",
      "Eye tracking difficulty",
      "Poor crossing midline",
      "Poor hand dominance",
      "Right/left confusion",
      "Mixes b's and d's during writing",
      "Clumsy gross motor skills",
      "Challenges with reading skills",
      "Holds pencil too tightly or presses too hard",
      "Difficulty copying from the board",
      "Challenges completing activities of daily living",
      "Poor balance/postural stability",
      "Difficulty concentrating",
      "Dyscalculia (challenges with math)",
      "Poor ability with hopscotch, jump rope, or skipping",
      "Did not crawl as baby or struggled with crawling",
      "Motor planning challenges",
      "Struggled with rolling in infancy",
      "Poor eye-hand and eye-foot coordination"
    ],
    
    affectedAreas: {
      'Academic': ['Poor handwriting', 'Reading challenges', 'Difficulty copying from board', 'Dyscalculia'],
      'Gross Motor': ['Poor crossing midline', 'Clumsy gross motor', 'Poor balance', 'Motor planning challenges'],
      'Fine Motor': ['Eye tracking difficulty', 'Holds pencil too tightly', 'Poor eye-hand coordination'],
      'Cognitive': ['Right/left confusion', 'Mixes b/d', 'Difficulty concentrating'],
      'Daily Living': ['Challenges with ADLs', 'Poor coordination for self-care']
    },
    
    exercises: [
      {
        name: "Lizard Crawl",
        description: "Army crawl with opposite arm and leg movement",
        frequency: "2 times daily",
        duration: "5 minutes"
      },
      {
        name: "Cross-Crawl Marching",
        description: "March in place touching opposite knee to elbow",
        frequency: "3 times daily",
        duration: "2 minutes"
      },
      {
        name: "Figure-8 Drawing",
        description: "Draw large figure-8s and infinity symbols",
        frequency: "Daily",
        duration: "10 repetitions"
      },
      {
        name: "Midline Crossing Activities",
        description: "Pass objects across body midline",
        frequency: "Throughout day",
        duration: "During play activities"
      },
      {
        name: "Windmill Exercises",
        description: "Arms windmill while walking",
        frequency: "2 times daily",
        duration: "20 repetitions"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Occupational Therapy",
        reason: "Midline crossing, bilateral coordination",
        priority: "HIGH"
      },
      {
        type: "Vision Therapy",
        reason: "Eye tracking, visual-motor integration",
        priority: "HIGH"
      },
      {
        type: "Educational Therapy",
        reason: "Reading, writing, math support",
        priority: "MEDIUM"
      }
    ]
  },
  
  stnr: {
    name: "Symmetrical Tonic Neck Reflex (STNR)",
    description: "Crawling reflex that should integrate by 9-11 months",
    integrationAge: "9-11 months",
    
    symptoms: [
      "Lays head on desk while writing",
      "Decreased ball skills",
      "Clumsy",
      "Messy eater",
      "Decreased attention",
      "Difficulty copying from the board",
      "Skipped crawling",
      "Asymmetrical/poor crawling pattern",
      "Difficulty with handwriting tasks",
      "Presents with farsidedness",
      "Challenges tuning out background noise",
      "Slouched posture",
      "W-sitting",
      "Poor muscle tone/core stability",
      "Hyperextended elbows in weight bearing",
      "Challenges disassociating upper and lower body",
      "Challenges with swimming",
      "Moves at slower speed than peers"
    ],
    
    affectedAreas: {
      'Posture': ['Slouched posture', 'W-sitting', 'Lays head on desk', 'Poor core stability'],
      'Gross Motor': ['Decreased ball skills', 'Clumsy', 'Challenges with swimming', 'Slower movement'],
      'Fine Motor': ['Difficulty with handwriting', 'Messy eating'],
      'Academic': ['Difficulty copying from board', 'Decreased attention'],
      'Sensory': ['Challenges tuning out background noise', 'Vision issues']
    },
    
    exercises: [
      {
        name: "Cat-Cow Stretches",
        description: "Yoga cat-cow position transitions",
        frequency: "3 times daily",
        duration: "10 repetitions"
      },
      {
        name: "Crawling Races",
        description: "Various crawling patterns and games",
        frequency: "Daily",
        duration: "10 minutes"
      },
      {
        name: "Wheelbarrow Walking",
        description: "Walk on hands while adult holds legs",
        frequency: "Daily",
        duration: "Across room 3 times"
      },
      {
        name: "Rocking on All Fours",
        description: "Rock forward and back on hands and knees",
        frequency: "2 times daily",
        duration: "2 minutes"
      },
      {
        name: "Prone Extension",
        description: "Superman pose holding position",
        frequency: "2 times daily",
        duration: "Hold 10 seconds x 5"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Physical Therapy",
        reason: "Core strengthening, postural control",
        priority: "HIGH"
      },
      {
        type: "Occupational Therapy",
        reason: "Handwriting, classroom positioning",
        priority: "HIGH"
      }
    ]
  },
  
  tlr: {
    name: "Tonic Labyrinthine Reflex (TLR)",
    description: "Head position reflex affecting muscle tone",
    integrationAge: "3-4 years",
    
    symptoms: [
      "Poor balance",
      "Difficulty with ball games",
      "Visual-perception challenges",
      "Auditory processing challenges",
      "Decreased organizational skills",
      "Spatial awareness difficulties",
      "Poor muscle tone",
      "Poor posture (seated/standing)",
      "Fatigues easily with arms above head",
      "Reading difficulties",
      "Fear of heights",
      "W-sitting",
      "Poor near/far point tracking",
      "Weak core strength/stability",
      "Poor time awareness",
      "Abnormal gait (toe walking, stiff, etc)",
      "Challenges holding concentration",
      "Challenges with motor planning activities",
      "Poor cause and effect reasoning",
      "Doesn't learn from mistakes"
    ],
    
    affectedAreas: {
      'Balance': ['Poor balance', 'Fear of heights', 'Spatial awareness difficulties'],
      'Gross Motor': ['Difficulty with ball games', 'Abnormal gait', 'Motor planning challenges'],
      'Posture': ['Poor muscle tone', 'Poor posture', 'W-sitting', 'Weak core'],
      'Academic': ['Reading difficulties', 'Visual-perception challenges', 'Poor concentration'],
      'Cognitive': ['Poor organizational skills', 'Time awareness', 'Cause-effect reasoning'],
      'Sensory': ['Auditory processing challenges', 'Visual tracking issues']
    },
    
    exercises: [
      {
        name: "Superman Pose",
        description: "Lie on stomach, lift arms and legs",
        frequency: "3 times daily",
        duration: "Hold 10 seconds x 5"
      },
      {
        name: "Balance Board Activities",
        description: "Stand on balance board for various activities",
        frequency: "Daily",
        duration: "5-10 minutes"
      },
      {
        name: "Head Lifts",
        description: "Lift head in various positions (prone, supine)",
        frequency: "2 times daily",
        duration: "10 repetitions each position"
      },
      {
        name: "Vestibular Swinging",
        description: "Linear swinging on playground or therapy swing",
        frequency: "Daily if possible",
        duration: "10 minutes"
      },
      {
        name: "Rolling Activities",
        description: "Log rolling, barrel rolling",
        frequency: "Daily",
        duration: "5 minutes"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Physical Therapy",
        reason: "Balance, posture, core strengthening",
        priority: "HIGH"
      },
      {
        type: "Occupational Therapy",
        reason: "Sensory integration, visual-motor skills",
        priority: "HIGH"
      },
      {
        type: "Vision Therapy",
        reason: "Visual tracking, perception",
        priority: "MEDIUM"
      }
    ]
  },
  
  spinalGalant: {
    name: "Spinal Galant Reflex",
    description: "Back reflex affecting posture and bladder control",
    integrationAge: "3-9 months",
    
    symptoms: [
      "Fidgeting",
      "Decreased concentration",
      "Bed wetting beyond age 5",
      "Sensory sensitivities",
      "Reading difficulties",
      "Ants in the pants",
      "Asymmetrical gait",
      "Scoliosis",
      "Irritated by clothing on waist",
      "Hypersensitivity in sacrum area",
      "Auditory processing challenges",
      "Poor perseverance",
      "Frequent middle ear infections",
      "IBS over the age of 4 years"
    ],
    
    affectedAreas: {
      'Behaviour': ['Fidgeting', 'Ants in pants', 'Decreased concentration', 'Poor perseverance'],
      'Physical': ['Bed wetting', 'Scoliosis', 'Asymmetrical gait', 'IBS'],
      'Sensory': ['Sensory sensitivities', 'Irritated by waistbands', 'Hypersensitivity in back'],
      'Academic': ['Reading difficulties', 'Concentration issues'],
      'Health': ['Frequent ear infections', 'Digestive issues']
    },
    
    exercises: [
      {
        name: "Snow Angels",
        description: "Lying on back, move arms and legs like making snow angels",
        frequency: "3 times daily",
        duration: "20 repetitions"
      },
      {
        name: "Back Brushing",
        description: "Firm brushing along spine with sensory brush",
        frequency: "2 times daily",
        duration: "2 minutes"
      },
      {
        name: "Cobra Pose",
        description: "Yoga cobra stretch",
        frequency: "2 times daily",
        duration: "Hold 10 seconds x 5"
      },
      {
        name: "Log Rolling",
        description: "Roll like a log keeping body straight",
        frequency: "Daily",
        duration: "10 rolls each direction"
      },
      {
        name: "Swimming Movements",
        description: "Prone swimming movements on floor",
        frequency: "Daily",
        duration: "2 minutes"
      }
    ],
    
    recommendedTherapies: [
      {
        type: "Occupational Therapy",
        reason: "Sensory integration, reflex integration",
        priority: "HIGH"
      },
      {
        type: "Physical Therapy",
        reason: "Posture, gait training",
        priority: "MEDIUM"
      },
      {
        type: "Pediatric Urologist",
        reason: "If bedwetting persists",
        priority: "As needed"
      }
    ]
  }
};

// Function to analyze which reflexes affect which assessment categories
export function mapReflexesToCategories(reflexAnalysis, categoryScores) {
  const categoryReflexMap = {};
  
  Object.keys(categoryScores).forEach(category => {
    categoryReflexMap[category] = {
      score: categoryScores[category].percentage,
      affectingReflexes: [],
      recommendedTherapies: new Set(),
      priorityExercises: []
    };
    
    // Check which reflexes affect this category
    reflexAnalysis.reflexes?.forEach(reflex => {
      const reflexData = COMPREHENSIVE_REFLEX_DATABASE[reflex.name?.toLowerCase().replace(/\s+/g, '')];
      if (reflexData?.affectedAreas[category]) {
        categoryReflexMap[category].affectingReflexes.push({
          reflexName: reflex.name,
          retentionLevel: reflex.retentionLevel,
          symptoms: reflexData.affectedAreas[category],
          exercises: reflexData.exercises.slice(0, 3) // Top 3 exercises
        });
        
        // Add recommended therapies
        reflexData.recommendedTherapies.forEach(therapy => {
          categoryReflexMap[category].recommendedTherapies.add(therapy.type);
        });
      }
    });
  });
  
  return categoryReflexMap;
}

// Function to generate comprehensive intervention plan
export function generateComprehensiveInterventionPlan(reflexAnalysis, categoryScores, childAge) {
  const plan = {
    immediateActions: [],
    dailySchedule: {},
    weeklyTherapyRecommendations: [],
    monthlyGoals: {},
    exercises: {},
    professionalSupport: []
  };
  
  // Analyze each retained reflex
  reflexAnalysis.reflexes?.forEach(reflex => {
    const reflexKey = reflex.name?.toLowerCase().replace(/\s+/g, '');
    const reflexData = COMPREHENSIVE_REFLEX_DATABASE[reflexKey];
    
    if (reflexData && reflex.retentionLevel > 30) {
      // Add exercises
      plan.exercises[reflex.name] = {
        priority: reflex.retentionLevel > 70 ? 'HIGH' : reflex.retentionLevel > 50 ? 'MEDIUM' : 'LOW',
        exercises: reflexData.exercises,
        frequency: reflex.retentionLevel > 70 ? 'Multiple times daily' : 'Daily',
        expectedImprovement: `${Math.min(20, reflex.retentionLevel * 0.3)}% reduction per month`
      };
      
      // Add therapy recommendations
      reflexData.recommendedTherapies.forEach(therapy => {
        const existing = plan.professionalSupport.find(p => p.type === therapy.type);
        if (!existing) {
          plan.professionalSupport.push({
            ...therapy,
            reflexesAddressed: [reflex.name],
            expectedFrequency: therapy.priority === 'HIGH' ? 'Weekly' : 'Bi-weekly'
          });
        } else {
          existing.reflexesAddressed.push(reflex.name);
          if (therapy.priority === 'HIGH') {
            existing.priority = 'HIGH';
          }
        }
      });
      
      // Add immediate actions for high retention
      if (reflex.retentionLevel > 70) {
        plan.immediateActions.push({
          action: `Start ${reflex.name} integration exercises immediately`,
          reason: `High retention (${reflex.retentionLevel}%) significantly impacting development`,
          exercises: reflexData.exercises.slice(0, 2).map(e => e.name)
        });
      }
    }
  });
  
  // Create daily schedule
  plan.dailySchedule = {
    morning: {
      time: '7:00 AM',
      activities: ['Deep pressure activities', 'Vestibular input', 'Core strengthening'],
      duration: '15 minutes'
    },
    midday: {
      time: '12:00 PM',
      activities: ['Reflex integration exercises', 'Fine motor activities'],
      duration: '10 minutes'
    },
    evening: {
      time: '6:00 PM',
      activities: ['Calming activities', 'Sensory integration', 'Oral motor exercises'],
      duration: '15 minutes'
    }
  };
  
  // Create monthly goals
  plan.monthlyGoals = {
    month1: {
      focus: 'Foundation & Awareness',
      reflexTargets: plan.exercises ? Object.keys(plan.exercises).slice(0, 2) : [],
      categoryTargets: Object.entries(categoryScores)
        .filter(([_, score]) => score.percentage < 50)
        .map(([cat, _]) => cat)
        .slice(0, 2),
      milestones: [
        'Establish daily routine',
        'Complete initial therapy evaluations',
        'Begin primary reflex exercises'
      ]
    },
    month2: {
      focus: 'Integration & Progress',
      reflexTargets: plan.exercises ? Object.keys(plan.exercises).slice(0, 3) : [],
      categoryTargets: Object.entries(categoryScores)
        .filter(([_, score]) => score.percentage < 60)
        .map(([cat, _]) => cat)
        .slice(0, 3),
      milestones: [
        '20% reduction in primary reflex retention',
        'Improvement in daily functioning',
        'Therapy plan refinement'
      ]
    },
    month3: {
      focus: 'Consolidation & Advancement',
      reflexTargets: Object.keys(plan.exercises),
      categoryTargets: Object.keys(categoryScores),
      milestones: [
        '40% overall reflex integration improvement',
        'Measurable academic/functional gains',
        'Plan for continued progress'
      ]
    }
  };
  
  return plan;
}

export default {
  COMPREHENSIVE_REFLEX_DATABASE,
  mapReflexesToCategories,
  generateComprehensiveInterventionPlan
};