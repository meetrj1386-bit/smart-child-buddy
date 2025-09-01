// AssessmentPage.jsx - Complete Fixed Version with No Duplicates
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
  const navigate = useNavigate();

  // Fetch assessment data
  useEffect(() => {
    const fetchAssessmentData = async () => {
      if (!assessmentId) {
        setError("No assessment ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("assessments")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) {
          setError(`Error fetching assessment: ${error.message}`);
          setLoading(false);
          return;
        }

        if (data) {
          setAssessmentData(data);
          
          // Add timeout to prevent infinite loading
          const questionTimeout = setTimeout(() => {
            console.error("Question generation timed out, using fallback");
            generateFallbackQuestions(data.child_age);
            setLoading(false);
          }, 5000); // 5 second timeout
          
          try {
            // Try to generate smart questions
            await generateSmartQuestions(data.child_age);
            clearTimeout(questionTimeout);
          } catch (error) {
            console.error("Error generating questions:", error);
            clearTimeout(questionTimeout);
            generateFallbackQuestions(data.child_age);
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setError("Failed to load assessment");
      } finally {
        // Always set loading to false
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessmentId]);

  // FIXED: Complete generateSmartQuestions with NO DUPLICATES
  const generateSmartQuestions = async (childAge) => {
    console.log("🧠 Starting Smart Assessment for age:", childAge);
    
    try {
      // Load questions from database
      const { data: dbQuestions, error: dbError } = await supabase
        .from("assessment_questions")
        .select("*")
        .eq("is_active", true)
        .order("developmental_level", { ascending: true })
        .order("difficulty_order", { ascending: true });
      
      console.log(`📊 Loaded ${dbQuestions?.length || 0} questions from database`);
      
      // Define categories based on age
      const categories = ['Speech', 'Gross Motor', 'Fine Motor', 'Cognitive', 'Daily Living Skills', 'Behaviour'];
      if (childAge >= 4) categories.push('School Readiness');
      
      const smartQuestionSets = {};
      
      // Generate questions for each category
      for (const category of categories) {
        smartQuestionSets[category] = buildSmartQuestionSet(
          category, 
          childAge, 
          dbQuestions
        );
      }
      
      setSmartQuestions(smartQuestionSets);
      setCategories(categories);
      setLoading(false);
      
    } catch (error) {
      console.error("Error in smart question generation:", error);
      generateFallbackQuestions(childAge);
    }
  };

  // NEW: Build smart question set without duplicates
  const buildSmartQuestionSet = (category, childAge, dbQuestions = []) => {
    const questions = [];
    const usedQuestionTexts = new Set(); // Track used questions to prevent duplicates
    
    // Get the distribution for this age
    const distribution = getQuestionDistribution(childAge);
    
    // Get all available questions for this category
    const categoryDbQuestions = dbQuestions.filter(q => 
      mapDatabaseCategory(q.category) === category
    );
    
    // Get fallback questions for this category
    const fallbackQuestions = getFallbackQuestionsForCategory(category, childAge);
    
    // Combine all available questions
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
    
    // Build question set based on distribution
    ['foundation', 'current', 'emerging'].forEach(level => {
      const targetCount = distribution[level];
      const levelQuestions = allAvailableQuestions.filter(q => q.level === level);
      
      let addedCount = 0;
      for (const q of levelQuestions) {
        // Check if we already have this question (prevent duplicates)
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
      
      // If we don't have enough questions for this level, note it
      if (addedCount < targetCount) {
        console.log(`⚠️ Only found ${addedCount}/${targetCount} ${level} questions for ${category}`);
      }
    });
    
    // If we have less than 10 questions total, add generic ones (but check for duplicates)
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
        break; // Avoid infinite loop if we can't add more
      }
    }
    
    console.log(`✅ ${category}: ${questions.length} unique questions generated`);
    return questions.slice(0, 10); // Maximum 10 questions
  };

  // NEW: Get question distribution based on age
  const getQuestionDistribution = (childAge) => {
    if (childAge <= 2) {
      return { foundation: 5, current: 3, emerging: 2 };
    } else if (childAge === 3) {
      return { foundation: 4, current: 4, emerging: 2 };
    } else if (childAge === 4) {
      return { foundation: 3, current: 4, emerging: 3 };
    } else if (childAge === 5) {
      return { foundation: 2, current: 5, emerging: 3 };
    } else {
      return { foundation: 2, current: 4, emerging: 4 };
    }
  };

  // NEW: Determine developmental level for a question
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

  // NEW: Get fallback questions for category
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
    
    // Add foundation questions
    categoryProgressions.foundation.forEach(q => {
      if (q.minAge <= childAge) {
        questions.push({ ...q, level: 'foundation' });
      }
    });
    
    // Add current questions
    categoryProgressions.current.forEach(q => {
      if (q.minAge <= childAge + 1 && q.minAge >= childAge - 1) {
        questions.push({ ...q, level: 'current' });
      }
    });
    
    // Add emerging questions
    categoryProgressions.emerging.forEach(q => {
      if (q.minAge <= childAge + 2) {
        questions.push({ ...q, level: 'emerging' });
      }
    });
    
    return questions;
  };

  // FIXED: Map database categories properly
  const mapDatabaseCategory = (dbCategory) => {
    if (!dbCategory) return 'Cognitive';
    
    const category = dbCategory.toLowerCase().trim();
    
    // Direct mappings
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
    
    // Check for mapping
    if (mappings[category]) {
      return mappings[category];
    }
    
    // Check for partial matches
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

  // Handle answer changes
  const handleChange = (qid, value) => {
    setFormData({ ...formData, [qid]: value });
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleCategoryClick = (index) => {
    setCurrentCategoryIndex(index);
    window.scrollTo(0, 0);
  };

  // ENHANCED: Handle submission with comprehensive report generation
  // Replace the handleSubmit function in AssessmentPage.jsx with this version
// that matches your exact database schema:

// Enhanced handleSubmit for AssessmentPage.jsx
// This version uses smart scoring and AI-powered report generation

const handleSubmit = async () => {
  if (!assessmentId) return;

  console.log("🚀 Starting Smart AI-Powered Report Generation with Comprehensive Reflex Analysis...");
  
  setLoading(true);
  
  try {
    // Step 1: Import smart systems AND comprehensive reflex analyzer
    console.log("📚 Loading smart scoring and reflex systems...");
    const { 
      analyzeResponsesWithSmartScoring, 
      mapResponsesToReflexesWithSmartScoring 
    } = await import('../utils/smartScoringSystem');
    
    const { AIReportGenerator } = await import('../utils/aiReportGenerator');
    const { EnhancedAIContext } = await import('../utils/enhancedAIContext');
    
    // IMPORTANT: Import the comprehensive reflex analyzer
    const { generateComprehensiveReflexAnalysis } = await import('../utils/comprehensiveReflexAnalysis');
    
    // Step 2: Check for uploaded files FIRST
    console.log("📄 Checking for uploaded documents...");
    const { data: uploadedFiles } = await supabase
      .from('uploaded_files')
      .select('*')
      .eq('assessment_id', assessmentId);

    if (uploadedFiles && uploadedFiles.length > 0) {
      console.log("📄 Found", uploadedFiles.length, "uploaded files");
    }
    
    // Step 3: Prepare enhanced context with parent inputs
    console.log("📝 Processing parent concerns and documents...");
    const contextGenerator = new EnhancedAIContext();
    const enhancedContext = await contextGenerator.prepareComprehensiveContext(
      assessmentData,
      formData,
      smartQuestions,
      uploadedFiles || []
    );
    
    // Step 4: Perform smart analysis (handles reverse scoring)
    console.log("🧠 Performing intelligent scoring analysis...");
    const smartAnalysis = analyzeResponsesWithSmartScoring(formData, smartQuestions);
    
    console.log("🔍 Smart scoring complete. Red flags:", smartAnalysis.redFlags.length);
    
    // Step 5: COMPREHENSIVE REFLEX ANALYSIS - THE KEY PART!
    console.log("🏥 Generating COMPREHENSIVE primitive reflex analysis...");
    
    // Use BOTH systems - your existing one for initial detection
    const basicReflexAnalysis = mapResponsesToReflexesWithSmartScoring(formData, smartQuestions);
    
    // AND the comprehensive system for detailed, parent-friendly analysis
    const comprehensiveReflexAnalysis = await generateComprehensiveReflexAnalysis(
      assessmentId,
      formData,
      assessmentData.child_age,
      assessmentData.main_concerns || assessmentData.parent_concerns || 'General developmental concerns'
    );
    
    console.log("✨ Comprehensive reflex analysis complete!");
    console.log("📊 Retained reflexes identified:", comprehensiveReflexAnalysis.retainedReflexes?.length || 0);
    console.log("💪 Total exercises prescribed:", comprehensiveReflexAnalysis.totalExercises || 0);
    console.log("💬 Personalized parent message generated:", !!comprehensiveReflexAnalysis.personalizedExplanation);
    
    // Enhance reflexes with comprehensive database if basic analysis found any
    if (basicReflexAnalysis.reflexes && basicReflexAnalysis.reflexes.length > 0) {
      const COMPREHENSIVE_REFLEX_DATABASE = {
        moro: { exercises: [], description: "Startle reflex" },
        atnr: { exercises: [], description: "Fencing reflex" },
        stnr: { exercises: [], description: "Crawling reflex" },
        spinal_galant: { exercises: [], description: "Hip wiggle reflex" },
        tlr: { exercises: [], description: "Balance reflex" },
        palmar: { exercises: [], description: "Grasp reflex" }
      };
      
      basicReflexAnalysis.reflexes = basicReflexAnalysis.reflexes.map(reflex => {
        const reflexKey = reflex.name?.toLowerCase().replace(/\s+/g, '_');
        const comprehensiveData = COMPREHENSIVE_REFLEX_DATABASE[reflexKey];
        
        if (comprehensiveData) {
          console.log(`📚 Enhancing ${reflex.name} with comprehensive data`);
          return {
            ...reflex,
            ...comprehensiveData,
            retentionLevel: reflex.retentionLevel || (reflex.severity * 10),
            matchedSymptoms: reflex.matchedSymptoms || []
          };
        }
        return reflex;
      });
    }
    
    // Step 6: Generate comprehensive AI report with enhanced context
    console.log("🤖 Generating AI-powered comprehensive report...");
    const aiGenerator = new AIReportGenerator();
    
    // Generate the comprehensive report
    const comprehensiveReport = await aiGenerator.generateComprehensiveReport(
      assessmentData,
      formData,
      smartQuestions,
      uploadedFiles || []
    );
    
    // Add parent context to the report
    comprehensiveReport.parentContext = enhancedContext;
    
    console.log("📊 AI report generated successfully!");
    
    // Step 7: Calculate final scores for database
    const categoryScores = {};
    let totalScore = 0;
    let totalCategories = 0;
    
    Object.entries(smartAnalysis.categoryScores).forEach(([category, data]) => {
      categoryScores[category] = {
        percentage: data.percentage,
        rawScore: data.rawScore,
        maxScore: data.maxScore,
        interpretation: data.interpretation,
        concerns: data.concerns.length,
        strengths: data.strengths.length
      };
      totalScore += data.percentage;
      totalCategories++;
    });
    
    const overallScore = totalCategories > 0 ? Math.round(totalScore / totalCategories) : 0;
    
    // Step 8: Create a COMPREHENSIVE structured report for the database
    const structuredReport = {
      // Child Information (for SmartReportPage)
      childInfo: {
        name: `${assessmentData.child_first_name} ${assessmentData.child_last_name}`,
        firstName: assessmentData.child_first_name,
        lastName: assessmentData.child_last_name,
        age: assessmentData.child_age,
        gender: assessmentData.child_gender,
        assessmentDate: new Date().toLocaleDateString()
      },
      
      // Executive Summary
      executiveSummary: comprehensiveReport.executiveSummary || {
        overallStatus: smartAnalysis.overallStatus || 'Assessment Complete',
        developmentalAge: comprehensiveReport.executiveSummary?.developmentalAge || assessmentData.child_age,
        keyFindings: comprehensiveReport.executiveSummary?.keyFindings || [],
        urgentActions: comprehensiveReport.executiveSummary?.urgentActions || []
      },
      
      // Developmental Analysis
      developmentalAnalysis: {
        overall: {
          overallStatus: smartAnalysis.overallStatus || 'Assessment Complete',
          developmentalAge: comprehensiveReport.executiveSummary?.developmentalAge || assessmentData.child_age,
          chronologicalAge: assessmentData.child_age,
          strengths: smartAnalysis.strengths?.map(s => s.category) || [],
          priorityAreas: smartAnalysis.redFlags?.map(rf => rf.category) || [],
          immediateActions: comprehensiveReport.executiveSummary?.urgentActions || []
        },
        ...Object.entries(categoryScores).reduce((acc, [category, scores]) => {
          acc[category] = {
            scores: {
              foundation: { percentage: scores.percentage },
              current: { percentage: scores.percentage },
              emerging: { percentage: Math.max(0, scores.percentage - 20) }
            },
            rootCause: smartAnalysis.categoryScores[category]?.rootCause,
            recommendations: smartAnalysis.categoryScores[category]?.recommendations || [],
            strengths: smartAnalysis.categoryScores[category]?.strengths || [],
            concerns: smartAnalysis.categoryScores[category]?.concerns || []
          };
          return acc;
        }, {})
      },
      
      // COMPREHENSIVE REFLEX ANALYSIS - This is the enhanced version
      reflexAnalysis: comprehensiveReflexAnalysis,
      
      // Also keep the basic reflex data for backward compatibility
      basicReflexAnalysis: {
        summary: basicReflexAnalysis.summary || 'Reflex analysis complete',
        reflexes: basicReflexAnalysis.reflexes || [],
        priorityReflexes: basicReflexAnalysis.priorityReflexes || []
      },
      
      // Parent Context
      parentContext: {
        mainConcerns: assessmentData.main_concerns || assessmentData.parent_concerns || '',
        uploadedDocuments: uploadedFiles?.length || 0,
        documentsSummary: enhancedContext.uploadedDocuments?.summary || 'No documents'
      },
      
      // Full AI Report
      aiReport: comprehensiveReport,
      
      // Action Plans
      interventionPlan: comprehensiveReport.interventionPlan || {},
      monthlyRoadmap: comprehensiveReport.interventionPlan?.monthlyRoadmap || {},
      
      // Add the comprehensive reflex integration plan
      reflexIntegrationPlan: {
        dailySchedule: comprehensiveReflexAnalysis.weekByWeekPlan || {},
        expectedImprovements: comprehensiveReflexAnalysis.expectedImprovements || {},
        successStories: comprehensiveReflexAnalysis.successStories || [],
        totalDailyTime: comprehensiveReflexAnalysis.estimatedTimeDaily || '20 minutes'
      }
    };
    
    // Step 9: Save everything to database
    console.log("💾 Saving comprehensive assessment data with enhanced reflex analysis...");
    
    const updateData = {
      responses: formData,
      status: "completed",
      category_scores: categoryScores,
      overall_score: overallScore,
      assessment_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
      
      // Store the structured report
      ai_report: structuredReport,
      
      // Store the developmental analysis separately for SmartReportPage
      developmental_analysis: structuredReport.developmentalAnalysis,
      
      // IMPORTANT: Store the COMPREHENSIVE reflex analysis
      reflex_analysis: comprehensiveReflexAnalysis,
      
      // Also store parent concerns for reflex analysis to use
      parent_concerns: assessmentData.main_concerns || assessmentData.parent_concerns || '',
      
      // Store raw analyses for debugging
      narrative_json: {
        smartAnalysis: smartAnalysis,
        basicReflexAnalysis: basicReflexAnalysis,
        comprehensiveReflexAnalysis: comprehensiveReflexAnalysis,
        comprehensiveReport: comprehensiveReport,
        timestamp: new Date().toISOString()
      },
      
      is_gpt_generated: !!aiGenerator.apiKey,
      has_comprehensive_reflex_analysis: true // Flag to indicate enhanced analysis
    };
    
    // Add specific scores if categories exist
    if (categoryScores['School Readiness']) {
      updateData.school_readiness_score = categoryScores['School Readiness'].percentage;
    }
    if (categoryScores['Daily Living Skills']) {
      updateData.self_care_score = categoryScores['Daily Living Skills'].percentage;
    }
    
    const { error: updateError } = await supabase
      .from("assessments")
      .update(updateData)
      .eq("id", assessmentId);

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }
    
    console.log("✅ All data saved successfully!");
    console.log("📝 Parent concerns processed:", assessmentData.main_concerns ? 'Yes' : 'No');
    console.log("📄 Documents analyzed:", uploadedFiles?.length || 0);
    console.log("🧠 Comprehensive reflex exercises:", comprehensiveReflexAnalysis.totalExercises || 0);
    console.log("📅 Week-by-week plan generated:", comprehensiveReflexAnalysis.weekByWeekPlan ? 'Yes' : 'No');
    console.log("💬 Personalized parent message:", comprehensiveReflexAnalysis.personalizedExplanation ? 'Yes' : 'No');
    console.log("🌟 Success stories included:", comprehensiveReflexAnalysis.successStories?.length || 0);
    
    // Step 10: Navigate to report page
    console.log("🚀 Navigating to comprehensive smart report page...");
    navigate(`/report/${assessmentId}`);
    
  } catch (error) {
    console.error("Error in smart assessment submission:", error);
    setLoading(false);
    
    // Provide helpful error message
    let errorMessage = "We encountered an issue generating your smart report.\n\n";
    
    if (error.message?.includes('comprehensiveReflexAnalysis')) {
      errorMessage += "⚠️ Comprehensive reflex analysis system not found.\n";
      errorMessage += "Please ensure comprehensiveReflexAnalysis.js is in utils folder.\n\n";
    }
    
    if (error.message?.includes('smartScoringSystem')) {
      errorMessage += "⚠️ Smart scoring system not found.\n";
      errorMessage += "Please ensure smartScoringSystem.js is in utils folder.\n\n";
    }
    
    if (error.message?.includes('aiReportGenerator')) {
      errorMessage += "⚠️ AI report generator not available.\n";
      errorMessage += "Check if OpenAI API key is set.\n\n";
    }
    
    if (error.message?.includes('API key')) {
      errorMessage += "⚠️ OpenAI API key not configured.\n";
      errorMessage += "Add VITE_OPENAI_API_KEY to your .env file.\n\n";
    }
    
    errorMessage += `Error details: ${error.message}`;
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

// Fallback basic submit if smart systems aren't available
const handleBasicSubmit = async () => {
  console.log("📝 Using basic submission (smart systems not available)");
  
  // Calculate basic scores
  const categoryScores = {};
  let totalScore = 0;
  let totalQuestions = 0;
  
  Object.entries(smartQuestions).forEach(([category, questions]) => {
    let yesCount = 0;
    let totalAnswered = 0;
    
    questions.forEach(q => {
      if (formData[q.id]) {
        totalAnswered++;
        // Basic scoring without reverse logic
        if (formData[q.id] === 'Yes') {
          yesCount++;
        } else if (formData[q.id] === 'Sometimes') {
          yesCount += 0.5;
        }
      }
    });
    
    const percentage = totalAnswered > 0 
      ? Math.round((yesCount / totalAnswered) * 100)
      : 0;
    
    categoryScores[category] = {
      score: percentage,
      answered: totalAnswered,
      total: questions.length
    };
    
    totalScore += percentage;
    totalQuestions++;
  });
  
  const overallScore = totalQuestions > 0 
    ? Math.round(totalScore / totalQuestions)
    : 0;
  
  // Create basic report
  const basicReport = {
    metadata: {
      generatedAt: new Date().toISOString(),
      childAge: assessmentData.child_age,
      assessmentId: assessmentId,
      aiGenerated: false
    },
    
    executiveSummary: {
      overallStatus: overallScore >= 70 ? 'On Track' : 
                    overallScore >= 50 ? 'Mild Concerns' : 
                    'Needs Support',
      developmentalAge: assessmentData.child_age,
      keyFindings: [],
      urgentActions: []
    },
    
    detailedAnalysis: {
      categoryBreakdown: categoryScores,
      redFlags: [],
      strengths: [],
      smartScores: categoryScores
    },
    
    reflexIntegration: {
      summary: 'Reflex assessment requires smart scoring system',
      detectedReflexes: [],
      priorityReflexes: [],
      integrationPlan: {},
      expectedTimeline: {}
    },
    
    interventionPlan: {
      immediate: [{
        action: 'Review results with healthcare provider',
        detail: 'Share this assessment for professional interpretation',
        timeline: 'Within 2 weeks'
      }],
      monthlyRoadmap: {
        month1: { theme: 'Foundation', focus: 'Establish routines' },
        month2: { theme: 'Development', focus: 'Build skills' },
        month3: { theme: 'Progress', focus: 'Evaluate improvements' }
      },
      homeProgram: {},
      professionalSupport: []
    },
    
    parentGuidance: {
      understanding: 'This assessment provides a snapshot of your child\'s development',
      dailyTips: ['Establish routines', 'Provide sensory breaks', 'Celebrate progress'],
      warningSignsToWatch: [],
      whenToSeekHelp: ['If you notice regression', 'If concerns increase']
    }
  };
  
  // Save basic report
  await supabase
    .from("assessments")
    .update({
      responses: formData,
      status: "completed",
      category_scores: categoryScores,
      overall_score: overallScore,
      ai_report: basicReport,
      updated_at: new Date().toISOString()
    })
    .eq("id", assessmentId);
  
  // Navigate with basic report
  navigate(`/report/${assessmentId}`, { 
    state: { 
      report: basicReport,
      categoryScores: categoryScores,
      overallScore: overallScore,
      assessmentData: assessmentData
    } 
  });
  
  setLoading(false);
};

// Helper function to process uploaded documents (if needed)
const processUploadedDocuments = async (files) => {
  // This would handle PDF extraction, OCR, etc.
  // For now, return file metadata
  return files.map(file => ({
    name: file.file_name,
    url: file.file_url,
    type: file.file_type,
    processed: false
  }));
};

// Helper: Generate basic analysis when modules are missing
const generateBasicAnalysis = () => {
  const analysis = {
    overall: {
      overallStatus: 'Assessment Complete',
      developmentalAge: assessmentData.child_age,
      strengths: [],
      priorityAreas: [],
      immediateActions: []
    }
  };
  
  // Analyze each category
  Object.entries(smartQuestions).forEach(([category, questions]) => {
    let yesCount = 0;
    let noCount = 0;
    let sometimesCount = 0;
    let foundationYes = 0;
    let foundationTotal = 0;
    let currentYes = 0;
    let currentTotal = 0;
    
    questions.forEach(q => {
      const response = formData[q.id];
      if (response) {
        if (response === 'Yes') yesCount++;
        else if (response === 'No') noCount++;
        else if (response === 'Sometimes') sometimesCount++;
        
        // Track by skill level
        if (q.skill_level === 'foundation') {
          foundationTotal++;
          if (response === 'Yes') foundationYes++;
        } else if (q.skill_level === 'current') {
          currentTotal++;
          if (response === 'Yes') currentYes++;
        }
      }
    });
    
    const total = yesCount + noCount + sometimesCount;
    const overallPercentage = total > 0 ? Math.round((yesCount / total) * 100) : 0;
    const foundationPercentage = foundationTotal > 0 ? Math.round((foundationYes / foundationTotal) * 100) : 0;
    const currentPercentage = currentTotal > 0 ? Math.round((currentYes / currentTotal) * 100) : 0;
    
    analysis[category] = {
      scores: {
        foundation: { percentage: foundationPercentage, total: foundationTotal, answered: foundationYes },
        current: { percentage: currentPercentage, total: currentTotal, answered: currentYes },
        emerging: { percentage: Math.max(0, overallPercentage - 20), total: 0, answered: 0 }
      },
      interpretation: overallPercentage >= 70 ? 'Age-appropriate development' : 
                      overallPercentage >= 50 ? 'Developing with some support needed' : 
                      'Significant support recommended',
      strengths: overallPercentage >= 70 ? [`Strong ${category} skills`] : [],
      concerns: overallPercentage < 50 ? [`${category} needs attention`] : [],
      recommendations: overallPercentage < 70 ? [
        { action: `Focus on ${category} activities`, priority: 'MEDIUM' }
      ] : []
    };
    
    // Update overall analysis
    if (overallPercentage >= 70) {
      analysis.overall.strengths.push(category);
    } else if (overallPercentage < 50) {
      analysis.overall.priorityAreas.push(category);
      if (foundationPercentage < 50) {
        analysis.overall.immediateActions.push({
          category: category,
          action: `Address foundation ${category} skills`,
          urgency: 'High'
        });
      }
    }
  });
  
  // Determine overall status
  if (analysis.overall.priorityAreas.length === 0) {
    analysis.overall.overallStatus = 'On Track';
  } else if (analysis.overall.priorityAreas.length <= 2) {
    analysis.overall.overallStatus = 'Mild Concerns';
  } else {
    analysis.overall.overallStatus = 'Significant Concerns';
  }
  
  return analysis;
};

// Helper: Generate basic report when modules are missing
const generateBasicReport = (analysis) => {
  const report = {
    childInfo: {
      name: `${assessmentData.child_first_name} ${assessmentData.child_last_name || ''}`,
      age: assessmentData.child_age,
      gender: assessmentData.child_gender || 'Not specified',
      assessmentDate: new Date().toLocaleDateString()
    },
    
    executiveSummary: {
      overallStatus: analysis.overall.overallStatus,
      developmentalAge: analysis.overall.developmentalAge,
      topStrengths: analysis.overall.strengths.length > 0 
        ? analysis.overall.strengths.slice(0, 3)
        : ['Completed assessment', 'Engaged with questions'],
      priorityAreas: analysis.overall.priorityAreas.length > 0
        ? analysis.overall.priorityAreas.slice(0, 3)
        : ['Continue monitoring development']
    },
    
    categoryBreakdown: {},
    
    actionPlan: {
      immediate: analysis.overall.immediateActions.length > 0
        ? analysis.overall.immediateActions.map(action => ({
            action: action.action,
            frequency: 'Daily',
            exercises: [`${action.category} development activities`]
          }))
        : [{
            action: 'Continue current activities',
            frequency: 'Daily',
            exercises: ['Age-appropriate play and learning']
          }],
      month1: {
        focus: 'Foundation Building',
        reflexTarget: '',
        goals: ['Establish routines', 'Build foundation skills'],
        activities: ['Daily practice activities', 'Structured play'],
        milestones: ['Consistent participation', 'Skill improvement']
      },
      month2: {
        focus: 'Skill Development',
        reflexTarget: '',
        goals: ['Expand abilities', 'Increase independence'],
        activities: ['Progressive challenges', 'Varied activities'],
        milestones: ['Measurable progress', 'Confidence building']
      },
      month3: {
        focus: 'Integration & Advancement',
        reflexTarget: '',
        goals: ['Consolidate gains', 'Advance to next level'],
        activities: ['Complex tasks', 'Real-world application'],
        milestones: ['Mastery of basics', 'Ready for new challenges']
      }
    },
    
    professionalRecommendations: analysis.overall.priorityAreas.length > 2
      ? [{
          specialist: 'Developmental Pediatrician',
          reason: 'Comprehensive evaluation recommended',
          priority: 'High Priority'
        }]
      : [],
    
    parentMessage: `Dear Parent,\n\nThank you for completing this assessment for ${assessmentData.child_first_name}. ` +
      `This report provides insights into your child's development across multiple areas.\n\n` +
      `${analysis.overall.overallStatus === 'On Track' 
        ? 'The results show positive development across most areas. Continue your excellent support!' 
        : 'Some areas may benefit from additional attention. Remember, every child develops at their own pace.'}\n\n` +
      `Please share these results with your child's healthcare provider for professional guidance.\n\n` +
      `Best wishes on your parenting journey!`,
    
    reflexAnalysis: {
      summary: 'Reflex assessment pending professional evaluation',
      details: []
    }
  };
  
  // Add category breakdown
  Object.entries(analysis).forEach(([category, data]) => {
    if (category !== 'overall' && data.scores) {
      report.categoryBreakdown[category] = {
        foundation: `${data.scores.foundation.percentage}%`,
        current: `${data.scores.current.percentage}%`,
        emerging: `${data.scores.emerging.percentage}%`,
        interpretation: data.interpretation,
        recommendations: data.recommendations || []
      };
    }
  });
  
  return report;
};

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating smart assessment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h2 className="text-red-800 font-semibold mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={() => navigate("/info-form")}
              className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
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
    <div className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-purple-700 mb-2">
            Smart Assessment for {assessmentData?.child_first_name}
          </h1>
          <p className="text-gray-600 mb-4">
            Age: {assessmentData?.child_age} years | Adaptive Developmental Assessment
          </p>
          
          {/* Overall Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{answeredQuestions} of {totalQuestions} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Category Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat, idx) => {
              const categoryQuestions = smartQuestions[cat] || [];
              const answered = categoryQuestions.filter(q => formData[q.id]).length;
              const isComplete = answered === categoryQuestions.length && categoryQuestions.length > 0;
              const isCurrent = idx === currentCategoryIndex;
              
              return (
                <button
                  key={cat}
                  onClick={() => handleCategoryClick(idx)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isCurrent 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : isComplete
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : answered > 0
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                  }`}
                >
                  <span>{cat}</span>
                  {isComplete && <span className="ml-2">✔</span>}
                  {!isComplete && answered > 0 && (
                    <span className="ml-2 text-xs">({answered}/{categoryQuestions.length})</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Category Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Category Header */}
          <div className="border-b pb-4 mb-6">
            <h2 className="text-2xl font-bold text-purple-700 mb-2">
              {currentCategory} Assessment
            </h2>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Section {currentCategoryIndex + 1} of {categories.length}
              </p>
              <p className="text-sm text-gray-500">
                {currentCategoryAnswered} of {currentQuestions.length} answered in this section
              </p>
            </div>
            {/* Section Progress */}
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentCategoryAnswered / currentQuestions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {currentQuestions.map((q, idx) => (
              <div key={q.id} className="mb-4">
                {/* Developmental Level Indicators */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-purple-700">{idx + 1}.</span>
                  
                  {/* Level Badge */}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    q.skill_level === 'foundation' ? 'bg-blue-100 text-blue-700' :
                    q.skill_level === 'current' ? 'bg-green-100 text-green-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {q.skill_level === 'foundation' ? '🔵 Foundation' :
                     q.skill_level === 'current' ? '🟢 Age-Expected' :
                     '🟡 Emerging'}
                  </span>
                  
                  {/* Stage Name */}
                  <span className="text-xs text-gray-500">
                    {q.developmental_stage}
                  </span>
                  
                  {/* Red Flag Indicator */}
                  {q.red_flag && (
                    <span className="text-xs text-red-500 font-medium">
                      ⚠️ Critical Skill
                    </span>
                  )}
                </div>
                
                {/* Question Text */}
                <div className="pl-8">
                  <p className="text-gray-800 mb-2">{q.question_text}</p>
                  
                  {/* Why Important (tooltip or expandable) */}
                  {q.why_important && (
                    <p className="text-xs text-gray-500 italic">
                      ℹ️ {q.why_important}
                    </p>
                  )}
                </div>
                
                {/* Answer Options */}
                <div className="flex gap-3 mt-3 pl-8">
                  {['Yes', 'No', 'Sometimes'].map((option) => (
                    <label 
                      key={option} 
                      className={`flex-1 text-center py-3 px-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData[q.id] === option 
                          ? option === 'Yes' ? 'bg-green-500 text-white border-green-500' :
                            option === 'No' ? 'bg-red-500 text-white border-red-500' :
                            'bg-yellow-500 text-white border-yellow-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question_${q.id}`}
                        value={option}
                        checked={formData[q.id] === option}
                        onChange={() => handleChange(q.id, option)}
                        className="sr-only"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <button
              onClick={handlePrevious}
              disabled={currentCategoryIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition ${
                currentCategoryIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-500 text-white hover:bg-gray-600'
              }`}
            >
              ← Previous Section
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                {allCurrentAnswered ? (
                  <span className="text-green-600 font-medium">✔ Section Complete</span>
                ) : (
                  <span className="text-yellow-600">Please answer all questions</span>
                )}
              </p>
            </div>

            {currentCategoryIndex === categories.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={answeredQuestions === 0}
                className={`px-6 py-3 rounded-lg font-medium transition transform hover:scale-105 ${
                  answeredQuestions === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                Submit Assessment →
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition transform hover:scale-105"
              >
                Next Section →
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-purple-700 mb-3">Assessment Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{categories.length}</p>
              <p className="text-sm text-gray-600">Total Sections</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{answeredQuestions}</p>
              <p className="text-sm text-gray-600">Answered</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{totalQuestions - answeredQuestions}</p>
              <p className="text-sm text-gray-600">Remaining</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</p>
              <p className="text-sm text-gray-600">Complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPage;

// ===================================
// ALSO UPDATE SmartReportPage.jsx with this fix:
// ===================================
// In SmartReportPage.jsx, replace the generateFullReport function with this:

/*
const generateFullReport = async () => {
  try {
    // Check if we have data from navigation state first
    if (location.state?.report) {
      setReport(location.state.report);
      setLoading(false);
      return;
    }

    // Otherwise fetch assessment data
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error || !assessment) {
      console.error('Database error:', error);
      // Try to use state data if available
      if (location.state) {
        if (location.state.analysis && location.state.reflexAnalysis) {
          // Generate report from state data
          const report = await generateReportFromState(location.state);
          setReport(report);
          setLoading(false);
          return;
        }
      }
      throw error || new Error('No assessment found');
    }

    // Continue with normal report generation...
    // [REST OF YOUR EXISTING CODE]
  } catch (error) {
    console.error('Error generating report:', error);
    setLoading(false);
  }
};
*/