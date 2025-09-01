// AssessmentPage.jsx - With Comprehensive Debug Logging
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { SmartAssessmentEngine } from '../utils/smartAssessmentEngine';
import { DevelopmentalAnalyzer } from '../utils/developmentalAnalysis';
import { generateComprehensiveReflexAnalysis } from '../utils/comprehensiveReflexAnalysis';
import { COMPREHENSIVE_REFLEX_DATABASE } from '../utils/comprehensiveReflexDatabase';

const AssessmentPage = () => {
  const { id: assessmentId } = useParams();
  const [assessmentData, setAssessmentData] = useState(null);
  const [smartQuestions, setSmartQuestions] = useState({});
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Category icons for visual appeal
const categoryIcons = {
  'Speech': '💬',
  'Gross Motor': '🏃',
  'Fine Motor': '✋',
  'Cognitive': '🧠',
  'Daily Living Skills': '🏠',
  'Behaviour': '❤️',
  'School Readiness': '📚'
};
  const navigate = useNavigate();

  // 🔍 DEBUG: Log component initialization
  useEffect(() => {
    console.log('🔍 DEBUG: AssessmentPage initialized');
    console.log('🔍 DEBUG: Assessment ID from params:', assessmentId);
  }, []);

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      console.log('🔍 DEBUG: Starting fetchAssessmentData');
      console.log('🔍 DEBUG: Assessment ID:', assessmentId);
      
      if (!assessmentId) {
        console.error('🔍 DEBUG: No assessment ID provided');
        setError("No assessment ID provided");
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 DEBUG: Fetching from Supabase...');
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();

        console.log('🔍 DEBUG: Supabase response:', { data, error });

        if (error) {
          console.error('🔍 DEBUG: Supabase error:', error);
          setError(`Error fetching assessment: ${error.message}`);
          setLoading(false);
          return;
        }

        if (data) {
          console.log('🔍 DEBUG: Assessment data fetched successfully:', data);
          console.log('🔍 DEBUG: Child age:', data.child_age);
          console.log('🔍 DEBUG: Current status:', data.status);
          console.log('🔍 DEBUG: Existing responses:', data.responses);
          
          setAssessmentData(data);
          
          const questionTimeout = setTimeout(() => {
            console.error("🔍 DEBUG: Question generation timed out, using fallback");
            const developmentalAge = Math.max(data.child_age - 1, 1);
generateFallbackQuestions(developmentalAge)
            setLoading(false);
          }, 5000);
          
      try {
  console.log('🔍 DEBUG: Starting smart question generation...');
  // ADJUSTMENT: Use developmental age (1 year younger) for assessment
  const developmentalAge = Math.max(data.child_age - 1, 1);
  console.log(`🎯 Using developmental age: ${developmentalAge} (chronological: ${data.child_age})`);
  await generateSmartQuestions(developmentalAge);
  clearTimeout(questionTimeout);
}
          catch (error) {
            console.error("🔍 DEBUG: Error generating questions:", error);
            clearTimeout(questionTimeout);
            generateFallbackQuestions(data.child_age);
          }
        }
      } catch (error) {
        console.error("🔍 DEBUG: Unexpected error in fetchAssessmentData:", error);
        setError("Failed to load assessment");
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  // Generate smart questions with debug logs
  const generateSmartQuestions = async (childAge) => {
    console.log("🔍 DEBUG: generateSmartQuestions called");
    console.log("🧠 Starting Smart Assessment for age:", childAge);
    
    try {
      console.log('🔍 DEBUG: Fetching questions from database...');
      const { data: dbQuestions, error: dbError } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("is_active", true)
        .order("developmental_level", { ascending: true })
        .order("difficulty_order", { ascending: true });
      
     // ⭐ ADD THIS BIG DEBUG SECTION HERE ⭐
    // ===========================================
    console.log("====== DATABASE DEBUG START ======");
    console.log("Total questions from DB:", dbQuestions?.length || 0);
    console.log("Database error:", dbError);
    
    if (!dbQuestions || dbQuestions.length === 0) {
      console.error("❌ CRITICAL: No questions loaded from database!");
      console.log("Trying without is_active filter...");
      
      // Try loading without the filter to see if that's the issue
      const { data: allQuestions } = await supabase
        .from("assessment_questions")
        .select("*")
        .limit(10);
      console.log("Questions without filter:", allQuestions);
    } else {
      // Show what categories exist in database
      const uniqueCategories = {};
      dbQuestions.forEach(q => {
        if (q.category) {
          uniqueCategories[q.category] = (uniqueCategories[q.category] || 0) + 1;
        }
      });
      
      console.log("Categories in your database:");
      Object.entries(uniqueCategories).forEach(([cat, count]) => {
        console.log(`  - "${cat}": ${count} questions`);
      });
      
      // Show how categories are being mapped
      console.log("\nCategory Mapping Test:");
      Object.keys(uniqueCategories).forEach(dbCat => {
        const mapped = mapDatabaseCategory(dbCat);
        console.log(`  "${dbCat}" → "${mapped}"`);
      });
      
      // Check age filtering
      const ageFilteredQuestions = dbQuestions.filter(q => {
        const minOk = !q.min_age || q.min_age <= childAge;
        const maxOk = !q.max_age || q.max_age >= childAge;
        return minOk && maxOk;
      });
      console.log(`\nQuestions for age ${childAge}: ${ageFilteredQuestions.length} out of ${dbQuestions.length}`);
      
      // Show sample questions
      console.log("\nFirst 3 questions from database:");
      dbQuestions.slice(0, 3).forEach((q, i) => {
        console.log(`${i + 1}. Category: "${q.category}", Text: "${q.question_text}"`);
      });
    }
    console.log("====== DATABASE DEBUG END ======\n");
    // ===========================================
    
    // Rest of your existing code...
     
      // Build categories based on developmental age (already adjusted by -1)
const categories = ['Speech', 'Gross Motor', 'Fine Motor', 'Cognitive', 'Daily Living Skills', 'Behaviour'];
if (childAge >= 3) {  // Changed from 4 to 3 (since childAge is already adjusted -1)
  categories.push('School Readiness');
}

      console.log('🔍 DEBUG: Categories for this age:', categories);
      
      const smartQuestionSets = {};
      
      for (const category of categories) {
        console.log(`🔍 DEBUG: Building questions for ${category}`);
        smartQuestionSets[category] = buildSmartQuestionSet(
          category, 
          childAge, 
          dbQuestions
        );
      }
      
      console.log('🔍 DEBUG: All question sets built:', Object.keys(smartQuestionSets));
      console.log('🔍 DEBUG: Total questions per category:', 
        Object.entries(smartQuestionSets).map(([cat, qs]) => `${cat}: ${qs.length}`)
      );
      
      setSmartQuestions(smartQuestionSets);
      setCategories(categories);
      setLoading(false);
      
    } catch (error) {
      console.error("🔍 DEBUG: Error in smart question generation:", error);
      generateFallbackQuestions(childAge);
    }
  };

  // Handle answer changes with detailed logging
  const handleChange = (qid, value) => {
    console.group(`🔍 DEBUG: Answer Recorded`);
    console.log('Question ID:', qid);
    console.log('Answer:', value);
    console.log('Previous formData size:', Object.keys(formData).length);
    console.log('Previous formData:', { ...formData });
    
    const newFormData = { ...formData, [qid]: value };
    setFormData(newFormData);
    
    console.log('New formData size:', Object.keys(newFormData).length);
    console.log('New formData:', newFormData);
    console.log('Progress:', `${Object.keys(newFormData).length}/${Object.values(smartQuestions).reduce((sum, q) => sum + q.length, 0)} questions answered`);
    console.groupEnd();
  };

// handle submit 

// FIXED handleSubmit function for AssessmentPage.jsx
const handleSubmit = async () => {
  console.group('🔍 DEBUG: SUBMIT PROCESS STARTED');
  console.time('Submit Duration');
  
  console.log('📍 Step 1: Pre-submission validation');
  console.log('- Assessment ID:', assessmentId);
  console.log('- Assessment ID exists:', assessmentId ? '✅' : '❌');
  console.log('- Total questions answered:', Object.keys(formData).length);
  console.log('- Form data:', formData);
  console.log('- Smart questions:', smartQuestions);
  console.log('- Current assessment data:', assessmentData);

  if (!assessmentId) {
    console.error('❌ DEBUG: No assessment ID!');
    console.groupEnd();
    alert('No assessment ID!');
    return;
  }

  if (Object.keys(formData).length === 0) {
    console.error('❌ DEBUG: No responses to submit!');
    console.groupEnd();
    alert('Please answer at least one question!');
    return;
  }

  console.log("🚀 Starting Smart AI-Powered Report Generation with Comprehensive Reflex Analysis...");
  
  setLoading(true);
  
  try {
    console.log('📍 Step 2: Loading smart systems...');
    console.log("📚 Loading smart scoring and reflex systems...");
    
    // Import smart systems
    const { 
      analyzeResponsesWithSmartScoring, 
      mapResponsesToReflexesWithSmartScoring 
    } = await import('../utils/smartScoringSystem');
    
    console.log('✅ DEBUG: Smart scoring system imported');
    
    const { AIReportGenerator } = await import('../utils/aiReportGenerator');
    console.log('✅ DEBUG: AI Report Generator imported');
    
    const { EnhancedAIContext } = await import('../utils/enhancedAIContext');
    console.log('✅ DEBUG: Enhanced AI Context imported');
    
    // CRITICAL: Import the reflex analysis function
    const { generateComprehensiveReflexAnalysis } = await import('../utils/comprehensiveReflexAnalysis');
    console.log('✅ DEBUG: Reflex Analysis system imported');
    
    console.log('📍 Step 3: Calculating basic scores...');
    
    // Calculate basic scores for immediate feedback
    const categoryScores = {};
    let totalScore = 0;
    let totalCategories = 0;
    
    Object.entries(smartQuestions).forEach(([category, questions]) => {
      console.log(`🔍 DEBUG: Processing category ${category}`);
      let yesCount = 0;
      let totalAnswered = 0;
      
      questions.forEach(q => {
        if (formData[q.id]) {
          totalAnswered++;
          if (formData[q.id] === 'Yes') yesCount++;
          else if (formData[q.id] === 'Sometimes') yesCount += 0.5;
        }
      });
      
      const percentage = totalAnswered > 0 
        ? Math.round((yesCount / totalAnswered) * 100)
        : 0;
      
      categoryScores[category] = { 
        percentage, 
        rawScore: yesCount, 
        maxScore: questions.length,
        totalAnswered 
      };
      totalScore += percentage;
      totalCategories++;
      
      console.log(`- ${category}: ${percentage}% (${yesCount}/${questions.length})`);
    });
    
    const overallScore = totalCategories > 0 
      ? Math.round(totalScore / totalCategories)
      : 0;
    
    console.log('📍 Overall Score:', overallScore + '%');
    console.log('📍 Category Scores:', categoryScores);
    
    console.log('📍 Step 4: Preparing update data...');
    
    // Prepare the update data
    const updateData = {
      responses: formData,
      status: "completed",
      category_scores: categoryScores,
      overall_score: overallScore,
      assessment_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
      chronological_age: assessmentData.child_age,      
      assessment_age: assessmentData.child_age - 1,     
      ai_report: {
        timestamp: new Date().toISOString(),
        categoryScores,
        overallScore,
        totalQuestions: Object.values(smartQuestions).reduce((sum, q) => sum + q.length, 0),
        answeredQuestions: Object.keys(formData).length,
        chronological_age: assessmentData.child_age,    
        assessment_age: assessmentData.child_age - 1,   
      }
    };
    
    console.log('🔍 DEBUG: Update payload prepared:', updateData);
    console.log('🔍 DEBUG: Payload size:', JSON.stringify(updateData).length, 'bytes');
    
    console.log('📍 Step 5: Saving basic assessment to database...');
    console.log('🔍 DEBUG: Attempting database update for ID:', assessmentId);
    
    const { data: updateResult, error: updateError } = await supabase
      .from("assessments")
      .update(updateData)
      .eq("id", assessmentId)
      .select();

    console.log('🔍 DEBUG: Database update result:', { updateResult, updateError });

    if (updateError) {
      console.error('❌ DEBUG: Database error details:', {
        message: updateError.message,
        details: updateError.details,
        hint: updateError.hint,
        code: updateError.code
      });
      throw updateError;
    }
    
    console.log('✅ DEBUG: Successfully saved basic assessment to database!');
    console.log('🔍 DEBUG: Updated record:', updateResult);
    
    // =====================================================
    // CRITICAL ADDITION: RUN REFLEX ANALYSIS
    // =====================================================
    console.log('\n📍 Step 6: RUNNING COMPREHENSIVE REFLEX ANALYSIS...');
    console.log('==============================================');
    
    try {
      // Get parent concerns if available
      const parentConcerns = assessmentData.parent_concerns || null;
      
      console.log('🔄 Starting reflex analysis with:');
      console.log('   - Assessment ID:', assessmentId);
      console.log('   - Child Age:', assessmentData.child_age);
      console.log('   - Responses Count:', Object.keys(formData).length);
      console.log('   - Parent Concerns:', parentConcerns);
      
      // RUN THE REFLEX ANALYSIS
      const reflexReport = await generateComprehensiveReflexAnalysis(
        assessmentId,
        formData,  // The responses
        assessmentData.child_age,
        parentConcerns
      );
      
      console.log('✅ REFLEX ANALYSIS COMPLETE!');
      console.log('📊 Reflex Report Summary:', {
        reflexesFound: reflexReport?.retainedReflexes?.length || 0,
        hasAnalysis: !!reflexReport
      });
      
      // Update the assessment with reflex analysis results
      if (reflexReport) {
        console.log('📍 Step 7: Saving reflex analysis to assessment...');
        
        const { error: reflexUpdateError } = await supabase
          .from("assessments")
          .update({
            reflex_analysis: reflexReport,
            reflex_analyzed_at: new Date().toISOString()
          })
          .eq("id", assessmentId);
        
        if (reflexUpdateError) {
          console.error('❌ Error saving reflex analysis:', reflexUpdateError);
        } else {
          console.log('✅ Reflex analysis saved to assessment!');
        }
      }
      
    } catch (reflexError) {
      console.error('❌ REFLEX ANALYSIS ERROR:', reflexError);
      console.error('Stack:', reflexError.stack);
      // Don't stop the whole process if reflex analysis fails
      // User can still see basic report
    }
    
    // =====================================================
    // END OF REFLEX ANALYSIS ADDITION
    // =====================================================
    
    // Verify the save by fetching the data back
    console.log('\n📍 Step 8: Verifying complete save...');
    const { data: verifyData, error: verifyError } = await supabase
      .from("assessments")
      .select("*")
      .eq("id", assessmentId)
      .single();
    
    console.log('🔍 DEBUG: Verification result:', { verifyData, verifyError });
    
    if (verifyData) {
      console.log('✅ DEBUG: Verification successful! Data persisted:');
      console.log('- Status:', verifyData.status);
      console.log('- Responses count:', Object.keys(verifyData.responses || {}).length);
      console.log('- Overall score:', verifyData.overall_score);
      console.log('- Category scores:', verifyData.category_scores);
      console.log('- Has reflex analysis:', !!verifyData.reflex_analysis);
    }
    
    // Check reflex_issues table
    console.log('\n📍 Step 9: Checking reflex_issues table...');
    const { data: reflexIssues, error: reflexIssuesError } = await supabase
      .from("reflex_issues")
      .select("*")
      .eq("assessment_id", assessmentId);
    
    console.log('🔍 DEBUG: Reflex issues saved:', reflexIssues?.length || 0);
    if (reflexIssues && reflexIssues.length > 0) {
      console.log('✅ Reflex issues successfully saved to table!');
      console.log('📊 Reflex breakdown:');
      const reflexCounts = {};
      reflexIssues.forEach(issue => {
        reflexCounts[issue.reflex_name] = (reflexCounts[issue.reflex_name] || 0) + 1;
      });
      console.table(reflexCounts);
    } else {
      console.warn('⚠️ No reflex issues saved to table');
    }
    
    console.log('\n📍 Step 10: Navigating to report...');
    console.log('🔍 DEBUG: Navigation URL:', `/report/${assessmentId}`);
    
    navigate(`/report/${assessmentId}`);
    
  } catch (error) {
    console.error('❌ DEBUG: Submit failed with error:', error);
    console.error('🔍 DEBUG: Error stack:', error.stack);
    console.error('🔍 DEBUG: Error type:', error.constructor.name);
    alert('Failed to save: ' + error.message);
  } finally {
    setLoading(false);
    console.timeEnd('Submit Duration');
    console.groupEnd();
  }
};

  // Navigation handlers with debug logs
  const handleNext = () => {
    console.log('🔍 DEBUG: Next button clicked');
    console.log('- Current category index:', currentCategoryIndex);
    console.log('- Total categories:', categories.length);
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      window.scrollTo(0, 0);
      setIsMobileMenuOpen(false);
      console.log('- New category index:', currentCategoryIndex + 1);
    }
  };

  const handlePrevious = () => {
    console.log('🔍 DEBUG: Previous button clicked');
    console.log('- Current category index:', currentCategoryIndex);
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      window.scrollTo(0, 0);
      setIsMobileMenuOpen(false);
      console.log('- New category index:', currentCategoryIndex - 1);
    }
  };

  const handleCategoryClick = (index) => {
    console.log('🔍 DEBUG: Category clicked:', categories[index]);
    console.log('- New index:', index);
    setCurrentCategoryIndex(index);
    window.scrollTo(0, 0);
    setIsMobileMenuOpen(false);
  };

  // Debug helper to check current state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.DEBUG_ASSESSMENT = {
        getFormData: () => formData,
        getQuestions: () => smartQuestions,
        getAssessmentData: () => assessmentData,
        getAssessmentId: () => assessmentId,
        testSubmit: () => handleSubmit(),
        checkDatabase: async () => {
          const { data, error } = await supabase
            .from("assessments")
            .select("*")
            .eq("id", assessmentId)
            .single();
          console.log('Database check:', { data, error });
          return { data, error };
        }
      };
      console.log('🔍 DEBUG: Debug helpers loaded. Access via window.DEBUG_ASSESSMENT');
    }
  }, [formData, smartQuestions, assessmentData, assessmentId]);

  // [Keep all the existing buildSmartQuestionSet, getQuestionDistribution, determineDevelopmentalLevel, 
  // getFallbackQuestionsForCategory, mapDatabaseCategory, generateFallbackQuestions functions as they are]
  
  // ... rest of your existing functions remain exactly the same ...

  // Build smart question set
  /*const buildSmartQuestionSet = (category, childAge, dbQuestions = []) => {
    const questions = [];
    const usedQuestionTexts = new Set();
    
    const distribution = getQuestionDistribution(childAge);
    
    const categoryDbQuestions = dbQuestions.filter(q => 
      mapDatabaseCategory(q.category) === category
    );
    
    const fallbackQuestions = getFallbackQuestionsForCategory(category, childAge);
    
    const allAvailableQuestions = [
      ...categoryDbQuestions.map(q => ({
        text: q.question_text,
        level: determineDevelopmentalLevel(q, childAge),
        source: 'database',
        original: q
      })),
      ...fallbackQuestions.map(q => ({
        text: q.text,
        level: q.level,
        source: 'fallback',
        original: q
      }))
    ];
    
    ['foundation', 'current', 'emerging'].forEach(level => {
      const targetCount = distribution[level];
      const levelQuestions = allAvailableQuestions.filter(q => q.level === level);
      
      let addedCount = 0;
      for (const q of levelQuestions) {
        if (!usedQuestionTexts.has(q.text.toLowerCase()) && addedCount < targetCount) {
          usedQuestionTexts.add(q.text.toLowerCase());
          
          questions.push({
            id: `${category}_${level}_${questions.length}_${Date.now()}`,
            question_text: q.text,
            category: category,
            skill_level: level,
            developmental_stage: `${level.charAt(0).toUpperCase() + level.slice(1)} Skills`,
            order: questions.length,
            source: q.source,
            why_important: level === 'foundation' ? 
              'Foundation skill - must be present before higher skills' :
              level === 'current' ? 
              'Age-appropriate skill for development' :
              'Emerging skill - next developmental milestone'
          });
          
          addedCount++;
        }
      }
      
      if (addedCount < targetCount) {
        console.log(`⚠️ Only found ${addedCount}/${targetCount} ${level} questions for ${category}`);
      }
    });
    
    while (questions.length < 10) {
      const genericText = `Can your child perform ${category.toLowerCase()} task ${questions.length + 1}?`;
      if (!usedQuestionTexts.has(genericText.toLowerCase())) {
        usedQuestionTexts.add(genericText.toLowerCase());
        questions.push({
          id: `${category}_generic_${questions.length}_${Date.now()}`,
          question_text: genericText,
          category: category,
          skill_level: 'current',
          developmental_stage: 'Assessment',
          order: questions.length
        });
      } else {
        break;
      }
    }
    
    console.log(`✅ ${category}: ${questions.length} unique questions generated`);
    return questions.slice(0, 10);
  };*/

  // SMART ASSESSMENT ENGINE - Works for ages 2-16
// Replace your buildSmartQuestionSet function with this:
// CONFIGURATION: Fixed question counts per category for comprehensive assessment
// CONFIGURATION: Fixed question counts per category for comprehensive assessment
const CATEGORY_QUESTION_COUNTS = {
  'Speech': 15,           
  'Gross Motor': 13,      
  'Fine Motor': 12,       
  'Behaviour': 12,        
  'Daily Living Skills': 12, 
  'Cognitive': 11,        
  'School Readiness': 10  
};

// Age-based adjustments for question counts
const getAdjustedQuestionCounts = (category, childAge) => {
  const baseCount = CATEGORY_QUESTION_COUNTS[category] || 10;
  
  // For very young children (1-2), reduce counts
  if (childAge <= 2) {
    const youngChildCounts = {
      'Speech': Math.min(baseCount, 10),      
      'Gross Motor': Math.min(baseCount, 10),
      'Fine Motor': Math.min(baseCount, 8),   
      'Behaviour': Math.min(baseCount, 8),
      'Daily Living Skills': Math.min(baseCount, 10),
      'Cognitive': Math.min(baseCount, 8),
      'School Readiness': 0  
    };
    return youngChildCounts[category] || baseCount;
  }
  
  // For teenagers (13+), might need different distribution
  if (childAge >= 13) {
    const teenCounts = {
      'Speech': 12,  
      'Gross Motor': 10,  
      'Fine Motor': 10,
      'Behaviour': 15,  
      'Daily Living Skills': 13,  
      'Cognitive': 12,
      'School Readiness': 15  
    };
    return teenCounts[category] || baseCount;
  }
  
  // Ages 3-12 use standard counts
  return baseCount;
};


// Distribution strategy for each category
const getQuestionComposition = (category, totalQuestions, redFlagCount) => {
  // Ensure we capture all critical questions (up to 60% of total)
  const criticalSlots = Math.min(redFlagCount, Math.ceil(totalQuestions * 0.6));
  
  // Remaining slots for other questions
  const remaining = totalQuestions - criticalSlots;
  
  // Distribution of remaining: 50% foundation, 30% current, 20% emerging
  return {
    critical: criticalSlots,
    foundation: Math.ceil(remaining * 0.5),
    current: Math.floor(remaining * 0.3),
    emerging: Math.floor(remaining * 0.2)
  };
};
const buildSmartQuestionSet = (category, childAge, dbQuestions = []) => {
  console.log(`🧠 SMART ENGINE: Building ${category} assessment for developmental age ${childAge}`);
  
  const targetQuestionCount = getAdjustedQuestionCounts(category, childAge);

  if (targetQuestionCount === 0) {
    console.log(`⏭️ Skipping ${category} for age ${childAge}`);
    return [];
  }

  const questions = [];
  const usedQuestionTexts = new Set();
  
  // Get target question count for this category
  console.log(`📊 Target questions for ${category}: ${targetQuestionCount}`);
  
  // Filter questions for this category
  const categoryQuestions = dbQuestions.filter(q => 
    mapDatabaseCategory(q.category) === category && q.is_active
  );
  
  if (categoryQuestions.length === 0) {
    console.log(`⚠️ No database questions for ${category}, using fallbacks`);
    return getFallbackQuestionsForCategory(category, childAge).slice(0, targetQuestionCount);
  }
  
  console.log(`📋 Processing ${categoryQuestions.length} ${category} questions`);
  
  // STEP 1: Classify all questions
  const classifiedQuestions = {
    foundation: [],
    current: [],
    emerging: []
  };
  
  // Separate critical (red flag) questions
  const criticalQuestions = [];
  
  categoryQuestions.forEach(q => {
    const qMinAge = q.min_age || 0;
    const qMaxAge = q.max_age || 18;
    
    // Check if age appropriate
    let level = null;
    
    if (qMaxAge < childAge) {
      level = 'foundation';
    }
    else if (qMinAge > childAge + 1) {  // Only 1 year ahead max
      return; // Skip - too advanced
    }
    else if (qMinAge > childAge) {
      level = 'emerging';
    }
    else {
      level = 'current';
    }
    
    // Separate critical questions for priority handling
    if (q.red_flag_if_no) {
      criticalQuestions.push({ ...q, level });
    } else {
      classifiedQuestions[level].push(q);
    }
  });
  
  // CRITICAL ORAL MOTOR QUESTIONS - Force include for Speech
  if (category === 'Speech') {
    const oralMotorCritical = categoryQuestions.filter(q => {
      const text = (q.question_text || '').toLowerCase();
      return (text.includes('mouth') && text.includes('breath')) ||
             (text.includes('nose') && text.includes('breath')) ||
             (text.includes('tongue') && (text.includes('stick') || text.includes('move'))) ||
             (text.includes('lips') && text.includes('close'));
    });
    
    // Add these to critical if not already there
    oralMotorCritical.forEach(q => {
      if (!criticalQuestions.find(cq => cq.question_text === q.question_text)) {
        const qMinAge = q.min_age || 0;
        const level = qMinAge > childAge ? 'emerging' : 
                     qMinAge < childAge - 1 ? 'foundation' : 'current';
        criticalQuestions.push({ ...q, level });
      }
    });
  }
  
  // Sort all groups by developmental level and age
  criticalQuestions.sort((a, b) => {
    // Prioritize by min_age first
    const aAge = a.min_age || 0;
    const bAge = b.min_age || 0;
    if (aAge !== bAge) return aAge - bAge;
    
    // Then by developmental_level
    if (a.developmental_level !== undefined && b.developmental_level !== undefined) {
      return a.developmental_level - b.developmental_level;
    }
    return (a.difficulty_order || 0) - (b.difficulty_order || 0);
  });
  
  // Sort regular questions
  Object.keys(classifiedQuestions).forEach(level => {
    classifiedQuestions[level].sort((a, b) => {
      const aAge = a.min_age || 0;
      const bAge = b.min_age || 0;
      if (aAge !== bAge) return aAge - bAge;
      return (a.difficulty_order || 0) - (b.difficulty_order || 0);
    });
  });
  
  console.log(`🔴 Critical questions found: ${criticalQuestions.length}`);
  console.log(`📊 Question distribution:`);
  console.log(`  - Foundation: ${classifiedQuestions.foundation.length} available`);
  console.log(`  - Current: ${classifiedQuestions.current.length} available`);
  console.log(`  - Emerging: ${classifiedQuestions.emerging.length} available`);
  
  // STEP 2: Calculate composition
  const composition = getQuestionComposition(
    category, 
    targetQuestionCount, 
    criticalQuestions.length
  );
  
  console.log(`📌 Building with composition:`, composition);
  
  // STEP 3: Add questions in priority order
  
  // 3A: Add ALL critical questions first (up to limit)
  const criticalToAdd = criticalQuestions.slice(0, composition.critical);
  criticalToAdd.forEach(q => {
    const questionKey = q.question_text.toLowerCase().trim();
    if (!usedQuestionTexts.has(questionKey)) {
      usedQuestionTexts.add(questionKey);
      questions.push({
        id: `${category}_critical_${questions.length}_${Date.now()}_${Math.random()}`,
        question_text: q.question_text,
        category: category,
        skill_level: q.level,
        developmental_stage: getdevelopmentalStage(q.level, childAge),
        order: questions.length,
        source: 'database',
        min_age: q.min_age,
        max_age: q.max_age,
        developmental_level: q.developmental_level,
        difficulty_order: q.difficulty_order,
        red_flag_if_no: true,
        priority: 'critical',
        why_important: '⚠️ Important developmental milestone'
      });
    }
  });
  
  console.log(`✅ Added ${questions.length} critical questions`);
  
  // 3B: Add foundation questions
  let foundationAdded = 0;
  for (const q of classifiedQuestions.foundation) {
    if (foundationAdded >= composition.foundation) break;
    if (questions.length >= targetQuestionCount) break;
    
    const questionKey = q.question_text.toLowerCase().trim();
    if (!usedQuestionTexts.has(questionKey)) {
      usedQuestionTexts.add(questionKey);
      questions.push({
        id: `${category}_foundation_${foundationAdded}_${Date.now()}_${Math.random()}`,
        question_text: q.question_text,
        category: category,
        skill_level: 'foundation',
        developmental_stage: getdevelopmentalStage('foundation', childAge),
        order: questions.length,
        source: 'database',
        min_age: q.min_age,
        max_age: q.max_age,
        red_flag_if_no: q.red_flag_if_no || false,
        priority: 'regular',
        why_important: 'Foundation skill - great that they can do this!'
      });
      foundationAdded++;
    }
  }
  
  console.log(`✅ Added ${foundationAdded} foundation questions`);
  
  // 3C: Add current age questions
  let currentAdded = 0;
  for (const q of classifiedQuestions.current) {
    if (currentAdded >= composition.current) break;
    if (questions.length >= targetQuestionCount) break;
    
    const questionKey = q.question_text.toLowerCase().trim();
    if (!usedQuestionTexts.has(questionKey)) {
      usedQuestionTexts.add(questionKey);
      questions.push({
        id: `${category}_current_${currentAdded}_${Date.now()}_${Math.random()}`,
        question_text: q.question_text,
        category: category,
        skill_level: 'current',
        developmental_stage: getdevelopmentalStage('current', childAge),
        order: questions.length,
        source: 'database',
        min_age: q.min_age,
        max_age: q.max_age,
        red_flag_if_no: q.red_flag_if_no || false,
        priority: 'regular',
        why_important: 'Currently developing - practice helps!'
      });
      currentAdded++;
    }
  }
  
  console.log(`✅ Added ${currentAdded} current age questions`);
  
  // 3D: Add emerging questions (only 1-2 for young kids)
  let emergingAdded = 0;
  const maxEmerging = childAge <= 5 ? 1 : composition.emerging; // Only 1 emerging for young kids
  
  for (const q of classifiedQuestions.emerging) {
    if (emergingAdded >= maxEmerging) break;
    if (questions.length >= targetQuestionCount) break;
    
    const questionKey = q.question_text.toLowerCase().trim();
    if (!usedQuestionTexts.has(questionKey)) {
      usedQuestionTexts.add(questionKey);
      questions.push({
        id: `${category}_emerging_${emergingAdded}_${Date.now()}_${Math.random()}`,
        question_text: q.question_text,
        category: category,
        skill_level: 'emerging',
        developmental_stage: getdevelopmentalStage('emerging', childAge),
        order: questions.length,
        source: 'database',
        min_age: q.min_age,
        max_age: q.max_age,
        red_flag_if_no: false,
        priority: 'bonus',
        why_important: '✨ Next milestone - wonderful if yes, perfectly normal if no!'
      });
      emergingAdded++;
    }
  }
  
  console.log(`✅ Added ${emergingAdded} emerging questions`);
  
  // STEP 4: Fill any remaining slots with fallbacks if needed
  if (questions.length < targetQuestionCount) {
    console.log(`⚠️ Only ${questions.length} questions, adding fallbacks...`);
    const fallbacks = getFallbackQuestionsForCategory(category, childAge);
    
    for (const fallback of fallbacks) {
      if (questions.length >= targetQuestionCount) break;
      
      const questionKey = fallback.text.toLowerCase().trim();
      if (!usedQuestionTexts.has(questionKey)) {
        usedQuestionTexts.add(questionKey);
        questions.push({
          id: `${category}_fallback_${questions.length}_${Date.now()}`,
          question_text: fallback.text,
          category: category,
          skill_level: fallback.level || 'current',
          developmental_stage: 'Supplemental',
          order: questions.length,
          source: 'fallback',
          priority: 'supplemental',
          why_important: 'Additional assessment question'
        });
      }
    }
  }
  
  // FINAL: Sort by developmental progression for natural flow
  questions.sort((a, b) => {
    // Critical questions first
    if (a.priority === 'critical' && b.priority !== 'critical') return -1;
    if (b.priority === 'critical' && a.priority !== 'critical') return 1;
    
    // Then by age progression
    const aAge = a.min_age || 0;
    const bAge = b.min_age || 0;
    return aAge - bAge;
  });
  
  // Re-number after sorting
  questions.forEach((q, idx) => {
    q.order = idx;
  });
  
  console.log(`✅ ${category}: Generated ${questions.length} questions (target: ${targetQuestionCount})`);
  console.log(`   Composition: ${questions.filter(q => q.priority === 'critical').length} critical, ` +
              `${questions.filter(q => q.skill_level === 'foundation').length} foundation, ` +
              `${questions.filter(q => q.skill_level === 'current').length} current, ` +
              `${questions.filter(q => q.skill_level === 'emerging').length} emerging`);
  
  return questions;
};
// Helper function: Get developmental stage label
const getdevelopmentalStage = (level, childAge) => {
  if (level === 'foundation') {
    return `Foundation (0-${childAge-1} years)`;
  } else if (level === 'current') {
    return `Current (${childAge} years)`;
  } else {
    return `Emerging (${childAge+1}+ years)`;
  }
};

// Helper function: Get importance reason

const getImportanceReason = (level, question, childAge) => {
  // Parent-friendly, encouraging messages
  if (question.red_flag_if_no) {
    return '⚠️ Important developmental milestone';
  }
  
  if (question.subcategory === 'oral_motor') {
    return '🗣️ Oral-motor skill for speech development';
  }
  
  // Encouraging messages that don't stress parents
  if (level === 'foundation') {
    return `Foundation skill - great that they can do this!`;
  } else if (level === 'current') {
    return `Currently developing - practice helps!`;
  } else {
    return `Next milestone - wonderful if yes, perfectly normal if no`;
  }
};

// IMPROVED Distribution based on age

// IMPROVED Distribution based on age - REPLACE THE OLD ONE

/*const getQuestionDistribution = (childAge) => {
  // Parent-friendly distribution: More foundation, minimal emerging
  if (childAge <= 2) {
    return { foundation: 6, current: 3, emerging: 1 }; // Only 1 emerging
  } else if (childAge <= 3) {
    return { foundation: 5, current: 4, emerging: 1 }; // Only 1 emerging
  } else if (childAge <= 5) {
    return { foundation: 5, current: 4, emerging: 1 }; // Only 1 emerging
  } else if (childAge <= 8) {
    return { foundation: 4, current: 4, emerging: 2 }; // 2 emerging for older
  } else if (childAge <= 12) {
    return { foundation: 3, current: 5, emerging: 2 };
  } else {
    return { foundation: 2, current: 5, emerging: 3 };
  }
};*/

  // Get question distribution
 // IMPROVED Distribution based on age - REPLACE THE OLD ONE

  // Determine developmental level
  const determineDevelopmentalLevel = (question, childAge) => {
    if (question.developmental_level <= 2 || 
        question.skill_level === 'foundation' ||
        question.min_age < childAge - 1) {
      return 'foundation';
    } else if (question.developmental_level >= 5 || 
               question.skill_level === 'emerging' ||
               question.skill_level === 'advanced' ||
               question.min_age > childAge) {
      return 'emerging';
    } else {
      return 'current';
    }
  };

  // Get fallback questions
  const getFallbackQuestionsForCategory = (category, childAge) => {
    const progressions = {
      'Speech': {
        foundation: [
          { text: "Does your child make eye contact when speaking?", minAge: 0 },
          { text: "Can your child follow simple one-step instructions?", minAge: 1 },
          { text: "Does your child respond to their name?", minAge: 1 }
        ],
        current: [
          { text: "Can your child speak in 3-4 word sentences?", minAge: 3 },
          { text: "Does your child ask simple questions?", minAge: 3 },
          { text: "Can your child tell you about their day?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child tell a story with a beginning and end?", minAge: 5 },
          { text: "Does your child use past and future tense correctly?", minAge: 5 },
          { text: "Can your child explain why things happen?", minAge: 5 }
        ]
      },
      'Gross Motor': {
        foundation: [
          { text: "Can your child walk without support?", minAge: 1 },
          { text: "Can your child climb stairs with help?", minAge: 2 },
          { text: "Does your child have good balance when standing?", minAge: 2 }
        ],
        current: [
          { text: "Can your child jump with both feet?", minAge: 3 },
          { text: "Can your child pedal a tricycle?", minAge: 3 },
          { text: "Can your child catch a large ball?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child hop on one foot?", minAge: 5 },
          { text: "Can your child skip with alternating feet?", minAge: 6 },
          { text: "Can your child ride a bicycle?", minAge: 6 }
        ]
      },
      'Fine Motor': {
        foundation: [
          { text: "Can your child pick up small objects with fingers?", minAge: 1 },
          { text: "Can your child hold a crayon?", minAge: 2 },
          { text: "Can your child turn pages in a book?", minAge: 2 }
        ],
        current: [
          { text: "Can your child draw circles and lines?", minAge: 3 },
          { text: "Can your child use scissors?", minAge: 4 },
          { text: "Can your child button clothes?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child write their name?", minAge: 5 },
          { text: "Can your child tie shoelaces?", minAge: 6 },
          { text: "Can your child cut out shapes accurately?", minAge: 6 }
        ]
      },
      'Cognitive': {
        foundation: [
          { text: "Does your child recognize familiar objects?", minAge: 1 },
          { text: "Can your child sort objects by color?", minAge: 2 },
          { text: "Does your child understand 'same' and 'different'?", minAge: 3 }
        ],
        current: [
          { text: "Can your child count to 10?", minAge: 4 },
          { text: "Does your child know basic shapes?", minAge: 4 },
          { text: "Can your child complete simple puzzles?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child understand time concepts?", minAge: 5 },
          { text: "Does your child understand cause and effect?", minAge: 5 },
          { text: "Can your child solve simple problems?", minAge: 6 }
        ]
      },
      'Daily Living Skills': {
        foundation: [
          { text: "Can your child drink from a cup?", minAge: 2 },
          { text: "Can your child take off shoes?", minAge: 2 },
          { text: "Does your child cooperate with dressing?", minAge: 2 }
        ],
        current: [
          { text: "Can your child dress themselves?", minAge: 4 },
          { text: "Is your child toilet trained?", minAge: 3 },
          { text: "Can your child wash hands independently?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child prepare simple snacks?", minAge: 5 },
          { text: "Can your child manage personal hygiene?", minAge: 6 },
          { text: "Can your child pack their school bag?", minAge: 6 }
        ]
      },
      'Behaviour': {
        foundation: [
          { text: "Can your child be soothed when upset?", minAge: 1 },
          { text: "Does your child show affection?", minAge: 2 },
          { text: "Can your child play alongside other children?", minAge: 2 }
        ],
        current: [
          { text: "Can your child share toys?", minAge: 3 },
          { text: "Does your child follow simple rules?", minAge: 4 },
          { text: "Can your child express emotions with words?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child resolve conflicts with words?", minAge: 5 },
          { text: "Does your child show empathy for others?", minAge: 5 },
          { text: "Can your child control impulses?", minAge: 6 }
        ]
      },
      'School Readiness': {
        foundation: [
          { text: "Can your child separate from parents?", minAge: 3 },
          { text: "Can your child sit for short activities?", minAge: 3 },
          { text: "Does your child follow classroom routines?", minAge: 4 }
        ],
        current: [
          { text: "Can your child recognize letters?", minAge: 4 },
          { text: "Can your child write their name?", minAge: 5 },
          { text: "Does your child participate in group activities?", minAge: 4 }
        ],
        emerging: [
          { text: "Can your child read simple words?", minAge: 6 },
          { text: "Can your child do basic math?", minAge: 6 },
          { text: "Can your child work independently?", minAge: 6 }
        ]
      }
    };

    const categoryProgressions = progressions[category] || progressions['Cognitive'];
    const questions = [];
    
    categoryProgressions.foundation.forEach(q => {
      if (q.minAge <= childAge) {
        questions.push({ ...q, level: 'foundation' });
      }
    });
    
    categoryProgressions.current.forEach(q => {
      if (q.minAge <= childAge + 1 && q.minAge >= childAge - 1) {
        questions.push({ ...q, level: 'current' });
      }
    });
    
    categoryProgressions.emerging.forEach(q => {
      if (q.minAge <= childAge + 2) {
        questions.push({ ...q, level: 'emerging' });
      }
    });
    
    return questions;
  };

  // Map database categories
  const mapDatabaseCategory = (dbCategory) => {
    if (!dbCategory) return 'Cognitive';
    
    const category = dbCategory.toLowerCase().trim();
    
    const mappings = {
      'speech': 'Speech',
      'language': 'Speech',
      'speech_language': 'Speech',
      'gross_motor': 'Gross Motor',
      'gross motor': 'Gross Motor',
      'balance_posture': 'Gross Motor',
      'fine_motor': 'Fine Motor',
      'fine motor': 'Fine Motor',
      'sensory_processing': 'Fine Motor',
      'cognitive': 'Cognitive',
      'thinking': 'Cognitive',
      'memory': 'Cognitive',
      'feeding': 'Daily Living Skills',
      'daily_living': 'Daily Living Skills',
      'self_care': 'Daily Living Skills',
      'behaviour': 'Behaviour',
      'behavior': 'Behaviour',
      'social_emotional': 'Behaviour',
      'attention_emotions': 'Behaviour',
      'school_readiness': 'School Readiness',
      'school readiness': 'School Readiness',
      'academic': 'School Readiness'
    };
    
    if (mappings[category]) {
      return mappings[category];
    }
    
    if (category.includes('speech') || category.includes('language')) return 'Speech';
    if (category.includes('gross')) return 'Gross Motor';
    if (category.includes('fine')) return 'Fine Motor';
    if (category.includes('cogn')) return 'Cognitive';
    if (category.includes('feed') || category.includes('daily') || category.includes('living')) return 'Daily Living Skills';
    if (category.includes('behav') || category.includes('social') || category.includes('emotion')) return 'Behaviour';
    if (category.includes('school') || category.includes('academic')) return 'School Readiness';
    
    console.log(`Unmapped category: "${dbCategory}" - defaulting to Cognitive`);
    return 'Cognitive';
  };

  // Generate fallback questions
  const generateFallbackQuestions = (childAge) => {
    console.log("Using fallback questions");
    const categories = ['Speech', 'Gross Motor', 'Fine Motor', 'Cognitive', 'Daily Living Skills', 'Behaviour'];
    if (childAge >= 4) categories.push('School Readiness');
    
    const fallbackSets = {};
    categories.forEach(cat => {
      fallbackSets[cat] = buildSmartQuestionSet(cat, childAge, []);
    });
    
    setSmartQuestions(fallbackSets);
    setCategories(categories);
    setLoading(false);
  };

  // [Rest of your JSX remains exactly the same]
  
  // Loading state

  if (loading) {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
             style={{ background: 'radial-gradient(circle, rgba(107, 91, 149, 0.4), transparent)' }}></div>
      </div>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
                 style={{ 
                   background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
                   animation: 'pulse 2s ease-in-out infinite'
                 }}>
              <span className="text-3xl">🌟</span>
            </div>
          </div>
          <p style={{ 
            color: '#6b5b95',
            fontSize: '16px',
            fontWeight: '300',
            letterSpacing: '0.05em'
          }}>
            Preparing personalized assessment...
          </p>
        </div>
      </div>
    </div>
  );
}

  // Error state
  if (error) {
    return (
<div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}>
<div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-red-800 font-semibold mb-2 text-lg">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => navigate("/info-form")}
              className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate progress
  const totalQuestions = Object.values(smartQuestions).reduce((acc, questions) => acc + questions.length, 0);
  const answeredQuestions = Object.keys(formData).length;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  
  // Get current category and questions
  const currentCategory = categories[currentCategoryIndex];
  const currentQuestions = smartQuestions[currentCategory] || [];
  
  // Calculate questions answered in current category
  const currentCategoryAnswered = currentQuestions.filter(q => formData[q.id]).length;
  const allCurrentAnswered = currentCategoryAnswered === currentQuestions.length;

  return (
<div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}>
    {/* Animated Background - Consistent with IntroPage/InfoForm */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
     style={{ background: 'radial-gradient(circle, rgba(107, 91, 149, 0.4), transparent)' }}></div>
<div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
     style={{ background: 'radial-gradient(circle, rgba(212, 165, 116, 0.4), transparent)' }}></div>
            </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header */}


    <nav className="relative z-20 bg-transparent"> {/* Remove white background */}
  <div className="max-w-7xl mx-auto px-6 lg:px-12">
    <div className="flex justify-between items-center py-3"> {/* Reduced padding from py-4 to py-3 */}
      {/* Logo Section - Make more compact */}
      <div className="flex items-center gap-2"> {/* Reduced gap from 3 to 2 */}
        <svg width="40" height="40" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"> {/* Reduced from 50x50 to 40x40 */}
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c6fa7"/>
              <stop offset="100%" stopColor="#6b5b95"/>
            </linearGradient>
          </defs>
          <path d="M100 20 Q130 20 150 40 T170 90 Q170 120 150 140 T100 160 Q70 160 50 140 T30 90 Q30 60 50 40 T100 20" 
                fill="url(#logoGradient)" opacity="0.9"/>
          <path d="M90 60 Q100 50 110 60 L115 70 Q120 80 115 90 L110 95 Q100 100 90 95 L85 90 Q80 80 85 70 Z" 
                fill="white"/>
          <path d="M75 75 Q80 70 85 75 L88 80 Q90 85 88 90 L85 92 Q80 95 75 92 L72 90 Q70 85 72 80 Z" 
                fill="white" opacity="0.8"/>
          <path d="M85 95 L85 120 Q85 130 90 135 L95 140" 
                stroke="white" strokeWidth="8" fill="none" strokeLinecap="round"/>
        </svg>
        <div>
          <h1 className="text-xl font-light tracking-wider" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
            Smart Child Buddy
          </h1>
          <p className="text-xs tracking-widest uppercase" style={{ color: '#8b7f92', letterSpacing: '0.15em' }}>
            Assessment in Progress
          </p>
        </div>
      </div>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="sm:hidden p-2 rounded-lg"
        style={{ background: 'rgba(107, 91, 149, 0.1)' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="#6b5b95" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>
  </div>
</nav> 
    


{/* Header Card with Progress and Categories */}
<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6 mt-6">
  <div className="p-4 sm:p-6"  
     style={{ 
       background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
     }}>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-white">
    <div>
      <h1 className="text-2xl font-light mb-1"  
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
        Personalized Assessment
      </h1>
      <p className="opacity-90 text-sm">  {/* Added text-sm for smaller text */}
        {assessmentData?.child_first_name} • {assessmentData?.child_age} years old
      </p>
    </div>
    <div className="mt-3 sm:mt-0">  
      <div className="text-right">
        <p className="text-xl font-light">{Math.round(progress)}%</p>  
        <p className="text-xs opacity-90">Complete</p>  
      </div>
    </div>
  </div>
  
  {/* Overall Progress Bar */}
  <div className="mt-4">  
    <div className="flex justify-between text-xs mb-1 opacity-90">  
      <span>Overall Progress</span>
      <span>{answeredQuestions} of {totalQuestions} questions</span>
    </div>
    <div className="w-full bg-white/20 rounded-full h-2"> 
      <div 
        className="h-full rounded-full transition-all duration-500"
        style={{ 
          width: `${progress}%`,
          background: 'linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.9))'
        }}
      ></div>
    </div>
  </div>
</div>

  {/* Desktop Category Navigation */}
  <div className="hidden sm:block p-6" style={{ background: 'rgba(107, 91, 149, 0.03)' }}>
    <div className="flex flex-wrap gap-3">
      {categories.map((cat, idx) => {
        const categoryQuestions = smartQuestions[cat] || [];
        const answered = categoryQuestions.filter(q => formData[q.id]).length;
        const isComplete = answered === categoryQuestions.length && categoryQuestions.length > 0;
        const isCurrent = idx === currentCategoryIndex;
        
        return (
          <button
            key={cat}
            onClick={() => handleCategoryClick(idx)}
            className={`px-4 py-2.5 rounded-full font-medium transition-all flex items-center gap-2 ${
              isCurrent 
                ? 'shadow-lg transform scale-105' 
                : 'hover:shadow-md'
            }`}
            style={{ 
              background: isCurrent 
                ? 'linear-gradient(135deg, #6b5b95, #87a08e)'
                : isComplete
                ? 'linear-gradient(135deg, #87a08e, #6b5b95)'
                : answered > 0
                ? 'rgba(212, 165, 116, 0.15)'
                : 'white',
              color: isCurrent || isComplete ? 'white' : '#4a5568',
              border: isCurrent || isComplete ? 'none' : '2px solid #e2e8f0',
              fontSize: '14px'
            }}
          >
            <span>{cat}</span>
            {isComplete && <span>✓</span>}
            {!isComplete && answered > 0 && (
              <span className="text-xs opacity-75">({answered}/{categoryQuestions.length})</span>
            )}
          </button>
        );
      })}
    </div>
  </div>

  {/* Mobile Category Menu */}
  {isMobileMenuOpen && (
    <div className="sm:hidden p-4" style={{ background: 'rgba(107, 91, 149, 0.03)' }}>
      <div className="space-y-2">
        {categories.map((cat, idx) => {
          const categoryQuestions = smartQuestions[cat] || [];
          const answered = categoryQuestions.filter(q => formData[q.id]).length;
          const isComplete = answered === categoryQuestions.length && categoryQuestions.length > 0;
          const isCurrent = idx === currentCategoryIndex;
          
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(idx)}
              className="w-full text-left px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-between"
              style={{ 
                background: isCurrent 
                  ? 'linear-gradient(135deg, #6b5b95, #87a08e)'
                  : isComplete
                  ? 'linear-gradient(135deg, #87a08e, #6b5b95)'
                  : 'white',
                color: isCurrent || isComplete ? 'white' : '#4a5568',
                border: isCurrent || isComplete ? 'none' : '1px solid #e2e8f0'
              }}
            >
            <div className="flex items-center gap-3">
  <span>{categoryIcons[cat]}</span>
  <span>{cat}</span>
</div>

              {isComplete && <span>✓</span>}
              {!isComplete && answered > 0 && (
                <span className="text-xs opacity-75">({answered}/{categoryQuestions.length})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  )}
</div>
        {/* Current Category Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
       
<div className="rounded-xl p-4 sm:p-6"> 
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
    <p className="text-base sm:text-lg font-medium text-gray-700">
      Section {currentCategoryIndex + 1} of {categories.length}
    </p>
    <p className="text-sm text-gray-500">
      {currentCategoryAnswered}/{currentQuestions.length} answered
      {currentQuestions.filter(q => q.priority === 'critical').length > 0 && (
        <span className="ml-2 text-red-600">
          ({currentQuestions.filter(q => q.priority === 'critical').length} critical)
        </span>
      )}
    </p>
  </div>
 
  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
    <div 
      className="bg-purple-500 h-full rounded-full transition-all duration-300"
      style={{ width: `${(currentCategoryAnswered / currentQuestions.length) * 100}%` }}
    ></div>
  </div>
</div>
          {/* Questions */}
          <div className="space-y-4 sm:space-y-6">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="pb-4 border-b border-gray-100 last:border-0">
                {/* Question Header */}
               {/* Question Header - Show priority indicators */}
<div className="flex flex-wrap items-center gap-2 mb-2">
  <span className="font-bold text-purple-700 text-sm sm:text-base">{idx + 1}.</span>
  
  {/* Priority indicator */}
  {q.priority === 'critical' && (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
      ⚠️ Important
    </span>
  )}
  
  {/* Show order for debugging - remove in production */}
  {process.env.NODE_ENV === 'development' && (
    <span className="text-xs text-gray-400">
      [{q.priority}]
    </span>
  )}
</div>
                
                {/* Question Text */}
                <div className="pl-0 sm:pl-8 mb-3">

<p className="text-sm sm:text-base text-gray-800 mb-2">
  {q.question_text}
  {/* Add reassuring message for advanced questions */}
  {q.skill_level === 'emerging' && (
    <span className="block text-xs text-green-600 italic mt-1">
      ✨ Next milestone - wonderful if yes, perfectly normal if no!
    </span>
  )}
  {q.skill_level === 'foundation' && formData[q.id] === 'Yes' && (
    <span className="block text-xs text-blue-600 italic mt-1">
      ✅ Great foundation skill!
    </span>
  )}
</p>                  
                  {/* Why Important (hidden on mobile by default) */}
                  {q.why_important && (
                    <details className="sm:hidden">
                      <summary className="text-xs text-gray-500 italic cursor-pointer">ℹ️ Why important?</summary>
                      <p className="text-xs text-gray-500 italic mt-1">{q.why_important}</p>
                    </details>
                  )}
                  {q.why_important && !q.why_important.includes('⚠️') && (
  <p className="hidden sm:block text-xs text-gray-500 italic">
    💡 {q.why_important}
  </p>
)}
                </div>
                
                {/* Answer Options - Mobile Optimized */}
               
               {/* Answer Options - Mobile Optimized */}
<div className="grid grid-cols-3 gap-2 sm:gap-3 pl-0 sm:pl-8">
  {['Yes', 'No', 'Sometimes'].map((option) => (
    <label 
      key={option} 
      className="relative cursor-pointer"
    >
      <input
        type="radio"
        name={`question_${q.id}`}
        value={option}
        checked={formData[q.id] === option}
        onChange={() => handleChange(q.id, option)}
        className="sr-only"
      />
      <div className={`
        text-center py-3 px-4 rounded-lg font-medium transition-all
        ${formData[q.id] === option 
          ? 'transform scale-105 shadow-md' 
          : 'hover:shadow-sm'
        }
      `}
      style={{ 
        background: formData[q.id] === option 
          ? option === 'Yes' 
            ? 'linear-gradient(135deg, #87a08e, #6b5b95)'
            : option === 'No' 
            ? 'linear-gradient(135deg, #d97070, #e09090)'
            : 'linear-gradient(135deg, #d4a574, #87a08e)'
          : 'white',
        color: formData[q.id] === option ? 'white' : '#4a5568',
        border: formData[q.id] === option ? 'none' : '2px solid #e2e8f0',
        fontSize: '14px'
      }}>
        {option}
      </div>
    </label>
  ))}
</div>

              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentCategoryIndex === 0}
             className={`w-full sm:w-auto px-6 py-3 rounded-full font-medium transition-all order-2 sm:order-1 ${
  currentCategoryIndex === 0
    ? 'cursor-not-allowed opacity-50'
    : 'hover:shadow-lg hover:scale-105'
}`}
style={{ 
  background: currentCategoryIndex === 0
    ? 'linear-gradient(135deg, #e2e8f0, #cbd5e0)'
    : 'linear-gradient(135deg, #8b8b8b, #6b6b6b)',
  color: 'white',
  fontSize: '14px',
  letterSpacing: '0.025em'
}}
            >
              ← Previous
            </button>

            {/* Status Message - Hidden on mobile to save space */}
            <div className="hidden sm:block text-center order-2">
              <p className="text-sm text-gray-600">
                {allCurrentAnswered ? (
                  <span className="text-green-600 font-medium">✔ Section Complete</span>
                ) : (
                  <span className="text-yellow-600">Please answer all questions</span>
                )}
              </p>
            </div>

            {/* Next/Submit Button */}
            {currentCategoryIndex === categories.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answeredQuestions === 0}
            
                className={`w-full sm:w-auto px-8 py-3 rounded-full font-semibold transition-all transform ${
  answeredQuestions === 0
    ? 'cursor-not-allowed opacity-50'
    : 'hover:shadow-xl hover:scale-105 active:scale-95'
}`}
style={{ 
  background: answeredQuestions === 0
    ? 'linear-gradient(135deg, #e2e8f0, #cbd5e0)'
    : 'linear-gradient(135deg, #6b5b95, #87a08e)',
  color: 'white',
  fontSize: '14px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
}}


              >
                Submit Assessment →
              </button>
            ) : (
              <button
                onClick={handleNext}
className="w-full sm:w-auto px-8 py-3 rounded-full font-semibold hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
style={{ 
  background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
  color: 'white',
  fontSize: '14px',
  letterSpacing: '0.05em',
  textTransform: 'uppercase'
}}
>
                Next Section →
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats - Simplified for mobile */}
       {/* Quick Stats - Updated for new counts */}
<div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
  <h3 className="text-base sm:text-lg font-semibold text-purple-700 mb-3">Assessment Summary</h3>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-purple-600">{categories.length}</p>
      <p className="text-xs sm:text-sm text-gray-600">Sections</p>
    </div>
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-green-600">{answeredQuestions}</p>
      <p className="text-xs sm:text-sm text-gray-600">Answered</p>
    </div>
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-yellow-600">{totalQuestions - answeredQuestions}</p>
      <p className="text-xs sm:text-sm text-gray-600">Remaining</p>
    </div>
    <div className="text-center">
      <p className="text-xl sm:text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
      <p className="text-xs sm:text-sm text-gray-600">Complete</p>
    </div>
  </div>
  
  {/* Add time estimate */}
  <div className="mt-3 pt-3 border-t text-center">
    <p className="text-xs text-gray-500">
      Estimated time: ~{Math.round(totalQuestions * 0.5)} minutes
    </p>
  </div>
</div>
      </div>

      {/* Animation Styles - Consistent with IntroPage/InfoForm */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(-120deg);
          }
          66% {
            transform: translateY(-20px) rotate(-240deg);
          }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
};

export default AssessmentPage;