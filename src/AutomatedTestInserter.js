// AutomatedTestInserter.js - Fixed for your table structure
import { supabase } from './utils/supabaseClient';

export class QATestSuite {
  constructor() {
    this.batchInserter = new BatchTestInserter();
  }

  async cleanupAllTests() {
    console.log('🧹 Cleaning up ALL test data...');
    
    const { error } = await supabase
      .from('assessments')
      .delete()
      .like('child_first_name', 'TEST_%');
    
    if (!error) {
      console.log('✅ All test data cleaned up');
    } else {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

class BatchTestInserter {
  async insertBatchTests(count = 5) {
    console.log(`🚀 Inserting ${count} test cases...`);
    const results = [];
    
    for (let i = 0; i < count; i++) {
      const testCase = this.generateTestCase(i);
      const result = await this.insertSingleTest(testCase);
      results.push(result);
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log(`\n📊 Test Results: ${successful} successful, ${failed} failed out of ${count}`);
    
    if (successful > 0) {
      console.log('📝 View successful reports at:');
      results.forEach(r => {
        if (r.success) {
          console.log(`   ${r.childName}: http://localhost:5173/smart-report/${r.assessmentId}`);
        }
      });
    }
    
    return results;
  }

  generateTestCase(index) {
    const ages = [2, 3, 4, 5, 6, 7, 8];
    const severities = ['mild', 'moderate', 'severe'];
    
    const age = ages[index % ages.length];
    const severity = severities[index % severities.length];
    
    return {
      childInfo: {
        first_name: `TEST_Child_${index}`,
        last_name: `Age${age}`,
        age: age,
        gender: index % 2 === 0 ? 'male' : 'female',
        parent_name: `TestParent_${index}`,
        parent_email: `test_${Date.now()}_${index}@test.com`,
        parent_phone: `555-${String(index).padStart(4, '0')}`,
        main_concerns: this.getConcerns(severity),
        child_diagnoses: this.getDiagnoses(severity),
        child_medications: severity === 'severe' ? 'Behavioral medication' : null
      },
      severity: severity, // Add severity to the test case
      responses: this.generateResponses(age, severity)
    };
  }

  getConcerns(severity) {
    const concerns = {
      mild: 'Some speech delays, occasional tantrums',
      moderate: 'Difficulty with fine motor, speech unclear, behavioral issues',
      severe: 'Not speaking, frequent meltdowns, poor motor skills'
    };
    return concerns[severity];
  }

  getDiagnoses(severity) {
    if (severity === 'severe') return ['ADHD', 'Speech Delay'];
    if (severity === 'moderate') return ['Developmental Delay'];
    return [];
  }

  generateResponses(age, severity) {
    const responses = {};
    
    // Speech responses based on severity
    if (severity === 'severe') {
      responses.speech_first_word_age = 'Not yet';
      responses.speech_vocabulary = '<10 words';
      responses.speech_speaks_sentences = 'Not yet';
      responses.speech_pronunciation = 'Very unclear';
      responses.speech_follows_instructions = 'Rarely';
    } else if (severity === 'moderate') {
      responses.speech_first_word_age = '18-24 months';
      responses.speech_vocabulary = '50-200 words';
      responses.speech_speaks_sentences = '2-3 words';
      responses.speech_pronunciation = 'Somewhat unclear';
      responses.speech_follows_instructions = 'Sometimes';
    } else {
      responses.speech_first_word_age = '12-15 months';
      responses.speech_vocabulary = '200-500 words';
      responses.speech_speaks_sentences = '3-4 words';
      responses.speech_pronunciation = 'Mostly clear';
      responses.speech_follows_instructions = 'Usually';
    }
    
    // Gross Motor responses
    if (severity === 'severe') {
      responses.gross_motor_walk_age = '18+ months';
      responses.gross_motor_runs = 'Cannot run';
      responses.gross_motor_jumps = 'Cannot jump';
      responses.gross_motor_balance = 'Falls often';
      responses.gross_motor_stairs = 'Needs support';
    } else if (severity === 'moderate') {
      responses.gross_motor_walk_age = '15-18 months';
      responses.gross_motor_runs = 'Awkwardly';
      responses.gross_motor_jumps = 'One foot only';
      responses.gross_motor_balance = 'Unsteady';
      responses.gross_motor_stairs = 'One step at a time';
    } else {
      responses.gross_motor_walk_age = '12-15 months';
      responses.gross_motor_runs = 'Yes, coordinated';
      responses.gross_motor_jumps = 'Both feet leave ground';
      responses.gross_motor_balance = 'Good balance';
      responses.gross_motor_stairs = 'Alternating feet';
    }
    
    // Fine Motor responses
    if (severity === 'severe' || age < 4) {
      responses.fine_motor_holds_pencil = 'Fist grip';
      responses.fine_motor_cuts_with_scissors = 'Cannot cut';
      responses.fine_motor_buttons = 'Cannot do';
      responses.fine_motor_draws_shapes = 'Scribbles only';
    } else if (severity === 'moderate') {
      responses.fine_motor_holds_pencil = 'Immature grip';
      responses.fine_motor_cuts_with_scissors = 'Cuts poorly';
      responses.fine_motor_buttons = 'With difficulty';
      responses.fine_motor_draws_shapes = 'Circle only';
    } else {
      responses.fine_motor_holds_pencil = 'Proper grip';
      responses.fine_motor_cuts_with_scissors = 'Cuts on line';
      responses.fine_motor_buttons = 'Independently';
      responses.fine_motor_draws_shapes = 'All basic shapes';
    }
    
    // Behavior responses
    if (severity === 'severe') {
      responses.behaviour_meltdowns = 'Multiple daily';
      responses.behaviour_transitions = 'Very difficult';
      responses.behaviour_attention = '<5 minutes';
      responses.behaviour_plays_with_others = 'Rarely';
      responses.behaviour_follows_instructions = 'Rarely';
    } else if (severity === 'moderate') {
      responses.behaviour_meltdowns = 'Daily';
      responses.behaviour_transitions = 'Some difficulty';
      responses.behaviour_attention = '5-10 minutes';
      responses.behaviour_plays_with_others = 'Sometimes';
      responses.behaviour_follows_instructions = 'Sometimes';
    } else {
      responses.behaviour_meltdowns = 'Few per week';
      responses.behaviour_transitions = 'Usually okay';
      responses.behaviour_attention = '10-15 minutes';
      responses.behaviour_plays_with_others = 'Often';
      responses.behaviour_follows_instructions = 'Usually';
    }
    
    // Add cognitive responses
    responses.cognitive_problem_solving = severity === 'severe' ? 'Needs help' : 'Sometimes independent';
    responses.cognitive_memory = severity === 'severe' ? 'Poor' : 'Age appropriate';
    
    // Add school readiness for older kids
    if (age >= 4) {
      responses.school_readiness_knows_letters = severity === 'severe' ? 'None' : 'Some letters';
      responses.school_readiness_counts = severity === 'severe' ? 'Cannot count' : 'To 10';
      responses.school_readiness_writes_name = severity === 'severe' ? 'Cannot write' : 'Attempts';
    }
    
    // Add daily living skills
    responses.daily_living_toilet_trained = age >= 3 && severity !== 'severe' ? 'Daytime only' : 'Not yet';
    responses.daily_living_dresses_self = severity === 'severe' ? 'Cannot' : 'With help';
    responses.daily_living_feeds_self = severity === 'severe' ? 'Needs help' : 'Independently';
    
    // Add sensory responses (random)
    if (Math.random() > 0.5) {
      responses.sensory_loud_noises = 'Covers ears';
      responses.sensory_clothing_tags = 'Cannot tolerate';
      responses.sensory_food_textures = 'Very picky';
    }
    
    return responses;
  }

  async insertSingleTest(testCase) {
    try {
      // Calculate ages
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - testCase.childInfo.age);
      const ageInMonths = testCase.childInfo.age * 12;
      
      // Calculate scores
      const categoryScores = this.calculateScores(testCase.responses);
      const overallScore = Math.round(
        Object.values(categoryScores).reduce((acc, cat) => acc + cat.percentage, 0) / 
        Object.keys(categoryScores).length
      );
      
      // Directly insert into assessments table with all required fields
      const { data: assessment, error: assessmentError } = await supabase
        .from('assessments')
        .insert({
          // Parent info - directly in assessments table
          parent_name: testCase.childInfo.parent_name,
          parent_email: testCase.childInfo.parent_email,
          parent_phone: testCase.childInfo.parent_phone || null,
          parent_concerns: testCase.childInfo.main_concerns,
          
          // Child info
          child_first_name: testCase.childInfo.first_name,
          child_last_name: testCase.childInfo.last_name,
          child_age: testCase.childInfo.age,
          child_gender: testCase.childInfo.gender,
          child_birth_history: 'Normal delivery',
          child_diagnoses: testCase.childInfo.child_diagnoses || [],
          child_medications: testCase.childInfo.child_medications || null,
          
          // Assessment data
          assessment_date: new Date().toISOString().split('T')[0],
          responses: testCase.responses,
          category_scores: categoryScores,
          overall_score: overallScore,
          
          // Age fields
          chronological_age: ageInMonths,
          assessment_age: ageInMonths - (testCase.severity === 'severe' ? 12 : testCase.severity === 'moderate' ? 6 : 0),
          
          // Score fields
          exec_function_score: categoryScores['Cognitive']?.percentage || 50,
          self_care_score: categoryScores['Daily Living']?.percentage || 50,
          school_readiness_score: categoryScores['School Readiness']?.percentage || 50,
          
          // Analysis fields (empty for now - will be filled by analysis)
          reflex_analysis: {},
          reflex_concerns: [],
          developmental_analysis: {},
          smart_analysis: {},
          comprehensive_report: {},
          ai_report: {},
          
          // Metadata
          status: 'completed',
          version: '2.0',
          completion_seconds: Math.floor(Math.random() * 600) + 300, // 5-15 minutes
          is_gpt_generated: false,
          main_concerns: testCase.childInfo.main_concerns,
          uploaded_files: []
        })
        .select()
        .single();

      if (assessmentError) {
        console.error(`❌ Assessment insert error:`, assessmentError);
        throw assessmentError;
      }

      console.log(`✅ Inserted: ${testCase.childInfo.first_name} (Age ${testCase.childInfo.age}) - ID: ${assessment.id}`);
      
      // Optionally trigger analysis (if you have that endpoint)
      // await this.triggerAnalysis(assessment.id);
      
      return {
        success: true,
        assessmentId: assessment.id,
        childName: testCase.childInfo.first_name
      };

    } catch (error) {
      console.error(`❌ Failed to insert test case:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  calculateScores(responses) {
    const scores = {
      'Speech': 50,
      'Gross Motor': 50,
      'Fine Motor': 50,
      'Behaviour': 50,
      'Cognitive': 50,
      'Daily Living': 50,
      'School Readiness': 50
    };
    
    // Simple scoring based on responses
    Object.entries(responses).forEach(([key, value]) => {
      if (key.startsWith('speech_')) {
        if (value === 'Not yet' || value === 'Very unclear' || value === 'Rarely') {
          scores['Speech'] -= 10;
        } else if (value === 'Clear' || value === 'Complex sentences' || value === 'Always') {
          scores['Speech'] += 10;
        }
      }
      
      if (key.startsWith('gross_motor_')) {
        if (value === 'Cannot' || value === 'Falls often' || value.includes('Cannot')) {
          scores['Gross Motor'] -= 10;
        } else if (value === 'Yes, coordinated' || value === 'Good balance') {
          scores['Gross Motor'] += 10;
        }
      }
      
      if (key.startsWith('fine_motor_')) {
        if (value === 'Cannot' || value === 'Fist grip' || value === 'Cannot do') {
          scores['Fine Motor'] -= 10;
        } else if (value === 'Independently' || value === 'Proper grip') {
          scores['Fine Motor'] += 10;
        }
      }
      
      if (key.startsWith('behaviour_')) {
        if (value === 'Multiple daily' || value === 'Very difficult' || value === 'Rarely') {
          scores['Behaviour'] -= 10;
        } else if (value === 'Few per week' || value === 'Usually okay' || value === 'Often') {
          scores['Behaviour'] += 10;
        }
      }
      
      if (key.startsWith('cognitive_')) {
        if (value === 'Needs help' || value === 'Poor') {
          scores['Cognitive'] -= 10;
        } else if (value === 'Independent' || value === 'Good') {
          scores['Cognitive'] += 10;
        }
      }
      
      if (key.startsWith('daily_living_')) {
        if (value === 'Cannot' || value === 'Not yet' || value === 'Needs help') {
          scores['Daily Living'] -= 10;
        } else if (value === 'Independently' || value === 'Yes') {
          scores['Daily Living'] += 10;
        }
      }
      
      if (key.startsWith('school_readiness_')) {
        if (value === 'None' || value === 'Cannot') {
          scores['School Readiness'] -= 10;
        } else if (value === 'All' || value === 'Yes') {
          scores['School Readiness'] += 10;
        }
      }
    });
    
    // Convert to percentage format and ensure within 0-100
    const result = {};
    Object.entries(scores).forEach(([category, score]) => {
      result[category] = {
        percentage: Math.max(0, Math.min(100, score))
      };
    });
    
    return result;
  }
}

// Export already done at class declaration above