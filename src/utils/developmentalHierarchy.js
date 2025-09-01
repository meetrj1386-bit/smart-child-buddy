// This is your source of truth for developmental progression
export const DEVELOPMENTAL_HIERARCHY = {
  Speech: {
    levels: [
      {
        level: 1,
        name: 'Oral Motor Foundation',
        ageRange: [0, 2],
        skills: [
          { 
            question: 'Does your child breathe through their nose (not mouth breathing)?',
            skill: 'nasal_breathing',
            redFlag: true,
            whyImportant: 'Mouth breathing affects speech development and facial structure'
          },
          {
            question: 'Can your child close lips completely around a spoon?',
            skill: 'lip_closure',
            redFlag: true,
            whyImportant: 'Lip closure is essential for many speech sounds (p, b, m)'
          },
          {
            question: 'Does your child\'s tongue stay inside mouth when at rest?',
            skill: 'tongue_posture',
            redFlag: true,
            whyImportant: 'Tongue posture affects swallowing and speech clarity'
          }
        ]
      },
      {
        level: 2,
        name: 'Pre-Speech Skills',
        ageRange: [1, 3],
        skills: [
          {
            question: 'Does your child make different consonant sounds (ba, ma, da)?',
            skill: 'consonant_variety',
            redFlag: false,
            whyImportant: 'Consonant variety shows oral motor coordination developing'
          }
          // Add more...
        ]
      }
      // Continue for all levels...
    ]
  },
  // Add other categories...
};

// Helper function to get questions for a specific age
export const getQuestionsForAge = (category, age) => {
  const hierarchy = DEVELOPMENTAL_HIERARCHY[category];
  if (!hierarchy) return [];
  
  const questions = [];
  const levels = hierarchy.levels;
  
  // Get foundation questions (2-3 questions from lower levels)
  const foundationLevels = levels.filter(l => l.ageRange[1] <= age);
  foundationLevels.slice(-2).forEach(level => {
    questions.push(...level.skills.slice(0, 2).map(s => ({
      ...s,
      level: 'foundation',
      levelName: level.name
    })));
  });
  
  // Get age-appropriate questions (4-5 questions)
  const currentLevel = levels.find(l => 
    age >= l.ageRange[0] && age <= l.ageRange[1]
  );
  if (currentLevel) {
    questions.push(...currentLevel.skills.slice(0, 5).map(s => ({
      ...s,
      level: 'current',
      levelName: currentLevel.name
    })));
  }
  
  // Get emerging skill questions (2-3 questions)
  const emergingLevels = levels.filter(l => l.ageRange[0] > age);
  if (emergingLevels.length > 0) {
    questions.push(...emergingLevels[0].skills.slice(0, 3).map(s => ({
      ...s,
      level: 'emerging',
      levelName: emergingLevels[0].name
    })));
  }
  
  return questions;
};