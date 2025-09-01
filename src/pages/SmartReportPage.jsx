// SmartReportPage.jsx - REFLEX-FOCUSED COMPREHENSIVE REPORT
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { generateComprehensiveReflexAnalysis } from '../utils/comprehensiveReflexAnalysis';
import html2pdf from 'html2pdf.js';
import EnhancedScheduleBuilder from '../components/EnhancedScheduleBuilder';
import { Download } from 'lucide-react';

const SmartReportPage = () => {
  const { id: assessmentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const [reflexAnalysis, setReflexAnalysis] = useState(null);
  const [developmentalAnalysis, setDevelopmentalAnalysis] = useState(null);
  const [scheduleGenerated, setScheduleGenerated] = useState(false);

  const handleScheduleGenerated = (schedule) => {
    setScheduleGenerated(true);
    console.log('Schedule generated:', schedule);
  };

  // Helper function to get improvement areas for each reflex
  const getImprovementAreas = (reflexName) => {
    const normalizedName = reflexName?.replace(/\s*Reflex\s*/gi, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    const improvements = {
      'MORO': [
        { category: 'Behaviour', improvement: 'Reduced anxiety & meltdowns', level: 'HIGH' },
        { category: 'Speech', improvement: 'Better emotional regulation for communication', level: 'MODERATE' },
        { category: 'Cognitive', improvement: 'Improved focus & attention', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'Better transitions & adaptability', level: 'HIGH' }
      ],
      'ATNR': [
        { category: 'Fine Motor', improvement: 'Dramatic handwriting improvement', level: 'HIGH' },
        { category: 'Cognitive', improvement: 'Better reading & math skills', level: 'HIGH' },
        { category: 'Gross Motor', improvement: 'Improved balance & coordination', level: 'MODERATE' },
        { category: 'School Readiness', improvement: 'Easier copying from board', level: 'HIGH' }
      ],
      'ASYMMETRICALTONICNECK': [
        { category: 'Fine Motor', improvement: 'Dramatic handwriting improvement', level: 'HIGH' },
        { category: 'Cognitive', improvement: 'Better reading & math skills', level: 'HIGH' },
        { category: 'Gross Motor', improvement: 'Improved balance & coordination', level: 'MODERATE' },
        { category: 'School Readiness', improvement: 'Easier copying from board', level: 'HIGH' }
      ],
      'STNR': [
        { category: 'Gross Motor', improvement: 'Better posture & sitting', level: 'HIGH' },
        { category: 'Fine Motor', improvement: 'Improved desk work', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'Can sit still for learning', level: 'HIGH' },
        { category: 'Feeding', improvement: 'Neater eating', level: 'MODERATE' }
      ],
      'SYMMETRICALTONICNECK': [
        { category: 'Gross Motor', improvement: 'Better posture & sitting', level: 'HIGH' },
        { category: 'Fine Motor', improvement: 'Improved desk work', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'Can sit still for learning', level: 'HIGH' },
        { category: 'Feeding', improvement: 'Neater eating', level: 'MODERATE' }
      ],
      'SPINALGALANT': [
        { category: 'Behaviour', improvement: 'Less fidgeting & hyperactivity', level: 'HIGH' },
        { category: 'Daily Living', improvement: 'Bedwetting often stops', level: 'HIGH' },
        { category: 'Cognitive', improvement: 'Better concentration', level: 'HIGH' },
        { category: 'Gross Motor', improvement: 'Improved hip stability', level: 'MODERATE' }
      ],
      'TLR': [
        { category: 'Gross Motor', improvement: 'Better balance & coordination', level: 'HIGH' },
        { category: 'Speech', improvement: 'Improved breath support for speech', level: 'MODERATE' },
        { category: 'Cognitive', improvement: 'Better spatial awareness', level: 'HIGH' },
        { category: 'Daily Living', improvement: 'Less motion sickness', level: 'MODERATE' }
      ],
      'TONICLABYRINTHINE': [
        { category: 'Gross Motor', improvement: 'Better balance & coordination', level: 'HIGH' },
        { category: 'Speech', improvement: 'Improved breath support for speech', level: 'MODERATE' },
        { category: 'Cognitive', improvement: 'Better spatial awareness', level: 'HIGH' },
        { category: 'Daily Living', improvement: 'Less motion sickness', level: 'MODERATE' }
      ],
      'PALMAR': [
        { category: 'Fine Motor', improvement: 'Proper pencil grip develops', level: 'HIGH' },
        { category: 'Speech', improvement: 'Better oral motor control', level: 'MODERATE' },
        { category: 'Daily Living', improvement: 'Can button/zip independently', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'Writing becomes effortless', level: 'HIGH' }
      ],
      'PALMARGRASP': [
        { category: 'Fine Motor', improvement: 'Proper pencil grip develops', level: 'HIGH' },
        { category: 'Speech', improvement: 'Better oral motor control', level: 'MODERATE' },
        { category: 'Daily Living', improvement: 'Can button/zip independently', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'Writing becomes effortless', level: 'HIGH' }
      ],
      'BABINSKI': [
        { category: 'Gross Motor', improvement: 'Better walking & running', level: 'HIGH' },
        { category: 'Daily Living', improvement: 'Less clumsy', level: 'HIGH' },
        { category: 'School Readiness', improvement: 'PE participation improves', level: 'MODERATE' }
      ],
      'ROOTING': [
        { category: 'Speech', improvement: 'Better articulation', level: 'HIGH' },
        { category: 'Feeding', improvement: 'Less picky eating', level: 'HIGH' },
        { category: 'Daily Living', improvement: 'Oral habits disappear', level: 'MODERATE' }
      ]
    };
    
    return improvements[normalizedName] || [
      { category: 'Overall Development', improvement: 'General improvements', level: 'MODERATE' }
    ];
  };

  // Helper function to get therapy connections
  const getTherapyConnections = (reflexName) => {
    const normalizedName = reflexName?.replace(/\s*Reflex\s*/gi, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    const therapies = {
      'MORO': [
        { type: 'OT', focus: 'Sensory integration & self-regulation', priority: 'PRIMARY' },
        { type: 'Counseling', focus: 'Anxiety management strategies', priority: 'SECONDARY' },
        { type: 'Speech', focus: 'Emotional vocabulary & expression', priority: 'SECONDARY' }
      ],
      'ATNR': [
        { type: 'OT', focus: 'Bilateral integration & crossing midline', priority: 'PRIMARY' },
        { type: 'Vision Therapy', focus: 'Eye tracking & visual-motor', priority: 'PRIMARY' },
        { type: 'Educational', focus: 'Reading & writing support', priority: 'SECONDARY' }
      ],
      'ASYMMETRICALTONICNECK': [
        { type: 'OT', focus: 'Bilateral integration & crossing midline', priority: 'PRIMARY' },
        { type: 'Vision Therapy', focus: 'Eye tracking & visual-motor', priority: 'PRIMARY' },
        { type: 'Educational', focus: 'Reading & writing support', priority: 'SECONDARY' }
      ],
      'STNR': [
        { type: 'OT', focus: 'Core strengthening & postural control', priority: 'PRIMARY' },
        { type: 'PT', focus: 'Gross motor coordination', priority: 'SECONDARY' },
        { type: 'Speech', focus: 'Oral motor if affecting feeding', priority: 'SECONDARY' }
      ],
      'SYMMETRICALTONICNECK': [
        { type: 'OT', focus: 'Core strengthening & postural control', priority: 'PRIMARY' },
        { type: 'PT', focus: 'Gross motor coordination', priority: 'SECONDARY' },
        { type: 'Speech', focus: 'Oral motor if affecting feeding', priority: 'SECONDARY' }
      ],
      'SPINALGALANT': [
        { type: 'OT', focus: 'Sensory processing & body awareness', priority: 'PRIMARY' },
        { type: 'PT', focus: 'Core stability & hip control', priority: 'SECONDARY' },
        { type: 'Behavioral', focus: 'ADHD-like symptom management', priority: 'SECONDARY' }
      ],
      'TLR': [
        { type: 'PT', focus: 'Vestibular & balance training', priority: 'PRIMARY' },
        { type: 'OT', focus: 'Sensory integration', priority: 'PRIMARY' },
        { type: 'Speech', focus: 'Postural support for breathing', priority: 'SECONDARY' }
      ],
      'TONICLABYRINTHINE': [
        { type: 'PT', focus: 'Vestibular & balance training', priority: 'PRIMARY' },
        { type: 'OT', focus: 'Sensory integration', priority: 'PRIMARY' },
        { type: 'Speech', focus: 'Postural support for breathing', priority: 'SECONDARY' }
      ],
      'PALMAR': [
        { type: 'OT', focus: 'Fine motor & hand strength', priority: 'PRIMARY' },
        { type: 'Speech', focus: 'Oral motor development', priority: 'SECONDARY' },
        { type: 'Educational', focus: 'Handwriting support', priority: 'SECONDARY' }
      ],
      'PALMARGRASP': [
        { type: 'OT', focus: 'Fine motor & hand strength', priority: 'PRIMARY' },
        { type: 'Speech', focus: 'Oral motor development', priority: 'SECONDARY' },
        { type: 'Educational', focus: 'Handwriting support', priority: 'SECONDARY' }
      ],
      'BABINSKI': [
        { type: 'PT', focus: 'Gait training & foot exercises', priority: 'PRIMARY' },
        { type: 'OT', focus: 'Sensory input to feet', priority: 'SECONDARY' }
      ],
      'ROOTING': [
        { type: 'Speech', focus: 'Oral motor therapy', priority: 'PRIMARY' },
        { type: 'OT', focus: 'Oral sensory desensitization', priority: 'SECONDARY' },
        { type: 'Feeding', focus: 'Food texture expansion', priority: 'SECONDARY' }
      ]
    };
    
    return therapies[normalizedName] || [
      { type: 'OT', focus: 'General reflex integration', priority: 'PRIMARY' }
    ];
  };

  // Helper function to connect reflex to parent concerns
  const getParentConcernConnection = (reflexName, concerns) => {
    if (!concerns) return "Integrating this reflex will support your child's overall development.";
    
    const concernsLower = concerns.toLowerCase();
    const normalizedReflex = reflexName?.replace(/\s*Reflex\s*/gi, '').replace(/[^a-zA-Z]/g, '').toUpperCase();
    
    if (normalizedReflex === 'MORO' && (concernsLower.includes('anxiety') || concernsLower.includes('meltdown') || concernsLower.includes('emotional'))) {
      return "Your child's anxiety and emotional outbursts are directly linked to this retained startle reflex. As it integrates, you'll see a calmer, more regulated child who can handle daily challenges.";
    }
    
    if ((normalizedReflex === 'ATNR' || normalizedReflex === 'ASYMMETRICALTONICNECK') && 
        (concernsLower.includes('writing') || concernsLower.includes('reading') || concernsLower.includes('school'))) {
      return "The handwriting and reading difficulties you mentioned are classic signs of retained ATNR. Integration will make academic tasks significantly easier for your child.";
    }
    
    if (normalizedReflex === 'SPINALGALANT' && 
        (concernsLower.includes('fidget') || concernsLower.includes('hyperactive') || concernsLower.includes('adhd') || concernsLower.includes('bedwetting'))) {
      return "The fidgeting and hyperactivity you're concerned about stem from this retained reflex. Many children diagnosed with ADHD actually have retained Spinal Galant. Integration often eliminates these symptoms.";
    }
    
    if ((normalizedReflex === 'STNR' || normalizedReflex === 'SYMMETRICALTONICNECK') && 
        (concernsLower.includes('sitting') || concernsLower.includes('posture') || concernsLower.includes('desk'))) {
      return "Your child's difficulty sitting at a desk is directly caused by this retained reflex. Once integrated, homework and classroom time will become much more manageable.";
    }
    
    if ((normalizedReflex === 'PALMAR' || normalizedReflex === 'PALMARGRASP') && 
        (concernsLower.includes('pencil') || concernsLower.includes('fine motor') || concernsLower.includes('buttons'))) {
      return "The fine motor challenges you described are textbook signs of retained Palmar reflex. Integration will unlock your child's ability to write neatly and manage self-care tasks.";
    }
    
    if ((normalizedReflex === 'TLR' || normalizedReflex === 'TONICLABYRINTHINE') && 
        (concernsLower.includes('balance') || concernsLower.includes('clumsy') || concernsLower.includes('motion'))) {
      return "Your child's balance issues and clumsiness are directly related to this retained reflex. As it integrates, you'll see dramatic improvements in coordination and confidence in movement.";
    }
    
    return `Based on your concerns, integrating this reflex will address several of these challenges. You'll see improvements in the areas listed above.`;
  };

  // Helper to get category scores
  const getCategoryScores = () => {
    if (assessmentData?.category_scores) {
      const scores = {};
      Object.entries(assessmentData.category_scores).forEach(([category, data]) => {
        scores[category] = data.percentage || 0;
      });
      return scores;
    }
    return null;
  };

 useEffect(() => {
  if (assessmentId) {
    fetchReportData();
  }
  // Prevent scroll refresh
  window.history.scrollRestoration = 'manual';
  
  // Scroll to top on mount
  window.scrollTo(0, 0);
  
  return () => {
    window.history.scrollRestoration = 'auto';
  };
}, [assessmentId]);

  const fetchReportData = async () => {
    try {
      const { data: assessment, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', assessmentId)
        .single();

      if (error) throw error;
      
      setAssessmentData(assessment);

      let reflexData = assessment.reflex_analysis;
      
      if (!reflexData || !reflexData.personalizedExplanation) {
        console.log('🧠 Generating comprehensive reflex analysis...');
        reflexData = await generateComprehensiveReflexAnalysis(
          assessmentId,
          assessment.responses || {},
          assessment.child_age,
          assessment.main_concerns || 'General developmental concerns'
        );
      }
      
      setReflexAnalysis(reflexData);
      
      if (assessment.developmental_analysis) {
        setDevelopmentalAnalysis(assessment.developmental_analysis);
      } else if (assessment.category_scores) {
        const analysis = {};
        Object.entries(assessment.category_scores).forEach(([category, scores]) => {
          analysis[category] = { percentage: scores.percentage || 0 };
        });
        setDevelopmentalAnalysis(analysis);
      }
      
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('report-content');
    html2pdf()
      .set({
        margin: 10,
        filename: `${assessmentData?.child_first_name}_smart_assessment_report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save();
  };

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
              <span className="text-3xl">✨</span>
            </div>
          </div>
          <p style={{ 
            color: '#6b5b95',
            fontSize: '16px',
            fontWeight: '300',
            letterSpacing: '0.05em'
          }}>
            Creating Your Child's Personalized Integration Plan...
          </p>
        </div>
      </div>
    </div>
  );
}

  const categoryScores = getCategoryScores();
  const childData = assessmentData;

  return (

  <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}>
    {/* Animated Background */}
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
           style={{ background: 'radial-gradient(circle, rgba(107, 91, 149, 0.4), transparent)' }}></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
           style={{ background: 'radial-gradient(circle, rgba(212, 165, 116, 0.4), transparent)' }}></div>
    </div>

    {/* FLOATING BUTTONS */}      {/* FLOATING BUTTONS */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50 print:hidden">
        <EnhancedScheduleBuilder 
          assessmentId={assessmentId}
          childData={assessmentData}
          reflexData={reflexAnalysis}
          onScheduleGenerated={handleScheduleGenerated}
        />
        
        <button
          onClick={handleDownloadPDF}
          className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 shadow-lg flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      <div id="report-content" className="max-w-6xl mx-auto p-6">
        {/* HEADER - UPDATED TITLE */}
      
      {/* HEADER - Updated with your branding */}
<div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
  <div className="p-4 sm:p-6" 
       style={{ 
         background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
       }}>
    <h1 className="text-2xl sm:text-3xl font-light text-white mb-2" 
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
      Your Child's Smart Assessment Report
    </h1>
    <p className="text-white/90 text-base sm:text-lg">
      Comprehensive Developmental & Reflex Integration Analysis
    </p>
  </div>
  
  {/* Child Info */}
  <div style={{ background: 'rgba(107, 91, 149, 0.03)' }} className="p-6">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
      <div>
        <p className="text-sm" style={{ color: '#8b7f92' }}>Child's Name</p>
        <p className="font-semibold text-lg" style={{ color: '#6b5b95' }}>
          {assessmentData?.child_first_name} {assessmentData?.child_last_name}
        </p>
      </div>
      <div>
        <p className="text-sm" style={{ color: '#8b7f92' }}>Age</p>
        <p className="font-semibold text-lg" style={{ color: '#6b5b95' }}>
          {assessmentData?.child_age} years
        </p>
      </div>
      <div>
        <p className="text-sm" style={{ color: '#8b7f92' }}>Assessment Date</p>
        <p className="font-semibold text-lg" style={{ color: '#6b5b95' }}>
          {new Date(assessmentData?.created_at).toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-sm" style={{ color: '#8b7f92' }}>Report Type</p>
        <p className="font-semibold text-lg" style={{ color: '#6b5b95' }}>Smart Analysis</p>
      </div>
    </div>
  </div>
</div>

        {/* PERSONAL MESSAGE - BETTER STYLED */}
    
    {/* PERSONAL MESSAGE - Updated styling */}
<div className="rounded-xl p-6 mb-6 border-2" 
     style={{ 
       background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.05), rgba(135, 160, 142, 0.05))',
       borderColor: 'rgba(107, 91, 149, 0.2)'
     }}>
  <div className="flex items-start gap-3">
    <span className="text-3xl">💌</span>
    <div>
      <p className="text-lg font-semibold mb-2" style={{ color: '#6b5b95' }}>
        Dear {assessmentData?.parent_first_name || 'Parent'},
      </p>
      <p className="text-gray-700 leading-relaxed">
        After carefully analyzing <span className="font-semibold" style={{ color: '#6b5b95' }}>
        {childData?.child_first_name}</span>'s assessment, we can see exactly where they 
        <span style={{ color: '#87a08e' }} className="font-medium"> shine</span> and 
        where targeted support will <span style={{ color: '#6b5b95' }} className="font-medium">unlock their potential</span>. 
        Every child develops differently, and <span className="font-semibold">{childData?.child_first_name}</span> has 
        their own unique pattern that tells us exactly how to help.
      </p>
    </div>
  </div>
</div>


        {/* CHILD'S PROFILE SECTION - WITH ACTUAL DATA */}
       {/* CHILD'S PROFILE SECTION */}
<div className="bg-white rounded-xl p-6 shadow-lg mb-6">
  <h2 className="text-2xl font-bold mb-4" style={{ color: '#6b5b95' }}>
    Understanding {childData?.child_first_name}'s Unique Development
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Strengths */}
    <div className="rounded-lg p-5" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
      <h3 className="font-bold mb-4 flex items-center" style={{ color: '#87a08e' }}>
        <span className="text-2xl mr-2">✨</span>
        {childData?.child_first_name}'s Strengths & Wins
      </h3>
      <div className="space-y-3">
        {(() => {
          const strengths = [];
          const responses = assessmentData?.responses || {};
          const scores = assessmentData?.category_scores || {};
          
          if (responses.speech_first_word_age === '10-12 months' || responses.speech_first_word_age === '12-15 months') {
            strengths.push({
              icon: '💬',
              title: 'Strong Language Foundation',
              detail: `Started speaking right on time - this early foundation means speech can improve quickly`
            });
          }
          
          if (responses.gross_motor_walk_age === '12-15 months' || responses.gross_motor_walk_age === '10-12 months') {
            strengths.push({
              icon: '🏃',
              title: 'Early Walker',
              detail: 'Walking milestone was on time - physical foundation is strong'
            });
          }
          
          if (responses.school_readiness_knows_letters === 'All letters' || responses.school_readiness_knows_letters === 'Most letters') {
            strengths.push({
              icon: '📚',
              title: 'Knows Letters',
              detail: 'Letter recognition is strong - ready for reading when other skills catch up'
            });
          }
          
          if (responses.daily_living_toilet_trained === 'Day and night' || responses.daily_living_toilet_trained === 'Daytime only') {
            strengths.push({
              icon: '🏠',
              title: 'Toilet Trained',
              detail: 'This major milestone shows body awareness and control'
            });
          }
          
          if (scores['Daily Living Skills']?.percentage >= 50) {
            strengths.push({
              icon: '🏠',
              title: 'Life Skills Developing',
              detail: `Daily living at ${scores['Daily Living Skills'].percentage}% - independence is growing`
            });
          }
          
          if (childData?.child_age <= 5) {
            strengths.push({
              icon: '🌈',
              title: 'Perfect Timing',
              detail: `At ${childData?.child_age} years old, the brain changes quickly - improvements will be rapid`
            });
          }
          
          if (strengths.length < 2) {
            strengths.push({
              icon: '💫',
              title: 'Ready for Change',
              detail: `Every skill that needs work means potential for big improvements`
            });
          }
          
          return strengths.slice(0, 5).map((strength, idx) => (
            <div key={idx} className="bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">{strength.icon}</span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#87a08e' }}>{strength.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{strength.detail}</p>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
    
    {/* Priority Support Areas */}
    <div className="rounded-lg p-5" style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
      <h3 className="font-bold mb-4 flex items-center" style={{ color: '#d4a574' }}>
        <span className="text-2xl mr-2">🎯</span>
        Priority Support Areas
      </h3>
      <div className="space-y-3">
        {(() => {
          const challenges = [];
          const responses = assessmentData?.responses || {};
          const scores = assessmentData?.category_scores || {};
          
          if (scores.Speech?.percentage < 60) {
            const speechDetails = [];
            if (responses.speech_speaks_sentences === 'Not yet') speechDetails.push('putting words together');
            if (responses.speech_pronunciation === 'Very unclear') speechDetails.push('clear speech sounds');
            
            challenges.push({
              icon: '💬',
              area: 'Speech & Language',
              level: scores.Speech?.percentage < 40 ? 'CRITICAL' : 'HIGH',
              detail: speechDetails.length > 0 
                ? `Working on ${speechDetails.join(', ')}` 
                : 'Language is still developing',
              impact: 'Affects communication, learning, and social connections'
            });
          }
          
          if (scores['Fine Motor']?.percentage < 60) {
            const fineMotorIssues = [];
            if (responses.fine_motor_holds_pencil === 'Fist grip') fineMotorIssues.push('pencil grip');
            if (responses.fine_motor_buttons === 'Cannot do') fineMotorIssues.push('fasteners');
            
            challenges.push({
              icon: '✋',
              area: 'Fine Motor Control',
              level: 'MODERATE',
              detail: fineMotorIssues.length > 0 
                ? `Still mastering ${fineMotorIssues.join(', ')}`
                : 'Hand skills are emerging',
              impact: 'Will affect writing, self-care, and school tasks'
            });
          }
          
          if (scores['Gross Motor']?.percentage < 60) {
            challenges.push({
              icon: '🏃',
              area: 'Movement & Coordination',
              level: 'MODERATE',
              detail: 'Body coordination is still developing',
              impact: 'Affects play, sports, and confidence in physical activities'
            });
          }
          
          if (scores.Behaviour?.percentage < 60) {
            challenges.push({
              icon: '❤️',
              area: 'Emotional Regulation',
              level: 'HIGH',
              detail: 'Learning to manage big emotions',
              impact: 'Makes daily life stressful for the whole family'
            });
          }
          
          if (scores['School Readiness']?.percentage < 60 && childData?.child_age >= 4) {
            challenges.push({
              icon: '📚',
              area: 'School Readiness',
              level: childData?.child_age >= 5 ? 'HIGH' : 'MODERATE',
              detail: 'Building pre-academic skills',
              impact: 'May need extra support when starting school'
            });
          }
          
          return challenges.slice(0, 5).map((challenge, idx) => (
            <div key={idx} className={`bg-white rounded-lg p-3 shadow-sm border-l-4`}
                 style={{ 
                   borderLeftColor: challenge.level === 'CRITICAL' ? '#d97070' :
                                  challenge.level === 'HIGH' ? '#d4a574' : '#f3d19e'
                 }}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{challenge.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800 text-sm">{challenge.area}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ 
                            background: challenge.level === 'CRITICAL' ? 'rgba(217, 112, 112, 0.2)' :
                                      challenge.level === 'HIGH' ? 'rgba(212, 165, 116, 0.2)' :
                                      'rgba(243, 209, 158, 0.2)',
                            color: challenge.level === 'CRITICAL' ? '#d97070' :
                                  challenge.level === 'HIGH' ? '#d4a574' : '#c9a66b'
                          }}>
                      {challenge.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 mb-1">{challenge.detail}</p>
                  <p className="text-xs text-gray-500 italic">{challenge.impact}</p>
                </div>
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  </div>

  {/* The Connection */}
  <div className="mt-6 p-5 rounded-lg border-2"
       style={{ 
         background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.05), rgba(135, 160, 142, 0.05))',
         borderColor: 'rgba(107, 91, 149, 0.2)'
       }}>
    <h3 className="font-bold mb-3 flex items-center" style={{ color: '#6b5b95' }}>
      <span className="text-xl mr-2">🔗</span>
      The Hidden Connection We Found
    </h3>
    <p className="text-sm text-gray-700 mb-3">
      {childData?.child_first_name}'s nervous system is still using early movement patterns (primitive reflexes). 
      Think of it like having training wheels when you're ready for a real bike - we just need to help the brain 
      update to the next level. The amazing news? These reflexes WANT to integrate - they just need the right exercises.
    </p>
    
    <div className="bg-white rounded-lg p-3">
      <p className="text-sm font-semibold mb-1" style={{ color: '#87a08e' }}>
        Expected Outcome:
      </p>
      <p className="text-xs text-gray-600">
        Based on {childData?.child_first_name}'s profile, we expect to see significant improvements within 
        <span className="font-bold" style={{ color: '#6b5b95' }}> 2-4 weeks</span> of consistent exercises, with major 
        breakthroughs by <span className="font-bold" style={{ color: '#6b5b95' }}> 6-8 weeks</span>. 
        {childData?.child_age <= 6 ? ' At this young age, changes happen FAST!' : ' The brain is ready for this change!'}
      </p>
    </div>
  </div>
</div>

        {/* PERSONALIZED MESSAGE WITH STATS */}
   
   {/* PERSONALIZED MESSAGE WITH STATS */}
{reflexAnalysis?.personalizedExplanation && (
  <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
    {/* Quick Stats Bar */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="rounded-xl p-4 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1), rgba(107, 91, 149, 0.2))' }}>
        <div className="text-3xl font-bold" style={{ color: '#6b5b95' }}>
          {reflexAnalysis?.retainedReflexes?.length || 0}
        </div>
        <p className="text-xs mt-1" style={{ color: '#8b7f92' }}>Reflexes Found</p>
      </div>
      <div className="rounded-xl p-4 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(135, 160, 142, 0.1), rgba(135, 160, 142, 0.2))' }}>
        <div className="text-3xl font-bold" style={{ color: '#87a08e' }}>
          {reflexAnalysis?.topThreePriority?.length || 3}
        </div>
        <p className="text-xs mt-1" style={{ color: '#8b7f92' }}>Focus Areas</p>
      </div>
      <div className="rounded-xl p-4 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.2))' }}>
        <div className="text-3xl font-bold" style={{ color: '#d4a574' }}>
          15-20
        </div>
        <p className="text-xs mt-1" style={{ color: '#8b7f92' }}>Min Daily</p>
      </div>
      <div className="rounded-xl p-4 text-center"
           style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1), rgba(135, 160, 142, 0.1))' }}>
        <div className="text-3xl font-bold" style={{ color: '#6b5b95' }}>
          6-8
        </div>
        <p className="text-xs mt-1" style={{ color: '#8b7f92' }}>Weeks to Results</p>
      </div>
    </div>

    {/* Understanding Section */}
    <div className="border-l-4 rounded-r-xl p-6 mb-6"
         style={{ 
           borderLeftColor: '#87a08e',
           background: 'rgba(135, 160, 142, 0.05)'
         }}>
      <h2 className="text-xl font-bold mb-3 flex items-center" style={{ color: '#87a08e' }}>
        <span className="mr-2">💚</span>
        Understanding Your Child's Assessment Results
      </h2>
      
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">What we found:</span> {childData?.child_first_name} has 
            {' '}<span className="font-bold" style={{ color: '#6b5b95' }}>{reflexAnalysis?.retainedReflexes?.length || 0} retained primitive reflexes</span> that 
            are affecting development. This is completely normal and very treatable!
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">What this means:</span> These reflexes should have integrated 
            in infancy but are still active, causing many of the challenges you see daily. The great news 
            is that with simple exercises, they WILL integrate.
          </p>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Your action plan:</span> Focus on the top 3 reflexes only. 
            Do the exercises for 15-20 minutes daily. You'll see improvements in 2-4 weeks, with major 
            changes by 6-8 weeks.
          </p>
        </div>
      </div>
    </div>

    {/* The Great News Box */}
    <div className="rounded-xl p-6 border-2"
         style={{ 
           background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.05), rgba(212, 165, 116, 0.1))',
           borderColor: 'rgba(212, 165, 116, 0.3)'
         }}>
      <h3 className="text-lg font-bold mb-3 flex items-center" style={{ color: '#d4a574' }}>
        <span className="mr-2">✨</span>
        The Amazing News
      </h3>
      <p className="text-gray-700 font-medium">
        When you work on the top 3 reflexes, ALL the others improve automatically!
      </p>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-600">✓ Interconnected nervous system</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-600">✓ Exercises create brain organization</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-600">✓ Movement patterns overlap</p>
        </div>
        <div className="bg-white rounded-lg p-3">
          <p className="text-sm text-gray-600">✓ System integrates as a whole</p>
        </div>
      </div>
    </div>
  </div>
)}

        {/* COMPRESSED TIMELINE */}
       
       {/* COMPRESSED TIMELINE */}
<div className="bg-white rounded-xl p-6 shadow-lg mb-6">
  <h2 className="text-2xl font-bold mb-4" style={{ color: '#6b5b95' }}>
    Expected Progress Timeline
  </h2>
  
  <div className="flex overflow-x-auto gap-4 pb-4">
    <div className="flex-shrink-0 rounded-lg p-4 min-w-[200px]"
         style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
      <div className="text-lg font-bold" style={{ color: '#6b5b95' }}>2 Weeks</div>
      <ul className="text-xs mt-2 space-y-1">
        <li>✓ Better sleep</li>
        <li>✓ Calmer transitions</li>
        <li>✓ Less anxiety</li>
      </ul>
    </div>
    
    <div className="flex-shrink-0 rounded-lg p-4 min-w-[200px]"
         style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
      <div className="text-lg font-bold" style={{ color: '#87a08e' }}>4 Weeks</div>
      <ul className="text-xs mt-2 space-y-1">
        <li>✓ Better focus</li>
        <li>✓ Improved coordination</li>
        <li>✓ Fewer meltdowns</li>
      </ul>
    </div>
    
    <div className="flex-shrink-0 rounded-lg p-4 min-w-[200px]"
         style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
      <div className="text-lg font-bold" style={{ color: '#d4a574' }}>6-8 Weeks</div>
      <ul className="text-xs mt-2 space-y-1">
        <li>✓ Academic improvements</li>
        <li>✓ Better social skills</li>
        <li>✓ Self-regulation</li>
      </ul>
    </div>
    
    <div className="flex-shrink-0 rounded-lg p-4 min-w-[200px]"
         style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.05), rgba(135, 160, 142, 0.05))' }}>
      <div className="text-lg font-bold" style={{ color: '#6b5b95' }}>3 Months</div>
      <ul className="text-xs mt-2 space-y-1">
        <li>✓ Consolidated skills</li>
        <li>✓ Increased confidence</li>
        <li>✓ Overall progress</li>
      </ul>
    </div>
  </div>
</div>

        {/* COMPRESSED DAILY PLAN */}
        
        {/* COMPRESSED DAILY PLAN */}
<div className="rounded-xl p-6 shadow-lg mb-6"
     style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.05), rgba(212, 165, 116, 0.1))' }}>
  <h2 className="text-2xl font-bold mb-4" style={{ color: '#d4a574' }}>
    Your Simple Daily Plan
  </h2>
  
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ color: '#6b5b95' }}>1</div>
      <p className="text-xs mt-1">Focus Top 3 Only</p>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ color: '#87a08e' }}>2</div>
      <p className="text-xs mt-1">15-20 min daily</p>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ color: '#d4a574' }}>3</div>
      <p className="text-xs mt-1">Track progress</p>
    </div>
    <div className="text-center">
      <div className="text-3xl font-bold" style={{ color: '#6b5b95' }}>4</div>
      <p className="text-xs mt-1">Stay consistent</p>
    </div>
  </div>
</div>

        {/* COMPREHENSIVE REFLEX ASSESSMENT */}
      
      {/* COMPREHENSIVE REFLEX ASSESSMENT */}
<div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
  <h2 className="text-3xl font-bold mb-2" style={{ color: '#6b5b95' }}>
    Primitive Reflex Assessment Results
  </h2>
  <p className="text-gray-600 mb-6">
    These early reflexes shape how your child's brain and body work together. Let's understand what's happening:
  </p>

  {/* DETAILED REFLEX CARDS */}
  {reflexAnalysis?.retainedReflexes?.map((reflex, idx) => (
    <div key={idx} className={`mb-8 rounded-2xl border-2`}
         style={{ 
           borderColor: reflex.severity === 'HIGH' ? 'rgba(217, 112, 112, 0.3)' : 
                       reflex.severity === 'MODERATE' ? 'rgba(212, 165, 116, 0.3)' : 
                       'rgba(135, 160, 142, 0.3)',
           background: reflex.severity === 'HIGH' ? 'rgba(217, 112, 112, 0.05)' : 
                      reflex.severity === 'MODERATE' ? 'rgba(212, 165, 116, 0.05)' : 
                      'rgba(135, 160, 142, 0.05)'
         }}>
      {/* Reflex details */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {reflex.data?.fullName || reflex.name}
            </h3>
            <p className="text-gray-600">
              Should have integrated by: <span className="font-semibold">{reflex.data?.integrationAge}</span>
            </p>
          </div>
          <div className="px-4 py-2 rounded-lg font-bold text-sm"
               style={{ 
                 background: reflex.severity === 'HIGH' ? 'rgba(217, 112, 112, 0.2)' : 
                            reflex.severity === 'MODERATE' ? 'rgba(212, 165, 116, 0.2)' : 
                            'rgba(135, 160, 142, 0.2)',
                 color: reflex.severity === 'HIGH' ? '#d97070' : 
                       reflex.severity === 'MODERATE' ? '#d4a574' : 
                       '#87a08e'
               }}>
            {reflex.severity === 'HIGH' ? 'High Priority' : 
             reflex.severity === 'MODERATE' ? 'Moderate Priority' : 
             'Check Needed'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h4 className="font-bold text-gray-700 mb-2">What This Reflex Does:</h4>
          <p className="text-gray-600">{reflex.data?.whatItDoes}</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h4 className="font-bold text-gray-700 mb-2">Why This Matters for Your Child:</h4>
          <p className="text-gray-600">{reflex.data?.whyItMatters}</p>
        </div>

        <div className="bg-white rounded-xl p-4 mb-4">
          <h4 className="font-bold text-gray-700 mb-2">Signs You Might Notice:</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {reflex.data?.signsRetained?.map((sign, signIdx) => (
              <div key={signIdx} className="flex items-start gap-2">
                <span style={{ color: '#6b5b95' }} className="mt-1">✓</span>
                <span className="text-gray-600 text-sm">{sign}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-4 mb-4"
             style={{ background: 'linear-gradient(135deg, rgba(135, 160, 142, 0.1), rgba(135, 160, 142, 0.2))' }}>
          <h4 className="font-bold mb-2" style={{ color: '#87a08e' }}>
            The Good News - When This Integrates:
          </h4>
          <p className="text-gray-700">{reflex.data?.howItHelpsWhenIntegrated}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl p-4" style={{ background: 'rgba(107, 91, 149, 0.05)' }}>
            <h4 className="font-bold mb-3" style={{ color: '#6b5b95' }}>Areas That Will Improve:</h4>
            <div className="space-y-2">
              {getImprovementAreas(reflex.name).map((area, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded text-xs font-semibold"
                        style={{ 
                          background: area.level === 'HIGH' ? 'rgba(135, 160, 142, 0.2)' :
                                    area.level === 'MODERATE' ? 'rgba(212, 165, 116, 0.2)' :
                                    'rgba(139, 127, 146, 0.2)',
                          color: area.level === 'HIGH' ? '#87a08e' :
                                area.level === 'MODERATE' ? '#d4a574' :
                                '#8b7f92'
                        }}>
                    {area.category}
                  </span>
                  <span className="text-xs text-gray-600">{area.improvement}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-4" style={{ background: 'rgba(135, 160, 142, 0.05)' }}>
            <h4 className="font-bold mb-3" style={{ color: '#87a08e' }}>Therapies That Address This:</h4>
            <div className="space-y-2">
              {getTherapyConnections(reflex.name).map((therapy, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="px-2 py-1 rounded text-xs font-bold"
                        style={{ 
                          background: therapy.priority === 'PRIMARY' ? 'rgba(107, 91, 149, 0.2)' :
                                    'rgba(107, 91, 149, 0.1)',
                          color: therapy.priority === 'PRIMARY' ? '#6b5b95' : '#8b7f92'
                        }}>
                    {therapy.type}
                  </span>
                  <span className="text-xs text-gray-600">{therapy.focus}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {assessmentData?.main_concerns && (
          <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
            <h4 className="font-bold mb-2" style={{ color: '#d4a574' }}>
              How This Addresses Your Concerns:
            </h4>
            <p className="text-sm text-gray-700 italic">
              {getParentConcernConnection(reflex.name, assessmentData.main_concerns || assessmentData.parent_concerns || '')}
            </p>
          </div>
        )}
      </div>

      <div className="p-6">
        <h4 className="text-xl font-bold mb-4" style={{ color: '#6b5b95' }}>
          Your Daily Integration Exercises
        </h4>
        <div className="grid md:grid-cols-1 gap-4">
          {reflex.data?.exercises?.map((exercise, exIdx) => (
            <div key={exIdx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{exercise.name.split(' ')[0]}</div>
                <div className="flex-1">
                  <h5 className="font-bold text-lg mb-2" style={{ color: '#6b5b95' }}>
                    {exercise.name}
                  </h5>
                  <p className="text-gray-700 mb-3">
                    <span className="font-semibold">How to do it:</span> {exercise.how}
                  </p>
                  <div className="flex gap-4 mb-2">
                    <span className="text-sm px-3 py-1 rounded-full"
                          style={{ 
                            background: 'rgba(107, 91, 149, 0.1)',
                            color: '#6b5b95'
                          }}>
                      {exercise.when}
                    </span>
                  </div>
                  <p className="text-sm italic" style={{ color: '#87a08e' }}>
                    Tip: {exercise.tip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ))}
</div>

        {/* SUCCESS STORIES */}
       
       {/* SUCCESS STORIES */}
{reflexAnalysis?.successStories && reflexAnalysis.successStories.length > 0 && (
  <div className="rounded-2xl shadow-xl p-8 mb-8"
       style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.05), rgba(212, 165, 116, 0.1))' }}>
    <h2 className="text-2xl font-bold mb-4" style={{ color: '#d4a574' }}>
      Real Success Stories from Other Parents
    </h2>
    <div className="space-y-4">
      {reflexAnalysis.successStories.map((story, idx) => (
        <div key={idx} className="bg-white rounded-xl p-4 italic text-gray-700">
          {story}
        </div>
      ))}
    </div>
  </div>
)}

        {/* WEEK BY WEEK PLAN */}
     
     {/* WEEK BY WEEK PLAN */}
{reflexAnalysis?.weekByWeekPlan && (
  <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
    <h2 className="text-3xl font-bold mb-6" style={{ color: '#6b5b95' }}>
      Your Week-by-Week Journey
    </h2>
    <div className="grid md:grid-cols-2 gap-6">
      {Object.entries(reflexAnalysis.weekByWeekPlan).map(([week, plan]) => (
        <div key={week} className="border-l-4 pl-6" style={{ borderLeftColor: '#6b5b95' }}>
          <h3 className="font-bold text-lg mb-2" style={{ color: '#6b5b95' }}>{week}</h3>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Focus:</span> {plan.focus}
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Exercises:</span> {plan.exercises}
          </p>
          <p className="italic" style={{ color: '#87a08e' }}>
            {plan.tip}
          </p>
        </div>
      ))}
    </div>
  </div>
)}

        {/* DEVELOPMENTAL SCORES */}
      {/* DEVELOPMENTAL SCORES */}
<div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
  <h2 className="text-2xl font-bold mb-4" style={{ color: '#6b5b95' }}>
    Developmental Assessment Summary
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {Object.entries(assessmentData?.category_scores || {}).map(([category, data]) => {
      const score = data.percentage || 0;
      return (
        <div key={category} className="text-center">
          <div className={`text-2xl font-bold mb-1`}
               style={{ 
                 color: score >= 70 ? '#87a08e' : 
                       score >= 50 ? '#d4a574' : 
                       '#d97070'
               }}>
            {score}%
          </div>
          <p className="text-sm text-gray-600">{category}</p>
        </div>
      );
    })}
  </div>
</div>

        {/* MOTIVATIONAL CLOSING */}
     {/* MOTIVATIONAL CLOSING */}
<div className="rounded-2xl shadow-xl p-8 text-white mb-8"
     style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}>
  <h2 className="text-3xl font-bold mb-4">
    You Are Your Child's Greatest Therapist
  </h2>
  <div className="space-y-4 text-lg">
    <p>
      The exercises in this report aren't just movements - they're building new neural pathways in your child's brain. 
      Every day you do these exercises, you're literally rewiring their nervous system for success.
    </p>
    <p>
      Remember: Your child's challenges aren't behavioral problems or laziness. They're working with a nervous system 
      that needs a little extra help to mature. With your consistent support, these reflexes WILL integrate.
    </p>
    <p className="font-bold text-yellow-100 text-xl">
      In 3 months, you'll look back amazed at how far your child has come. Start today - your child's 
      incredible potential is waiting to be unlocked!
    </p>
  </div>
</div>

        {/* IMPORTANT DISCLAIMER */}
      
<div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-8 border border-gray-200">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <span className="text-sm">ℹ️</span>
      <p className="text-sm text-gray-600">
        This report provides educational guidance based on your assessment responses.
      </p>
    </div>
    <button 
      onClick={() => {
        const disclaimer = document.getElementById('full-disclaimer');
        if (disclaimer) {
          disclaimer.style.display = disclaimer.style.display === 'none' ? 'block' : 'none';
        }
      }}
      className="text-blue-600 text-sm hover:text-blue-800 underline font-medium"
    >
      Important Information
    </button>
  </div>
  
  {/* Hidden full disclaimer - only shows when clicked */}
  <div id="full-disclaimer" style={{ display: 'none' }} className="mt-4 pt-4 border-t border-gray-200">
    <div className="space-y-2 text-xs text-gray-500">
      <p>
        <span className="font-semibold">Educational Purpose:</span> This assessment is for informational purposes only, not medical advice.
      </p>
      <p>
        <span className="font-semibold">Professional Guidance:</span> Consult healthcare professionals before starting any program.
      </p>
      <p>
        <span className="font-semibold">Individual Results:</span> Every child is unique. Results may vary.
      </p>
      <p>
        <span className="font-semibold">Privacy:</span> Your data is secure and confidential.
      </p>
    </div>
  </div>
</div>

        {/* COPYRIGHT FOOTER */}
       <div className="text-center text-xs text-gray-400 mb-6 space-y-1">
  <p>© 2024 Smart Child Development Assessment System. All rights reserved.</p>
  <p>This report is confidential and intended solely for the family of {childData?.child_first_name} {childData?.child_last_name}</p>
  <p className="text-[10px] italic">
    This assessment tool is not FDA approved, not a medical device, and does not provide medical diagnosis or treatment. 
    Educational purposes only.
  </p>
</div>

<div className="mt-8 p-3 bg-gray-50 rounded text-center">
  <p className="text-[10px] text-gray-400 leading-relaxed">
    This Smart Assessment Report is for educational and informational purposes only. Not a substitute for professional medical advice, diagnosis, or treatment. 
    Not FDA approved. Individual results may vary. Always consult qualified healthcare professionals. By using this report, you acknowledge these terms. 
    <button 
      onClick={() => window.open('/terms', '_blank')}
      className="text-blue-500 hover:underline ml-1"
    >
      Full Terms & Conditions
    </button>
  </p>
</div>

        {/* Action Buttons */}
       {/* Action Buttons */}
<div className="flex justify-center gap-4 mt-8 print:hidden">
  <button
    onClick={handleDownloadPDF}
    className="px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
    style={{ 
      background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
      color: 'white'
    }}
  >
    Download Complete Integration Plan
  </button>
  <button
    onClick={() => navigate('/')}
    className="px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
    style={{ 
      background: 'linear-gradient(135deg, #87a08e, #6b5b95)',
      color: 'white'
    }}
  >
    Start New Assessment
  </button>
</div>
      </div>
    </div>
  );
};

export default SmartReportPage;