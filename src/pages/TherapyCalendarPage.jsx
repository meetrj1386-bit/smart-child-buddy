import React, { useState, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { COMPREHENSIVE_REFLEX_DATABASE } from '../utils/comprehensiveReflexDatabase';

const TherapyCalendarPage = () => {
  // ALL HOOKS AT THE TOP
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calendarGenerated, setCalendarGenerated] = useState(false);
  const [generatedCalendar, setGeneratedCalendar] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [reportContent, setReportContent] = useState('');
  
  // Form data with proper defaults
  const [formData, setFormData] = useState({
    // Basic Info
    parentName: "",
    email: "",
    phone: "",
    childFirstName: "",
    childLastName: "",
    age: "",
    gender: "",
    
    // IMPORTANT: Parent's notes about child
    tellUsAboutChild: "",
    parentGoals: "",
    mainConcerns: "",
    
    // School Schedule
    hasSchool: "",
    schoolStartTime: "",
    schoolEndTime: "",
    schoolDays: [],
    
    // Therapy Services (Professional Sessions)
    speechTherapy: {
      enabled: false,
      sessionTime: "",
      sessionHours: "",
      sessionDays: []
    },
    otTherapy: {
      enabled: false,
      sessionTime: "",
      sessionHours: "",
      sessionDays: []
    },
    physicalTherapy: {
      enabled: false,
      sessionTime: "",
      sessionHours: "",
      sessionDays: []
    },
    abaTherapy: {
      enabled: false,
      sessionTime: "",
      sessionHours: "",
      sessionDays: []
    },
    
    // Daily Routine
    wakeUpTime: "07:00",
    breakfastTime: "08:00",
    lunchTime: "12:30",
    snackTime: "15:30",
    dinnerTime: "19:00",
    bedtime: "21:00",
    
    // Parent Availability for HOME EXERCISES - SEPARATED WEEKDAY/WEEKEND
    parentAvailability: {
      weekdayHours: "2",
      weekendHours: "4",
      weekdayTimeBlocks: {
        earlyMorning: false,
        morning: false,
        afternoon: false,
        evening: false,
        night: false
      },
      weekendTimeBlocks: {
        earlyMorning: false,
        morning: false,
        afternoon: false,
        evening: false,
        night: false
      }
    },
    
    // Uploaded Reports
    existingReports: [],
    detailedNotes: "",
  });

  // Constants
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const today = new Date().getDay();
  const todayName = daysOfWeek[today === 0 ? 6 : today - 1];

  // File Upload Handler with Text Extraction
  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setUploading(true);
    const newFiles = [];
    let extractedText = '';
    
    for (let file of files) {
      try {
        // Create temporary assessment ID for file storage
        const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const filePath = `${tempId}/${file.name}`;
        
        // Upload to Supabase
        const { data, error } = await supabase.storage
          .from("assessment-files")
          .upload(filePath, file);
        
        if (!error) {
          const { data: { publicUrl } } = supabase.storage
            .from("assessment-files")
            .getPublicUrl(filePath);
          
          newFiles.push({
            name: file.name,
            url: publicUrl,
            path: filePath,
            uploadedAt: new Date().toISOString()
          });
          
          // Try to extract text from file for AI analysis
          if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
            const text = await file.text();
            extractedText += text + '\n';
          }
        }
      } catch (err) {
        console.error("Upload error:", err);
      }
    }
    
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    setFormData(prev => ({
      ...prev,
      existingReports: [...prev.existingReports, ...newFiles]
    }));
    setReportContent(extractedText);
    setUploading(false);
    
    // Analyze uploaded files with AI
    if (newFiles.length > 0 || extractedText) {
      analyzeUploadedReports(newFiles, extractedText);
    }
  };

  // Enhanced AI Analysis - FIXED to use form data properly
  const analyzeUploadedReports = async (files, extractedText = '') => {
    try {
      const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Always use form data, even if no files uploaded
      const childDescription = formData.tellUsAboutChild || 'No description provided';
      const mainConcerns = formData.mainConcerns || 'No specific concerns mentioned';
      const parentGoals = formData.parentGoals || 'General improvement';
      
      if (!OPENAI_API_KEY) {
        console.log("No OpenAI API key found, using local analysis");
        performLocalAnalysis();
        return;
      }
      
      const prompt = `
        Analyze this child's therapy needs and provide specific recommendations.
        
        Parent's description of child: "${childDescription}"
        Main concerns from parent: "${mainConcerns}"
        Parent's goals: "${parentGoals}"
        Child's age: ${formData.age || 'Not specified'}
        ${extractedText ? `Additional report content: ${extractedText}` : ''}
        
        Based on this information, identify:
        1. ALL developmental concerns (speech, motor, sensory, behavior, cognitive)
        2. Specific reflexes that might be retained based on symptoms
        3. Recommended therapies with priority levels
        4. Specific exercises that would help
        5. Recommended hours of therapy based on severity
        
        Return ONLY a valid JSON object with this exact structure:
        {
          "detectedTherapies": ["speech", "ot", "pt", "aba"],
          "primaryConcerns": ["specific concern 1", "specific concern 2"],
          "retainedReflexes": ["Moro", "ATNR", "Spinal Galant"],
          "recommendedHours": { "weekday": 2, "weekend": 4 },
          "specificExercises": ["exercise 1", "exercise 2"],
          "insights": ["insight 1", "insight 2"],
          "severity": "mild|moderate|severe",
          "priorityOrder": ["therapy1", "therapy2"],
          "specialConsiderations": ["consideration 1"]
        }
      `;
      
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
              content: 'You are a pediatric therapy specialist. Analyze the information and return ONLY a valid JSON object with no additional text or explanation.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1500
        })
      });
      
      if (!response.ok) {
        console.error("OpenAI API request failed:", response.status);
        performLocalAnalysis();
        return;
      }
      
      const data = await response.json();
      
      if (data.error || !data.choices || !data.choices[0]) {
        console.error("AI API Error:", data.error || "Invalid response");
        performLocalAnalysis();
        return;
      }
      
      try {
        const content = data.choices[0].message.content.trim();
        // Clean the response to ensure it's valid JSON
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0]);
          setAiAnalysis(analysis);
          
          // Auto-enable detected therapies
          if (analysis.detectedTherapies) {
            analysis.detectedTherapies.forEach(therapy => {
              if (therapy === 'speech' && !formData.speechTherapy.enabled) {
                setFormData(prev => ({
                  ...prev,
                  speechTherapy: { ...prev.speechTherapy, enabled: true }
                }));
              }
              if (therapy === 'ot' && !formData.otTherapy.enabled) {
                setFormData(prev => ({
                  ...prev,
                  otTherapy: { ...prev.otTherapy, enabled: true }
                }));
              }
              if (therapy === 'pt' && !formData.physicalTherapy.enabled) {
                setFormData(prev => ({
                  ...prev,
                  physicalTherapy: { ...prev.physicalTherapy, enabled: true }
                }));
              }
              if (therapy === 'aba' && !formData.abaTherapy.enabled) {
                setFormData(prev => ({
                  ...prev,
                  abaTherapy: { ...prev.abaTherapy, enabled: true }
                }));
              }
            });
          }
        } else {
          console.error("Could not extract JSON from response");
          performLocalAnalysis();
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", parseError);
        performLocalAnalysis();
      }
      
    } catch (error) {
      console.error("AI Analysis error:", error);
      performLocalAnalysis();
    }
  };

  // Local analysis without AI - MUCH MORE COMPREHENSIVE
  const performLocalAnalysis = () => {
    const notes = (formData.tellUsAboutChild + ' ' + formData.mainConcerns + ' ' + formData.parentGoals).toLowerCase();
    const analysis = {
      detectedTherapies: [],
      primaryConcerns: [],
      retainedReflexes: [],
      insights: [],
      recommendedHours: { weekday: 2, weekend: 4 },
      severity: 'moderate'
    };
    
    // COMPREHENSIVE Speech detection
    const speechKeywords = ['speech', 'talk', 'language', 'communication', 'articulation', 'verbal', 
                           'word', 'vocabulary', 'pronounce', 'pronunciation', 'stutter', 'voice',
                           'sound', 'express', 'understand', 'comprehension', 'delay', 'late talker'];
    if (speechKeywords.some(keyword => notes.includes(keyword))) {
      analysis.detectedTherapies.push('speech');
      analysis.primaryConcerns.push('Speech and language delays');
    }
    
    // COMPREHENSIVE OT detection
    const otKeywords = ['writing', 'sensory', 'fine motor', 'buttons', 'pencil', 'scissors',
                       'handwriting', 'grip', 'zipper', 'dressing', 'feeding', 'texture',
                       'touch', 'sensitive', 'coordination', 'drawing', 'coloring', 'cutting'];
    if (otKeywords.some(keyword => notes.includes(keyword))) {
      analysis.detectedTherapies.push('ot');
      analysis.primaryConcerns.push('Fine motor/sensory issues');
    }
    
    // COMPREHENSIVE PT detection
    const ptKeywords = ['walking', 'gross motor', 'balance', 'clumsy', 'coordination', 'running',
                       'jumping', 'hopping', 'climbing', 'falling', 'strength', 'posture',
                       'sitting', 'standing', 'movement', 'physical', 'exercise', 'muscle'];
    if (ptKeywords.some(keyword => notes.includes(keyword))) {
      analysis.detectedTherapies.push('pt');
      analysis.primaryConcerns.push('Gross motor coordination issues');
    }
    
    // COMPREHENSIVE ABA detection
    const abaKeywords = ['behavior', 'tantrum', 'meltdown', 'attention', 'hyperactive', 'autism',
                        'asd', 'focus', 'concentrate', 'aggressive', 'hitting', 'biting',
                        'social', 'interaction', 'routine', 'transition', 'compliance', 'listening'];
    if (abaKeywords.some(keyword => notes.includes(keyword))) {
      analysis.detectedTherapies.push('aba');
      analysis.primaryConcerns.push('Behavioral challenges');
    }
    
    // If nothing detected but user wrote something, detect general developmental needs
    if (analysis.detectedTherapies.length === 0 && notes.length > 20) {
      // Look for any developmental concerns
      if (notes.includes('develop') || notes.includes('delay') || notes.includes('concern') || notes.includes('help')) {
        analysis.detectedTherapies.push('ot', 'speech');
        analysis.primaryConcerns.push('General developmental support needed');
      }
    }
    
    // Detect possible reflexes
    if (notes.includes('startle') || notes.includes('anxious') || notes.includes('sensitive')) {
      analysis.retainedReflexes.push('Moro');
    }
    if (notes.includes('writing') || notes.includes('handwriting') || notes.includes('crossing')) {
      analysis.retainedReflexes.push('ATNR');
    }
    if (notes.includes('fidget') || notes.includes('sitting') || notes.includes('bedwetting')) {
      analysis.retainedReflexes.push('Spinal Galant');
    }
    
    // Add insights
    if (analysis.detectedTherapies.length > 0) {
      analysis.insights.push('Multiple therapy needs detected - integrated approach recommended');
    }
    if (analysis.retainedReflexes.length > 0) {
      analysis.insights.push('Possible retained reflexes - reflex integration exercises will be included');
    }
    
    setAiAnalysis(analysis);
    
    // Auto-enable detected therapies
    if (analysis.detectedTherapies.length > 0) {
      analysis.detectedTherapies.forEach(therapy => {
        if (therapy === 'speech' && !formData.speechTherapy.enabled) {
          setFormData(prev => ({
            ...prev,
            speechTherapy: { ...prev.speechTherapy, enabled: true }
          }));
        }
        if (therapy === 'ot' && !formData.otTherapy.enabled) {
          setFormData(prev => ({
            ...prev,
            otTherapy: { ...prev.otTherapy, enabled: true }
          }));
        }
        if (therapy === 'pt' && !formData.physicalTherapy.enabled) {
          setFormData(prev => ({
            ...prev,
            physicalTherapy: { ...prev.physicalTherapy, enabled: true }
          }));
        }
        if (therapy === 'aba' && !formData.abaTherapy.enabled) {
          setFormData(prev => ({
            ...prev,
            abaTherapy: { ...prev.abaTherapy, enabled: true }
          }));
        }
      });
    }
  };

  // Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTherapyChange = (therapy, field, value) => {
    setFormData(prev => ({
      ...prev,
      [therapy]: { ...prev[therapy], [field]: value }
    }));
  };

  const handleTherapyDayToggle = (therapy, day) => {
    setFormData(prev => ({
      ...prev,
      [therapy]: {
        ...prev[therapy],
        sessionDays: prev[therapy].sessionDays.includes(day)
          ? prev[therapy].sessionDays.filter(d => d !== day)
          : [...prev[therapy].sessionDays, day]
      }
    }));
  };

  const handleSchoolDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      schoolDays: prev.schoolDays.includes(day)
        ? prev.schoolDays.filter(d => d !== day)
        : [...prev.schoolDays, day]
    }));
  };

  // Get reflex exercises from your database
  const getReflexExercises = (reflexName) => {
    const reflexKey = reflexName?.toLowerCase().replace(/\s+/g, '');
    const reflexData = COMPREHENSIVE_REFLEX_DATABASE[reflexKey];
    
    if (reflexData && reflexData.exercises) {
      return reflexData.exercises.map(ex => ({
        name: ex.name,
        duration: 10,
        instructions: ex.description,
        frequency: ex.frequency,
        equipment: 'See instructions',
        difficulty: 'Medium',
        targets: reflexName + ' reflex',
        priority: 'HIGH',
        icon: '🧠',
        isReflex: true,
        tip: `This helps integrate the ${reflexName} reflex`
      }));
    }
    return [];
  };

  // Generate VARIED exercises for each day - FIXED FOR MORE VARIETY
  const generateVariedExercises = (therapy, dayIndex, childAge, concerns) => {
    const age = parseInt(childAge) || 5;
    const notes = concerns.toLowerCase();
    
    // Massive exercise library with variations
    const exerciseLibrary = {
      speechTherapy: {
        oralMotor: [
          {
            name: 'Bubble Mountain Challenge',
            duration: 8,
            instructions: 'Blow bubbles through different size wands, try to make the biggest bubble mountain',
            equipment: 'Bubble solution, various wands',
            difficulty: 'Easy',
            targets: 'Breath control, oral motor',
            priority: 'HIGH',
            icon: '🫧',
            tip: '💡 Make it fun: Count bubbles, pop them with different body parts!',
            playful: true
          },
          {
            name: 'Straw Painting Art',
            duration: 10,
            instructions: 'Drop watercolor on paper, blow through straw to create designs',
            equipment: 'Straws, watercolors, paper',
            difficulty: 'Easy',
            targets: 'Breath control, lip strength',
            priority: 'HIGH',
            icon: '🎨',
            tip: '💡 Create stories about your paintings!',
            playful: true
          },
          {
            name: 'Animal Sound Safari',
            duration: 10,
            instructions: 'Make different animal sounds with exaggerated mouth movements',
            equipment: 'Animal cards or book',
            difficulty: 'Easy',
            targets: 'Articulation, oral motor',
            priority: 'HIGH',
            icon: '🦁',
            tip: '💡 Mirror practice: Watch your mouth make sounds!',
            playful: true
          },
          {
            name: 'Lollipop Tongue Gym',
            duration: 8,
            instructions: 'Lick lollipop in patterns: up/down, circles, side to side',
            equipment: 'Sugar-free lollipop',
            difficulty: 'Easy',
            targets: 'Tongue mobility',
            priority: 'HIGH',
            icon: '🍭',
            tip: '💡 Great for tongue lateralization needed for speech sounds!',
            playful: true
          },
          {
            name: 'Cheek Puff Dragon',
            duration: 5,
            instructions: 'Puff cheeks like dragon, hold 5 sec, release with funny sound',
            equipment: 'Mirror',
            difficulty: 'Easy',
            targets: 'Cheek strength',
            priority: 'MEDIUM',
            icon: '🐲',
            tip: '💡 Strengthens cheeks for better speech clarity',
            playful: true
          },
          {
            name: 'Whistle Training',
            duration: 8,
            instructions: 'Practice whistling or blowing through pursed lips',
            equipment: 'None',
            difficulty: 'Medium',
            targets: 'Lip rounding, breath control',
            priority: 'MEDIUM',
            icon: '🎵',
            tip: '💡 If whistling is hard, start with blowing kisses!',
            playful: true
          },
          {
            name: 'Cotton Ball Soccer',
            duration: 10,
            instructions: 'Blow cotton balls across table into goal using straw',
            equipment: 'Cotton balls, straws, cups for goals',
            difficulty: 'Easy',
            targets: 'Breath control, sustained airflow',
            priority: 'HIGH',
            icon: '⚽',
            tip: '💡 Sustained blowing strengthens respiratory support for speech!',
            playful: true
          },
          {
            name: 'Tongue Tapping Beats',
            duration: 8,
            instructions: 'Tap tongue on roof of mouth to make different rhythms',
            equipment: 'None',
            difficulty: 'Medium',
            targets: 'Tongue elevation, control',
            priority: 'HIGH',
            icon: '🥁',
            tip: '💡 Important for T, D, N, L sounds!',
            playful: true
          }
        ],
        language: [
          {
            name: 'Story Dice Adventure',
            duration: 15,
            instructions: 'Roll dice with pictures, create silly story using all images',
            equipment: 'Story dice or picture cards',
            difficulty: 'Medium',
            targets: 'Narrative skills',
            priority: 'HIGH',
            icon: '🎲',
            tip: '💡 Start with "Once upon a time" - encourage full sentences!',
            playful: true
          },
          {
            name: 'Rhyme Time Dance',
            duration: 10,
            instructions: 'Say rhyming words while doing actions (hop-stop, run-sun)',
            equipment: 'None',
            difficulty: 'Easy',
            targets: 'Phonological awareness',
            priority: 'HIGH',
            icon: '🎵',
            tip: '💡 Rhyming builds reading readiness!',
            playful: true
          },
          {
            name: 'Telephone Talk Show',
            duration: 10,
            instructions: 'Pretend phone conversations with different characters',
            equipment: 'Toy phones',
            difficulty: 'Easy',
            targets: 'Conversation skills',
            priority: 'MEDIUM',
            icon: '📞',
            tip: '💡 Practice greetings, questions, and goodbye!',
            playful: true
          },
          {
            name: 'Category Sorting Game',
            duration: 12,
            instructions: 'Sort toys/cards into categories, explain why they belong',
            equipment: 'Various toys or picture cards',
            difficulty: 'Medium',
            targets: 'Vocabulary, categorization',
            priority: 'HIGH',
            icon: '📦',
            tip: '💡 Start with simple categories: animals, food, vehicles',
            playful: true
          },
          {
            name: 'Opposite Day Fun',
            duration: 10,
            instructions: 'Say and act out opposites: big/small, fast/slow, happy/sad',
            equipment: 'None',
            difficulty: 'Easy',
            targets: 'Vocabulary, concepts',
            priority: 'MEDIUM',
            icon: '↔️',
            tip: '💡 Use whole body to show opposites!',
            playful: true
          },
          {
            name: 'Following Directions Game',
            duration: 10,
            instructions: 'Give silly 2-3 step directions: hop twice, touch nose, spin',
            equipment: 'None',
            difficulty: 'Medium',
            targets: 'Listening, processing',
            priority: 'HIGH',
            icon: '👂',
            tip: '💡 Start with 2 steps, work up to 4!',
            playful: true
          },
          {
            name: 'What Happens Next?',
            duration: 10,
            instructions: 'Read part of story, child predicts what happens next',
            equipment: 'Picture books',
            difficulty: 'Medium',
            targets: 'Prediction, reasoning',
            priority: 'HIGH',
            icon: '📚',
            tip: '💡 Accept all answers, ask "why do you think that?"',
            playful: false
          }
        ],
        articulation: [
          {
            name: 'Sound Hunt Treasure',
            duration: 10,
            instructions: 'Find objects starting with target sound around house',
            equipment: 'Basket or bag',
            difficulty: 'Easy',
            targets: 'Sound awareness',
            priority: 'HIGH',
            icon: '🔍',
            tip: '💡 Focus on one sound per week for mastery',
            playful: true
          },
          {
            name: 'Mirror Monster Mouths',
            duration: 8,
            instructions: 'Make silly faces emphasizing target sounds in mirror',
            equipment: 'Mirror',
            difficulty: 'Easy',
            targets: 'Articulation',
            priority: 'HIGH',
            icon: '👾',
            tip: '💡 Exaggerated movements help muscle memory!',
            playful: true
          },
          {
            name: 'Sound Hopscotch',
            duration: 10,
            instructions: 'Draw hopscotch with letters, say sound when jumping on each',
            equipment: 'Chalk or tape',
            difficulty: 'Medium',
            targets: 'Sound production, gross motor',
            priority: 'HIGH',
            icon: '🎯',
            tip: '💡 Combine movement with speech for better retention!',
            playful: true
          },
          {
            name: 'Silly Sound Stories',
            duration: 12,
            instructions: 'Make up story using many words with target sound',
            equipment: 'Picture cards optional',
            difficulty: 'Medium',
            targets: 'Sound generalization',
            priority: 'HIGH',
            icon: '📖',
            tip: '💡 Silly stories are more memorable!',
            playful: true
          },
          {
            name: 'Sound Sorting Buckets',
            duration: 10,
            instructions: 'Sort pictures into buckets based on beginning sound',
            equipment: 'Picture cards, containers',
            difficulty: 'Easy',
            targets: 'Sound discrimination',
            priority: 'MEDIUM',
            icon: '🪣',
            tip: '💡 Start with very different sounds, then similar ones',
            playful: true
          }
        ]
      },
      
      otTherapy: {
        sensory: [
          {
            name: 'Sensory Soup Kitchen',
            duration: 15,
            instructions: 'Mix dried beans, rice, pasta in bin, hide small toys to find',
            equipment: 'Bin, dried goods, small toys',
            difficulty: 'Easy',
            targets: 'Tactile processing',
            priority: 'HIGH',
            icon: '🥣',
            tip: '💡 Deep pressure to hands calms the nervous system',
            playful: true
          },
          {
            name: 'Shaving Cream Car Wash',
            duration: 12,
            instructions: 'Draw roads in shaving cream, drive toy cars through',
            equipment: 'Shaving cream, toy cars, tray',
            difficulty: 'Easy',
            targets: 'Tactile, visual motor',
            priority: 'HIGH',
            icon: '🚗',
            tip: '💡 Add food coloring for extra fun!',
            playful: true
          },
          {
            name: 'Body Sock Obstacle Course',
            duration: 10,
            instructions: 'Crawl through tunnels, over pillows in stretchy sock',
            equipment: 'Body sock or sleeping bag',
            difficulty: 'Medium',
            targets: 'Proprioception',
            priority: 'HIGH',
            icon: '🐛',
            tip: '💡 Deep pressure input helps with self-regulation',
            playful: true
          },
          {
            name: 'Play Dough Power',
            duration: 12,
            instructions: 'Hide beads in play dough, find and sort by color',
            equipment: 'Play dough, beads',
            difficulty: 'Easy',
            targets: 'Hand strength, tactile',
            priority: 'HIGH',
            icon: '🎨',
            tip: '💡 Rolling snakes and balls builds hand muscles!',
            playful: true
          },
          {
            name: 'Water Bead Exploration',
            duration: 10,
            instructions: 'Scoop, pour, squeeze water beads with tools',
            equipment: 'Water beads, containers, tools',
            difficulty: 'Easy',
            targets: 'Sensory exploration',
            priority: 'MEDIUM',
            icon: '💧',
            tip: '💡 Great for kids who avoid wet textures!',
            playful: true
          }
        ],
        fineMotor: [
          {
            name: 'Pompom Hockey',
            duration: 10,
            instructions: 'Use straws to blow pompoms into goals',
            equipment: 'Pompoms, straws, tape for goals',
            difficulty: 'Easy',
            targets: 'Breath control, hand-eye',
            priority: 'MEDIUM',
            icon: '🏒',
            tip: '💡 Works on controlled breathing AND visual tracking!',
            playful: true
          },
          {
            name: 'Tweezer Feed the Monster',
            duration: 10,
            instructions: 'Use tweezers to feed pompoms to cardboard monster',
            equipment: 'Tweezers, pompoms, decorated box',
            difficulty: 'Medium',
            targets: 'Pincer grasp',
            priority: 'HIGH',
            icon: '👹',
            tip: '💡 Strengthens muscles needed for pencil grip',
            playful: true
          },
          {
            name: 'Sticker Story Scene',
            duration: 12,
            instructions: 'Peel and place stickers to create scene, tell story',
            equipment: 'Stickers, paper',
            difficulty: 'Easy',
            targets: 'Fine motor precision',
            priority: 'MEDIUM',
            icon: '⭐',
            tip: '💡 Peeling stickers builds finger strength!',
            playful: true
          },
          {
            name: 'Pipe Cleaner Sculptures',
            duration: 10,
            instructions: 'Bend, twist pipe cleaners into animals or shapes',
            equipment: 'Pipe cleaners',
            difficulty: 'Medium',
            targets: 'Finger strength, creativity',
            priority: 'MEDIUM',
            icon: '🎭',
            tip: '💡 Great for bilateral coordination!',
            playful: true
          },
          {
            name: 'Button Box Threading',
            duration: 10,
            instructions: 'Thread buttons onto string, make patterns',
            equipment: 'Large buttons, thick string',
            difficulty: 'Medium',
            targets: 'Hand-eye coordination',
            priority: 'HIGH',
            icon: '🔘',
            tip: '💡 Start with big buttons, work down to smaller!',
            playful: false
          },
          {
            name: 'Clothespin Rescue',
            duration: 8,
            instructions: 'Use clothespins to rescue small toys from container',
            equipment: 'Clothespins, small toys, container',
            difficulty: 'Easy',
            targets: 'Grip strength',
            priority: 'HIGH',
            icon: '📎',
            tip: '💡 Squeezing clothespins builds hand strength!',
            playful: true
          }
        ],
        handwriting: [
          {
            name: 'Rainbow Writing',
            duration: 8,
            instructions: 'Trace letters with different colors to make rainbow',
            equipment: 'Crayons, paper with dotted letters',
            difficulty: 'Easy',
            targets: 'Letter formation',
            priority: 'HIGH',
            icon: '🌈',
            tip: '💡 Multi-sensory learning improves retention',
            playful: true
          },
          {
            name: 'Sandbox Letters',
            duration: 10,
            instructions: 'Write letters in sand tray with finger',
            equipment: 'Shallow tray with sand',
            difficulty: 'Easy',
            targets: 'Pre-writing',
            priority: 'HIGH',
            icon: '🏖️',
            tip: '💡 Tactile input helps motor planning',
            playful: true
          },
          {
            name: 'Dot-to-Dot Adventures',
            duration: 10,
            instructions: 'Connect dots to reveal pictures, trace over lines',
            equipment: 'Dot-to-dot worksheets',
            difficulty: 'Medium',
            targets: 'Pencil control',
            priority: 'MEDIUM',
            icon: '✏️',
            tip: '💡 Builds visual tracking and pencil control!',
            playful: true
          },
          {
            name: 'Letter Formation Races',
            duration: 8,
            instructions: 'Race to write letters correctly on whiteboard',
            equipment: 'Small whiteboard, markers',
            difficulty: 'Medium',
            targets: 'Letter formation speed',
            priority: 'MEDIUM',
            icon: '🏃',
            tip: '💡 Focus on correct formation, not just speed!',
            playful: true
          }
        ]
      },
      
      physicalTherapy: {
        reflexIntegration: [
          {
            name: 'Starfish to Soldier',
            duration: 8,
            instructions: 'Lie on back, spread like starfish, then bring arms/legs together like soldier',
            equipment: 'Mat',
            difficulty: 'Easy',
            targets: 'Moro reflex integration',
            priority: 'HIGH',
            icon: '⭐',
            tip: '💡 Integrating Moro reflex reduces anxiety and improves focus!',
            isReflex: true
          },
          {
            name: 'Cross-Crawl Dance Party',
            duration: 10,
            instructions: 'Touch opposite elbow to knee while dancing to music',
            equipment: 'Music',
            difficulty: 'Easy',
            targets: 'ATNR reflex, midline crossing',
            priority: 'HIGH',
            icon: '💃',
            tip: '💡 Crossing midline improves reading and writing skills!',
            isReflex: true,
            playful: true
          },
          {
            name: 'Log Roll Races',
            duration: 8,
            instructions: 'Roll like a log keeping body straight, race to finish line',
            equipment: 'Mat or carpet',
            difficulty: 'Easy',
            targets: 'Spinal Galant reflex',
            priority: 'HIGH',
            icon: '🪵',
            tip: '💡 Helps with bedwetting and sitting still!',
            isReflex: true,
            playful: true
          },
          {
            name: 'Bear Walk Safari',
            duration: 10,
            instructions: 'Walk on hands and feet like bear, collect safari animals',
            equipment: 'Toy animals',
            difficulty: 'Medium',
            targets: 'STNR reflex, core strength',
            priority: 'HIGH',
            icon: '🐻',
            tip: '💡 Improves posture and attention for desk work!',
            isReflex: true,
            playful: true
          },
          {
            name: 'Superman Flying',
            duration: 8,
            instructions: 'Lie on tummy, lift arms and legs like flying, hold 5 seconds',
            equipment: 'Mat',
            difficulty: 'Medium',
            targets: 'TLR reflex, back strength',
            priority: 'HIGH',
            icon: '🦸',
            tip: '💡 Strengthens back and improves posture!',
            isReflex: true,
            playful: true
          }
        ],
        balance: [
          {
            name: 'Flamingo Freeze Dance',
            duration: 10,
            instructions: 'Dance, then freeze on one foot when music stops',
            equipment: 'Music',
            difficulty: 'Medium',
            targets: 'Balance, motor planning',
            priority: 'MEDIUM',
            icon: '🦩',
            tip: '💡 Start with 5 seconds, work up to 30!',
            playful: true
          },
          {
            name: 'Pillow Path Adventure',
            duration: 10,
            instructions: 'Walk on pillow path without falling into "lava"',
            equipment: 'Pillows',
            difficulty: 'Easy',
            targets: 'Balance, proprioception',
            priority: 'MEDIUM',
            icon: '🌋',
            tip: '💡 Uneven surfaces challenge the vestibular system!',
            playful: true
          },
          {
            name: 'Tightrope Walker',
            duration: 8,
            instructions: 'Walk heel-to-toe on tape line, arms out for balance',
            equipment: 'Masking tape',
            difficulty: 'Medium',
            targets: 'Balance, coordination',
            priority: 'HIGH',
            icon: '🎪',
            tip: '💡 Look ahead, not down at feet!',
            playful: true
          },
          {
            name: 'Balance Beam Delivery',
            duration: 10,
            instructions: 'Walk on beam/line carrying objects without dropping',
            equipment: 'Tape line, bean bags',
            difficulty: 'Medium',
            targets: 'Dynamic balance',
            priority: 'HIGH',
            icon: '📦',
            tip: '💡 Start with easy objects, progress to tricky ones!',
            playful: true
          }
        ],
        gross: [
          {
            name: 'Animal Movement Dice',
            duration: 12,
            instructions: 'Roll dice: 1=hop like bunny, 2=crawl like crab, 3=jump like frog, etc',
            equipment: 'Dice',
            difficulty: 'Easy',
            targets: 'Motor planning, coordination',
            priority: 'HIGH',
            icon: '🎲',
            tip: '💡 Different movements work different muscle groups!',
            playful: true
          },
          {
            name: 'Balloon Volleyball',
            duration: 10,
            instructions: 'Keep balloon in air, cant let it touch ground',
            equipment: 'Balloon',
            difficulty: 'Easy',
            targets: 'Eye-hand coordination',
            priority: 'MEDIUM',
            icon: '🎈',
            tip: '💡 Slow movement improves motor control!',
            playful: true
          },
          {
            name: 'Obstacle Course Challenge',
            duration: 15,
            instructions: 'Crawl under tables, jump over pillows, spin 3 times, hop to finish',
            equipment: 'Household items',
            difficulty: 'Medium',
            targets: 'Motor planning, sequencing',
            priority: 'HIGH',
            icon: '🏃',
            tip: '💡 Change course daily for new challenges!',
            playful: true
          },
          {
            name: 'Dance Freeze Shapes',
            duration: 10,
            instructions: 'Dance freely, freeze in shape called out (star, ball, tree)',
            equipment: 'Music',
            difficulty: 'Easy',
            targets: 'Body awareness, control',
            priority: 'MEDIUM',
            icon: '🕺',
            tip: '💡 Great for impulse control and listening!',
            playful: true
          },
          {
            name: 'Jumping Jack Variations',
            duration: 8,
            instructions: 'Star jumps, cross jumps, half jacks, slow motion jacks',
            equipment: 'None',
            difficulty: 'Medium',
            targets: 'Bilateral coordination',
            priority: 'HIGH',
            icon: '⭐',
            tip: '💡 Start slow, focus on coordination before speed!',
            playful: false
          }
        ]
      },
      
      abaTherapy: {
        behavior: [
          {
            name: 'Calm Down Volcano',
            duration: 8,
            instructions: 'Pretend to be volcano: build up tension, then slowly release with breathing',
            equipment: 'None',
            difficulty: 'Easy',
            targets: 'Emotional regulation',
            priority: 'HIGH',
            icon: '🌋',
            tip: '💡 Teach before meltdowns for best results!',
            playful: true
          },
          {
            name: 'Feeling Faces Charades',
            duration: 10,
            instructions: 'Act out emotions, others guess, discuss when we feel that way',
            equipment: 'Emotion cards',
            difficulty: 'Easy',
            targets: 'Emotion recognition',
            priority: 'HIGH',
            icon: '😊',
            tip: '💡 Understanding emotions reduces behavioral issues!',
            playful: true
          },
          {
            name: 'Token Treasure Hunt',
            duration: 10,
            instructions: 'Earn tokens for completing tasks, trade for treasures',
            equipment: 'Tokens, reward box',
            difficulty: 'Easy',
            targets: 'Positive reinforcement',
            priority: 'HIGH',
            icon: '🏆',
            tip: '💡 Immediate rewards work best for young children!',
            playful: true
          },
          {
            name: 'Red Light Green Light Emotions',
            duration: 8,
            instructions: 'Red light = stop and breathe, yellow = think, green = go with good choice',
            equipment: 'Colored cards or lights',
            difficulty: 'Easy',
            targets: 'Impulse control',
            priority: 'HIGH',
            icon: '🚦',
            tip: '💡 Practice when calm to use during difficult moments!',
            playful: true
          },
          {
            name: 'Anger Thermometer',
            duration: 10,
            instructions: 'Draw thermometer, mark feelings from cool to hot, practice cooling strategies',
            equipment: 'Paper, markers',
            difficulty: 'Medium',
            targets: 'Anger management',
            priority: 'HIGH',
            icon: '🌡️',
            tip: '💡 Visual scales help kids understand intensity of feelings!',
            playful: false
          }
        ],
        social: [
          {
            name: 'Turn-Taking Tower',
            duration: 10,
            instructions: 'Take turns adding blocks to tower, say one nice thing each turn',
            equipment: 'Blocks',
            difficulty: 'Easy',
            targets: 'Turn-taking, social skills',
            priority: 'MEDIUM',
            icon: '🏗️',
            tip: '💡 Builds patience and social awareness!',
            playful: true
          },
          {
            name: 'Puppet Problem Solving',
            duration: 12,
            instructions: 'Use puppets to act out social problems and solutions',
            equipment: 'Puppets or stuffed animals',
            difficulty: 'Medium',
            targets: 'Social problem solving',
            priority: 'HIGH',
            icon: '🎭',
            tip: '💡 Role play helps practice before real situations!',
            playful: true
          },
          {
            name: 'Friendship Recipe',
            duration: 10,
            instructions: 'Create recipe for being a good friend: mix kindness, add sharing, stir in listening',
            equipment: 'Paper, crayons',
            difficulty: 'Easy',
            targets: 'Social skills concepts',
            priority: 'MEDIUM',
            icon: '👫',
            tip: '💡 Make it visual with drawings of each ingredient!',
            playful: true
          },
          {
            name: 'Compliment Circle',
            duration: 8,
            instructions: 'Pass a ball, give compliment to person you pass to',
            equipment: 'Soft ball',
            difficulty: 'Easy',
            targets: 'Positive interactions',
            priority: 'MEDIUM',
            icon: '💝',
            tip: '💡 Model specific compliments: "I like how you..."',
            playful: true
          },
          {
            name: 'Space Bubble Practice',
            duration: 8,
            instructions: 'Use hula hoop to show personal space, practice appropriate distances',
            equipment: 'Hula hoop or rope circle',
            difficulty: 'Easy',
            targets: 'Personal boundaries',
            priority: 'HIGH',
            icon: '🫧',
            tip: '💡 Important for kids who get too close or touch too much!',
            playful: true
          }
        ],
        routine: [
          {
            name: 'Visual Schedule Check',
            duration: 5,
            instructions: 'Review picture schedule, move completed tasks to "done"',
            equipment: 'Visual schedule board',
            difficulty: 'Easy',
            targets: 'Routine following',
            priority: 'HIGH',
            icon: '📅',
            tip: '💡 Predictability reduces anxiety and tantrums!',
            playful: false
          },
          {
            name: 'First-Then Game',
            duration: 8,
            instructions: 'First do non-preferred task, then preferred activity',
            equipment: 'First-Then board',
            difficulty: 'Easy',
            targets: 'Compliance, transitions',
            priority: 'HIGH',
            icon: '➡️',
            tip: '💡 Makes transitions predictable and manageable!',
            playful: false
          },
          {
            name: 'Timer Challenge',
            duration: 10,
            instructions: 'Set timer for tasks, try to beat the timer (but do it right!)',
            equipment: 'Visual timer',
            difficulty: 'Medium',
            targets: 'Task completion',
            priority: 'MEDIUM',
            icon: '⏰',
            tip: '💡 Makes boring tasks into games!',
            playful: true
          },
          {
            name: 'Choice Board Power',
            duration: 8,
            instructions: 'Child chooses order of activities from choice board',
            equipment: 'Choice board with pictures',
            difficulty: 'Easy',
            targets: 'Autonomy, compliance',
            priority: 'HIGH',
            icon: '🎯',
            tip: '💡 Giving choices reduces power struggles!',
            playful: false
          },
          {
            name: 'Transition Song',
            duration: 5,
            instructions: 'Sing special song when changing activities',
            equipment: 'None',
            difficulty: 'Easy',
            targets: 'Smooth transitions',
            priority: 'MEDIUM',
            icon: '🎵',
            tip: '💡 Same song every time creates predictable routine!',
            playful: true
          }
        ]
      }
    };
    
    // Get exercises based on therapy type and day - BETTER VARIETY
    const therapyKey = therapy.toLowerCase().replace(' ', '');
    const exercises = [];
    
    if (therapyKey === 'speech') {
      // Rotate through different types each day with better variety
      const categories = ['oralMotor', 'language', 'articulation'];
      const primaryCategory = categories[dayIndex % categories.length];
      const secondaryCategory = categories[(dayIndex + 1) % categories.length];
      
      const primaryExercises = exerciseLibrary.speechTherapy[primaryCategory] || [];
      const secondaryExercises = exerciseLibrary.speechTherapy[secondaryCategory] || [];
      
      // Add 2 from primary category, starting at different points based on day
      const primaryStart = (dayIndex * 2) % primaryExercises.length;
      for (let i = 0; i < 2 && i < primaryExercises.length; i++) {
        const exercise = primaryExercises[(primaryStart + i) % primaryExercises.length];
        if (exercise) exercises.push(exercise);
      }
      
      // Add 1 from secondary category for variety
      if (secondaryExercises.length > 0) {
        const secondaryIndex = dayIndex % secondaryExercises.length;
        exercises.push(secondaryExercises[secondaryIndex]);
      }
    }
    
    if (therapyKey === 'ot') {
      const categories = ['sensory', 'fineMotor', 'handwriting'];
      const primaryCategory = categories[dayIndex % categories.length];
      const secondaryCategory = categories[(dayIndex + 1) % categories.length];
      
      const primaryExercises = exerciseLibrary.otTherapy[primaryCategory] || [];
      const secondaryExercises = exerciseLibrary.otTherapy[secondaryCategory] || [];
      
      // Different starting point each day
      const primaryStart = (dayIndex * 2) % primaryExercises.length;
      for (let i = 0; i < 2 && i < primaryExercises.length; i++) {
        const exercise = primaryExercises[(primaryStart + i) % primaryExercises.length];
        if (exercise) exercises.push(exercise);
      }
      
      // Add variety from secondary
      if (secondaryExercises.length > 0) {
        const secondaryIndex = dayIndex % secondaryExercises.length;
        exercises.push(secondaryExercises[secondaryIndex]);
      }
    }
    
    if (therapyKey === 'pt') {
      const categories = ['reflexIntegration', 'balance', 'gross'];
      const primaryCategory = categories[dayIndex % categories.length];
      const secondaryCategory = categories[(dayIndex + 1) % categories.length];
      
      const primaryExercises = exerciseLibrary.physicalTherapy[primaryCategory] || [];
      const secondaryExercises = exerciseLibrary.physicalTherapy[secondaryCategory] || [];
      
      const primaryStart = (dayIndex * 2) % primaryExercises.length;
      for (let i = 0; i < 2 && i < primaryExercises.length; i++) {
        const exercise = primaryExercises[(primaryStart + i) % primaryExercises.length];
        if (exercise) exercises.push(exercise);
      }
      
      if (secondaryExercises.length > 0) {
        const secondaryIndex = dayIndex % secondaryExercises.length;
        exercises.push(secondaryExercises[secondaryIndex]);
      }
    }
    
    if (therapyKey === 'aba') {
      const categories = ['behavior', 'social', 'routine'];
      // ABA rotates differently for more behavioral variety
      const dayRotation = dayIndex % categories.length;
      const primaryCategory = categories[dayRotation];
      const secondaryCategory = categories[(dayRotation + 1) % categories.length];
      
      const primaryExercises = exerciseLibrary.abaTherapy[primaryCategory] || [];
      const secondaryExercises = exerciseLibrary.abaTherapy[secondaryCategory] || [];
      
      // Use different exercises each day
      const primaryStart = dayIndex % primaryExercises.length;
      if (primaryExercises[primaryStart]) {
        exercises.push(primaryExercises[primaryStart]);
      }
      
      const secondaryStart = (dayIndex + 1) % secondaryExercises.length;
      if (secondaryExercises[secondaryStart]) {
        exercises.push(secondaryExercises[secondaryStart]);
      }
      
      // Add third exercise if space
      const tertiaryCategory = categories[(dayRotation + 2) % categories.length];
      const tertiaryExercises = exerciseLibrary.abaTherapy[tertiaryCategory] || [];
      const tertiaryStart = dayIndex % tertiaryExercises.length;
      if (tertiaryExercises[tertiaryStart]) {
        exercises.push(tertiaryExercises[tertiaryStart]);
      }
    }
    
    return exercises;
  };

  // FIXED Calendar Generation with Better Weekend Logic
  const generateSmartCalendar = (data) => {
    const weeklySchedule = {};
    const selectedTherapies = [];
    
    // Collect enabled therapies
    ['speechTherapy', 'otTherapy', 'physicalTherapy', 'abaTherapy'].forEach(therapy => {
      if (data[therapy].enabled) {
        const therapyNames = {
          'speechTherapy': 'Speech',
          'otTherapy': 'OT',
          'physicalTherapy': 'PT',
          'abaTherapy': 'ABA'
        };
        selectedTherapies.push({
          key: therapy,
          name: therapyNames[therapy],
          days: data[therapy].sessionDays || [],
          professionalTime: data[therapy].sessionTime,
          professionalHours: parseFloat(data[therapy].sessionHours) || 0
        });
      }
    });

    // Detect what child needs from parent notes
    const notes = (data.tellUsAboutChild + ' ' + data.mainConcerns + ' ' + data.parentGoals).toLowerCase();
    const detectedNeeds = {
      speech: notes.includes('speech') || notes.includes('talk') || notes.includes('language') || 
               notes.includes('communication') || notes.includes('articulation'),
      ot: notes.includes('writing') || notes.includes('sensory') || notes.includes('fine motor') || 
          notes.includes('buttons') || notes.includes('pencil'),
      pt: notes.includes('walking') || notes.includes('balance') || notes.includes('gross motor') || 
          notes.includes('clumsy') || notes.includes('coordination'),
      aba: notes.includes('behavior') || notes.includes('tantrum') || notes.includes('meltdown') || 
           notes.includes('attention') || notes.includes('hyperactive')
    };
    
    // Check for reflex indicators
    const detectedReflexes = [];
    if (notes.includes('startle') || notes.includes('anxious') || notes.includes('sensitive')) {
      detectedReflexes.push('moro');
    }
    if (notes.includes('fidget') || notes.includes('sitting') || notes.includes('bedwetting')) {
      detectedReflexes.push('spinalgalant');
    }
    if (notes.includes('handwriting') || notes.includes('crossing')) {
      detectedReflexes.push('atnr');
    }

    // Generate schedule for each day
    daysOfWeek.forEach((day, dayIndex) => {
      const isWeekend = ['Saturday', 'Sunday'].includes(day);
      
      // Get planned hours - FIXED to use correct values
      const dailyHours = isWeekend 
        ? parseFloat(data.parentAvailability?.weekendHours || '0')
        : parseFloat(data.parentAvailability?.weekdayHours || '0');
      
      const targetMinutes = dailyHours * 60;
      const daySchedule = [];
      
      // Skip if no hours allocated
      if (targetMinutes === 0) {
        weeklySchedule[day] = { 
          exercises: [], 
          totalMinutes: 0,
          displayHours: '0 hours',
          plannedHours: 0
        };
        return; // Use return instead of continue in forEach
      }
      
      // Calculate blocked times
      const blockedTimes = [];
      
      // Add professional therapy sessions
      selectedTherapies.forEach(therapy => {
        if (therapy.days.includes(day) && therapy.professionalTime && therapy.professionalHours > 0) {
          const [hours, minutes] = therapy.professionalTime.split(':').map(Number);
          const startHour = hours + (minutes / 60);
          const endHour = startHour + therapy.professionalHours;
          blockedTimes.push({ 
            start: startHour, 
            end: endHour, 
            type: `${therapy.name} Professional Session`,
            isTherapy: true
          });
        }
      });
      
      // Add school (weekdays only)
      if (!isWeekend && data.hasSchool === 'yes' && 
          data.schoolDays.includes(day) && 
          data.schoolStartTime && data.schoolEndTime) {
        const [startH, startM] = data.schoolStartTime.split(':').map(Number);
        const [endH, endM] = data.schoolEndTime.split(':').map(Number);
        blockedTimes.push({ 
          start: startH + (startM / 60), 
          end: endH + (endM / 60), 
          type: 'School' 
        });
      }
      
      // Add meal times
      const dinnerTime = data.dinnerTime || '19:00';
      const [dinnerH, dinnerM] = dinnerTime.split(':').map(Number);
      const dinnerHour = dinnerH + (dinnerM / 60);
      
      blockedTimes.push({
        start: dinnerHour - 0.5,
        end: dinnerHour + 1,
        type: 'Dinner Time'
      });
      
      // Find best time slot - FIXED LOGIC FOR PROPER TIME SELECTION
      let bestStartTime = null;
      const timeBlocks = isWeekend 
        ? data.parentAvailability?.weekendTimeBlocks 
        : data.parentAvailability?.weekdayTimeBlocks;
      
      if (isWeekend) {
        // Weekend: Check weekend-specific time blocks
        const weekendPreferences = [
          { block: 'earlyMorning', hour: 7, label: '07:00' },
          { block: 'morning', hour: 9, label: '09:00' },
          { block: 'afternoon', hour: 14, label: '14:00' },
          { block: 'evening', hour: 17, label: '17:00' },
          { block: 'night', hour: 19, label: '19:00' }
        ];
        
        // First try user-selected weekend time blocks
        let foundSlot = false;
        if (timeBlocks) {
          for (const pref of weekendPreferences) {
            if (timeBlocks[pref.block]) {
              const endTime = pref.hour + (targetMinutes / 60);
              const hasConflict = blockedTimes.some(blocked => 
                (pref.hour >= blocked.start && pref.hour < blocked.end) ||
                (endTime > blocked.start && endTime <= blocked.end)
              );
              
              if (!hasConflict) {
                bestStartTime = pref.label;
                foundSlot = true;
                break;
              }
            }
          }
        }
        
        // If no weekend time blocks selected or no slot works, use default morning
        if (!foundSlot) {
          bestStartTime = '10:00'; // Default weekend morning time
        }
      } else {
        // WEEKDAY LOGIC - FIXED to properly check selected time blocks
        const weekdayPreferences = [
          { block: 'earlyMorning', hour: 6.5, label: '06:30' },
          { block: 'morning', hour: 9, label: '09:00' },
          { block: 'afternoon', hour: 14, label: '14:00' },
          { block: 'evening', hour: 17, label: '17:00' },
          { block: 'night', hour: 19.5, label: '19:30' }
        ];
        
        let foundSlot = false;
        if (timeBlocks) {
          // Process preferences in the order they appear (earliest to latest)
          for (const pref of weekdayPreferences) {
            if (timeBlocks[pref.block]) {
              const endTime = pref.hour + (targetMinutes / 60);
              
              // Check for conflicts with professional therapy and school
              const hasConflict = blockedTimes.some(blocked => 
                (pref.hour >= blocked.start && pref.hour < blocked.end) ||
                (endTime > blocked.start && endTime <= blocked.end) ||
                (pref.hour < blocked.end && endTime > blocked.start)
              );
              
              if (!hasConflict) {
                bestStartTime = pref.label;
                foundSlot = true;
                break;
              }
            }
          }
        }
        
        // Fallback for weekdays - after all blocked times
        if (!foundSlot) {
          // If no time blocks selected, find time after all conflicts
          const schoolAndTherapyBlocks = blockedTimes.filter(b => b.type !== 'Dinner Time');
          if (schoolAndTherapyBlocks.length > 0) {
            const lastBlocked = Math.max(...schoolAndTherapyBlocks.map(b => b.end));
            if (lastBlocked > 0 && lastBlocked < 18) {
              const hour = Math.ceil(lastBlocked);
              bestStartTime = `${String(hour).padStart(2, '0')}:00`;
            } else {
              bestStartTime = '16:00'; // Default after-school time
            }
          } else {
            // No conflicts, use first available evening slot if that's what was selected
            if (timeBlocks?.evening) {
              bestStartTime = '17:00';
            } else if (timeBlocks?.night) {
              bestStartTime = '19:30';
            } else if (timeBlocks?.afternoon) {
              bestStartTime = '14:00';
            } else if (timeBlocks?.morning) {
              bestStartTime = '09:00';
            } else {
              bestStartTime = '16:00'; // Default
            }
          }
        }
      }
      
      // Generate exercises for the allocated time
      let currentTime = new Date(`2024-01-01T${bestStartTime}:00`);
      let totalMinutes = 0;
      let exerciseCount = 0;
      
      // Build therapy priority list
      const therapyPriorities = [];
      
      // Prioritize based on detected needs
      if (detectedNeeds.speech && selectedTherapies.some(t => t.key === 'speechTherapy')) {
        therapyPriorities.push({ name: 'Speech', key: 'speechTherapy', priority: 'HIGH' });
      }
      if (detectedNeeds.aba && selectedTherapies.some(t => t.key === 'abaTherapy')) {
        therapyPriorities.push({ name: 'ABA', key: 'abaTherapy', priority: 'HIGH' });
      }
      if (detectedNeeds.ot && selectedTherapies.some(t => t.key === 'otTherapy')) {
        therapyPriorities.push({ name: 'OT', key: 'otTherapy', priority: 'MEDIUM' });
      }
      if (detectedNeeds.pt && selectedTherapies.some(t => t.key === 'physicalTherapy')) {
        therapyPriorities.push({ name: 'PT', key: 'physicalTherapy', priority: 'MEDIUM' });
      }
      
      // Add any enabled therapies not yet in list
      selectedTherapies.forEach(therapy => {
        if (!therapyPriorities.find(t => t.key === therapy.key)) {
          therapyPriorities.push({
            name: therapy.name,
            key: therapy.key,
            priority: 'LOW'
          });
        }
      });
      
      // If no therapies selected but time allocated, add based on detected needs
      if (therapyPriorities.length === 0 && targetMinutes > 0) {
        if (detectedNeeds.speech) therapyPriorities.push({ name: 'Speech', key: 'speechTherapy', priority: 'HIGH' });
        if (detectedNeeds.ot) therapyPriorities.push({ name: 'OT', key: 'otTherapy', priority: 'HIGH' });
        if (detectedNeeds.pt) therapyPriorities.push({ name: 'PT', key: 'physicalTherapy', priority: 'HIGH' });
        if (detectedNeeds.aba) therapyPriorities.push({ name: 'ABA', key: 'abaTherapy', priority: 'HIGH' });
      }
      
      // Generate exercises to fill the target time
      let therapyIndex = 0;
      while (totalMinutes < targetMinutes && exerciseCount < 20) {
        // Cycle through therapies
        if (therapyPriorities.length > 0) {
          const currentTherapy = therapyPriorities[therapyIndex % therapyPriorities.length];
          const exercises = generateVariedExercises(
            currentTherapy.name, 
            dayIndex, 
            data.age,
            data.tellUsAboutChild + ' ' + data.mainConcerns
          );
          
          // Add exercises from this therapy
          for (let i = 0; i < 2 && totalMinutes < targetMinutes; i++) {
            const exercise = exercises[i % exercises.length];
            if (exercise) {
              const duration = Math.min(exercise.duration, targetMinutes - totalMinutes);
              daySchedule.push({
                ...exercise,
                duration: duration,
                time: currentTime.toTimeString().slice(0, 5),
                therapy: currentTherapy.name,
                type: 'exercise'
              });
              
              currentTime = new Date(currentTime.getTime() + duration * 60000);
              totalMinutes += duration;
              exerciseCount++;
            }
          }
          
          // Add a break every 30 minutes
          if (totalMinutes >= 30 && totalMinutes % 30 < 10 && totalMinutes < targetMinutes - 5) {
            daySchedule.push({
              name: '🎉 Fun Break!',
              duration: 5,
              time: currentTime.toTimeString().slice(0, 5),
              instructions: 'Free play, water break, or dance!',
              type: 'break',
              icon: '🎮'
            });
            currentTime = new Date(currentTime.getTime() + 5 * 60000);
            totalMinutes += 5;
          }
          
          therapyIndex++;
        } else {
          // No therapies selected, add general developmental exercises
          const genericExercise = {
            name: 'Developmental Play',
            duration: Math.min(15, targetMinutes - totalMinutes),
            time: currentTime.toTimeString().slice(0, 5),
            instructions: 'Age-appropriate play activities',
            therapy: 'General',
            type: 'exercise',
            icon: '🎯'
          };
          daySchedule.push(genericExercise);
          totalMinutes += genericExercise.duration;
          currentTime = new Date(currentTime.getTime() + genericExercise.duration * 60000);
          exerciseCount++;
        }
      }
      
      // Calculate display format for hours
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      const displayHours = hours > 0 
        ? (minutes > 0 ? `${hours}h ${minutes}min` : `${hours} hour${hours !== 1 ? 's' : ''}`)
        : `${minutes} min`;
      
      weeklySchedule[day] = {
        exercises: daySchedule,
        totalMinutes: totalMinutes,
        displayHours: displayHours,
        plannedHours: dailyHours,
        achievedTarget: totalMinutes >= (targetMinutes * 0.8) // 80% is good enough
      };
    });

    // Generate insights
    const insights = generateSmartInsights(data, weeklySchedule, detectedNeeds, detectedReflexes, selectedTherapies);

    return {
      childName: data.childFirstName || 'Your Child',
      selectedTherapies: selectedTherapies,
      weeklySchedule: weeklySchedule,
      weekdayHours: data.parentAvailability?.weekdayHours || '0',
      weekendHours: data.parentAvailability?.weekendHours || '0',
      aiInsights: insights,
      recommendations: generateRecommendations(data, weeklySchedule, detectedNeeds),
      detectedNeeds: detectedNeeds,
      detectedReflexes: detectedReflexes
    };
  };

  // Generate smart insights - FIXED
  const generateSmartInsights = (data, schedule, detectedNeeds, detectedReflexes, selectedTherapies) => {
    const insights = [];
    const notes = (data.tellUsAboutChild + ' ' + data.mainConcerns).toLowerCase();
    
    // Check for therapy mismatches
    if (detectedNeeds.speech && !data.speechTherapy.enabled) {
      insights.push("🔴 Speech concerns detected in your notes - consider enabling Speech Therapy");
    }
    if (detectedNeeds.aba && !data.abaTherapy.enabled) {
      insights.push("🔴 Behavioral concerns mentioned - ABA therapy could help significantly");
    }
    if (detectedNeeds.ot && !data.otTherapy.enabled) {
      insights.push("🟡 Fine motor/sensory issues noted - OT would be beneficial");
    }
    
    // Reflex insights
    if (detectedReflexes.length > 0) {
      insights.push(`🧠 Possible retained reflexes detected: ${detectedReflexes.join(', ')} - exercises included!`);
    }
    
    // Weekend insights - FIXED calculation
    const weekendHours = parseFloat(data.parentAvailability?.weekendHours || 0);
    const saturdayMinutes = schedule['Saturday']?.totalMinutes || 0;
    const sundayMinutes = schedule['Sunday']?.totalMinutes || 0;
    const weekendAchievedHours = (saturdayMinutes + sundayMinutes) / 60;  // Convert to hours
    const weekendTargetHours = weekendHours * 2; // Total for both days
    
    if (weekendHours > 0) {
      if (weekendAchievedHours >= weekendTargetHours * 0.8) {
        insights.push(`✅ Great weekend commitment! ${weekendAchievedHours.toFixed(1)} hours of therapy scheduled out of ${weekendTargetHours} hours planned.`);
      } else if (weekendAchievedHours > 0) {
        insights.push(`🟡 Weekend: ${weekendAchievedHours.toFixed(1)} hours scheduled. Target was ${weekendTargetHours} hours. Check time slot selections.`);
      }
    }
    
    // Weekday insights
    const weekdayHours = parseFloat(data.parentAvailability?.weekdayHours || 0);
    let weekdayTotalMinutes = 0;
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach(day => {
      weekdayTotalMinutes += schedule[day]?.totalMinutes || 0;
    });
    const weekdayAchievedHours = weekdayTotalMinutes / 60;
    const weekdayTargetHours = weekdayHours * 5;
    
    if (weekdayHours > 0 && weekdayAchievedHours >= weekdayTargetHours * 0.8) {
      insights.push(`✅ Weekday schedule on track: ${weekdayAchievedHours.toFixed(1)} hours planned out of ${weekdayTargetHours} hours target.`);
    }
    
    // Therapy load
    const totalTherapies = selectedTherapies.filter(t => t.name).length;
    if (totalTherapies >= 3) {
      insights.push("💡 Multiple therapies integrated - exercises rotate daily for variety");
    }
    
    // Oral motor connection for speech
    if (notes.includes('speech') || notes.includes('oral')) {
      insights.push("👄 Oral motor exercises included to support speech development - these are fun and playful!");
    }
    
    return insights;
  };

  // Generate recommendations
  const generateRecommendations = (data, schedule, detectedNeeds) => {
    const recommendations = [];
    const age = parseInt(data.age) || 5;
    const notes = (data.tellUsAboutChild + ' ' + data.mainConcerns).toLowerCase();
    
    // Age-specific
    if (age <= 3) {
      recommendations.push("🎯 At this age, play-based therapy works best - all exercises are designed to be fun!");
    } else if (age >= 4 && age <= 6) {
      recommendations.push("🌟 Perfect age for rapid progress - consistency is key!");
    }
    
    // Reflex-specific
    if (notes.includes('reflex') || notes.includes('primitive')) {
      recommendations.push("🧠 Reflex integration exercises included - expect improvements in 6-8 weeks");
    }
    
    // Speech-specific with oral motor
    if (detectedNeeds.speech) {
      recommendations.push("👄 Oral motor exercises support speech - do these before meals when possible");
      recommendations.push("🗣️ Practice speech sounds during daily routines (bath time, car rides)");
    }
    
    // Behavior-specific
    if (detectedNeeds.aba) {
      recommendations.push("🎯 Visual schedules and token systems help - consistency across all caregivers is crucial");
      recommendations.push("😊 Catch them being good - positive reinforcement works better than punishment");
    }
    
    // Sensory
    if (notes.includes('sensory')) {
      recommendations.push("🌈 Heavy work activities help regulate sensory system - do these before difficult tasks");
    }
    
    // Weekend specific
    const weekendTotal = (schedule['Saturday']?.totalMinutes || 0) + (schedule['Sunday']?.totalMinutes || 0);
    if (weekendTotal >= 360) {  // 6+ hours total
      recommendations.push("👏 Excellent weekend commitment! Break sessions into morning and afternoon for best results");
    }
    
    // Professional therapy reminder
    recommendations.push("📅 Continue professional therapy sessions - home exercises enhance but don't replace them");
    
    return recommendations;
  };

  // Submit handler - FIXED database save
  const handleSubmit = async () => {
    if (!formData.childFirstName || !formData.age || !formData.parentName || !formData.email) {
      alert('Please fill in all required fields (Parent Name, Email, Child Name, Age)');
      return;
    }

    const hasTherapy = ['speechTherapy', 'otTherapy', 'physicalTherapy', 'abaTherapy']
      .some(t => formData[t].enabled);
    
    const hasDescription = formData.tellUsAboutChild.length > 10 || 
                          formData.mainConcerns.length > 10;
    
    if (!hasTherapy && !hasDescription) {
      alert('Please either select therapy types OR describe your child\'s needs in the text area');
      return;
    }

    setIsSubmitting(true);
    
    // Auto-analyze if description provided but no AI analysis yet
    if (hasDescription && !aiAnalysis) {
      await analyzeUploadedReports([], '');
    }
    
    try {
      const calendar = generateSmartCalendar(formData);
      setGeneratedCalendar(calendar);
      setCalendarGenerated(true);
      if (!selectedDay) {
        setSelectedDay(todayName);
      }
      
      // Save to database - FIXED structure
      if (formData.email) {
        try {
          const assessmentId = `calendar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Prepare clean data for database
          const dbData = {
            assessment_id: assessmentId,
            parent_email: formData.email,
            child_name: formData.childFirstName,
            child_age: parseInt(formData.age) || 0,
            schedule_data: JSON.stringify(formData), // Convert to JSON string
            generated_schedule: JSON.stringify(calendar), // Convert to JSON string
            created_at: new Date().toISOString()
          };
          
          console.log('Saving to database:', assessmentId);
          
          const { data, error } = await supabase.from('child_schedules').insert(dbData);
          
          if (error) {
            console.error("Database save error:", error);
            // Don't block calendar generation, just log the error
            // The schedule is still generated and shown to user
          } else {
            console.log('Successfully saved to database');
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Continue anyway - calendar is more important than saving
        }
      }
    } catch (err) {
      console.error("Error:", err);
      alert('Error generating calendar. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Current view calculations
  const currentViewDay = selectedDay || todayName;
  const currentSchedule = calendarGenerated && generatedCalendar 
    ? (generatedCalendar.weeklySchedule[currentViewDay] || { exercises: [], totalMinutes: 0 })
    : { exercises: [], totalMinutes: 0 };
  const actualExercises = currentSchedule.exercises.filter(e => e.type === 'exercise' || e.type === 'reflex');

  // RENDER: Calendar View
  if (calendarGenerated && generatedCalendar) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-3xl">🧠</span>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {generatedCalendar.childName}'s Smart Therapy Schedule
            </h1>
            <p className="text-gray-600">
              AI-Optimized • Playful Exercises • {generatedCalendar.weekdayHours}hrs weekdays, {generatedCalendar.weekendHours}hrs weekends
            </p>
          </div>

          {/* Detected Needs Banner */}
          {(Object.values(generatedCalendar.detectedNeeds || {}).some(v => v) || 
            (generatedCalendar.detectedReflexes && generatedCalendar.detectedReflexes.length > 0)) && (
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 mb-6 border-2 border-purple-300">
              <h2 className="text-xl font-bold text-purple-700 mb-4 flex items-center">
                <span className="mr-2">🔍</span>
                What We Detected From Your Input
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.values(generatedCalendar.detectedNeeds || {}).some(v => v) && (
                  <div>
                    <h3 className="font-semibold text-purple-600 mb-2">Therapy Needs:</h3>
                    <div className="space-y-1">
                      {Object.entries(generatedCalendar.detectedNeeds).map(([therapy, needed]) => 
                        needed && (
                          <div key={therapy} className="flex items-center gap-2">
                            <span className="text-green-500">✓</span>
                            <span className="text-gray-700 capitalize">{therapy} therapy recommended</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
                {generatedCalendar.detectedReflexes && generatedCalendar.detectedReflexes.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-purple-600 mb-2">Possible Retained Reflexes:</h3>
                    <div className="space-y-1">
                      {generatedCalendar.detectedReflexes.map(reflex => (
                        <div key={reflex} className="flex items-center gap-2">
                          <span className="text-blue-500">🧠</span>
                          <span className="text-gray-700 capitalize">{reflex} reflex exercises included</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AI Insights */}
          {generatedCalendar.aiInsights && generatedCalendar.aiInsights.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
              <h2 className="text-xl font-bold text-blue-700 mb-4 flex items-center">
                <span className="mr-2">💡</span>
                Smart Schedule Insights
              </h2>
              <div className="space-y-2">
                {generatedCalendar.aiInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <p className="text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {generatedCalendar.recommendations && generatedCalendar.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-200">
              <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Personalized Tips for Success
              </h2>
              <div className="grid md:grid-cols-2 gap-3">
                {generatedCalendar.recommendations.map((rec, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Day Stats */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">📅</span>
              <span className="text-lg font-medium">
                {currentViewDay === todayName ? 'Today' : currentViewDay}: {currentSchedule.displayHours || '0 hours'}
                {currentSchedule.achievedTarget && <span className="ml-2">✅</span>}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-2xl">🎯</span>
              <span className="text-lg font-medium">
                {actualExercises.length} fun activities planned
              </span>
            </div>
          </div>

          {/* Week Overview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gray-50 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Week at a Glance (Click any day)</h2>
              <div className="grid grid-cols-7 gap-3">
                {daysOfWeek.map(day => {
                  const schedule = generatedCalendar.weeklySchedule[day] || {};
                  const isToday = day === todayName;
                  const isSelected = day === currentViewDay;
                  const exercises = (schedule.exercises || []).filter(e => e.type === 'exercise' || e.type === 'reflex');
                  const isWeekend = ['Saturday', 'Sunday'].includes(day);
                  const achievedTarget = schedule.achievedTarget;
                  
                  return (
                    <div 
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`rounded-xl p-4 text-center transition-all cursor-pointer hover:scale-105 ${
                        isSelected 
                          ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl ring-4 ring-purple-300' 
                          : isToday
                          ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg'
                          : isWeekend
                          ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-400'
                      }`}
                    >
                      <div className="font-bold text-lg">{day.slice(0, 3)}</div>
                      {isToday && (
                        <div className="text-xs mb-1 opacity-90">Today</div>
                      )}
                      <div className={`text-2xl font-bold mt-2 ${
                        isSelected || isToday ? 'text-white' : 'text-purple-600'
                      }`}>
                        {schedule.displayHours || '0h'}
                      </div>
                      <div className={`text-sm mt-1 ${
                        isSelected || isToday ? 'text-purple-100' : 'text-gray-600'
                      }`}>
                        {exercises.length} activities
                      </div>
                      {isWeekend && schedule.plannedHours > 0 && (
                        <div className="text-xs mt-1 text-green-600 font-semibold">
                          Weekend Power!
                        </div>
                      )}
                      {achievedTarget && (
                        <div className="text-xs mt-1">✅ Goal Met!</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Daily Schedule - Enhanced */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              {currentViewDay === todayName ? "Today's" : `${currentViewDay}'s`} Fun Therapy Adventure
            </h3>
            
            {currentSchedule.exercises.length > 0 ? (
              <div className="space-y-4">
                {currentSchedule.exercises.map((exercise, idx) => {
                  // Handle different types of items
                  if (exercise.type === 'tip') {
                    return (
                      <div key={idx} className="rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{exercise.icon}</span>
                          <div>
                            <h4 className="font-bold text-orange-700">{exercise.name}</h4>
                            <p className="text-sm text-gray-700 italic">{exercise.instructions}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  if (exercise.type === 'break') {
                    return (
                      <div key={idx} className="rounded-xl p-4 border-2 border-pink-300 bg-gradient-to-r from-pink-50 to-purple-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="bg-pink-500 text-white px-4 py-2 rounded-full font-bold">
                              {exercise.time}
                            </div>
                            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                              <span className="text-2xl">{exercise.icon}</span>
                              {exercise.name}
                            </h4>
                          </div>
                          <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                            {exercise.duration} min
                          </div>
                        </div>
                        {exercise.tip && (
                          <p className="text-sm text-purple-600 italic mt-2 ml-4">{exercise.tip}</p>
                        )}
                      </div>
                    );
                  }
                  
                  // Regular exercise or reflex exercise
                  const priorityColors = {
                    'HIGH': 'border-red-400 bg-red-50',
                    'MEDIUM': 'border-yellow-400 bg-yellow-50',
                    'LOW': 'border-green-400 bg-green-50'
                  };
                  
                  const isReflex = exercise.type === 'reflex' || exercise.isReflex;
                  
                  return (
                    <div key={idx} className={`rounded-xl p-6 border-2 ${
                      isReflex ? 'border-purple-400 bg-purple-50' : priorityColors[exercise.priority] || 'border-gray-300 bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-purple-600 text-white px-4 py-2 rounded-full font-bold">
                            {exercise.time}
                          </div>
                          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-full text-sm font-medium">
                            {exercise.duration} min
                          </div>
                          {exercise.playful && (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                              🎮 PLAYFUL
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {isReflex && (
                            <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-500 text-white">
                              🧠 REFLEX
                            </span>
                          )}
                          {exercise.priority && (
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                              exercise.priority === 'HIGH' ? 'bg-red-500 text-white' :
                              exercise.priority === 'MEDIUM' ? 'bg-yellow-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                              {exercise.priority} Priority
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2 mb-3">
                        <span className="text-2xl">{exercise.icon}</span>
                        {exercise.name}
                        <span className="text-sm bg-purple-200 text-purple-700 px-2 py-1 rounded">
                          {exercise.therapy}
                        </span>
                      </h4>
                      
                      <div className="bg-white rounded-lg p-4 mb-4">
                        <p className="text-gray-700">
                          <strong>How to play:</strong> {exercise.instructions}
                        </p>
                      </div>
                      
                      {exercise.tip && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-700 font-medium">{exercise.tip}</p>
                        </div>
                      )}
                      
                      <div className="flex gap-6 text-sm">
                        {exercise.equipment && (
                          <div>
                            <span className="font-semibold text-gray-700">Equipment:</span>
                            <span className="ml-2 text-gray-600">{exercise.equipment}</span>
                          </div>
                        )}
                        {exercise.difficulty && (
                          <div>
                            <span className="font-semibold text-gray-700">Difficulty:</span>
                            <span className={`ml-2 font-medium ${
                              exercise.difficulty === 'Easy' ? 'text-green-600' : 
                              exercise.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          </div>
                        )}
                        {exercise.targets && (
                          <div>
                            <span className="font-semibold text-gray-700">Targets:</span>
                            <span className="ml-2 text-purple-600 font-medium">{exercise.targets}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">No exercises scheduled for this day</p>
                <p className="text-sm text-gray-400 mt-2">
                  This might be a rest day or you haven't allocated time for this day
                </p>
              </div>
            )}
          </div>

          {/* Professional Therapy Reminder */}
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl p-6 mt-6 border-2 border-indigo-300">
            <h3 className="text-lg font-bold text-indigo-700 mb-2">
              📅 Remember Your Professional Therapy Sessions
            </h3>
            <p className="text-gray-700">
              These home exercises enhance but don't replace professional therapy. 
              Continue attending all scheduled therapy appointments for best results!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center mt-8">
            <button 
              onClick={() => window.print()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-8 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              📄 Print Calendar
            </button>
            <button 
              onClick={() => {
                const dataStr = JSON.stringify(generatedCalendar, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const exportFileDefaultName = `${formData.childFirstName}_therapy_schedule.json`;
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', exportFileDefaultName);
                linkElement.click();
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              💾 Export Schedule
            </button>
            <button 
              onClick={() => {
                setCalendarGenerated(false);
                setGeneratedCalendar(null);
                setSelectedDay(null);
              }}
              className="bg-gray-200 text-gray-700 py-4 px-8 rounded-lg font-semibold hover:bg-gray-300 transition-all"
            >
              🔄 Edit Schedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  // RENDER: Form View with SEPARATE Weekend/Weekday Time Blocks
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🧠 Smart AI Therapy Schedule Creator
          </h1>
          <p className="text-gray-600">
            Tell us about your child and we'll create the perfect therapy schedule
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Basic Information Section */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
            <h2 className="text-xl font-semibold text-white">Parent & Child Information</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.parentName}
                onChange={(e) => handleChange('parentName', e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                placeholder="Parent Name *"
                required
              />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                placeholder="Email *"
                required
              />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                placeholder="Phone Number"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.childFirstName}
                onChange={(e) => handleChange('childFirstName', e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                placeholder="Child's First Name *"
                required
              />
              <input
                type="text"
                value={formData.childLastName}
                onChange={(e) => handleChange('childLastName', e.target.value)}
                className="px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                placeholder="Child's Last Name"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange('age', e.target.value)}
                  min="1" max="18"
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  placeholder="Age *"
                  required
                />
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg"
                >
                  <option value="">Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tell Us About Your Child - IMPORTANT SECTION */}
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6">
            <h2 className="text-xl font-semibold text-white">Tell Us About Your Child</h2>
          </div>
          
          <div className="p-6 space-y-4 bg-indigo-50/30">
            <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>💡 Important:</strong> Describe your child's needs in your own words. 
                Our AI will analyze this to create the perfect schedule. Mention any concerns like 
                speech delays, behavior issues, sensory problems, motor skills, etc.
              </p>
            </div>
            
            <textarea
              value={formData.tellUsAboutChild}
              onChange={(e) => handleChange('tellUsAboutChild', e.target.value)}
              rows="4"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
              placeholder="Example: My child is 5 years old and has speech delay. He gets frustrated easily and has meltdowns. He struggles with buttons and zippers. His teacher says he can't sit still. We've been told he might have sensory issues..."
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <textarea
                value={formData.mainConcerns}
                onChange={(e) => handleChange('mainConcerns', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                placeholder="Main Concerns: What worries you most?"
              />
              <textarea
                value={formData.parentGoals}
                onChange={(e) => handleChange('parentGoals', e.target.value)}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                placeholder="Goals: What do you want to achieve?"
              />
            </div>
            
            {/* Auto-analyze button */}
            {(formData.tellUsAboutChild || formData.mainConcerns) && !aiAnalysis && (
              <button
                onClick={() => analyzeUploadedReports([], '')}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                🤖 Analyze Description
              </button>
            )}
          </div>

          {/* File Upload Section */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
            <h2 className="text-xl font-semibold text-white">Upload Existing Reports (Optional)</h2>
          </div>
          
          <div className="p-6 bg-green-50/30">
            <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                {uploading ? 'Uploading...' : '📁 Choose Files'}
              </button>
              <p className="text-sm text-gray-600 mt-3">
                Upload any existing therapy reports, assessments, or doctor's notes
              </p>
              {uploadedFiles.length > 0 && (
                <div className="mt-4 text-left">
                  <p className="font-semibold text-gray-700 mb-2">Uploaded Files:</p>
                  {uploadedFiles.map((file, idx) => (
                    <div key={idx} className="text-sm text-gray-600 mb-1">
                      ✅ {file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {aiAnalysis && (
              <div className="mt-4 bg-white rounded-lg p-4 border-2 border-green-300">
                <h3 className="font-semibold text-green-700 mb-2">🤖 AI Analysis of Your Input:</h3>
                <div className="text-sm text-gray-700 space-y-1">
                  {aiAnalysis.detectedTherapies && aiAnalysis.detectedTherapies.length > 0 && (
                    <p>• Detected therapies: <span className="font-semibold">{aiAnalysis.detectedTherapies.join(', ')}</span></p>
                  )}
                  {aiAnalysis.primaryConcerns && aiAnalysis.primaryConcerns.length > 0 && (
                    <p>• Main concerns: <span className="font-semibold">{aiAnalysis.primaryConcerns.slice(0, 3).join(', ')}</span></p>
                  )}
                  {aiAnalysis.retainedReflexes && aiAnalysis.retainedReflexes.length > 0 && (
                    <p>• Possible reflexes: <span className="font-semibold">{aiAnalysis.retainedReflexes.join(', ')}</span></p>
                  )}
                  {aiAnalysis.severity && (
                    <p>• Severity level: <span className="font-semibold capitalize">{aiAnalysis.severity}</span></p>
                  )}
                  {aiAnalysis.recommendedHours && (
                    <p>• Recommended hours: <span className="font-semibold">{aiAnalysis.recommendedHours.weekday}hrs weekdays, {aiAnalysis.recommendedHours.weekend}hrs weekends</span></p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* School Schedule */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
            <h2 className="text-xl font-semibold text-white">School Schedule (Optional)</h2>
          </div>
          
          <div className="p-6 space-y-4 bg-blue-50/30">
            <select
              value={formData.hasSchool}
              onChange={(e) => handleChange('hasSchool', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg bg-white"
            >
              <option value="">Does your child attend school?</option>
              <option value="yes">Yes - Regular School</option>
              <option value="special">Yes - Special Needs School</option>
              <option value="no">No - Homeschool/No School</option>
            </select>
            
            {formData.hasSchool && formData.hasSchool !== 'no' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School Start Time</label>
                    <input
                      type="time"
                      value={formData.schoolStartTime}
                      onChange={(e) => handleChange('schoolStartTime', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">School End Time</label>
                    <input
                      type="time"
                      value={formData.schoolEndTime}
                      onChange={(e) => handleChange('schoolEndTime', e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">School Days</label>
                  <div className="flex flex-wrap gap-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map(day => (
                      <label key={day} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border-2 border-gray-200 hover:border-blue-400">
                        <input
                          type="checkbox"
                          checked={formData.schoolDays.includes(day)}
                          onChange={() => handleSchoolDayToggle(day)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Professional Therapy Services */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-6">
            <h2 className="text-xl font-semibold text-white">Professional Therapy Services</h2>
            <p className="text-emerald-100 text-sm mt-1">Select therapies your child needs or already receives</p>
          </div>
          
          <div className="p-6 overflow-x-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> These are professional therapy sessions (if any). 
                We'll schedule parent-led home exercises around these times.
              </p>
            </div>
            
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-2">Active</th>
                  <th className="pb-2">Therapy Type</th>
                  <th className="pb-2">Session Time</th>
                  <th className="pb-2">Duration</th>
                  <th className="pb-2 text-center">Days</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'speechTherapy', name: 'Speech Therapy', emoji: '🗣️' },
                  { key: 'otTherapy', name: 'Occupational Therapy', emoji: '✋' },
                  { key: 'physicalTherapy', name: 'Physical Therapy', emoji: '💪' },
                  { key: 'abaTherapy', name: 'ABA/Behavioral Therapy', emoji: '🧩' }
                ].map(therapy => (
                  <tr key={therapy.key} className="border-b">
                    <td className="py-3">
                      <input
                        type="checkbox"
                        checked={formData[therapy.key].enabled}
                        onChange={(e) => handleTherapyChange(therapy.key, 'enabled', e.target.checked)}
                        className="w-5 h-5"
                      />
                    </td>
                    <td className="py-3">
                      <span className="mr-2">{therapy.emoji}</span>
                      {therapy.name}
                    </td>
                    <td className="py-3">
                      <input
                        type="time"
                        value={formData[therapy.key].sessionTime}
                        onChange={(e) => handleTherapyChange(therapy.key, 'sessionTime', e.target.value)}
                        disabled={!formData[therapy.key].enabled}
                        className="px-2 py-1 border rounded"
                      />
                    </td>
                    <td className="py-3">
                      <select
                        value={formData[therapy.key].sessionHours}
                        onChange={(e) => handleTherapyChange(therapy.key, 'sessionHours', e.target.value)}
                        disabled={!formData[therapy.key].enabled}
                        className="px-2 py-1 border rounded"
                      >
                        <option value="">Duration</option>
                        <option value="0.5">30 min</option>
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                      </select>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1 justify-center">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                          <label key={i} className="cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[therapy.key].sessionDays.includes(daysOfWeek[i])}
                              onChange={() => handleTherapyDayToggle(therapy.key, daysOfWeek[i])}
                              disabled={!formData[therapy.key].enabled}
                              className="sr-only"
                            />
                            <span className={`block w-8 h-8 text-xs flex items-center justify-center rounded ${
                              formData[therapy.key].sessionDays.includes(daysOfWeek[i])
                                ? 'bg-emerald-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {d}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Daily Routine */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6">
            <h2 className="text-xl font-semibold text-white">Daily Routine & Meal Times</h2>
          </div>
          
          <div className="p-6 bg-orange-50/30">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wake Up Time</label>
                <input
                  type="time"
                  value={formData.wakeUpTime}
                  onChange={(e) => handleChange('wakeUpTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Breakfast</label>
                <input
                  type="time"
                  value={formData.breakfastTime}
                  onChange={(e) => handleChange('breakfastTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lunch</label>
                <input
                  type="time"
                  value={formData.lunchTime}
                  onChange={(e) => handleChange('lunchTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Snack Time</label>
                <input
                  type="time"
                  value={formData.snackTime}
                  onChange={(e) => handleChange('snackTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dinner</label>
                <input
                  type="time"
                  value={formData.dinnerTime}
                  onChange={(e) => handleChange('dinnerTime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bedtime</label>
                <input
                  type="time"
                  value={formData.bedtime}
                  onChange={(e) => handleChange('bedtime', e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Parent Availability for HOME EXERCISES - ENHANCED */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <h2 className="text-xl font-semibold text-white">Your Availability for Home Exercises</h2>
            <p className="text-purple-100 text-sm mt-1">How much time can YOU spend doing therapy with your child?</p>
          </div>
          
          <div className="p-6 bg-purple-50/30">
            <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-4">
              <p className="text-sm text-gray-700">
                <strong>🏠 Important:</strong> This is YOUR time to do exercises with your child at home. 
                Select different time slots for weekdays vs weekends for best results!
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">⏰ Weekday Hours (Mon-Fri)</label>
                <select
                  value={formData.parentAvailability.weekdayHours}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parentAvailability: {
                      ...prev.parentAvailability,
                      weekdayHours: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="0">No time available</option>
                  <option value="0.5">30 minutes per day</option>
                  <option value="1">1 hour per day</option>
                  <option value="1.5">1.5 hours per day</option>
                  <option value="2">2 hours per day (recommended)</option>
                  <option value="3">3 hours per day</option>
                  <option value="4">4 hours per day</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">🎉 Weekend Hours (Sat-Sun)</label>
                <select
                  value={formData.parentAvailability.weekendHours}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    parentAvailability: {
                      ...prev.parentAvailability,
                      weekendHours: e.target.value
                    }
                  }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="0">No time available</option>
                  <option value="1">1 hour per day</option>
                  <option value="2">2 hours per day</option>
                  <option value="3">3 hours per day</option>
                  <option value="4">4 hours per day (recommended)</option>
                  <option value="5">5 hours per day</option>
                  <option value="6">6 hours per day</option>
                </select>
              </div>
            </div>
            
            {/* Weekday Time Blocks */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">📍 Weekday Preferred Times (Mon-Fri)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'earlyMorning', label: 'Early Morning', time: '(6-8 AM)', emoji: '🌅' },
                  { key: 'morning', label: 'Morning', time: '(8 AM-12 PM)', emoji: '☀️' },
                  { key: 'afternoon', label: 'Afternoon', time: '(12-4 PM)', emoji: '🌤️' },
                  { key: 'evening', label: 'Evening', time: '(4-7 PM)', emoji: '🌆' },
                  { key: 'night', label: 'Night', time: '(7-9 PM)', emoji: '🌙' }
                ].map(block => (
                  <label key={block.key} className="flex items-center p-3 bg-white rounded-lg border-2 border-gray-200 cursor-pointer hover:border-purple-400">
                    <input
                      type="checkbox"
                      checked={formData.parentAvailability.weekdayTimeBlocks[block.key]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parentAvailability: {
                          ...prev.parentAvailability,
                          weekdayTimeBlocks: {
                            ...prev.parentAvailability.weekdayTimeBlocks,
                            [block.key]: e.target.checked
                          }
                        }
                      }))}
                      className="w-5 h-5 mr-3"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        <span>{block.emoji}</span>
                        {block.label}
                      </div>
                      <div className="text-xs text-gray-500">{block.time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Weekend Time Blocks */}
            <div>
              <label className="block text-sm font-medium mb-2">📍 Weekend Preferred Times (Sat-Sun)</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { key: 'earlyMorning', label: 'Early Morning', time: '(7-9 AM)', emoji: '🌅' },
                  { key: 'morning', label: 'Morning', time: '(9 AM-12 PM)', emoji: '☀️' },
                  { key: 'afternoon', label: 'Afternoon', time: '(12-4 PM)', emoji: '🌤️' },
                  { key: 'evening', label: 'Evening', time: '(4-7 PM)', emoji: '🌆' },
                  { key: 'night', label: 'Night', time: '(7-9 PM)', emoji: '🌙' }
                ].map(block => (
                  <label key={block.key} className="flex items-center p-3 bg-blue-50 rounded-lg border-2 border-blue-200 cursor-pointer hover:border-blue-400">
                    <input
                      type="checkbox"
                      checked={formData.parentAvailability.weekendTimeBlocks[block.key]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        parentAvailability: {
                          ...prev.parentAvailability,
                          weekendTimeBlocks: {
                            ...prev.parentAvailability.weekendTimeBlocks,
                            [block.key]: e.target.checked
                          }
                        }
                      }))}
                      className="w-5 h-5 mr-3"
                    />
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        <span>{block.emoji}</span>
                        {block.label}
                      </div>
                      <div className="text-xs text-gray-500">{block.time}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mt-4 bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-300">
              <p className="text-sm font-semibold text-purple-700 mb-1">
                📊 Your Weekly Commitment:
              </p>
              <p className="text-lg font-bold text-purple-800">
                {(parseFloat(formData.parentAvailability.weekdayHours || 0) * 5 + 
                  parseFloat(formData.parentAvailability.weekendHours || 0) * 2).toFixed(1)} total hours per week
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Perfect! Consistency matters more than duration. Even 30 minutes daily makes a huge difference!
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 bg-gray-50">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.childFirstName || !formData.age || !formData.parentName || !formData.email}
              className={`w-full py-4 font-semibold rounded-lg transition-all ${
                isSubmitting || !formData.childFirstName || !formData.age || !formData.parentName || !formData.email
                  ? 'bg-gray-300 text-gray-500'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {isSubmitting ? '🧠 AI Creating Your Personalized Schedule...' : '🧠 Generate Smart Therapy Schedule'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 mt-6 space-y-1">
          <p>© 2024 Smart Therapy Calendar System. All rights reserved.</p>
          <p>Powered by AI • Personalized for {formData.childFirstName || 'Your Child'}</p>
        </div>
      </div>
    </div>
  );
};

export default TherapyCalendarPage;