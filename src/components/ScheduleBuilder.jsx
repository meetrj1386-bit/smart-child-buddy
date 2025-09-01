import React, { useState, useEffect } from 'react';
import { Calendar, Clock, School, Heart, Users, Sun, Moon, Coffee } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import EnhancedScheduleBuilder from '../components/EnhancedScheduleBuilder';


const ScheduleBuilder = ({ assessmentId, childData, onScheduleGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    // Daily Routine Times
    wakeUpTime: '07:00',
    sleepTime: '20:00',
    breakfastTime: '08:00',
    lunchTime: '12:00',
    dinnerTime: '18:00',
    snackTime1: '10:00',
    snackTime2: '15:00',
    
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
    
    // Therapy Schedule (using table format with day checkboxes)
    therapies: [
      { 
        type: 'Speech Therapy', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '45' 
      },
      { 
        type: 'Occupational Therapy (OT)', 
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
      },
      { 
        type: 'Other', 
        active: false, 
        days: { mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false },
        time: '', 
        duration: '30', 
        name: '' 
      }
    ],
    
    // Parent Availability
    weekdayHours: '2',
    weekendHours: '4',
    preferredTimeSlots: {
      earlyMorning: false,  // 6-8am
      morning: true,        // 8-12pm
      afternoon: true,      // 12-4pm
      evening: false,       // 4-7pm
      night: false         // 7-9pm
    },
    
    // Additional Preferences
    napTime: '',
    napDuration: '',
    educationalScreenTime: '0.5',
    outdoorPlayPreferred: 'afternoon',
    
    // Additional Notes
    specialConsiderations: '',
    currentChallenges: ''
  });

  // Time slot labels for display
  const timeSlotLabels = {
    earlyMorning: 'Early Morning (6-8 AM)',
    morning: 'Morning (8-12 PM)',
    afternoon: 'Afternoon (12-4 PM)',
    evening: 'Evening (4-7 PM)',
    night: 'Night (7-9 PM)'
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

  const handleTimeSlotToggle = (slot) => {
    setScheduleData(prev => ({
      ...prev,
      preferredTimeSlots: {
        ...prev.preferredTimeSlots,
        [slot]: !prev.preferredTimeSlots[slot]
      }
    }));
  };

  const generateSchedule = async () => {
    setLoading(true);
    
    // Validate assessmentId
    if (!assessmentId) {
      alert('Assessment ID is missing. Please refresh the page and try again.');
      setLoading(false);
      return;
    }
    
    try {
      // Calculate buffer times
      const wakeUpHour = parseInt(scheduleData.wakeUpTime.split(':')[0]);
      const sleepHour = parseInt(scheduleData.sleepTime.split(':')[0]);
      
      // Morning buffer: +1.5 hours after wake up
      const morningBufferEnd = `${String(wakeUpHour + 1).padStart(2, '0')}:30`;
      
      // Evening buffer: -30 minutes before sleep
      const eveningBufferStart = `${String(sleepHour).padStart(2, '0')}:${sleepHour > 0 ? '30' : '00'}`;
      
      // Generate weekly schedule based on input
      const weeklySchedule = generateWeeklySchedule();
      
      // Save to database
      console.log('Attempting to save schedule for assessment:', assessmentId);
      
      const { data, error } = await supabase
        .from('child_schedules')
        .insert({
          assessment_id: assessmentId,
          schedule_data: scheduleData,
          generated_schedule: weeklySchedule,
          created_at: new Date().toISOString()
        })
        .select(); // Add select to return the inserted data
      
      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      
      console.log('Schedule saved successfully:', data);
      
      setGeneratedSchedule(weeklySchedule);
      console.log('Generated schedule set:', weeklySchedule);
      
      // Close the modal
      setIsOpen(false);
      console.log('Modal closed, calendar should appear');
      
      // Notify parent component
      if (onScheduleGenerated) {
        onScheduleGenerated(weeklySchedule);
      }
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      alert(`Failed to generate schedule. Error: ${error.message || 'Unknown error'}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklySchedule = () => {
    const schedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    days.forEach(day => {
      const dayKey = day.toLowerCase();
      const activities = [];
      
      // Add wake up time with buffer
      activities.push({
        time: scheduleData.wakeUpTime,
        activity: '🌅 Wake Up & Morning Routine',
        type: 'routine',
        duration: 90
      });
      
      // Add breakfast
      activities.push({
        time: scheduleData.breakfastTime,
        activity: '🍳 Breakfast',
        type: 'meal',
        duration: 30
      });
      
      // Add school if applicable
      if (scheduleData.attendsSchool === 'yes' && scheduleData.schoolDays[dayKey]) {
        activities.push({
          time: scheduleData.schoolStartTime,
          activity: '🎒 School',
          type: 'school',
          duration: calculateDuration(scheduleData.schoolStartTime, scheduleData.schoolEndTime)
        });
      } else {
        // Add morning reflex exercises
        activities.push({
          time: '09:00',
          activity: '🤸 Reflex Integration Exercises',
          type: 'therapy',
          duration: 20
        });
      }
      
      // Add therapies
      scheduleData.therapies.forEach(therapy => {
        if (therapy.active) {
          // Check if this therapy is scheduled for this day
          const dayMapping = {
            'monday': 'mon',
            'tuesday': 'tue',
            'wednesday': 'wed',
            'thursday': 'thu',
            'friday': 'fri',
            'saturday': 'sat',
            'sunday': 'sun'
          };
          
          if (therapy.days[dayMapping[dayKey]]) {
            activities.push({
              time: therapy.time,
              activity: `💊 ${therapy.type === 'Other' ? therapy.name : therapy.type}`,
              type: 'therapy',
              duration: parseInt(therapy.duration)
            });
          }
        }
      });
      
      // Add lunch
      activities.push({
        time: scheduleData.lunchTime,
        activity: '🥗 Lunch',
        type: 'meal',
        duration: 30
      });
      
      // Add nap if specified
      if (scheduleData.napTime) {
        activities.push({
          time: scheduleData.napTime,
          activity: '😴 Nap Time',
          type: 'rest',
          duration: parseInt(scheduleData.napDuration) || 60
        });
      }
      
      // Add afternoon activities based on preferences
      if (scheduleData.outdoorPlayPreferred === 'afternoon') {
        activities.push({
          time: '16:00',
          activity: '🏃 Outdoor Play / Physical Activity',
          type: 'play',
          duration: 45
        });
      }
      
      // Add dinner
      activities.push({
        time: scheduleData.dinnerTime,
        activity: '🍽️ Dinner',
        type: 'meal',
        duration: 30
      });
      
      // Add evening routine
      activities.push({
        time: '19:00',
        activity: '🛁 Evening Routine (Bath, Calm Activities)',
        type: 'routine',
        duration: 60
      });
      
      // Add bedtime
      activities.push({
        time: scheduleData.sleepTime,
        activity: '🌙 Bedtime',
        type: 'routine',
        duration: 0
      });
      
      // Sort activities by time
      activities.sort((a, b) => a.time.localeCompare(b.time));
      
      schedule[day] = activities;
    });
    
    return schedule;
  };

  const calculateDuration = (start, end) => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    return (endHour * 60 + endMin) - (startHour * 60 + startMin);
  };

  return (
    <div className="mt-6">
      {/* Button to open schedule builder */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
      >
        <Calendar className="w-5 h-5" />
        Build Personalized Schedule
      </button>

      {/* Modal/Expanded Form */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Build Your Child's Daily Schedule</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Daily Routine Section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Daily Routine Times
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Wake Up Time</label>
                    <input
                      type="time"
                      value={scheduleData.wakeUpTime}
                      onChange={(e) => handleInputChange('wakeUpTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Sleep Time</label>
                    <input
                      type="time"
                      value={scheduleData.sleepTime}
                      onChange={(e) => handleInputChange('sleepTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Breakfast</label>
                    <input
                      type="time"
                      value={scheduleData.breakfastTime}
                      onChange={(e) => handleInputChange('breakfastTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lunch</label>
                    <input
                      type="time"
                      value={scheduleData.lunchTime}
                      onChange={(e) => handleInputChange('lunchTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Dinner</label>
                    <input
                      type="time"
                      value={scheduleData.dinnerTime}
                      onChange={(e) => handleInputChange('dinnerTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nap Time (optional)</label>
                    <input
                      type="time"
                      value={scheduleData.napTime}
                      onChange={(e) => handleInputChange('napTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      placeholder="Leave blank if no nap"
                    />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <School className="w-5 h-5 text-green-600" />
                  School Information
                </h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Does your child attend school?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendsSchool"
                        value="yes"
                        checked={scheduleData.attendsSchool === 'yes'}
                        onChange={(e) => handleInputChange('attendsSchool', e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="attendsSchool"
                        value="no"
                        checked={scheduleData.attendsSchool === 'no'}
                        onChange={(e) => handleInputChange('attendsSchool', e.target.value)}
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>
                
                {scheduleData.attendsSchool === 'yes' && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">School Days</label>
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(scheduleData.schoolDays).map(day => (
                          <button
                            key={day}
                            onClick={() => handleSchoolDayToggle(day)}
                            className={`px-3 py-1 rounded ${
                              scheduleData.schoolDays[day]
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">School Start Time</label>
                        <input
                          type="time"
                          value={scheduleData.schoolStartTime}
                          onChange={(e) => handleInputChange('schoolStartTime', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">School End Time</label>
                        <input
                          type="time"
                          value={scheduleData.schoolEndTime}
                          onChange={(e) => handleInputChange('schoolEndTime', e.target.value)}
                          className="w-full border rounded px-3 py-2"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Therapy Schedule Table */}
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-purple-600" />
                  Therapy Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-purple-100">
                        <th className="border border-gray-300 px-2 py-2 text-left text-sm">Active</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm">Therapy Type</th>
                        <th className="border border-gray-300 px-2 py-2 text-center text-sm" colSpan="7">Days</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm">Time</th>
                        <th className="border border-gray-300 px-4 py-2 text-left text-sm">Duration (min)</th>
                      </tr>
                      <tr className="bg-purple-50">
                        <th className="border border-gray-300"></th>
                        <th className="border border-gray-300"></th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">M</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">T</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">W</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">T</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">F</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">S</th>
                        <th className="border border-gray-300 px-1 py-1 text-xs">S</th>
                        <th className="border border-gray-300"></th>
                        <th className="border border-gray-300"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduleData.therapies.map((therapy, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-2 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.active}
                              onChange={(e) => handleTherapyChange(index, 'active', e.target.checked)}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            {therapy.type === 'Other' ? (
                              <input
                                type="text"
                                value={therapy.name}
                                onChange={(e) => handleTherapyChange(index, 'name', e.target.value)}
                                placeholder="Enter therapy name"
                                className="w-full border-0 bg-transparent text-sm"
                                disabled={!therapy.active}
                              />
                            ) : (
                              <span className="text-sm">{therapy.type}</span>
                            )}
                          </td>
                          {/* Day checkboxes */}
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.mon}
                              onChange={() => handleTherapyDayToggle(index, 'mon')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.tue}
                              onChange={() => handleTherapyDayToggle(index, 'tue')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.wed}
                              onChange={() => handleTherapyDayToggle(index, 'wed')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.thu}
                              onChange={() => handleTherapyDayToggle(index, 'thu')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.fri}
                              onChange={() => handleTherapyDayToggle(index, 'fri')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.sat}
                              onChange={() => handleTherapyDayToggle(index, 'sat')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-1 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={therapy.days.sun}
                              onChange={() => handleTherapyDayToggle(index, 'sun')}
                              disabled={!therapy.active}
                              className="w-3 h-3"
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="time"
                              value={therapy.time}
                              onChange={(e) => handleTherapyChange(index, 'time', e.target.value)}
                              className="w-full border-0 bg-transparent text-sm"
                              disabled={!therapy.active}
                            />
                          </td>
                          <td className="border border-gray-300 px-4 py-2">
                            <input
                              type="number"
                              value={therapy.duration}
                              onChange={(e) => handleTherapyChange(index, 'duration', e.target.value)}
                              className="w-full border-0 bg-transparent text-sm"
                              disabled={!therapy.active}
                              min="15"
                              max="120"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parent Availability */}
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-600" />
                  Parent Availability
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hours available on weekdays
                    </label>
                    <input
                      type="number"
                      value={scheduleData.weekdayHours}
                      onChange={(e) => handleInputChange('weekdayHours', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                      max="24"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Hours available on weekends
                    </label>
                    <input
                      type="number"
                      value={scheduleData.weekendHours}
                      onChange={(e) => handleInputChange('weekendHours', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                      max="24"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred time slots for activities
                  </label>
                  <div className="space-y-2">
                    {Object.keys(scheduleData.preferredTimeSlots).map(slot => (
                      <label key={slot} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={scheduleData.preferredTimeSlots[slot]}
                          onChange={() => handleTimeSlotToggle(slot)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{timeSlotLabels[slot]}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Additional Preferences */}
              <div className="bg-orange-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Additional Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Educational Screen Time (hours/day)
                    </label>
                    <input
                      type="number"
                      value={scheduleData.educationalScreenTime}
                      onChange={(e) => handleInputChange('educationalScreenTime', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                      min="0"
                      max="8"
                      step="0.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Default: 30 minutes</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Preferred Outdoor Play Time
                    </label>
                    <select
                      value={scheduleData.outdoorPlayPreferred}
                      onChange={(e) => handleInputChange('outdoorPlayPreferred', e.target.value)}
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="morning">Morning</option>
                      <option value="afternoon">Afternoon</option>
                      <option value="evening">Evening</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-1">
                    Special Considerations (allergies, medications, sensory needs)
                  </label>
                  <textarea
                    value={scheduleData.specialConsiderations}
                    onChange={(e) => handleInputChange('specialConsiderations', e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    rows="3"
                    placeholder="E.g., Needs quiet time after school, sensitive to loud noises, takes medication at 2pm..."
                  />
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={generateSchedule}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Generating...' : 'Generate Schedule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generated Schedule Display - Outside Modal */}
      {generatedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {childData?.child_first_name || 'Your Child'}'s Weekly Schedule
                  </h2>
                  <p className="text-blue-100 mt-1">Personalized daily routine with all activities</p>
                </div>
                <button
                  onClick={() => setGeneratedSchedule(null)}
                  className="text-white hover:text-gray-200 text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Schedule Display */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(generatedSchedule).map(([day, activities]) => (
                  <div key={day} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <h3 className="font-bold text-lg text-blue-600 mb-3 border-b pb-2">{day}</h3>
                    <div className="space-y-2">
                      {activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 p-2 rounded hover:bg-gray-50">
                          <span className="font-medium text-gray-600 w-14 text-sm">
                            {activity.time}
                          </span>
                          <div className="flex-1">
                            <span className={`text-sm font-medium ${
                              activity.type === 'therapy' ? 'text-purple-600' :
                              activity.type === 'meal' ? 'text-green-600' :
                              activity.type === 'school' ? 'text-blue-600' :
                              activity.type === 'routine' ? 'text-orange-600' :
                              activity.type === 'play' ? 'text-pink-600' :
                              activity.type === 'rest' ? 'text-gray-600' :
                              'text-gray-700'
                            }`}>
                              {activity.activity}
                            </span>
                            {activity.duration > 0 && (
                              <span className="text-xs text-gray-500 ml-2">
                                ({activity.duration} min)
                              </span>
                            )}
                            {activity.tips && (
                              <p className="text-xs text-gray-500 mt-1 italic">{activity.tips}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex justify-center gap-4">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 flex items-center gap-2"
                >
                  <span>🖨️</span> Print Schedule
                </button>
                <button
                  onClick={() => {
                    // Create calendar file
                    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Child Schedule//EN\n';
                    const getNextDateForDay = (dayName) => {
                      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                      const today = new Date();
                      const targetDay = days.indexOf(dayName);
                      const currentDay = today.getDay();
                      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
                      const targetDate = new Date(today);
                      targetDate.setDate(today.getDate() + daysUntilTarget);
                      return targetDate.toISOString().split('T')[0].replace(/-/g, '');
                    };
                    
                    Object.entries(generatedSchedule).forEach(([day, activities]) => {
                      activities.forEach(activity => {
                        if (activity.duration > 0) {
                          icsContent += 'BEGIN:VEVENT\n';
                          icsContent += `SUMMARY:${activity.activity.replace(/[^\w\s]/gi, '')}\n`;
                          icsContent += `DTSTART:${getNextDateForDay(day)}T${activity.time.replace(':', '')}00\n`;
                          icsContent += `DURATION:PT${activity.duration}M\n`;
                          icsContent += 'RRULE:FREQ=WEEKLY\n';
                          icsContent += 'END:VEVENT\n';
                        }
                      });
                    });
                    
                    icsContent += 'END:VCALENDAR';
                    
                    // Download the file
                    const blob = new Blob([icsContent], { type: 'text/calendar' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${childData?.child_first_name || 'child'}_schedule.ics`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-600 flex items-center gap-2"
                >
                  <span>📅</span> Export to Calendar
                </button>
                <button
                  onClick={() => setGeneratedSchedule(null)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600"
                >
                  Close
                </button>
              </div>
              
              {/* Notes */}
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">📝 Important Notes:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Morning activities start 1.5 hours after wake-up for adjustment time</li>
                  <li>• Evening wind-down begins 30 minutes before bedtime</li>
                  <li>• Reflex integration exercises are automatically included on non-school days</li>
                  <li>• Adjust timings based on your child's response and energy levels</li>
                  <li>• The exported calendar file can be imported into Google Calendar, Outlook, or Apple Calendar</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleBuilder;