// comprehensiveReflexAnalysis.js - COMPLETE FIXED VERSION
import { supabase } from './supabaseClient';

export class ComprehensiveReflexAnalyzer {
  constructor(assessmentId, responses, childAge, parentConcerns) {
    this.assessmentId = assessmentId;
    this.responses = responses;
    this.childAge = childAge;
    this.parentConcerns = parentConcerns;
    this.reflexDatabase = this.getReflexDatabase();
  }

  // Complete Reflex Database with Parent-Friendly Explanations
  getReflexDatabase() {
    return {
      'Moro': {
        fullName: 'Moro Reflex (Startle Reflex)',
        integrationAge: '4-6 months',
        whatItDoes: `This is your baby's "alarm system" - when startled, arms fly out then come back in. It helped your baby survive as an infant.`,
        whyItMatters: `If still active, your child may be constantly "on alert", leading to anxiety, poor focus, and emotional outbursts.`,
        signsRetained: [
          'Overreacts to sudden sounds or movements',
          'Difficulty with transitions or changes',
          'Anxiety or frequent meltdowns',
          'Poor impulse control',
          'Motion sickness',
          'Difficulty sitting still'
        ],
        howItHelpsWhenIntegrated: `When integrated, your child will feel calmer, handle changes better, and have fewer meltdowns. They'll be able to focus in noisy environments and feel more secure.`,
        exercises: [
          {
            name: '🌟 Starfish Exercise',
            how: 'Child lies on back, spreads arms and legs wide like a star, then brings them together',
            when: 'Morning and evening, 5 times',
            tip: 'Make it fun - pretend to be a starfish opening and closing!'
          },
          {
            name: '🤗 Deep Pressure Hugs',
            how: 'Give firm, calming hugs or use a weighted blanket',
            when: 'When child seems anxious',
            tip: 'This calms the nervous system immediately'
          },
          {
            name: '🎈 Ball Squeeze',
            how: 'Child hugs large therapy ball, squeezing with whole body',
            when: 'Daily, 2-3 minutes',
            tip: 'Provides proprioceptive input that integrates the reflex'
          }
        ]
      },
      
      'ATNR': {
        fullName: 'Asymmetrical Tonic Neck Reflex (ATNR)',
        integrationAge: '6 months',
        whatItDoes: `Known as the "fencing reflex" - when baby turns head, same-side arm extends. This helped develop hand-eye coordination.`,
        whyItMatters: `If retained, it's like trying to write while someone keeps moving your paper - frustrating and exhausting!`,
        signsRetained: [
          'Poor handwriting or difficulty writing',
          'Trouble crossing the midline',
          'Reading difficulties',
          'Poor balance',
          'Difficulty with sports requiring hand-eye coordination',
          'Problems with math (especially columns)'
        ],
        howItHelpsWhenIntegrated: `Handwriting becomes easier, reading improves dramatically, and sports skills develop. Your child won't have to fight their own body to learn!`,
        exercises: [
          {
            name: '🦎 Lizard Crawl',
            how: 'Army crawl with opposite arm and leg moving together',
            when: 'Daily, 3-5 minutes',
            tip: 'Pretend to be a sneaky lizard - makes it fun!'
          },
          {
            name: '✋ Cross-Crawl March',
            how: 'Touch opposite elbow to knee while marching',
            when: '3 times daily, 2 minutes',
            tip: 'Play marching music to make it enjoyable'
          },
          {
            name: '∞ Lazy 8s',
            how: 'Draw large figure-8s lying sideways (infinity symbol)',
            when: 'Before homework',
            tip: 'This connects both brain hemispheres for better learning'
          }
        ]
      },

      'STNR': {
        fullName: 'Symmetrical Tonic Neck Reflex (STNR)',
        integrationAge: '9-11 months',
        whatItDoes: `This reflex helped baby learn to crawl. Head up = arms straight, head down = arms bend.`,
        whyItMatters: `If retained, sitting at a desk becomes a battle - child may slouch, slide off chair, or wrap legs around chair legs.`,
        signsRetained: [
          'Poor posture (slouching)',
          'W-sitting',
          'Difficulty copying from board',
          'Messy eating',
          'Clumsiness',
          'Trouble sitting still at desk'
        ],
        howItHelpsWhenIntegrated: `Your child will sit comfortably at their desk, copy from the board easily, and have better posture. Homework time becomes less of a battle!`,
        exercises: [
          {
            name: '🐱 Cat-Cow Stretches',
            how: 'On hands and knees, arch back up like angry cat, then down like cow',
            when: 'Morning and night, 10 times',
            tip: 'Make cat and cow sounds - kids love it!'
          },
          {
            name: '🎾 Ball Bouncing',
            how: 'Sit on therapy ball, bounce gently',
            when: 'During TV time or homework breaks',
            tip: 'Strengthens core and integrates reflex'
          },
          {
            name: '🐻 Bear Walk',
            how: 'Walk on hands and feet with bottom in air',
            when: 'Daily, across the room 3 times',
            tip: 'Race with siblings or parents!'
          }
        ]
      },

      'Spinal Galant': {
        fullName: 'Spinal Galant Reflex',
        integrationAge: '3-9 months',
        whatItDoes: `When baby's back was stroked, hips would wiggle. This helped with the birthing process and developed hip mobility.`,
        whyItMatters: `If retained, sitting still feels impossible - like having ants in your pants all day!`,
        signsRetained: [
          'Bedwetting past age 5',
          'Fidgeting and hyperactivity',
          'Poor concentration',
          'Hip rotation when walking',
          'Difficulty sitting still',
          'Sensitivity to clothing tags/waistbands'
        ],
        howItHelpsWhenIntegrated: `Bedwetting often stops, fidgeting decreases dramatically, and your child can finally sit through dinner or class comfortably!`,
        exercises: [
          {
            name: '🐍 Snake Crawl',
            how: 'Belly crawl without using arms, wiggling like a snake',
            when: 'Daily, 2-3 minutes',
            tip: 'Make it a game - slither to find hidden toys!'
          },
          {
            name: '👼 Snow Angels',
            how: 'Lying on back, move arms and legs like making snow angels',
            when: 'Morning wake-up routine',
            tip: 'Do on carpet or yoga mat'
          },
          {
            name: '🎯 Back Tapping',
            how: 'Gentle tapping along spine while child is on all fours',
            when: 'Bedtime routine',
            tip: 'Very calming before sleep'
          }
        ]
      },

      'TLR': {
        fullName: 'Tonic Labyrinthine Reflex (TLR)',
        integrationAge: '3-4 months',
        whatItDoes: `Head forward = body curls, head back = body extends. Helped baby learn head control.`,
        whyItMatters: `If retained, your child fights gravity all day - exhausting! Poor posture and balance result.`,
        signsRetained: [
          'Poor balance and coordination',
          'Motion sickness',
          'Difficulty judging space and distance',
          'Toe walking',
          'Hunched posture',
          'Difficulty with sports'
        ],
        howItHelpsWhenIntegrated: `Balance improves, sports become easier, and your child won't tire as quickly. They'll stand tall with confidence!`,
        exercises: [
          {
            name: '✈️ Superman Pose',
            how: 'Lying on tummy, lift arms, legs and head like flying',
            when: 'Daily, hold for 10 seconds x5',
            tip: 'Count together or sing Superman theme!'
          },
          {
            name: '🎾 Balance Ball Rock',
            how: 'Rock gently on therapy ball on tummy',
            when: 'During play time',
            tip: 'Start slow, increase as comfort grows'
          },
          {
            name: '🚶 Head Nods Walking',
            how: 'Walk while slowly nodding head yes and no',
            when: 'Walking to car or school',
            tip: 'Makes regular walking therapeutic!'
          }
        ]
      },

      'Palmar': {
        fullName: 'Palmar Grasp Reflex',
        integrationAge: '5-6 months',
        whatItDoes: `Baby automatically grips anything placed in palm. Helped baby hold onto mom.`,
        whyItMatters: `If retained, pencil grip is exhausting, handwriting is messy, and fine motor tasks are difficult.`,
        signsRetained: [
          'Poor pencil grip',
          'Messy handwriting',
          'Hand fatigue when writing',
          'Difficulty with buttons/zippers',
          'Sticky fingers (touches everything)',
          'Poor manual dexterity'
        ],
        howItHelpsWhenIntegrated: `Handwriting becomes neat and easy, buttoning clothes is simple, and fine motor skills flourish. No more hand cramps during homework!`,
        exercises: [
          {
            name: '🤏 Squeeze and Release',
            how: 'Squeeze stress ball or putty, then completely relax hand',
            when: 'During homework breaks, 10 times each hand',
            tip: 'Use therapy putty of different resistances'
          },
          {
            name: '🐒 Monkey Bars',
            how: 'Hang from bar or do monkey bars at playground',
            when: 'Playground visits',
            tip: 'Start with just hanging, build up slowly'
          },
          {
            name: '🎨 Finger Painting',
            how: 'Paint with individual fingers, not whole hand',
            when: 'Art time',
            tip: 'Make it sensory with shaving cream on mirror!'
          }
        ]
      },

      'Babinski': {
        fullName: 'Babinski Reflex',
        integrationAge: '12-24 months',
        whatItDoes: `When foot sole is stroked, toes fan out. Showed nervous system was developing.`,
        whyItMatters: `If retained, walking is awkward, running is difficult, and your child may be very clumsy.`,
        signsRetained: [
          'Delayed walking',
          'Awkward gait',
          'Poor coordination',
          'Frequent tripping',
          'Difficulty with sports',
          'Ankle/foot problems'
        ],
        howItHelpsWhenIntegrated: `Walking becomes smooth, running improves, and sports skills develop naturally. Your child gains confidence in movement!`,
        exercises: [
          {
            name: '🦶 Foot Massage',
            how: 'Firm massage of foot sole, heel to toes',
            when: 'Before bed, 2 minutes each foot',
            tip: 'Use lotion for calming bedtime routine'
          },
          {
            name: '🎯 Toe Picking',
            how: 'Pick up small objects with toes',
            when: 'During play time',
            tip: 'Make it a game - pick up marbles or pom-poms!'
          },
          {
            name: '👣 Different Textures',
            how: 'Walk barefoot on grass, sand, carpet',
            when: 'Daily opportunities',
            tip: 'Sensory path with different textures'
          }
        ]
      },

      'Rooting': {
        fullName: 'Rooting Reflex',
        integrationAge: '3-4 months',
        whatItDoes: `Baby turns head toward touch on cheek, looking for food.`,
        whyItMatters: `If retained, can cause speech delays, picky eating, and oral sensitivities.`,
        signsRetained: [
          'Speech delays',
          'Picky eating',
          'Drooling past age 2',
          'Thumb sucking past age 5',
          'Chewing on objects',
          'Oral sensitivities'
        ],
        howItHelpsWhenIntegrated: `Speech develops naturally, eating variety improves, and oral habits disappear. Mealtimes become enjoyable!`,
        exercises: [
          {
            name: '🎈 Bubble Blowing',
            how: 'Blow bubbles with different sized wands',
            when: 'Daily play time',
            tip: 'Great for oral motor development!'
          },
          {
            name: '🥤 Straw Exercises',
            how: 'Drink thick smoothies through straw',
            when: 'Snack time',
            tip: 'Thicker liquids = more oral work'
          },
          {
            name: '😊 Facial Massage',
            how: 'Gentle circular massage around mouth and cheeks',
            when: 'After meals',
            tip: 'Helps desensitize and integrate'
          }
        ]
      }
    };
  }

  // MAIN METHOD - This orchestrates everything
  async generateComprehensiveAnalysis() {
    console.log('🚀 ===========================================');
    console.log('🧠 Starting Comprehensive Reflex Analysis...');
    console.log('📋 Assessment ID:', this.assessmentId);
    console.log('👶 Child Age:', this.childAge);
    console.log('📝 Total Responses:', Object.keys(this.responses).length);
    console.log('===========================================');
    
    try {
      // Step 1: Identify reflexes from assessment responses
      console.log('\n🔍 STEP 1: Identifying reflexes from responses...');
      const detectedReflexes = this.identifyRetainedReflexes();
      console.log(`✅ Detected ${detectedReflexes.length} reflexes from responses`);
      
      // Step 2: Fetch additional data from database
      console.log('\n🔍 STEP 2: Fetching from database...');
      const databaseReflexes = await this.fetchReflexDataFromDatabase();
      console.log(`✅ Found ${databaseReflexes.length} entries in database`);
      
      // Step 3: Merge both sources
      console.log('\n🔍 STEP 3: Merging data sources...');
      const allReflexes = this.mergeReflexData(detectedReflexes, databaseReflexes);
      console.log(`✅ Total reflexes after merge: ${allReflexes.length}`);
      
      // Step 4: Save to reflex_issues table
      console.log('\n🔍 STEP 4: Saving to reflex_issues table...');
      await this.saveToReflexIssuesTable(
        this.assessmentId,
        allReflexes,
        {} // Pass empty object if no category scores available
      );
      
      // Step 5: Generate AI explanations
      console.log('\n🔍 STEP 5: Generating AI explanations...');
      const personalizedAnalysis = await this.generateAIExplanations(allReflexes);
      console.log('✅ AI analysis generated');
      
      // Step 6: Create parent-friendly report
      console.log('\n🔍 STEP 6: Creating parent report...');
      const reflexReport = this.createParentFriendlyReport(allReflexes, personalizedAnalysis);
      
      // Step 7: Save complete analysis to assessments table
      console.log('\n🔍 STEP 7: Saving complete analysis...');
      await this.saveToDatabase(reflexReport);
      
      console.log('\n🎉 ===========================================');
      console.log('✅ REFLEX ANALYSIS COMPLETE!');
      console.log('📊 Summary:');
      console.log(`   - Reflexes Identified: ${allReflexes.length}`);
      console.log(`   - High Priority: ${allReflexes.filter(r => r.severity === 'HIGH').length}`);
      console.log(`   - Moderate Priority: ${allReflexes.filter(r => r.severity === 'MODERATE').length}`);
      console.log('===========================================\n');
      
      return reflexReport;
      
    } catch (error) {
      console.error('❌ ERROR in generateComprehensiveAnalysis:', error);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  // FIXED: Comprehensive Reflex Detection with proper severity values
  // FIXED comprehensiveReflexAnalysis.js - identifyRetainedReflexes method
// Replace the existing method with this corrected version

// DEEP DEBUG VERSION - Add this to the start of identifyRetainedReflexes()
// This will show us EXACTLY what's happening with the question IDs and responses

identifyRetainedReflexes() {
  console.log('🔍 DEEP DEBUG: Starting reflex analysis...');
  console.log('🔍 Child Age:', this.childAge);
  console.log('🔍 Assessment ID:', this.assessmentId);
  console.log('🔍 Total Responses:', Object.keys(this.responses).length);
  
  // CRITICAL: Show us the actual response structure
  console.log('🔍 ACTUAL RESPONSE STRUCTURE:');
  const responseEntries = Object.entries(this.responses).slice(0, 10);
  responseEntries.forEach(([qId, answer], i) => {
    console.log(`   ${i+1}. ID: "${qId}"`);
    console.log(`      Answer: "${answer}"`);
    console.log(`      ID Parts:`, qId.split('_'));
  });
  
  // Check if responses is empty or malformed
  if (!this.responses || Object.keys(this.responses).length === 0) {
    console.error('❌ CRITICAL: No responses found!');
    return [];
  }
  
  // Check response format - are they the expected Yes/No/Sometimes?
  const uniqueAnswers = [...new Set(Object.values(this.responses))];
  console.log('🔍 Unique Answer Values:', uniqueAnswers);
  
  // Check if question IDs match expected format
  const sampleId = Object.keys(this.responses)[0];
  console.log('🔍 Sample Question ID Analysis:');
  console.log(`   Full ID: "${sampleId}"`);
  console.log(`   Split by _:`, sampleId.split('_'));
  console.log(`   Length:`, sampleId.split('_').length);
  
  // Initialize scores for ALL reflexes
  const reflexScores = {
    'Moro': 0,
    'ATNR': 0,
    'STNR': 0,
    'Spinal Galant': 0,
    'TLR': 0,
    'Palmar': 0,
    'Rooting': 0,
    'Babinski': 0
  };
  
  let totalConcerns = 0;
  let responsesAnalyzed = 0;
  let categoryMatches = 0;
  let categoryBreakdown = {};
  
  // Analyze each response with MAXIMUM DEBUGGING
  Object.entries(this.responses).forEach(([questionId, answer]) => {
    responsesAnalyzed++;
    
    // Parse the question ID
    const parts = questionId.split('_');
    
    // Determine category and level
    let category, level;
    
    if (parts.length >= 5) {
      // Check for multi-word categories
      const possibleTwoWordCategory = `${parts[0]} ${parts[1]}`;
      const possibleThreeWordCategory = `${parts[0]} ${parts[1]} ${parts[2]}`;
      
      if (['Fine Motor', 'Gross Motor'].includes(possibleTwoWordCategory)) {
        category = possibleTwoWordCategory;
        level = parts[2];
      } else if (['Daily Living Skills'].includes(possibleThreeWordCategory)) {
        category = possibleThreeWordCategory;
        level = parts[3];
      } else {
        category = parts[0];
        level = parts[1];
      }
    } else {
      // Fallback for unexpected format
      category = parts[0] || 'Unknown';
      level = parts[1] || 'Unknown';
    }
    
    // Track categories we find
    if (!categoryBreakdown[category]) {
      categoryBreakdown[category] = { total: 0, matched: 0 };
    }
    categoryBreakdown[category].total++;
    
    // Log first few for debugging
    if (responsesAnalyzed <= 5) {
      console.log(`🔍 Response ${responsesAnalyzed}:`);
      console.log(`   Question ID: "${questionId}"`);
      console.log(`   Parts:`, parts);
      console.log(`   Category: "${category}"`);
      console.log(`   Level: "${level}"`);
      console.log(`   Answer: "${answer}"`);
    }
    
    let foundMatch = false;
    let isConcern = false;
    
    // CATEGORY MATCHING WITH DETAILED LOGGING
    
    // SPEECH CATEGORY
    if (category === 'Speech') {
      foundMatch = true;
      categoryMatches++;
      categoryBreakdown[category].matched++;
      
      if (level === 'foundation' && answer === 'No') {
        reflexScores['Rooting'] += 3;
        reflexScores['Palmar'] += 1;
        isConcern = true;
        console.log(`   ✅ Speech Foundation Concern: Rooting +3, Palmar +1`);
      }
      if (level === 'critical' && (answer === 'No' || answer === 'Sometimes')) {
        reflexScores['Rooting'] += 2;
        isConcern = true;
        console.log(`   ✅ Speech Critical Concern: Rooting +2`);
      }
    }
    
    // BEHAVIOUR CATEGORY
    else if (category === 'Behaviour') {
      foundMatch = true;
      categoryMatches++;
      categoryBreakdown[category].matched++;
      
      if (level === 'critical' && (answer === 'Yes' || answer === 'Sometimes')) {
        reflexScores['Moro'] += (answer === 'Yes' ? 3 : 2);
        reflexScores['Spinal Galant'] += 1;
        isConcern = true;
        console.log(`   ✅ Behaviour Critical Concern: Moro +${answer === 'Yes' ? 3 : 2}, Spinal Galant +1`);
      }
      if (level === 'foundation' && answer === 'No') {
        reflexScores['Moro'] += 2;
        isConcern = true;
        console.log(`   ✅ Behaviour Foundation Concern: Moro +2`);
      }
    }
    
    // FINE MOTOR CATEGORY
    else if (category === 'Fine Motor') {
      foundMatch = true;
      categoryMatches++;
      categoryBreakdown[category].matched++;
      
      if ((level === 'critical' || level === 'foundation') && answer === 'No') {
        reflexScores['ATNR'] += 3;
        reflexScores['Palmar'] += 3;
        isConcern = true;
        console.log(`   ✅ Fine Motor Concern: ATNR +3, Palmar +3`);
      }
    }
    
    // GROSS MOTOR CATEGORY
    else if (category === 'Gross Motor') {
      foundMatch = true;
      categoryMatches++;
      categoryBreakdown[category].matched++;
      
      if (level === 'critical' && answer === 'No') {
        reflexScores['TLR'] += 3;
        reflexScores['STNR'] += 2;
        isConcern = true;
        console.log(`   ✅ Gross Motor Critical Concern: TLR +3, STNR +2`);
      }
      if (level === 'foundation' && answer === 'No') {
        reflexScores['TLR'] += 2;
        reflexScores['STNR'] += 2;
        isConcern = true;
        console.log(`   ✅ Gross Motor Foundation Concern: TLR +2, STNR +2`);
      }
    }
    
    // Add more debug logging for unmatched categories
    if (!foundMatch && responsesAnalyzed <= 10) {
      console.log(`   ❌ No category match for: "${category}"`);
    }
    
    if (isConcern) {
      totalConcerns++;
    }
  });
  
  // SUMMARY DEBUGGING
  console.log('🔍 ANALYSIS SUMMARY:');
  console.log(`   Total Responses Analyzed: ${responsesAnalyzed}`);
  console.log(`   Category Matches Found: ${categoryMatches}`);
  console.log(`   Total Concerns Identified: ${totalConcerns}`);
  console.log(`   Categories Found:`, Object.keys(categoryBreakdown));
  
  console.log('🔍 CATEGORY BREAKDOWN:');
  Object.entries(categoryBreakdown).forEach(([cat, data]) => {
    console.log(`   ${cat}: ${data.matched}/${data.total} matched`);
  });
  
  console.log('🔍 FINAL REFLEX SCORES:');
  Object.entries(reflexScores).forEach(([reflex, score]) => {
    if (score > 0) {
      console.log(`   ${reflex}: ${score} points`);
    }
  });
  
  // Convert to reflex objects
  const allReflexes = [];
  Object.entries(reflexScores).forEach(([reflex, score]) => {
    if (score > 0) {
      const reflexData = this.reflexDatabase[reflex];
      if (reflexData) {
        let severity = score >= 10 ? 'HIGH' : score >= 5 ? 'MODERATE' : 'LOW';
        
        allReflexes.push({
          name: reflex,
          severity: severity,
          priority: score >= 10 ? 1 : score >= 5 ? 2 : 3,
          score: score,
          indicators: score,
          data: reflexData,
          symptoms: [],
          isTopThree: false
        });
      }
    }
  });
  
  // Sort and mark top 3
  allReflexes.sort((a, b) => b.score - a.score);
  allReflexes.forEach((reflex, index) => {
    reflex.isTopThree = index < 3;
  });
  
  console.log(`🔍 FINAL RESULT: ${allReflexes.length} reflexes detected`);
  allReflexes.forEach((r, i) => {
    console.log(`   ${i+1}. ${r.name}: ${r.score} points (${r.severity})`);
  });
  
  return allReflexes;
}

  // FIXED: Save to reflex_issues table with proper priority values
  async saveToReflexIssuesTable(assessmentId, identifiedReflexes, categoryScores) {
    console.log('\n💾 SAVING TO REFLEX_ISSUES TABLE...');
    console.log('   Assessment ID:', assessmentId);
    console.log('   Reflexes to save:', identifiedReflexes.length);
    
    if (!identifiedReflexes || identifiedReflexes.length === 0) {
      console.log('   ⚠️ No reflexes to save, skipping...');
      return;
    }
    
    try {
      const reflexIssueRecords = [];
      
      for (const reflex of identifiedReflexes) {
        const affectedCategories = this.getAffectedCategories(reflex.name);
        console.log(`   📌 ${reflex.name} affects ${affectedCategories.length} categories`);
        
        for (const category of affectedCategories) {
          const categoryScore = categoryScores?.[category]?.percentage || 0;
          
          // FIXED: Only use 'HIGH', 'MEDIUM', 'LOW' for priority
          let priority = 'MEDIUM';
          if (reflex.severity === 'HIGH' || categoryScore < 30) {
            priority = 'HIGH';
          } else if (reflex.severity === 'LOW' && categoryScore > 70) {
            priority = 'LOW';
          }
          
          // Get issues as a string, then split into array
          const issuesString = this.getReflexCategoryIssues(reflex.name, category);
          const issuesArray = issuesString.split(', ').map(issue => issue.trim());
          
          // Create timeline as JSONB object
          const timelineObj = {
            duration: this.getReflexTimeline(reflex.name, priority),
            startWeek: 1,
            endWeek: priority === 'HIGH' ? 4 : priority === 'LOW' ? 12 : 8
          };
          
          // Create record matching EXACT database columns
          reflexIssueRecords.push({
            assessment_id: assessmentId,
            reflex_name: reflex.name,
            category_name: category,
            score: reflex.score || 0,
            priority: priority,  // FIXED: Now only 'HIGH', 'MEDIUM', or 'LOW'
            issues: issuesArray,
            timeline: timelineObj
          });
        }
      }
      
      console.log(`   📊 Prepared ${reflexIssueRecords.length} records for insertion`);
      
      if (reflexIssueRecords.length > 0) {
        // Delete existing records
        console.log('   🗑️ Deleting old records...');
        const { error: deleteError } = await supabase
          .from('reflex_issues')
          .delete()
          .eq('assessment_id', assessmentId);
        
        if (deleteError) {
          console.error('   ❌ Delete error:', deleteError);
        } else {
          console.log('   ✅ Old records deleted');
        }
        
        // Insert new records
        console.log('   📝 Inserting new records...');
        const { data, error } = await supabase
          .from('reflex_issues')
          .insert(reflexIssueRecords)
          .select();
        
        if (error) {
          console.error('   ❌ INSERT ERROR:', error);
          console.error('   Failed record structure:', reflexIssueRecords[0]);
        } else {
          console.log(`   ✅ SUCCESS! Saved ${reflexIssueRecords.length} records`);
          if (data) {
            console.log(`   📄 First inserted record:`, data[0]);
            console.log(`   📊 Total inserted: ${data.length} records`);
          }
        }
      }
    } catch (error) {
      console.error('❌ EXCEPTION in saveToReflexIssuesTable:', error);
      console.error('Stack:', error.stack);
    }
  }

  // Fetch from database
  async fetchReflexDataFromDatabase() {
    console.log('📊 Querying reflex_issues table...');
    
    try {
      const { data: reflexIssues, error } = await supabase
        .from('reflex_issues')
        .select('*')
        .eq('assessment_id', this.assessmentId);
      
      if (error) {
        console.error('   ❌ Database error:', error);
        return [];
      }
      
      if (reflexIssues && reflexIssues.length > 0) {
        console.log(`   ✅ Found ${reflexIssues.length} existing entries`);
        
        const dbReflexes = reflexIssues.map(issue => ({
          name: issue.reflex_name,
          severity: issue.priority === 'HIGH' ? 'HIGH' : 
                   issue.priority === 'MEDIUM' ? 'MODERATE' : 'LOW',
          score: issue.score || 0,
          indicators: issue.score || 0,
          category: issue.category_name,
          issues: issue.issues,
          timeline: issue.timeline,
          fromDatabase: true
        }));
        
        return dbReflexes;
      }
      
      console.log('   ℹ️ No existing entries found');
      return [];
      
    } catch (error) {
      console.error('❌ Database fetch exception:', error);
      return [];
    }
  }

  // Merge reflex data
  mergeReflexData(detectedReflexes, databaseReflexes) {
    console.log('🔄 Merging reflex data...');
    const merged = [...detectedReflexes];
    const existingNames = new Set(detectedReflexes.map(r => r.name));
    
    databaseReflexes.forEach(dbReflex => {
      if (!existingNames.has(dbReflex.name)) {
        const reflexData = this.reflexDatabase[dbReflex.name];
        if (reflexData) {
          merged.push({
            ...dbReflex,
            data: reflexData
          });
          console.log(`   ➕ Added ${dbReflex.name} from database`);
        }
      }
    });
    
    console.log(`   📊 Final count: ${merged.length} reflexes`);
    return merged;
  }

  // Helper: Get categories affected by a reflex
  getAffectedCategories(reflexName) {
    const reflexCategoryMap = {
      'Moro': ['Behaviour', 'Sensory', 'Gross Motor', 'Cognitive'],
      'ATNR': ['Fine Motor', 'Cognitive', 'Gross Motor', 'School Readiness'],
      'STNR': ['Gross Motor', 'Fine Motor', 'School Readiness', 'Behaviour'],
      'Spinal Galant': ['Behaviour', 'Daily Living Skills', 'Sensory', 'Cognitive'],
      'TLR': ['Gross Motor', 'Cognitive', 'Sensory', 'Behaviour'],
      'Palmar': ['Fine Motor', 'Speech', 'Daily Living Skills', 'Behaviour'],
      'Rooting': ['Feeding', 'Speech', 'Sensory', 'Daily Living Skills'],
      'Babinski': ['Gross Motor', 'Balance', 'Sensory']
    };
    
    return reflexCategoryMap[reflexName] || ['General'];
  }

  // Helper: Get specific issues for reflex-category combination
  getReflexCategoryIssues(reflexName, category) {
    const issueMap = {
      'Moro': {
        'Behaviour': 'Anxiety, emotional outbursts, poor impulse control',
        'Sensory': 'Light/sound sensitivity, motion sickness',
        'Gross Motor': 'Poor balance, difficulty with ball games',
        'Cognitive': 'Poor concentration, ADD/ADHD tendencies'
      },
      'ATNR': {
        'Fine Motor': 'Poor handwriting, difficulty crossing midline',
        'Cognitive': 'Reading difficulties, mixing b/d, poor spatial awareness',
        'Gross Motor': 'Clumsy movements, poor coordination',
        'School Readiness': 'Difficulty copying from board'
      },
      'STNR': {
        'Gross Motor': 'W-sitting, poor posture, clumsy',
        'Fine Motor': 'Lays head on desk while writing',
        'School Readiness': 'Difficulty focusing on desk work',
        'Behaviour': 'Decreased attention, fidgeting'
      },
      'Spinal Galant': {
        'Behaviour': 'Hyperactivity, fidgeting, ADHD symptoms',
        'Daily Living Skills': 'Bedwetting beyond age 5',
        'Sensory': 'Clothing sensitivity, waistband irritation',
        'Cognitive': 'Poor concentration'
      },
      'TLR': {
        'Gross Motor': 'Poor balance, toe walking, abnormal gait',
        'Cognitive': 'Poor spatial/time awareness',
        'Sensory': 'Motion sickness, visual-perception issues',
        'Behaviour': 'Appears lazy due to low muscle tone'
      },
      'Palmar': {
        'Fine Motor': 'Poor pencil grip, poor handwriting',
        'Speech': 'Articulation challenges, tongue overflow',
        'Daily Living Skills': 'Difficulty with utensils, buttons',
        'Behaviour': 'Nail biting, thumb sucking'
      },
      'Rooting': {
        'Feeding': 'Picky eating, texture sensitivity',
        'Speech': 'Articulation delays, oral motor weakness',
        'Sensory': 'Face/cheek tactile sensitivity',
        'Daily Living Skills': 'Messy eating, drooling'
      },
      'Babinski': {
        'Gross Motor': 'Delayed walking, awkward gait',
        'Balance': 'Poor balance, frequent falls',
        'Sensory': 'Foot sensitivity, toe walking'
      }
    };
    
    return issueMap[reflexName]?.[category] || 'General developmental concerns';
  }

  // Helper: Get timeline for reflex integration
  getReflexTimeline(reflexName, priority) {
    if (priority === 'HIGH') {
      return '2-4 weeks intensive';
    } else if (priority === 'LOW') {
      return '8-12 weeks maintenance';
    }
    return '4-8 weeks regular';
  }

  // Helper: Get exercises for reflex
  getReflexExercises(reflexName) {
    const exerciseMap = {
      'Moro': ['Starfish exercise', 'Deep pressure massage', 'Weighted blanket', 'Rhythmic rocking'],
      'ATNR': ['Cross-crawl', 'Lizard walk', 'Angels in snow', 'Infinity drawing'],
      'STNR': ['Cat-cow stretches', 'Rocking on hands/knees', 'Wall push-ups'],
      'Spinal Galant': ['Snow angels', 'Back massage', 'Swimming movements'],
      'TLR': ['Superman pose', 'Log rolling', 'Balance beam walking'],
      'Palmar': ['Squeeze ball exercises', 'Finger painting', 'Play-dough activities'],
      'Rooting': ['Facial massage', 'Blowing exercises', 'Straw activities'],
      'Babinski': ['Foot massage', 'Toe exercises', 'Walking on different textures']
    };
    
    return exerciseMap[reflexName] || ['General integration exercises'];
  }

  // FIXED: Get expected improvements with correct timeline order
  getExpectedImprovements(topReflexes) {
    const improvements = {
      '2 Weeks': [
        'Better sleep patterns',
        'Calmer transitions',
        'Improved mood regulation'
      ],
      '4 Weeks': [
        'Better focus and attention',
        'Improved coordination',
        'Fewer emotional outbursts'
      ],
      '6-8 Weeks': [
        'Significant academic improvements',
        'Better social interactions',
        'Improved self-regulation'
      ],
      '3 Months': [
        'Consolidated skills',
        'Increased confidence',
        'Overall developmental progress'
      ]
    };
    
    // Customize based on top reflexes if present
    if (topReflexes && topReflexes.length > 0) {
      const topReflex = topReflexes[0];
      if (topReflex.name === 'Moro') {
        improvements['2 Weeks'].push('Reduced anxiety');
        improvements['4 Weeks'].push('Better emotional control');
      }
      if (topReflex.name === 'ATNR') {
        improvements['4 Weeks'].push('Improved handwriting');
        improvements['6-8 Weeks'].push('Better reading fluency');
      }
      if (topReflex.name === 'Spinal Galant') {
        improvements['2 Weeks'].push('Better sitting tolerance');
        improvements['4 Weeks'].push('Improved bladder control');
      }
    }
    
    return improvements;
  }

  // Helper: Get success stories
  getSuccessStories(topReflexes) {
    const stories = [];
    
    if (!topReflexes || topReflexes.length === 0) {
      return ['Every child progresses at their own pace - celebrate small wins!'];
    }
    
    topReflexes.slice(0, 2).forEach(reflex => {
      if (reflex.name === 'Moro') {
        stories.push('✨ "After 6 weeks, my daughter went from daily meltdowns to handling changes calmly!" - Sarah, mom of 5-year-old');
      }
      if (reflex.name === 'ATNR') {
        stories.push('📚 "My son\'s handwriting transformed in just 2 months!" - Michael, dad of 7-year-old');
      }
      if (reflex.name === 'Spinal Galant') {
        stories.push('🎉 "The bedwetting stopped after 4 weeks of exercises!" - Jennifer, mom of 6-year-old');
      }
      if (reflex.name === 'Rooting') {
        stories.push('🗣️ "Speech clarity improved dramatically in 6 weeks!" - David, dad of 4-year-old');
      }
    });
    
    if (stories.length === 0) {
      stories.push('💪 "Consistency is key - small daily efforts lead to big changes!"');
    }
    
    return stories;
  }

  // Helper: Generate weekly plan
  generateWeeklyPlan(topReflexes, additionalReflexes) {
    return {
      'Week 1-2': {
        focus: 'Building routine & body awareness',
        exercises: 'Start with 1 exercise per top reflex, 5 minutes each',
        tip: 'Make it fun with music and games!'
      },
      'Week 3-4': {
        focus: 'Increasing integration intensity',
        exercises: 'Add second exercise per reflex, 10 minutes total',
        tip: 'Some regression is normal - it means it\'s working!'
      },
      'Week 5-8': {
        focus: 'Deepening neural pathways',
        exercises: 'Full program, 15-20 minutes daily',
        tip: 'Celebrate improvements, no matter how small!'
      },
      'Week 9-12': {
        focus: 'Maintenance & mastery',
        exercises: 'Continue daily, can reduce to 3x/week if progressing well',
        tip: 'Document changes to stay motivated!'
      }
    };
  }

  // Helper: Get professional recommendations
  getProfessionalRecommendations(retainedReflexes) {
    if (!retainedReflexes || retainedReflexes.length === 0) {
      return {
        recommended: false,
        message: 'Continue monitoring development. Consult if concerns arise.'
      };
    }
    
    const hasHigh = retainedReflexes.some(r => r.severity === 'HIGH');
    const hasMultiple = retainedReflexes.length > 5;
    
    if (hasHigh || hasMultiple) {
      return {
        recommended: true,
        professionals: [
          'Occupational Therapist (OT) - For reflex integration and sensory processing',
          'Developmental Optometrist - If ATNR/TLR affecting vision and reading',
          'Speech Therapist - If Rooting/Palmar affecting speech'
        ],
        message: 'While home exercises are powerful, professional support can accelerate progress.'
      };
    }
    
    return {
      recommended: false,
      message: 'Home exercises should be sufficient. Monitor progress monthly.'
    };
  }

  // NEW: Helper for reflex impact
  getReflexImpact(reflexName) {
    const impacts = {
      'Moro': "Anxiety, emotional outbursts, sensory sensitivities",
      'ATNR': "Writing difficulties, reading challenges, coordination",
      'STNR': "Poor posture, can't sit still, desk work struggles",
      'Spinal Galant': "Fidgeting, hyperactivity, possible bedwetting",
      'TLR': "Balance issues, clumsiness, spatial awareness",
      'Palmar': "Poor pencil grip, messy writing, hand fatigue",
      'Rooting': "Speech delays, picky eating, oral sensitivities",
      'Babinski': "Walking difficulties, frequent tripping, poor balance"
    };
    return impacts[reflexName] || "General developmental concerns";
  }

  // NEW: Helper for expected changes
  getExpectedChanges(reflexName) {
    const changes = {
      'Moro': "Calmer transitions, better emotional control, less anxiety",
      'ATNR': "Improved handwriting, easier homework, better reading",
      'STNR': "Better posture, can sit comfortably, improved focus",
      'Spinal Galant': "Less fidgeting, better concentration, dry nights",
      'TLR': "Better balance, improved sports skills, confident movement",
      'Palmar': "Neat writing, easier self-care tasks, no hand fatigue",
      'Rooting': "Clearer speech, varied diet, better oral control",
      'Babinski': "Smooth walking, better running, improved coordination"
    };
    return changes[reflexName] || "Overall improvement in development";
  }

  // Generate AI explanations
  async generateAIExplanations(retainedReflexes) {
    console.log('   🤖 Generating AI explanations...');
    return this.generateDefaultExplanations(retainedReflexes);
  }

  // IMPROVED: Generate structured explanations for better UI
  generateDefaultExplanations(retainedReflexes) {
    if (!retainedReflexes || retainedReflexes.length === 0) {
      return {
        type: 'positive',
        sections: {
          summary: {
            title: "Great News!",
            content: "Your child is showing good development across many areas!"
          },
          recommendations: {
            title: "Keep Supporting Growth",
            points: [
              "Daily physical play and movement",
              "Reading together and conversation",
              "Age-appropriate challenges",
              "Celebrate strengths while working on growth areas"
            ]
          },
          message: "You're doing wonderfully! 🌟"
        }
      };
    }
    
    const topThree = retainedReflexes.filter(r => r.isTopThree);
    const additional = retainedReflexes.filter(r => !r.isTopThree);
    
    return {
      type: 'action_needed',
      sections: {
        summary: {
          title: "Assessment Complete",
          totalReflexes: retainedReflexes.length,
          needsFocus: topThree.length,
          willImproveAutomatically: additional.length
        },
        topPriorities: topThree.map((reflex, index) => ({
          number: index + 1,
          name: reflex.data?.fullName || reflex.name,
          severity: reflex.severity,
          impact: this.getReflexImpact(reflex.name),
          improvements: this.getExpectedChanges(reflex.name)
        })),
        additionalReflexes: additional.map((reflex, index) => ({
          number: topThree.length + index + 1,
          name: reflex.data?.fullName || reflex.name,
          severity: reflex.severity,
          note: "Will improve with top 3 work"
        })),
        actionPlan: {
          title: "Your Simple Daily Plan",
          steps: [
            { step: 1, action: "Focus on Top 3 Only", detail: "Just 3-4 exercises per reflex" },
            { step: 2, action: "Daily Practice", detail: "15-20 minutes total" },
            { step: 3, action: "Track Progress", detail: "Most see changes in 2-3 weeks" },
            { step: 4, action: "Stay Consistent", detail: "6-8 weeks for full integration" }
          ]
        },
        encouragement: {
          title: "Remember",
          message: "You don't need to be perfect! Focus on the top 3 reflexes with simple, fun exercises.",
          closing: "Your child's brain is ready to change, and you're the perfect person to guide them! 🌟"
        }
      }
    };
  }

  // Create parent-friendly report
  createParentFriendlyReport(retainedReflexes, aiExplanation) {
    const topThree = retainedReflexes.filter(r => r.isTopThree);
    const additional = retainedReflexes.filter(r => !r.isTopThree);
    
    return {
      retainedReflexes: retainedReflexes,
      topThreePriority: topThree,
      additionalReflexes: additional,
      personalizedExplanation: aiExplanation,
      totalReflexesFound: retainedReflexes.length,
      totalExercisesNeeded: topThree.reduce((sum, r) => sum + 3, 0),
      estimatedTimeDaily: topThree.length === 0 ? '10-15 minutes' : 
                          topThree.length === 1 ? '10-15 minutes' :
                          topThree.length === 2 ? '15 minutes' :
                          '15-20 minutes',
      keyMessage: retainedReflexes.length > 3 ? 
        '🌟 Focus on the top 3 reflexes - the others will improve automatically!' :
        '🌟 With daily practice, these reflexes will integrate within 6-8 weeks!',
      expectedImprovements: this.getExpectedImprovements(topThree),
      successStories: this.getSuccessStories(topThree),
      weekByWeekPlan: this.generateWeeklyPlan(topThree, additional),
      professionalSupport: this.getProfessionalRecommendations(retainedReflexes)
    };
  }

  // Save to database
  async saveToDatabase(reflexReport) {
    console.log('💾 Saving analysis to assessments table...');
    try {
      const { error } = await supabase
        .from('assessments')
        .update({
          reflex_analysis: reflexReport
        })
        .eq('id', this.assessmentId);
      
      if (error) {
        console.error('   ❌ Save error:', error);
      } else {
        console.log('   ✅ Analysis saved to assessments table');
      }
    } catch (error) {
      console.error('❌ Save exception:', error);
    }
  }
}

// Export function to use in assessment
export const generateComprehensiveReflexAnalysis = async (
  assessmentId, 
  responses, 
  childAge, 
  parentConcerns
) => {
  console.log('\n🚀 INITIALIZING REFLEX ANALYZER...');
  
  const analyzer = new ComprehensiveReflexAnalyzer(
    assessmentId,
    responses,
    childAge,
    parentConcerns
  );
  
  const reflexReport = await analyzer.generateComprehensiveAnalysis();
  
  return reflexReport;
};