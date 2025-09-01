// supabase/functions/generate-questions/index.ts
// Deploy this as a Supabase Edge Function

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { category, childAge, count = 10 } = await req.json()
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured')
    }

    // Create the prompt for GPT
    const prompt = createPrompt(category, childAge, count)
    
    // Call OpenAI API
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
            content: `You are a pediatric developmental assessment expert. Generate evidence-based developmental milestone questions that:
            1. Are appropriate for the child's age
            2. Progress from foundational to advanced skills
            3. Can be answered with Yes/No/Sometimes
            4. Are specific and observable by parents
            5. Cover key developmental milestones`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      
      // Return fallback questions if GPT fails
      const fallbackQuestions = generateFallbackQuestions(category, childAge, count)
      return new Response(
        JSON.stringify({ questions: fallbackQuestions, fallback: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json()
    const content = JSON.parse(data.choices[0].message.content)
    
    // Format questions for the frontend
    const formattedQuestions = content.questions.map((q: any, idx: number) => ({
      id: `gpt_${category.toLowerCase().replace(/\s+/g, '_')}_${idx}_${Date.now()}`,
      question_text: q.question_text,
      category: category,
      skill_level: q.skill_level || 'intermediate',
      min_age: Math.max(0, q.developmental_age - 1) || Math.max(0, childAge - 2),
      max_age: (q.developmental_age + 2) || (childAge + 2),
      difficulty_order: idx + 1,
      is_gpt_generated: true,
      subcategory: q.subcategory || null
    }))

    return new Response(
      JSON.stringify({ questions: formattedQuestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in generate-questions function:', error)
    
    // Return a fallback response
    const { category = 'General', childAge = 5, count = 10 } = await req.json().catch(() => ({}))
    const fallbackQuestions = generateFallbackQuestions(category, childAge, count)
    
    return new Response(
      JSON.stringify({ 
        questions: fallbackQuestions, 
        fallback: true,
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function createPrompt(category: string, childAge: number, count: number) {
  const ageRange = {
    start: Math.max(0, childAge - 2),
    end: childAge
  }
  
  return `Generate ${count} developmental assessment questions for the "${category}" domain for a ${childAge}-year-old child.

Consider developmental milestones from age ${ageRange.start} to ${ageRange.end}.

For ${category}, include questions that assess:
${getCategoryGuidelines(category)}

Return a JSON object with a "questions" array containing ${count} questions.
Each question should have this structure:
{
  "question_text": "Can your child [specific observable behavior]?",
  "skill_level": "foundation|basic|intermediate|advanced",
  "developmental_age": ${childAge},
  "subcategory": "specific skill area",
  "rationale": "brief explanation of what this assesses"
}

Distribute questions as follows:
- 30% foundation (skills from ${ageRange.start} years)
- 40% basic/intermediate (age-appropriate skills)  
- 30% advanced (emerging skills for ${childAge}+ years)

Make questions specific, observable, and answerable with Yes/No/Sometimes.`
}

function getCategoryGuidelines(category: string): string {
  const guidelines: Record<string, string> = {
    'Speech': `
      - Receptive language (understanding)
      - Expressive language (speaking)
      - Articulation and pronunciation
      - Vocabulary and grammar
      - Social communication
      - Narrative skills`,
    'Gross Motor': `
      - Balance and coordination
      - Strength and endurance
      - Ball skills
      - Locomotor skills (running, jumping, hopping)
      - Body awareness
      - Motor planning`,
    'Fine Motor': `
      - Pencil grasp and control
      - Cutting skills
      - Hand-eye coordination
      - Bilateral coordination
      - Hand strength
      - Visual-motor integration`,
    'Cognitive': `
      - Problem-solving
      - Memory and attention
      - Logical thinking
      - Understanding concepts (size, time, quantity)
      - Pre-academic skills
      - Executive function`,
    'Feeding': `
      - Self-feeding skills
      - Oral motor skills
      - Food variety and texture tolerance
      - Mealtime behavior
      - Utensil use
      - Drinking skills`,
    'Behaviour': `
      - Emotional regulation
      - Social skills
      - Following rules and routines
      - Independence and self-help
      - Attention and focus
      - Adaptability`,
    'School Readiness': `
      - Pre-literacy skills
      - Pre-math concepts
      - Following instructions
      - Group participation
      - Self-care and independence
      - Attention and task persistence`
  }
  
  return guidelines[category] || `General developmental skills appropriate for ${category}`
}

function generateFallbackQuestions(category: string, childAge: number, count: number) {
  // Comprehensive fallback questions for each category
  const fallbackSets: Record<string, any[]> = {
    'Speech': [
      { text: "respond to their name when called", min: 1, level: "foundation" },
      { text: "use single words meaningfully", min: 1, level: "foundation" },
      { text: "combine 2-3 words together", min: 2, level: "foundation" },
      { text: "ask simple questions", min: 3, level: "basic" },
      { text: "speak in complete sentences", min: 4, level: "intermediate" },
      { text: "tell stories with a beginning, middle, and end", min: 5, level: "advanced" },
      { text: "use pronouns correctly (I, you, he, she)", min: 3, level: "basic" },
      { text: "follow 2-step instructions", min: 3, level: "basic" },
      { text: "describe past events", min: 4, level: "intermediate" },
      { text: "explain why things happen", min: 5, level: "advanced" }
    ],
    'Gross Motor': [
      { text: "walk independently", min: 1, level: "foundation" },
      { text: "run without falling frequently", min: 2, level: "foundation" },
      { text: "jump with both feet leaving the ground", min: 2, level: "foundation" },
      { text: "climb stairs with alternating feet", min: 3, level: "basic" },
      { text: "pedal a tricycle or bicycle", min: 3, level: "basic" },
      { text: "hop on one foot", min: 4, level: "intermediate" },
      { text: "catch a ball with both hands", min: 4, level: "intermediate" },
      { text: "skip with alternating feet", min: 5, level: "advanced" },
      { text: "balance on one foot for 10 seconds", min: 5, level: "advanced" },
      { text: "do jumping jacks", min: 5, level: "advanced" }
    ],
    'Fine Motor': [
      { text: "pick up small objects with thumb and finger", min: 1, level: "foundation" },
      { text: "stack 3-4 blocks", min: 1, level: "foundation" },
      { text: "hold a crayon with fingers (not fist)", min: 2, level: "foundation" },
      { text: "turn pages in a book one at a time", min: 2, level: "basic" },
      { text: "use scissors to make snips", min: 3, level: "basic" },
      { text: "draw a circle", min: 3, level: "basic" },
      { text: "button and unbutton", min: 4, level: "intermediate" },
      { text: "color within lines", min: 4, level: "intermediate" },
      { text: "write their first name", min: 5, level: "advanced" },
      { text: "tie shoelaces", min: 6, level: "advanced" }
    ],
    'Cognitive': [
      { text: "point to body parts when named", min: 1, level: "foundation" },
      { text: "sort objects by color or shape", min: 2, level: "foundation" },
      { text: "count to 5", min: 3, level: "basic" },
      { text: "understand 'same' and 'different'", min: 3, level: "basic" },
      { text: "name basic colors", min: 3, level: "basic" },
      { text: "count 10 objects accurately", min: 4, level: "intermediate" },
      { text: "understand yesterday, today, tomorrow", min: 4, level: "intermediate" },
      { text: "complete 8-10 piece puzzles", min: 4, level: "intermediate" },
      { text: "recognize some letters and numbers", min: 5, level: "advanced" },
      { text: "understand basic addition (1+1=2)", min: 5, level: "advanced" }
    ],
    'Feeding': [
      { text: "drink from an open cup", min: 1, level: "foundation" },
      { text: "feed themselves with fingers", min: 1, level: "foundation" },
      { text: "use a spoon independently", min: 2, level: "foundation" },
      { text: "use a fork effectively", min: 3, level: "basic" },
      { text: "pour from a small pitcher", min: 4, level: "intermediate" },
      { text: "spread with a knife", min: 5, level: "advanced" },
      { text: "open simple food packages", min: 4, level: "intermediate" },
      { text: "use napkin appropriately", min: 3, level: "basic" },
      { text: "sit at table for entire meal", min: 3, level: "basic" },
      { text: "try new foods when offered", min: 2, level: "foundation" }
    ],
    'Behaviour': [
      { text: "show affection to familiar people", min: 1, level: "foundation" },
      { text: "play alongside other children", min: 2, level: "foundation" },
      { text: "take turns in games", min: 3, level: "basic" },
      { text: "express emotions appropriately", min: 3, level: "basic" },
      { text: "separate from parents without extreme distress", min: 3, level: "basic" },
      { text: "share toys with prompting", min: 3, level: "basic" },
      { text: "follow classroom rules", min: 4, level: "intermediate" },
      { text: "play cooperatively with peers", min: 4, level: "intermediate" },
      { text: "manage frustration without aggression", min: 5, level: "advanced" },
      { text: "show empathy for others", min: 5, level: "advanced" }
    ],
    'School Readiness': [
      { text: "sit and attend to a story", min: 3, level: "foundation" },
      { text: "recognize their written name", min: 4, level: "basic" },
      { text: "hold a pencil correctly", min: 4, level: "basic" },
      { text: "know some letter sounds", min: 5, level: "intermediate" },
      { text: "write some letters", min: 5, level: "intermediate" },
      { text: "count to 20", min: 5, level: "intermediate" },
      { text: "understand positional words (under, over, beside)", min: 4, level: "basic" },
      { text: "follow multi-step classroom instructions", min: 5, level: "advanced" },
      { text: "work independently for 10-15 minutes", min: 5, level: "advanced" },
      { text: "organize simple materials", min: 5, level: "advanced" }
    ]
  }

  const questions = fallbackSets[category] || fallbackSets['Cognitive']
  
  // Filter age-appropriate questions
  const appropriate = questions.filter(q => q.min <= childAge)
  
  // Sort by skill level
  appropriate.sort((a, b) => {
    const levels: Record<string, number> = { foundation: 1, basic: 2, intermediate: 3, advanced: 4 }
    return (levels[a.level] || 5) - (levels[b.level] || 5)
  })
  
  // Take requested number of questions
  return appropriate.slice(0, count).map((q, idx) => ({
    id: `fallback_${category.toLowerCase().replace(/\s+/g, '_')}_${idx}_${Date.now()}`,
    question_text: `Can your child ${q.text}?`,
    category: category,
    skill_level: q.level,
    min_age: q.min,
    max_age: Math.min(q.min + 4, 18),
    difficulty_order: idx + 1,
    is_fallback: true
  }))
}