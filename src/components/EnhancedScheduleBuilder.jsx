import React, { useState, useEffect } from 'react';
import { Calendar, Clock, School, Heart, Users, Sun, Moon, Coffee, Target, Trophy, Star, Download, AlertCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const EnhancedScheduleBuilder = ({ assessmentId, childData, reflexData, onScheduleGenerated }) => {
  
  console.log('A1. EnhancedScheduleBuilder: Component initialized');

  // Get child's specific issues and reflexes
  const childIssues = reflexData?.retainedReflexes || [];
  const topPriorities = reflexData?.topThreePriority || reflexData?.retainedReflexes?.slice(0, 3) || [];
  const mainConcerns = childData?.main_concerns || childData?.parent_concerns || '';
  
  console.log('A2. EnhancedScheduleBuilder: States created');
  console.log('Parsed data:', { childIssues, topPriorities, mainConcerns });
  
  const [isOpen, setIsOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const [scheduleData, setScheduleData] = useState({
    // Daily Routine Times (for context only)
    wakeUpTime: '07:00',
    sleepTime: '20:00',
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    
    // School Information
    attendsSchool: 'yes',
    schoolDays: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    schoolStartTime: '08:30',
    schoolEndTime: '14:30',
    
    // Professional Therapies
    therapies: [
      { 
        type: 'Speech Therapy', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '45' 
      },
      { 
        type: 'Occupational Therapy', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '45' 
      },
      { 
        type: 'ABA Therapy', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '60' 
      },
      { 
        type: 'Physical Therapy', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '45' 
      }
    ],
    
    // Parent Availability - This is CRUCIAL
    weekdayHours: '1', // How many hours parent can dedicate
    weekendHours: '2',
    preferredTimeSlots: {
      earlyMorning: false,
      morning: true,
      afternoon: true,
      evening: false,
      night: false
    }
  });

  // Comprehensive reflex exercise database
  const getReflexExerciseSet = (reflexName) => {
    // Normalize reflex name
    let normalizedName = reflexName;
    if (typeof reflexName === 'object') {
      normalizedName = reflexName.name || reflexName.reflexName || reflexName.reflex || '';
    }
    normalizedName = normalizedName.replace(/\s*Reflex\s*/gi, '').trim().toUpperCase();
    
    const exerciseDatabase = {
      'MORO': [
        {
          name: 'Starfish Exercise',
          duration: 10,
          instructions: 'Lie on back, spread arms/legs like star, slowly bring to center, repeat 5x',
          equipment: 'Mat',
          difficulty: 'Easy'
        },
        {
          name: 'Deep Pressure Protocol',
          duration: 10,
          instructions: 'Firm hugs, joint compressions, weighted blanket time',
          equipment: 'Weighted blanket',
          difficulty: 'Easy'
        },
        {
          name: 'Ball Squeeze & Release',
          duration: 10,
          instructions: 'Squeeze stress ball tight, hold 5 sec, release, repeat 10x',
          equipment: 'Stress ball',
          difficulty: 'Easy'
        }
      ],
      'ATNR': [
        {
          name: 'Lizard Crawl',
          duration: 10,
          instructions: 'Belly crawl turning head side to side with arm movements',
          equipment: 'Mat',
          difficulty: 'Medium'
        },
        {
          name: 'Cross-Pattern Marching',
          duration: 10,
          instructions: 'March touching opposite elbow to knee, 20 reps each side',
          equipment: 'None',
          difficulty: 'Easy'
        },
        {
          name: 'Infinity Drawing',
          duration: 10,
          instructions: 'Draw large figure-8 in air, track with eyes, both hands',
          equipment: 'None',
          difficulty: 'Easy'
        }
      ],
      'ROOTING': [
        {
          name: 'Oral Motor Massage',
          duration: 10,
          instructions: 'Gentle facial massage, cheek circles, jaw stretches',
          equipment: 'None',
          difficulty: 'Easy'
        },
        {
          name: 'Bubble Blowing',
          duration: 10,
          instructions: 'Blow bubbles different sizes, practice lip rounding',
          equipment: 'Bubbles',
          difficulty: 'Easy'
        },
        {
          name: 'Straw Exercises',
          duration: 10,
          instructions: 'Suck thick smoothie, blow cotton balls with straw',
          equipment: 'Straws',
          difficulty: 'Medium'
        }
      ],
      'SPINAL GALANT': [
        {
          name: 'Snow Angels',
          duration: 10,
          instructions: 'Lying on back, move arms and legs like making snow angel',
          equipment: 'Mat',
          difficulty: 'Easy'
        },
        {
          name: 'Back Brushing',
          duration: 10,
          instructions: 'Firm brush strokes down each side of spine',
          equipment: 'Sensory brush',
          difficulty: 'Easy'
        },
        {
          name: 'Bridge Pose',
          duration: 10,
          instructions: 'Lift hips up, hold 5 seconds, lower slowly, repeat 10x',
          equipment: 'Mat',
          difficulty: 'Medium'
        }
      ],
      'PALMAR': [
        {
          name: 'Finger Strengthening',
          duration: 10,
          instructions: 'Squeeze putty, make shapes, hide and find beads',
          equipment: 'Therapy putty',
          difficulty: 'Easy'
        },
        {
          name: 'Hanging Bar',
          duration: 5,
          instructions: 'Hang from bar, work up to 30 seconds',
          equipment: 'Pull-up bar',
          difficulty: 'Hard'
        },
        {
          name: 'Hand Walks',
          duration: 10,
          instructions: 'Walk fingers up and down wall, spider crawls',
          equipment: 'Wall',
          difficulty: 'Easy'
        }
      ],
      'TLR': [
        {
          name: 'Superman Pose',
          duration: 10,
          instructions: 'Lie on tummy, lift head/arms/legs, hold 5 sec, repeat',
          equipment: 'Mat',
          difficulty: 'Medium'
        },
        {
          name: 'Rocking Chair',
          duration: 10,
          instructions: 'Rock back and forth in steady rhythm',
          equipment: 'Rocking chair',
          difficulty: 'Easy'
        },
        {
          name: 'Head Lifts',
          duration: 10,
          instructions: 'Lie on back, lift head to look at toes, hold, repeat',
          equipment: 'Mat',
          difficulty: 'Easy'
        }
      ],
      'STNR': [
        {
          name: 'Cat-Cow Yoga',
          duration: 10,
          instructions: 'On hands/knees, arch back up and down slowly',
          equipment: 'Mat',
          difficulty: 'Easy'
        },
        {
          name: 'Tunnel Crawling',
          duration: 10,
          instructions: 'Crawl through tunnel forward and backward',
          equipment: 'Play tunnel',
          difficulty: 'Medium'
        },
        {
          name: 'Wheelbarrow Walks',
          duration: 5,
          instructions: 'Walk on hands while adult holds legs',
          equipment: 'None',
          difficulty: 'Hard'
        }
      ]
    };
    
    // Return exercises for the reflex or generic set
    return exerciseDatabase[normalizedName] || [
      {
        name: 'Sensory Integration Activity',
        duration: 10,
        instructions: 'General movement and balance exercises',
        equipment: 'Various',
        difficulty: 'Easy'
      }
    ];
  };

  // SMART Schedule Generation - THERAPY FOCUSED
  const generateTherapeuticSchedule = () => {
    console.log('D4. Starting THERAPY-FOCUSED schedule generation');
    const schedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Helper functions
    const parseTimeToMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const minutesToTime = (minutes) => {
      const hours = Math.floor(minutes / 60) % 24;
      const mins = minutes % 60;
      return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    };
    
    // Parse all important times
    const wakeUpMinutes = parseTimeToMinutes(scheduleData.wakeUpTime);
    const sleepMinutes = parseTimeToMinutes(scheduleData.sleepTime);
    const breakfastMinutes = parseTimeToMinutes(scheduleData.breakfastTime);
    const lunchMinutes = parseTimeToMinutes(scheduleData.lunchTime);
    const dinnerMinutes = parseTimeToMinutes(scheduleData.dinnerTime);
    
    // Smart buffer zones
    const morningBufferEnd = wakeUpMinutes + 90; // No exercises for 1.5 hours after wake
    const eveningBufferStart = sleepMinutes - 30; // No exercises 30 min before sleep
    const postMealBuffer = 30; // Wait 30 min after meals
    
    // Get parent's available hours
    const weekdayMinutes = parseInt(scheduleData.weekdayHours) * 60;
    const weekendMinutes = parseInt(scheduleData.weekendHours) * 60;
    
    // Find best exercise windows avoiding meals and respecting buffers
    const findBestExerciseWindows = (isSchoolDay, isWeekend) => {
      const windows = [];
      const totalMinutesNeeded = isWeekend ? weekendMinutes : weekdayMinutes;
      
      if (totalMinutesNeeded === 0) return windows;
      
      // Morning window (after morning buffer, before school/lunch)
      if (scheduleData.preferredTimeSlots.morning || scheduleData.preferredTimeSlots.earlyMorning) {
        const morningStart = Math.max(morningBufferEnd, breakfastMinutes + postMealBuffer);
        const morningEnd = isSchoolDay ? 
          parseTimeToMinutes(scheduleData.schoolStartTime) - 15 : 
          lunchMinutes - 15;
        
        if (morningEnd > morningStart) {
          windows.push({
            start: morningStart,
            end: morningEnd,
            period: 'morning'
          });
        }
      }
      
      // Afternoon window (after lunch/school, before dinner)
      if (scheduleData.preferredTimeSlots.afternoon) {
        const afternoonStart = isSchoolDay ? 
          parseTimeToMinutes(scheduleData.schoolEndTime) + 30 : // 30 min after school
          lunchMinutes + postMealBuffer;
        const afternoonEnd = dinnerMinutes - 15;
        
        if (afternoonEnd > afternoonStart) {
          windows.push({
            start: afternoonStart,
            end: afternoonEnd,
            period: 'afternoon'
          });
        }
      }
      
      // Evening window (after dinner, before evening buffer)
      if (scheduleData.preferredTimeSlots.evening || scheduleData.preferredTimeSlots.night) {
        const eveningStart = dinnerMinutes + postMealBuffer;
        const eveningEnd = eveningBufferStart;
        
        if (eveningEnd > eveningStart) {
          windows.push({
            start: eveningStart,
            end: eveningEnd,
            period: 'evening'
          });
        }
      }
      
      // If no preferences selected, use default windows
      if (windows.length === 0) {
        // Try afternoon first (usually best for exercises)
        const defaultStart = isSchoolDay ? 
          parseTimeToMinutes(scheduleData.schoolEndTime) + 30 :
          lunchMinutes + postMealBuffer;
        const defaultEnd = dinnerMinutes - 15;
        
        if (defaultEnd > defaultStart) {
          windows.push({
            start: defaultStart,
            end: defaultEnd,
            period: 'afternoon'
          });
        }
      }
      
      return windows;
    };
    
    // Process each day
    days.forEach(day => {
      const dayKey = day.toLowerCase();
      const isSchoolDay = scheduleData.attendsSchool === 'yes' && scheduleData.schoolDays[dayKey];
      const isWeekend = day === 'Saturday' || day === 'Sunday';
      const availableMinutes = isWeekend ? weekendMinutes : weekdayMinutes;
      
      const activities = [];
      
      // PROFESSIONAL THERAPIES FIRST (highest priority)
      scheduleData.therapies.forEach(therapy => {
        if (therapy.active && therapy.time) {
          const dayMapping = {
            'monday': 'mon', 'tuesday': 'tue', 'wednesday': 'wed',
            'thursday': 'thu', 'fri': 'friday', 'saturday': 'sat', 'sunday': 'sun'
          };
          
          if (therapy.days[dayMapping[dayKey]]) {
            activities.push({
              time: therapy.time,
              duration: parseInt(therapy.duration) || 45,
              activity: therapy.type,
              type: 'professional',
              priority: 'CRITICAL',
              details: `Professional ${therapy.type} session`,
              color: 'bg-blue-100 border-blue-500',
              icon: '👩‍⚕️'
            });
          }
        }
      });
      
      // REFLEX EXERCISES - Smartly scheduled around routines with BREAKS
      if (availableMinutes > 0 && topPriorities.length > 0) {
        const windows = findBestExerciseWindows(isSchoolDay, isWeekend);
        
        if (windows.length > 0) {
          let remainingMinutes = availableMinutes;
          const breakTime = 10; // 10 minute break between exercises
          
          // Account for breaks in time calculation
          const exercisesCount = Math.min(3, topPriorities.length); // Max 3 different exercises per session
          const totalBreakTime = (exercisesCount - 1) * breakTime;
          const actualExerciseTime = remainingMinutes - totalBreakTime;
          const minutesPerReflex = Math.floor(actualExerciseTime / exercisesCount);
          
          topPriorities.forEach((reflex, index) => {
            if (remainingMinutes <= 0 || index >= 3) return; // Max 3 exercises per session
            
            // Find best window for this reflex
            const window = windows[index % windows.length];
            const exerciseSet = getReflexExerciseSet(reflex);
            
            // Calculate start time with breaks
            const previousExercisesTime = index * (minutesPerReflex + breakTime);
            const startTime = window.start + previousExercisesTime;
            
            // Add main exercise for this reflex
            const exercise = exerciseSet[0]; // Use primary exercise
            const exerciseDuration = Math.min(minutesPerReflex, exercise.duration * 2); // Can repeat if needed
            
            // Make sure we don't exceed window
            if (startTime + exerciseDuration <= window.end) {
              activities.push({
                time: minutesToTime(startTime),
                duration: exerciseDuration,
                activity: `${exercise.name} (${typeof reflex === 'string' ? reflex : reflex.name} Reflex)`,
                type: 'reflex-exercise',
                priority: index === 0 ? 'HIGH' : index === 1 ? 'MEDIUM' : 'LOW',
                details: exercise.instructions,
                equipment: exercise.equipment,
                difficulty: exercise.difficulty,
                reflex: typeof reflex === 'string' ? reflex : reflex.name,
                color: index === 0 ? 'bg-red-100 border-red-500' : 
                       index === 1 ? 'bg-yellow-100 border-yellow-500' : 
                       'bg-green-100 border-green-500',
                icon: index === 0 ? '🎯' : index === 1 ? '💪' : '✨',
                hasBreakAfter: index < exercisesCount - 1 // Add break indicator
              });
              
              remainingMinutes -= (exerciseDuration + (index < exercisesCount - 1 ? breakTime : 0));
            }
          });
        }
      }
      
      // Only add school block if it's a school day (for context)
      if (isSchoolDay) {
        activities.push({
          time: scheduleData.schoolStartTime,
          duration: calculateDuration(scheduleData.schoolStartTime, scheduleData.schoolEndTime),
          activity: 'School',
          type: 'blocked',
          priority: 'INFO',
          details: 'Child at school',
          color: 'bg-gray-100 border-gray-300',
          icon: '🏫'
        });
      }
      
      // NO LONGER ADDING MEALS TO THE DISPLAY - they're just for calculation
      
      // Sort activities by time
      activities.sort((a, b) => {
        const timeA = parseTimeToMinutes(a.time);
        const timeB = parseTimeToMinutes(b.time);
        return timeA - timeB;
      });
      
      schedule[day] = activities;
    });
    
    console.log('D5. Therapy-focused schedule generated:', schedule);
    return schedule;
  };

  const handleInputChange = (field, value) => {
    setScheduleData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSchoolDayToggle = (day) => {
    setScheduleData(prev => ({
      ...prev,
      schoolDays: {
        ...prev.schoolDays,
        [day]: !prev.schoolDays[day]
      }
    }));
  };

  const handleTherapyChange = (index, field, value) => {
    const updatedTherapies = [...scheduleData.therapies];
    updatedTherapies[index][field] = value;
    setScheduleData(prev => ({
      ...prev,
      therapies: updatedTherapies
    }));
  };

  const handleTherapyDayToggle = (index, day) => {
    const updatedTherapies = [...scheduleData.therapies];
    updatedTherapies[index].days[day] = !updatedTherapies[index].days[day];
    setScheduleData(prev => ({
      ...prev,
      therapies: updatedTherapies
    }));
  };
  
  const handleTimeSlotToggle = (slot, event) => {
    // Prevent any form submission or page refresh
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setScheduleData(prev => ({
      ...prev,
      preferredTimeSlots: {
        ...prev.preferredTimeSlots,
        [slot]: !prev.preferredTimeSlots[slot]
      }
    }));
  };

  const generateSchedule = async () => {
    console.log('D1. Generate Schedule clicked');
    setLoading(true);
    
    try {
      console.log('D3. Starting schedule generation');
      const weeklySchedule = generateTherapeuticSchedule();
      
      console.log('D6. Saving to database');
      const { data, error } = await supabase
        .from('child_schedules')
        .insert({
          assessment_id: assessmentId,
          schedule_data: scheduleData,
          generated_schedule: weeklySchedule,
          created_at: new Date().toISOString()
        })
        .select();
      
      console.log('D7. Database save complete');
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      setGeneratedSchedule(weeklySchedule);
      setIsOpen(false);
      
      if (onScheduleGenerated) {
        onScheduleGenerated(weeklySchedule);
      }
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert(`Failed to generate schedule. Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  const addMinutesToTime = (timeStr, minutes) => {
    const [hours, mins] = timeStr.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  };

  // Export to calendar function
  const exportToCalendar = () => {
    const icsContent = generateICSContent(generatedSchedule);
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${childData?.child_first_name || 'child'}_therapy_schedule.ics`;
    link.click();
  };

  const generateICSContent = (schedule) => {
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Reflex Therapy Schedule//EN
CALSCALE:GREGORIAN\n`;
    
    const today = new Date();
    const dayMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    };
    
    Object.entries(schedule).forEach(([day, activities]) => {
      activities.forEach(activity => {
        if (activity.type === 'reflex-exercise' || activity.type === 'professional') {
          const dayDiff = (dayMap[day] - today.getDay() + 7) % 7;
          const eventDate = new Date(today);
          eventDate.setDate(today.getDate() + dayDiff);
          
          const [hours, minutes] = activity.time.split(':');
          eventDate.setHours(parseInt(hours), parseInt(minutes), 0);
          
          const endDate = new Date(eventDate);
          endDate.setMinutes(endDate.getMinutes() + activity.duration);
          
          icsContent += `BEGIN:VEVENT
DTSTART:${formatDateToICS(eventDate)}
DTEND:${formatDateToICS(endDate)}
SUMMARY:${activity.activity}
DESCRIPTION:${activity.details}${activity.equipment ? '\\nEquipment: ' + activity.equipment : ''}
RRULE:FREQ=WEEKLY
END:VEVENT\n`;
        }
      });
    });
    
    icsContent += 'END:VCALENDAR';
    return icsContent;
  };

  const formatDateToICS = (date) => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  // Map reflexes to affected developmental areas
  const getAffectedAreas = (reflexName) => {
    const reflexMap = {
      'MORO': 'Emotional, Sleep, Anxiety',
      'ATNR': 'Reading, Writing, Coordination',
      'STNR': 'Posture, Focus, Sitting',
      'TLR': 'Balance, Motion, Posture',
      'ROOTING': 'Speech, Eating, Oral',
      'PALMAR': 'Fine Motor, Writing, Grip',
      'SPINAL GALANT': 'Focus, Bladder, Sitting'
    };
    
    const normalizedName = reflexName.replace(/\s*Reflex\s*/gi, '').trim().toUpperCase();
    return reflexMap[normalizedName] || 'Multiple areas';
  };

  // Clean Therapy Schedule Display
  const TherapyScheduleDisplay = ({ schedule, childName }) => {
    const [selectedDay, setSelectedDay] = useState('Monday');
    const days = Object.keys(schedule);
    
    // Get actual dates starting from tomorrow
    const getDayDate = (dayName) => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
      const dayMap = {
        'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
        'Friday': 5, 'Saturday': 6, 'Sunday': 0
      };
      
      const targetDay = dayMap[dayName];
      const tomorrowDay = tomorrow.getDay();
      let daysToAdd = (targetDay - tomorrowDay + 7) % 7;
      if (daysToAdd === 0 && dayName === 'Sunday') daysToAdd = 7;
      
      const targetDate = new Date(tomorrow);
      targetDate.setDate(tomorrow.getDate() + daysToAdd);
      
      return targetDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    // Calculate therapy statistics (exclude meals and school)
    const getDayStats = (day) => {
      const activities = schedule[day].filter(a => a.type !== 'meal'); // Exclude meals from stats
      const therapyMinutes = activities
        .filter(a => a.type === 'reflex-exercise' || a.type === 'professional')
        .reduce((sum, a) => sum + a.duration, 0);
      const exerciseCount = activities.filter(a => a.type === 'reflex-exercise').length;
      const professionalCount = activities.filter(a => a.type === 'professional').length;
      
      // Add break time to total
      const breakMinutes = exerciseCount > 1 ? (exerciseCount - 1) * 10 : 0;
      const totalTherapyTime = therapyMinutes + breakMinutes;
      
      return { 
        therapyMinutes: totalTherapyTime, 
        exerciseCount, 
        professionalCount,
        actualExerciseMinutes: therapyMinutes,
        breakMinutes 
      };
    };
    
    const stats = getDayStats(selectedDay);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  {childName}'s Therapy Schedule
                </h2>
                <div className="text-yellow-200 mb-2">
                  <strong>Key Focus:</strong> Integrating primitive reflexes for better development
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  {topPriorities.map((reflex, idx) => {
                    const reflexName = typeof reflex === 'string' ? reflex : reflex.name;
                    const affectedAreas = getAffectedAreas(reflexName);
                    return (
                      <div key={idx} className="bg-white/20 px-3 py-2 rounded-lg">
                        <div className="text-sm font-bold">{reflexName} Reflex</div>
                        <div className="text-xs opacity-90">Affects: {affectedAreas}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-4 mt-3">
                  <span className="text-yellow-200">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {stats.therapyMinutes} min therapy today
                  </span>
                  <span className="text-yellow-200">
                    <Target className="inline w-4 h-4 mr-1" />
                    {stats.exerciseCount} exercises
                  </span>
                  {stats.professionalCount > 0 && (
                    <span className="text-yellow-200">
                      <Users className="inline w-4 h-4 mr-1" />
                      {stats.professionalCount} professional sessions
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setGeneratedSchedule(null)}
                className="text-white hover:text-gray-200 text-2xl"
              >
                ✕
              </button>
            </div>
          </div>
          
          {/* Day Selector - Fixed with dates and no overlap */}
          <div className="bg-gray-50 border-b p-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {days.map(day => {
                const dayStats = getDayStats(day);
                const dayDate = getDayDate(day);
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`flex-shrink-0 px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedDay === day
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white text-gray-700 hover:bg-purple-100 border'
                    }`}
                    style={{ minWidth: '140px' }}
                  >
                    <div className="text-sm font-bold">{day}</div>
                    <div className="text-xs mt-1 opacity-90">{dayDate}</div>
                    <div className="text-xs mt-1 opacity-80">
                      {dayStats.therapyMinutes > 0 ? `${dayStats.therapyMinutes} min` : 'Rest day'}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-center mt-2 text-sm text-purple-600 font-medium">
              📅 Schedule starts tomorrow: {getDayDate(days[0])}
            </div>
          </div>
          
          {/* Schedule Display */}
          <div className="flex-1 overflow-auto p-6 bg-gray-50">
            {schedule[selectedDay].length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No therapy scheduled for {selectedDay}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {schedule[selectedDay].map((activity, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border-2 p-5 bg-white shadow-md hover:shadow-lg transition-shadow ${activity.color || 'bg-white border-gray-200'}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Time Block */}
                      <div className="flex-shrink-0 text-center bg-white rounded-lg p-3 shadow-sm border">
                        <div className="text-2xl font-bold text-purple-600">
                          {activity.time}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {activity.duration} min
                        </div>
                      </div>
                      
                      {/* Activity Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{activity.icon}</span>
                          <h3 className="font-bold text-lg text-gray-800">
                            {activity.activity}
                          </h3>
                          {activity.priority && activity.priority !== 'INFO' && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              activity.priority === 'CRITICAL' ? 'bg-purple-200 text-purple-800' :
                              activity.priority === 'HIGH' ? 'bg-red-200 text-red-800' :
                              activity.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                              'bg-green-200 text-green-800'
                            }`}>
                              {activity.priority}
                            </span>
                          )}
                        </div>
                        
                        {activity.details && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-2">
                            <p className="text-sm text-gray-700">
                              <strong>Instructions:</strong> {activity.details}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          {activity.equipment && (
                            <div className="flex items-center gap-1 text-gray-600">
                              <span className="font-semibold">Equipment:</span> {activity.equipment}
                            </div>
                          )}
                          {activity.difficulty && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Difficulty:</span>
                              <span className={`px-2 py-0.5 rounded ${
                                activity.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                                activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {activity.difficulty}
                              </span>
                            </div>
                          )}
                          {activity.reflex && (
                            <div className="flex items-center gap-1 text-purple-600">
                              <span className="font-semibold">Targets:</span> {activity.reflex}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Checkbox for exercises */}
                      {activity.type === 'reflex-exercise' && (
                        <div className="flex-shrink-0">
                          <label className="flex flex-col items-center cursor-pointer bg-white rounded-lg p-3 shadow-sm border hover:bg-green-50">
                            <input type="checkbox" className="w-6 h-6 text-green-600" />
                            <span className="text-xs mt-1 text-gray-600">Complete</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Summary Card with Reflex Connections */}
            {stats.therapyMinutes > 0 && (
              <div className="mt-6">
                {/* Reflex Impact Summary */}
                <div className="bg-white rounded-xl p-6 border-2 border-purple-200 mb-4">
                  <h3 className="font-bold text-lg mb-4 text-purple-800">
                    🧠 How These Exercises Help Your Child
                  </h3>
                  <div className="space-y-3">
                    {topPriorities.map((reflex, idx) => {
                      const reflexName = typeof reflex === 'string' ? reflex : reflex.name;
                      const areas = getAffectedAreas(reflexName);
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                            idx === 0 ? 'bg-red-500' :
                            idx === 1 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">
                              {reflexName} Reflex Integration
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">Improves:</span> {areas}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Daily Stats */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border-2 border-green-200">
                  <h3 className="font-bold text-lg mb-3 text-green-800">
                    📊 Daily Therapy Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 text-center shadow">
                      <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.therapyMinutes}
                      </div>
                      <div className="text-sm text-gray-600">Total Minutes</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow">
                      <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold text-purple-600">
                        {stats.exerciseCount}
                      </div>
                      <div className="text-sm text-gray-600">Exercises</div>
                    </div>
                    <div className="bg-white rounded-lg p-4 text-center shadow">
                      <Star className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                      <div className="text-2xl font-bold text-purple-600">
                        {topPriorities.length}
                      </div>
                      <div className="text-sm text-gray-600">Reflexes Targeted</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-green-700 italic">
                    "Consistency is key! Daily practice rewires the nervous system for better development."
                  </div>
                </div>
              </div>
            )}
            
            {/* Action Buttons - Mobile Responsive */}
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 px-3 sm:px-0">
              <button
                onClick={() => window.print()}
                className="bg-blue-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
              >
                🖨️ Print Schedule
              </button>
              <button
                onClick={exportToCalendar}
                className="bg-green-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-green-600 flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Export All to Calendar
              </button>
              <button
                onClick={() => setGeneratedSchedule(null)}
                className="bg-gray-500 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold hover:bg-gray-600 shadow-lg text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-6">
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg"
      >
        <Calendar className="w-5 h-5" />
        Build Therapy Schedule
      </button>

      {/* Input Modal - Mobile Responsive */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 z-10">
              <div className="flex justify-between items-start">
                <div className="pr-8">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                    Create {childData?.child_first_name}'s Therapy Schedule
                  </h2>
                  <p className="text-green-600 font-medium mt-1 text-sm sm:text-base">
                    📅 Starts tomorrow ({new Date(Date.now() + 86400000).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })})
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              {topPriorities.length > 0 ? (
                <div className="mt-3">
                  <p className="text-gray-600">Based on assessment, we'll focus on:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topPriorities.map((reflex, idx) => {
                      const reflexName = typeof reflex === 'string' ? reflex : reflex.name;
                      const areas = getAffectedAreas(reflexName);
                      return (
                        <div key={idx} className={`px-3 py-2 rounded-lg text-sm ${
                          idx === 0 ? 'bg-red-100 border border-red-300' :
                          idx === 1 ? 'bg-yellow-100 border border-yellow-300' :
                          'bg-green-100 border border-green-300'
                        }`}>
                          <div className="font-bold text-gray-800">
                            Priority {idx + 1}: {reflexName}
                          </div>
                          <div className="text-xs text-gray-600">
                            Affects: {areas}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 mt-2">Configure therapy and exercise schedule</p>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Daily Routine - Mobile Responsive */}
              <div className="bg-purple-50 rounded-lg p-4 sm:p-5 border border-purple-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-purple-800">
                  ⏰ Child's Daily Routine
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  We'll schedule exercises avoiding meal times and respecting sleep schedules
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Wake Up</label>
                    <input
                      type="time"
                      value={scheduleData.wakeUpTime}
                      onChange={(e) => handleInputChange('wakeUpTime', e.target.value)}
                      className="w-full border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base"
                      required
                    />
                    <span className="text-xs text-gray-500 hidden sm:block">No exercises 1.5h after</span>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Sleep</label>
                    <input
                      type="time"
                      value={scheduleData.sleepTime}
                      onChange={(e) => handleInputChange('sleepTime', e.target.value)}
                      className="w-full border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base"
                      required
                    />
                    <span className="text-xs text-gray-500 hidden sm:block">No exercises 30m before</span>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Breakfast</label>
                    <input
                      type="time"
                      value={scheduleData.breakfastTime}
                      onChange={(e) => handleInputChange('breakfastTime', e.target.value)}
                      className="w-full border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Lunch</label>
                    <input
                      type="time"
                      value={scheduleData.lunchTime}
                      onChange={(e) => handleInputChange('lunchTime', e.target.value)}
                      className="w-full border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-1">Dinner</label>
                    <input
                      type="time"
                      value={scheduleData.dinnerTime}
                      onChange={(e) => handleInputChange('dinnerTime', e.target.value)}
                      className="w-full border-2 rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* CRITICAL: Parent Availability - Mobile Responsive */}
              <div className="bg-red-50 rounded-lg p-4 sm:p-5 border-2 border-red-200">
                <h3 className="font-bold text-base sm:text-lg mb-3 sm:mb-4 text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  Parent Time (Important!)
                </h3>
                <p className="text-purple-600 font-medium mb-3 text-xs sm:text-sm">
                  📍 Daily time for exercises starting tomorrow
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">
                      Hours on WEEKDAYS
                    </label>
                    <select
                      value={scheduleData.weekdayHours}
                      onChange={(e) => handleInputChange('weekdayHours', e.target.value)}
                      className="w-full border-2 border-red-300 rounded-lg px-3 py-2 text-sm sm:text-lg font-semibold"
                    >
                      <option value="0.5">30 minutes</option>
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4+ hours</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium mb-2">
                      Hours on WEEKENDS
                    </label>
                    <select
                      value={scheduleData.weekendHours}
                      onChange={(e) => handleInputChange('weekendHours', e.target.value)}
                      className="w-full border-2 border-red-300 rounded-lg px-3 py-2 text-sm sm:text-lg font-semibold"
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                      <option value="5">5+ hours</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-red-600 mt-3">
                  ⚠️ This time will be used for reflex integration exercises
                </p>
              </div>

              {/* Preferred Time Slots - Mobile Responsive */}
              <div className="bg-yellow-50 rounded-lg p-4 sm:p-5 border border-yellow-200">
                <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">When can you do exercises?</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-yellow-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleData.preferredTimeSlots.earlyMorning}
                      onChange={(e) => handleTimeSlotToggle('earlyMorning', e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />
                    <span className="text-sm sm:text-base">Early Morning (6-8 AM)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-yellow-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleData.preferredTimeSlots.morning}
                      onChange={(e) => handleTimeSlotToggle('morning', e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />
                    <span className="text-sm sm:text-base">Morning (8 AM-12 PM)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-yellow-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleData.preferredTimeSlots.afternoon}
                      onChange={(e) => handleTimeSlotToggle('afternoon', e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />
                    <span className="text-sm sm:text-base">Afternoon (12-4 PM)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-yellow-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleData.preferredTimeSlots.evening}
                      onChange={(e) => handleTimeSlotToggle('evening', e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />
                    <span className="text-sm sm:text-base">Evening (4-7 PM)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border rounded-lg hover:bg-yellow-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={scheduleData.preferredTimeSlots.night}
                      onChange={(e) => handleTimeSlotToggle('night', e)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-5 h-5"
                    />
                    <span className="text-sm sm:text-base">Night (7-9 PM)</span>
                  </label>
                </div>
              </div>

              {/* Professional Therapies */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <h3 className="font-semibold text-lg mb-4">Professional Therapies (if any)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="text-left p-2">Active</th>
                        <th className="text-left p-2">Therapy Type</th>
                        <th className="text-left p-2">Time</th>
                        <th className="text-left p-2">Duration</th>
                        <th className="text-center p-2" colSpan="7">Days</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.therapies.map((therapy, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">
                            <input
                              type="checkbox"
                              checked={therapy.active}
                              onChange={(e) => handleTherapyChange(index, 'active', e.target.checked)}
                              className="w-5 h-5"
                            />
                          </td>
                          <td className="p-2 font-medium">{therapy.type}</td>
                          <td className="p-2">
                            <input
                              type="time"
                              value={therapy.time}
                              onChange={(e) => handleTherapyChange(index, 'time', e.target.value)}
                              className="border rounded px-2 py-1"
                              disabled={!therapy.active}
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={therapy.duration}
                              onChange={(e) => handleTherapyChange(index, 'duration', e.target.value)}
                              className="border rounded px-2 py-1"
                              disabled={!therapy.active}
                            >
                              <option value="30">30 min</option>
                              <option value="45">45 min</option>
                              <option value="60">1 hour</option>
                              <option value="90">1.5 hours</option>
                            </select>
                          </td>
                          {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                            <td key={day} className="p-1 text-center">
                              <div className="flex flex-col items-center">
                                <input
                                  type="checkbox"
                                  checked={therapy.days[day]}
                                  onChange={() => handleTherapyDayToggle(index, day)}
                                  disabled={!therapy.active}
                                  className="w-4 h-4"
                                />
                                <span className="text-xs mt-1">{day.slice(0, 1).toUpperCase()}</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* School Schedule (for context) */}
              <div className="bg-green-50 rounded-lg p-5 border border-green-200">
                <h3 className="font-semibold text-lg mb-4">School Schedule (for planning)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Attends School?</label>
                    <select
                      value={scheduleData.attendsSchool}
                      onChange={(e) => handleInputChange('attendsSchool', e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="yes">Yes</option>
                      <option value="no">No / Homeschool</option>
                    </select>
                  </div>
                  {scheduleData.attendsSchool === 'yes' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium mb-2">Start Time</label>
                        <input
                          type="time"
                          value={scheduleData.schoolStartTime}
                          onChange={(e) => handleInputChange('schoolStartTime', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">End Time</label>
                        <input
                          type="time"
                          value={scheduleData.schoolEndTime}
                          onChange={(e) => handleInputChange('schoolEndTime', e.target.value)}
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </>
                  )}
                </div>
                {scheduleData.attendsSchool === 'yes' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">School Days</label>
                    <div className="flex gap-2">
                      {Object.entries(scheduleData.schoolDays).map(([day, active]) => (
                        <label key={day} className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={active}
                            onChange={() => handleSchoolDayToggle(day)}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{day.slice(0, 3).charAt(0).toUpperCase() + day.slice(1, 3)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button - Mobile Responsive */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={generateSchedule}
                  disabled={loading}
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 sm:px-8 sm:py-3 rounded-lg font-bold disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all text-sm sm:text-base"
                >
                  {loading ? 'Creating Plan...' : 'Generate Therapy Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Schedule Display */}
      {generatedSchedule && (
        <TherapyScheduleDisplay 
          schedule={generatedSchedule}
          childName={childData?.child_first_name || 'Your Child'}
        />
      )}
    </div>
  );
};

export default EnhancedScheduleBuilder;