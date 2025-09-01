// src/utils/gptQuestionGenerator.js - Enhanced Version

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export const generateSmartQuestions = async (category, childAge, existingQuestions = []) => {
  const skillProgression = getSkillProgression(category, childAge);
  
  const prompt = `
    Generate 10 developmental assessment questions for a ${childAge}-year-old child in the ${category} domain.
    
    Requirements:
    1. Start with foundational skills and progress to age-appropriate challenges
    2. Include a mix of skill levels: foundation (basic milestones), intermediate (age-typical), and advanced (emerging skills)
    3. Questions should be answerable with Yes/No/Sometimes
    4. Be specific and observable by parents
    5. Consider developmental progression from age ${Math.max(0, childAge - 2)} to ${childAge}
    
    Skill progression for ${category}:
    ${skillProgression}
    
    Format each question as JSON:
    {
      "question_text": "Can your child...",
      "skill_level": "foundation|intermediate|advanced",
      "developmental_age": number,
      "rationale": "brief explanation"
    }
    
    Return as a JSON array of 10 questions, ordered from foundational to advanced.
  `;

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
            content: 'You are a pediatric developmental assessment expert. Generate evidence-based developmental milestone questions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    const questions = JSON.parse(content);
    
    // Format for the assessment
    return questions.map((q, idx) => ({
      id: `gpt_${category}_${idx}_${Date.now()}`,
      question_text: q.question_text,
      category: category,
      skill_level: q.skill_level,
      min_age: Math.max(0, q.developmental_age - 1),
      max_age: q.developmental_age + 2,
      difficulty_order: idx + 1,
      is_gpt_generated: true
    }));
    
  } catch (error) {
    console.error('Error generating questions with GPT:', error);
    return generateFallbackQuestions(category, childAge);
  }
};

// Define skill progressions for each category
const getSkillProgression = (category, age) => {
  const progressions = {
    'Speech': `
      - Foundation: Single words, simple sounds, responding to name
      - Basic: 2-3 word phrases, following simple instructions
      - Intermediate: Complete sentences, storytelling, clear pronunciation
      - Advanced: Complex sentences, abstract concepts, conversations
    `,
    'Gross Motor': `
      - Foundation: Walking, basic balance, climbing stairs with support
      - Basic: Running, jumping with both feet, throwing ball
      - Intermediate: Hopping on one foot, catching ball, pedaling
      - Advanced: Skipping, complex coordination, sports skills
    `,
    'Fine Motor': `
      - Foundation: Grasping objects, transferring between hands
      - Basic: Using utensils, scribbling, stacking blocks
      - Intermediate: Cutting with scissors, drawing shapes, writing letters
      - Advanced: Tying shoes, detailed drawings, neat handwriting
    `,
    'Cognitive': `
      - Foundation: Object permanence, cause-effect understanding
      - Basic: Sorting, counting to 10, identifying colors
      - Intermediate: Problem-solving, understanding time concepts, patterns
      - Advanced: Abstract thinking, math concepts, reading readiness
    `,
    'Feeding': `
      - Foundation: Self-feeding with fingers, drinking from cup
      - Basic: Using spoon/fork, trying new foods
      - Intermediate: Using knife, table manners, food preferences
      - Advanced: Preparing simple snacks, understanding nutrition
    `,
    'Behaviour': `
      - Foundation: Attachment, basic emotional expression
      - Basic: Sharing, turn-taking, following rules
      - Intermediate: Emotional regulation, empathy, cooperation
      - Advanced: Conflict resolution, self-control, independence
    `,
    'School Readiness': `
      - Foundation: Separating from parents, following routines
      - Basic: Sitting for activities, group participation
      - Intermediate: Letter recognition, counting, focusing on tasks
      - Advanced: Writing name, reading simple words, complex instructions
    `
  };
  
  return progressions[category] || 'General developmental progression';
};

// Fallback questions if GPT fails
const generateFallbackQuestions = (category, childAge) => {
  const templates = {
    'Speech': [
      { text: "say their name clearly", minAge: 2, level: "foundation" },
      { text: "use 2-3 word sentences", minAge: 2, level: "foundation" },
      { text: "ask 'why' questions", minAge: 3, level: "basic" },
      { text: "tell a simple story", minAge: 4, level: "intermediate" },
      { text: "use past tense correctly", minAge: 4, level: "intermediate" },
      { text: "explain how things work", minAge: 5, level: "advanced" },
      { text: "have back-and-forth conversations", minAge: 4, level: "intermediate" },
      { text: "pronounce most sounds correctly", minAge: 5, level: "advanced" },
      { text: "understand jokes and humor", minAge: 5, level: "advanced" },
      { text: "follow 3-step instructions", minAge: 4, level: "intermediate" }
    ],
    'Gross Motor': [
      { text: "walk up stairs alternating feet", minAge: 3, level: "foundation" },
      { text: "jump with both feet", minAge: 2, level: "foundation" },
      { text: "pedal a tricycle", minAge: 3, level: "basic" },
      { text: "hop on one foot", minAge: 4, level: "intermediate" },
      { text: "catch a bounced ball", minAge: 4, level: "intermediate" },
      { text: "do a somersault", minAge: 5, level: "advanced" },
      { text: "skip alternating feet", minAge: 5, level: "advanced" },
      { text: "balance on one foot for 5 seconds", minAge: 4, level: "intermediate" },
      { text: "climb playground equipment", minAge: 3, level: "basic" },
      { text: "ride a bike with training wheels", minAge: 4, level: "intermediate" }
    ],
    // Add more categories...
  };

  const categoryTemplates = templates[category] || [];
  const ageAppropriate = categoryTemplates.filter(t => t.minAge <= childAge);
  
  // Sort by skill level
  const sorted = ageAppropriate.sort((a, b) => {
    const levelOrder = { foundation: 1, basic: 2, intermediate: 3, advanced: 4 };
    return (levelOrder[a.level] || 5) - (levelOrder[b.level] || 5);
  });

  return sorted.slice(0, 10).map((template, idx) => ({
    id: `fallback_${category}_${idx}_${Date.now()}`,
    question_text: `Can your child ${template.text}?`,
    category: category,
    skill_level: template.level,
    min_age: template.minAge,
    max_age: Math.min(template.minAge + 3, 18),
    difficulty_order: idx + 1
  }));
};

export default generateSmartQuestions;