// ComprehensiveQATestSuite.js - 100+ Diverse Test Cases
import { supabase } from './utils/supabaseClient';

export class ComprehensiveQATestSuite {
  constructor() {
    this.testResults = [];
    this.testProfiles = [];
  }

  // Main runner for comprehensive testing
  async runComprehensiveTest(testCount = 100) {
    console.log(`\n🚀 COMPREHENSIVE QA SUITE - ${testCount} DIVERSE TEST CASES\n`);
    console.log('='.repeat(80));
    
    try {
      // Clean previous test data
      await this.cleanupTestData();
      
      // Generate diverse test profiles
      console.log('🧬 Generating diverse test profiles...');
      this.testProfiles = this.generateDiverseTestProfiles(testCount);
      
      console.log(`\n📊 Test Profile Distribution:`);
      this.logProfileDistribution();
      
      // Process each test profile
      console.log('\n🔄 Processing test cases...');
      let processedCount = 0;
      
      for (const profile of this.testProfiles) {
        const result = await this.processTestProfile(profile);
        this.testResults.push(result);
        
        processedCount++;
        if (processedCount % 20 === 0) {
          console.log(`   ✓ Processed ${processedCount}/${testCount} cases...`);
        }
      }
      
      // Run comprehensive validation
      console.log('\n🔍 Running comprehensive validation...');
      const validation = await this.runComprehensiveValidation();
      
      // Generate detailed report
      const report = this.generateDetailedReport(validation);
      
      // Display results
      this.displayResults(report);
      
      return report;
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Generate diverse test profiles with specific combinations
  generateDiverseTestProfiles(count) {
    const profiles = [];
    
    // SPECIFIC TEST SCENARIOS - First 50 are targeted scenarios
    const specificScenarios = [
      // Speech + Cognitive Issues
      { name: 'NonVerbal_HighCognitive', age: 4, speech: 'severe', cognitive: 'severe', motor: 'normal', behavior: 'mild' },
      { name: 'NonVerbal_LowCognitive', age: 5, speech: 'severe', cognitive: 'severe', motor: 'mild', behavior: 'moderate' },
      { name: 'MinimalSpeech_HighAnxiety', age: 3, speech: 'severe', cognitive: 'moderate', motor: 'normal', behavior: 'severe' },
      
      // Motor + Behavior Combinations
      { name: 'CantWalk_Aggressive', age: 3, speech: 'mild', cognitive: 'normal', motor: 'severe', behavior: 'severe' },
      { name: 'CantWalk_Passive', age: 4, speech: 'normal', cognitive: 'mild', motor: 'severe', behavior: 'normal' },
      { name: 'PoorBalance_Hyperactive', age: 5, speech: 'normal', cognitive: 'normal', motor: 'moderate', behavior: 'severe' },
      
      // Extreme Cases
      { name: 'AllSevere', age: 3, speech: 'severe', cognitive: 'severe', motor: 'severe', behavior: 'severe' },
      { name: 'AllNormal', age: 6, speech: 'normal', cognitive: 'normal', motor: 'normal', behavior: 'normal' },
      { name: 'AllMild', age: 5, speech: 'mild', cognitive: 'mild', motor: 'mild', behavior: 'mild' },
      
      // Age-Specific Challenges
      { name: 'Toddler_NoSpeech', age: 2, speech: 'severe', cognitive: 'moderate', motor: 'mild', behavior: 'moderate' },
      { name: 'Preschool_Aggressive', age: 4, speech: 'mild', cognitive: 'normal', motor: 'normal', behavior: 'severe' },
      { name: 'School_CantWrite', age: 6, speech: 'normal', cognitive: 'mild', motor: 'severe', behavior: 'mild' },
      
      // Specific Behavioral Profiles
      { name: 'ExtremelyAggressive', age: 5, speech: 'normal', cognitive: 'normal', motor: 'normal', behavior: 'severe', aggressive: true },
      { name: 'SevereAnxiety', age: 4, speech: 'moderate', cognitive: 'normal', motor: 'mild', behavior: 'severe', anxious: true },
      { name: 'ADHD_Type', age: 6, speech: 'normal', cognitive: 'mild', motor: 'moderate', behavior: 'severe', adhd: true },
      
      // Sensory Processing Issues
      { name: 'SensoryOverload', age: 4, speech: 'mild', cognitive: 'normal', motor: 'mild', behavior: 'moderate', sensory: 'severe' },
      { name: 'SensorySeeker', age: 3, speech: 'normal', cognitive: 'normal', motor: 'moderate', behavior: 'moderate', sensory: 'seeking' },
      { name: 'SensoryAvoider', age: 5, speech: 'mild', cognitive: 'normal', motor: 'mild', behavior: 'mild', sensory: 'avoiding' },
      
      // Academic Challenges
      { name: 'CantRead_Normal_IQ', age: 7, speech: 'normal', cognitive: 'normal', motor: 'mild', behavior: 'normal', academic: 'severe' },
      { name: 'CantWrite_HighIQ', age: 6, speech: 'normal', cognitive: 'high', motor: 'severe', behavior: 'normal', academic: 'moderate' },
      { name: 'MathOnly_Issues', age: 8, speech: 'normal', cognitive: 'mild', motor: 'normal', behavior: 'normal', academic: 'math' },
      
      // Social Challenges
      { name: 'NoFriends_Aggressive', age: 5, speech: 'normal', cognitive: 'normal', motor: 'normal', behavior: 'severe', social: 'severe' },
      { name: 'Withdrawn_Anxious', age: 4, speech: 'mild', cognitive: 'normal', motor: 'normal', behavior: 'moderate', social: 'severe' },
      { name: 'Overly_Social', age: 6, speech: 'normal', cognitive: 'normal', motor: 'normal', behavior: 'mild', social: 'excessive' },
      
      // Daily Living Challenges
      { name: 'NotToiletTrained_5yr', age: 5, speech: 'mild', cognitive: 'mild', motor: 'moderate', behavior: 'mild', toileting: false },
      { name: 'CantDress_6yr', age: 6, speech: 'normal', cognitive: 'normal', motor: 'severe', behavior: 'normal', selfcare: false },
      { name: 'WontEat_Variety', age: 4, speech: 'normal', cognitive: 'normal', motor: 'normal', behavior: 'moderate', eating: 'restricted' },
      
      // Sleep Issues
      { name: 'NeverSleeps', age: 3, speech: 'mild', cognitive: 'mild', motor: 'normal', behavior: 'severe', sleep: 'severe' },
      { name: 'Bedwetting_7yr', age: 7, speech: 'normal', cognitive: 'normal', motor: 'mild', behavior: 'mild', bedwetting: true },
      
      // Mixed Profiles
      { name: 'HighFunc_Autism', age: 5, speech: 'mild', cognitive: 'high', motor: 'mild', behavior: 'moderate', social: 'severe' },
      { name: 'Dyspraxia_Profile', age: 6, speech: 'mild', cognitive: 'normal', motor: 'severe', behavior: 'mild' },
      { name: 'Dyslexia_Profile', age: 7, speech: 'normal', cognitive: 'normal', motor: 'mild', behavior: 'normal', academic: 'reading' },
      { name: 'Global_Delay', age: 4, speech: 'moderate', cognitive: 'moderate', motor: 'moderate', behavior: 'moderate' }
    ];
    
    // Add specific scenarios first
    specificScenarios.forEach((scenario, idx) => {
      profiles.push(this.createDetailedProfile(idx, scenario));
    });
    
    // Generate additional random combinations to reach target count
    const remainingCount = count - specificScenarios.length;
    for (let i = 0; i < remainingCount; i++) {
      profiles.push(this.generateRandomProfile(specificScenarios.length + i));
    }
    
    return profiles;
  }

  // Create detailed profile from scenario
  createDetailedProfile(index, scenario) {
    const profile = {
      id: `QA_${scenario.name}_${index}`,
      childInfo: {
        first_name: `QA_${scenario.name}`,
        last_name: `Test_${index}`,
        age: scenario.age,
        gender: index % 2 === 0 ? 'male' : 'female'
      },
      scenario: scenario,
      responses: this.generateResponsesFromScenario(scenario),
      expectedOutcomes: this.determineExpectedOutcomes(scenario)
    };
    
    return profile;
  }

  // Generate responses based on scenario
  generateResponsesFromScenario(scenario) {
    const responses = {};
    
    // SPEECH RESPONSES
    switch(scenario.speech) {
      case 'severe':
        responses.speech_first_word_age = 'Not yet';
        responses.speech_vocabulary = scenario.age >= 3 ? '<10 words' : 'None';
        responses.speech_speaks_sentences = 'Not yet';
        responses.speech_pronunciation = 'Cannot speak';
        responses.speech_follows_instructions = 'Rarely';
        responses.speech_points_to_needs = 'Sometimes';
        break;
      case 'moderate':
        responses.speech_first_word_age = '24-30 months';
        responses.speech_vocabulary = '50-200 words';
        responses.speech_speaks_sentences = '2-3 words';
        responses.speech_pronunciation = 'Somewhat unclear';
        responses.speech_follows_instructions = 'Sometimes';
        responses.speech_conversation = 'Limited';
        break;
      case 'mild':
        responses.speech_first_word_age = '15-18 months';
        responses.speech_vocabulary = '200-500 words';
        responses.speech_speaks_sentences = '3-4 words';
        responses.speech_pronunciation = 'Mostly clear';
        responses.speech_follows_instructions = 'Usually';
        responses.speech_conversation = 'Simple';
        break;
      default: // normal
        responses.speech_first_word_age = '10-12 months';
        responses.speech_vocabulary = '>500 words';
        responses.speech_speaks_sentences = 'Complex sentences';
        responses.speech_pronunciation = 'Clear';
        responses.speech_follows_instructions = 'Always';
        responses.speech_conversation = 'Age appropriate';
    }
    
    // MOTOR RESPONSES
    switch(scenario.motor) {
      case 'severe':
        responses.gross_motor_walk_age = scenario.age >= 3 ? 'Not yet' : '24+ months';
        responses.gross_motor_runs = 'Cannot run';
        responses.gross_motor_jumps = 'Cannot jump';
        responses.gross_motor_balance = 'Cannot balance';
        responses.gross_motor_stairs = 'Cannot climb';
        responses.gross_motor_rides_bike = 'Cannot';
        responses.fine_motor_holds_pencil = 'Cannot hold';
        responses.fine_motor_cuts_with_scissors = 'Cannot cut';
        responses.fine_motor_buttons = 'Cannot do';
        responses.fine_motor_draws_shapes = 'Cannot draw';
        break;
      case 'moderate':
        responses.gross_motor_walk_age = '18-24 months';
        responses.gross_motor_runs = 'Awkwardly';
        responses.gross_motor_jumps = 'Barely';
        responses.gross_motor_balance = 'Poor';
        responses.gross_motor_stairs = 'With support';
        responses.fine_motor_holds_pencil = 'Poor grip';
        responses.fine_motor_cuts_with_scissors = 'Cannot cut on line';
        responses.fine_motor_buttons = 'With difficulty';
        responses.fine_motor_draws_shapes = 'Basic only';
        break;
      case 'mild':
        responses.gross_motor_walk_age = '13-15 months';
        responses.gross_motor_runs = 'Can run';
        responses.gross_motor_jumps = 'Can jump';
        responses.gross_motor_balance = 'Occasional falls';
        responses.gross_motor_stairs = 'One at a time';
        responses.fine_motor_holds_pencil = 'Developing grip';
        responses.fine_motor_cuts_with_scissors = 'Learning';
        responses.fine_motor_buttons = 'Slow but can do';
        responses.fine_motor_draws_shapes = 'Simple shapes';
        break;
      default: // normal
        responses.gross_motor_walk_age = '10-12 months';
        responses.gross_motor_runs = 'Coordinated';
        responses.gross_motor_jumps = 'Both feet';
        responses.gross_motor_balance = 'Good';
        responses.gross_motor_stairs = 'Alternating feet';
        responses.fine_motor_holds_pencil = 'Proper grip';
        responses.fine_motor_cuts_with_scissors = 'On line';
        responses.fine_motor_buttons = 'Independent';
        responses.fine_motor_draws_shapes = 'Complex shapes';
    }
    
    // BEHAVIOR RESPONSES
    switch(scenario.behavior) {
      case 'severe':
        responses.behaviour_meltdowns = scenario.aggressive ? 'Violent daily' : 'Multiple daily';
        responses.behaviour_transitions = 'Impossible';
        responses.behaviour_attention = '<2 minutes';
        responses.behaviour_hyperactive = scenario.adhd ? 'Constant' : 'Severe';
        responses.behaviour_aggressive = scenario.aggressive ? 'Hits/bites daily' : 'Sometimes';
        responses.behaviour_self_regulation = 'Cannot';
        responses.behaviour_follows_rules = 'Never';
        break;
      case 'moderate':
        responses.behaviour_meltdowns = 'Daily';
        responses.behaviour_transitions = 'Very difficult';
        responses.behaviour_attention = '5-10 minutes';
        responses.behaviour_hyperactive = 'Often';
        responses.behaviour_aggressive = 'Occasionally';
        responses.behaviour_self_regulation = 'Poor';
        responses.behaviour_follows_rules = 'Sometimes';
        break;
      case 'mild':
        responses.behaviour_meltdowns = 'Few per week';
        responses.behaviour_transitions = 'Some difficulty';
        responses.behaviour_attention = '10-15 minutes';
        responses.behaviour_hyperactive = 'Sometimes';
        responses.behaviour_aggressive = 'Rarely';
        responses.behaviour_self_regulation = 'Developing';
        responses.behaviour_follows_rules = 'Usually';
        break;
      default: // normal
        responses.behaviour_meltdowns = 'Rare';
        responses.behaviour_transitions = 'Easy';
        responses.behaviour_attention = '15+ minutes';
        responses.behaviour_hyperactive = 'Age appropriate';
        responses.behaviour_aggressive = 'Never';
        responses.behaviour_self_regulation = 'Good';
        responses.behaviour_follows_rules = 'Always';
    }
    
    // COGNITIVE RESPONSES
    switch(scenario.cognitive) {
      case 'severe':
        responses.cognitive_problem_solving = 'Cannot';
        responses.cognitive_memory = 'Very poor';
        responses.cognitive_learning_speed = 'Very slow';
        responses.cognitive_understanding = 'Limited';
        break;
      case 'moderate':
        responses.cognitive_problem_solving = 'Needs help';
        responses.cognitive_memory = 'Below average';
        responses.cognitive_learning_speed = 'Slow';
        responses.cognitive_understanding = 'Delayed';
        break;
      case 'mild':
        responses.cognitive_problem_solving = 'Some difficulty';
        responses.cognitive_memory = 'Inconsistent';
        responses.cognitive_learning_speed = 'Slightly slow';
        responses.cognitive_understanding = 'Age appropriate';
        break;
      case 'high':
        responses.cognitive_problem_solving = 'Advanced';
        responses.cognitive_memory = 'Excellent';
        responses.cognitive_learning_speed = 'Very fast';
        responses.cognitive_understanding = 'Above age level';
        break;
      default: // normal
        responses.cognitive_problem_solving = 'Age appropriate';
        responses.cognitive_memory = 'Good';
        responses.cognitive_learning_speed = 'Normal';
        responses.cognitive_understanding = 'Age appropriate';
    }
    
    // SPECIAL CONDITIONS
    if (scenario.sensory) {
      responses.sensory_loud_noises = scenario.sensory === 'severe' ? 'Extreme distress' : 'Covers ears';
      responses.sensory_textures = scenario.sensory === 'seeking' ? 'Seeks constantly' : 'Avoids many';
      responses.sensory_movement = scenario.sensory === 'seeking' ? 'Craves movement' : 'Avoids movement';
    }
    
    if (scenario.toileting === false) {
      responses.daily_living_toilet_trained = 'Not yet';
      responses.daily_living_accidents = 'Multiple daily';
    }
    
    if (scenario.bedwetting) {
      responses.daily_living_bedwetting = 'Nightly';
    }
    
    if (scenario.sleep === 'severe') {
      responses.sleep_falls_asleep = 'Takes hours';
      responses.sleep_stays_asleep = 'Wakes frequently';
      responses.sleep_nightmares = 'Nightly';
    }
    
    if (scenario.eating === 'restricted') {
      responses.eating_variety = '<5 foods';
      responses.eating_textures = 'Only smooth';
      responses.eating_behavior = 'Extreme pickiness';
    }
    
    if (scenario.social === 'severe') {
      responses.social_interaction = 'Avoids all';
      responses.social_play = 'Alone only';
      responses.social_eye_contact = 'Never';
    }
    
    return responses;
  }

  // Determine expected outcomes based on scenario
  determineExpectedOutcomes(scenario) {
    let expectedReflexCount = 0;
    let expectedSeverity = 'NONE';
    let expectedReflexes = [];
    
    // Calculate expected reflexes based on profile
    if (scenario.speech === 'severe' || scenario.behavior === 'severe') {
      expectedReflexes.push('Moro Reflex');
      expectedReflexCount += 1;
    }
    
    if (scenario.motor === 'severe' || scenario.motor === 'moderate') {
      expectedReflexes.push('ATNR', 'TLR');
      expectedReflexCount += 2;
    }
    
    if (scenario.motor === 'severe' && scenario.age <= 4) {
      expectedReflexes.push('Palmar Grasp', 'STNR');
      expectedReflexCount += 2;
    }
    
    if (scenario.behavior === 'severe' && scenario.aggressive) {
      expectedReflexes.push('Fear Paralysis Reflex');
      expectedReflexCount += 1;
    }
    
    if (scenario.sensory === 'severe' || scenario.sensory === 'avoiding') {
      expectedReflexes.push('Spinal Galant Reflex');
      expectedReflexCount += 1;
    }
    
    if (scenario.speech === 'severe' && scenario.age <= 3) {
      expectedReflexes.push('Rooting Reflex', 'Babkin Reflex');
      expectedReflexCount += 2;
    }
    
    // Determine severity
    if (expectedReflexCount === 0) expectedSeverity = 'NONE';
    else if (expectedReflexCount <= 2) expectedSeverity = 'MILD';
    else if (expectedReflexCount <= 4) expectedSeverity = 'MODERATE';
    else expectedSeverity = 'HIGH';
    
    // Calculate expected scores
    const expectedScores = {
      Speech: scenario.speech === 'severe' ? [10, 30] : scenario.speech === 'moderate' ? [30, 50] : scenario.speech === 'mild' ? [50, 70] : [70, 90],
      'Gross Motor': scenario.motor === 'severe' ? [10, 30] : scenario.motor === 'moderate' ? [30, 50] : scenario.motor === 'mild' ? [50, 70] : [70, 90],
      'Fine Motor': scenario.motor === 'severe' ? [10, 30] : scenario.motor === 'moderate' ? [30, 50] : scenario.motor === 'mild' ? [50, 70] : [70, 90],
      Behaviour: scenario.behavior === 'severe' ? [10, 30] : scenario.behavior === 'moderate' ? [30, 50] : scenario.behavior === 'mild' ? [50, 70] : [70, 90],
      Cognitive: scenario.cognitive === 'severe' ? [10, 30] : scenario.cognitive === 'moderate' ? [30, 50] : scenario.cognitive === 'mild' ? [50, 70] : [70, 90]
    };
    
    return {
      reflexCount: [Math.max(0, expectedReflexCount - 1), expectedReflexCount + 1],
      severity: expectedSeverity,
      reflexes: [...new Set(expectedReflexes)],
      scores: expectedScores,
      requiresIntervention: scenario.speech === 'severe' || scenario.motor === 'severe' || scenario.behavior === 'severe',
      primaryConcerns: this.identifyPrimaryConcerns(scenario)
    };
  }

  // Identify primary concerns from scenario
  identifyPrimaryConcerns(scenario) {
    const concerns = [];
    
    if (scenario.speech === 'severe') concerns.push('Non-verbal or minimal speech');
    if (scenario.motor === 'severe') concerns.push('Significant motor delays');
    if (scenario.behavior === 'severe') concerns.push('Severe behavioral challenges');
    if (scenario.cognitive === 'severe') concerns.push('Cognitive impairment');
    if (scenario.aggressive) concerns.push('Aggressive behavior');
    if (scenario.anxious) concerns.push('Severe anxiety');
    if (scenario.sensory) concerns.push('Sensory processing disorder');
    if (scenario.toileting === false) concerns.push('Not toilet trained');
    if (scenario.academic) concerns.push('Academic difficulties');
    if (scenario.social === 'severe') concerns.push('Social interaction challenges');
    
    return concerns;
  }

  // Generate random profile for additional test cases
  generateRandomProfile(index) {
    const ages = [2, 3, 4, 5, 6, 7, 8];
    const severities = ['normal', 'mild', 'moderate', 'severe'];
    
    const randomScenario = {
      name: `Random_${index}`,
      age: ages[Math.floor(Math.random() * ages.length)],
      speech: severities[Math.floor(Math.random() * severities.length)],
      cognitive: severities[Math.floor(Math.random() * severities.length)],
      motor: severities[Math.floor(Math.random() * severities.length)],
      behavior: severities[Math.floor(Math.random() * severities.length)]
    };
    
    // Add random special conditions
    if (Math.random() > 0.7) {
      randomScenario.sensory = Math.random() > 0.5 ? 'severe' : 'mild';
    }
    if (Math.random() > 0.8) {
      randomScenario.aggressive = true;
    }
    if (Math.random() > 0.8) {
      randomScenario.anxious = true;
    }
    
    return this.createDetailedProfile(index, randomScenario);
  }

  // Process test profile
  async processTestProfile(profile) {
    try {
      // Insert assessment
      const { data: assessment, error } = await supabase
        .from('assessments')
        .insert({
          parent_name: `QA_Parent_${profile.id}`,
          parent_email: `qa_${profile.id}@test.com`,
          child_first_name: profile.childInfo.first_name,
          child_last_name: profile.childInfo.last_name,
          child_age: profile.childInfo.age,
          child_gender: profile.childInfo.gender,
          responses: profile.responses,
          status: 'completed',
          version: 'QA_COMPREHENSIVE'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Run your actual analysis (import from your real files)
      const analysisResult = await this.runActualAnalysis(assessment);
      
      // Update with analysis
      await supabase
        .from('assessments')
        .update({
          category_scores: analysisResult.scores,
          reflex_analysis: analysisResult.reflexAnalysis,
          comprehensive_report: analysisResult.report
        })
        .eq('id', assessment.id);
      
      return {
        success: true,
        profile: profile,
        expected: profile.expectedOutcomes,
        actual: analysisResult,
        assessmentId: assessment.id
      };
      
    } catch (error) {
      return {
        success: false,
        profile: profile,
        error: error.message
      };
    }
  }

  // Run actual analysis using your real logic
  async runActualAnalysis(assessment) {
    // Import and use your actual analysis functions
    // const { analyzeResponses } = await import('./utils/analysisEngine');
    // return analyzeResponses(assessment);
    
    // For now, using simplified version
    const scores = this.calculateScores(assessment.responses);
    const reflexAnalysis = this.detectReflexes(assessment.responses, scores, assessment.child_age);
    
    return {
      scores,
      reflexAnalysis,
      report: { 
        severity: reflexAnalysis.severity,
        reflexCount: reflexAnalysis.detected_reflexes?.length || 0
      }
    };
  }

  // Your existing calculateScores and detectReflexes methods here...
  calculateScores(responses) {
    // Use your actual scoring logic
    const scores = {};
    // ... scoring implementation
    return scores;
  }

  detectReflexes(responses, scores, age) {
    // Use your actual reflex detection logic
    const reflexes = [];
    // ... reflex detection implementation
    return {
      detected_reflexes: reflexes,
      severity: 'MODERATE',
      reflex_count: reflexes.length
    };
  }

  // Log profile distribution
  logProfileDistribution() {
    const distribution = {
      byAge: {},
      bySeverity: {},
      bySpecialCondition: {}
    };
    
    this.testProfiles.forEach(profile => {
      const age = profile.childInfo.age;
      distribution.byAge[age] = (distribution.byAge[age] || 0) + 1;
      
      const scenario = profile.scenario;
      ['speech', 'motor', 'behavior', 'cognitive'].forEach(area => {
        const severity = scenario[area];
        if (severity) {
          distribution.bySeverity[`${area}_${severity}`] = 
            (distribution.bySeverity[`${area}_${severity}`] || 0) + 1;
        }
      });
      
      ['aggressive', 'anxious', 'sensory', 'toileting', 'academic', 'social'].forEach(condition => {
        if (scenario[condition]) {
          distribution.bySpecialCondition[condition] = 
            (distribution.bySpecialCondition[condition] || 0) + 1;
        }
      });
    });
    
    console.log('  Age Distribution:', distribution.byAge);
    console.log('  Severity Distribution:', Object.keys(distribution.bySeverity).length, 'combinations');
    console.log('  Special Conditions:', distribution.bySpecialCondition);
  }

  // Run comprehensive validation
  async runComprehensiveValidation() {
    const validation = {
      overall: { total: this.testResults.length, successful: 0, failed: 0 },
      byScenario: {},
      byAge: {},
      bySeverity: {},
      reflexAccuracy: { correct: 0, overDetected: 0, underDetected: 0 },
      scoreAccuracy: { withinRange: 0, outOfRange: 0 },
      specialConditions: {}
    };
    
    this.testResults.forEach(result => {
      if (result.success) {
        validation.overall.successful++;
        
        // Check reflex accuracy
        const actualCount = result.actual.reflexAnalysis?.detected_reflexes?.length || 0;
        const [minExpected, maxExpected] = result.expected.reflexCount;
        
        if (actualCount >= minExpected && actualCount <= maxExpected) {
          validation.reflexAccuracy.correct++;
        } else if (actualCount > maxExpected) {
          validation.reflexAccuracy.overDetected++;
        } else {
          validation.reflexAccuracy.underDetected++;
        }
        
        // Track by scenario type
        const scenarioName = result.profile.scenario.name;
        if (!validation.byScenario[scenarioName]) {
          validation.byScenario[scenarioName] = { correct: 0, total: 0 };
        }
        validation.byScenario[scenarioName].total++;
        if (actualCount >= minExpected && actualCount <= maxExpected) {
          validation.byScenario[scenarioName].correct++;
        }
        
      } else {
        validation.overall.failed++;
      }
    });
    
    // Calculate accuracy percentages
    validation.reflexAccuracy.percentage = 
      (validation.reflexAccuracy.correct / validation.overall.successful * 100).toFixed(1);
    
    return validation;
  }

  // Generate detailed report
  generateDetailedReport(validation) {
    return {
      summary: {
        totalCases: this.testProfiles.length,
        successful: validation.overall.successful,
        failed: validation.overall.failed,
        successRate: (validation.overall.successful / this.testProfiles.length * 100).toFixed(1) + '%'
      },
      reflexDetection: {
        accuracy: validation.reflexAccuracy.percentage + '%',
        correct: validation.reflexAccuracy.correct,
        overDetected: validation.reflexAccuracy.overDetected,
        underDetected: validation.reflexAccuracy.underDetected
      },
      scenarioBreakdown: validation.byScenario,
      recommendations: this.generateRecommendations(validation),
      timestamp: new Date().toISOString()
    };
  }

  // Generate recommendations
  generateRecommendations(validation) {
    const recommendations = [];
    
    if (validation.reflexAccuracy.overDetected > validation.reflexAccuracy.correct * 0.2) {
      recommendations.push('⚠️ Reflex detection is too sensitive - many false positives');
    }
    
    if (validation.reflexAccuracy.underDetected > validation.reflexAccuracy.correct * 0.2) {
      recommendations.push('⚠️ Reflex detection missing cases - increase sensitivity');
    }
    
    if (validation.reflexAccuracy.percentage > 85) {
      recommendations.push('✅ Reflex detection accuracy is excellent');
    }
    
    // Check specific scenarios
    Object.entries(validation.byScenario).forEach(([scenario, data]) => {
      const accuracy = (data.correct / data.total * 100);
      if (accuracy < 70) {
        recommendations.push(`⚠️ Low accuracy for ${scenario}: ${accuracy.toFixed(0)}%`);
      }
    });
    
    return recommendations;
  }

  // Display results
  displayResults(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE QA TEST RESULTS');
    console.log('='.repeat(80));
    
    console.log('\n📈 Overall Results:');
    console.log(`   Total Test Cases: ${report.summary.totalCases}`);
    console.log(`   Success Rate: ${report.summary.successRate}`);
    console.log(`   Failed Cases: ${report.summary.failed}`);
    
    console.log('\n🎯 Reflex Detection Accuracy:');
    console.log(`   Overall Accuracy: ${report.reflexDetection.accuracy}`);
    console.log(`   Correctly Detected: ${report.reflexDetection.correct}`);
    console.log(`   Over-Detected: ${report.reflexDetection.overDetected}`);
    console.log(`   Under-Detected: ${report.reflexDetection.underDetected}`);
    
    console.log('\n📋 Top Performing Scenarios:');
    const scenarios = Object.entries(report.scenarioBreakdown)
      .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
      .slice(0, 5);
    
    scenarios.forEach(([name, data]) => {
      const accuracy = (data.correct / data.total * 100).toFixed(0);
      console.log(`   ${name}: ${accuracy}% accuracy`);
    });
    
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`   ${rec}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('📝 SQL Queries for Manual Verification:');
    console.log(this.generateVerificationQueries());
  }

  // Generate SQL queries for verification
  generateVerificationQueries() {
    return `
-- Check specific scenario results
SELECT 
    child_first_name,
    child_age,
    reflex_analysis->>'severity' as severity,
    reflex_analysis->>'reflex_count' as reflex_count,
    category_scores
FROM assessments 
WHERE child_first_name LIKE 'QA_%'
AND version = 'QA_COMPREHENSIVE'
ORDER BY created_at DESC
LIMIT 20;

-- Aggregate by scenario type
SELECT 
    SUBSTRING(child_first_name FROM 'QA_([^_]+)') as scenario_type,
    COUNT(*) as count,
    AVG((reflex_analysis->>'reflex_count')::int) as avg_reflexes,
    AVG((category_scores->'Speech'->>'percentage')::int) as avg_speech_score
FROM assessments
WHERE version = 'QA_COMPREHENSIVE'
GROUP BY scenario_type
ORDER BY avg_reflexes DESC;`;
  }

  // Cleanup test data
  async cleanupTestData() {
    await supabase
      .from('assessments')
      .delete()
      .eq('version', 'QA_COMPREHENSIVE');
  }
}