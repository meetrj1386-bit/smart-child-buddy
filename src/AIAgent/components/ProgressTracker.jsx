// src/AIAgent/components/ProgressTracker.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';

const ProgressTracker = ({ parentEmail, childName }) => {
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState({});
  const [weekNumber, setWeekNumber] = useState(1);
  
  useEffect(() => {
    loadProgress();
  }, [parentEmail]);
  
  const loadProgress = async () => {
    // Load assigned exercises and progress
    const { data } = await supabase
      .from('progress_trackers')
      .select(`
        *,
        exercise_library (
          exercise_name,
          skill_areas,
          expected_improvement_weeks
        )
      `)
      .eq('parent_email', parentEmail);
    
    setExercises(data || []);
  };
  
  const updateProgress = async (exerciseId, week, status) => {
    const columnName = `week_${week}_status`;
    
    const { error } = await supabase
      .from('progress_trackers')
      .update({ [columnName]: status })
      .eq('id', exerciseId);
    
    if (!error) {
      loadProgress();
    }
  };
  
  const getStatusEmoji = (status) => {
    const emojis = {
      'not_started': '⭕',
      'tried': '🟡',
      'improving': '🟢',
      'mastered': '⭐'
    };
    return emojis[status] || '⭕';
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          📊 {childName}'s Progress Tracker
        </h2>
        
        {/* Week Selector */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
            <button
              key={week}
              onClick={() => setWeekNumber(week)}
              className={`px-4 py-2 rounded-lg ${
                weekNumber === week 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Week {week}
            </button>
          ))}
        </div>
        
        {/* Exercise Progress */}
        <div className="space-y-4">
          {exercises.map(exercise => (
            <div key={exercise.id} className="border rounded-xl p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">
                    {exercise.exercise_library?.exercise_name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Skills: {exercise.exercise_library?.skill_areas?.join(', ')}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Expected improvement: {exercise.exercise_library?.expected_improvement_weeks} weeks
                  </p>
                </div>
                
                {/* Week Status */}
                <div className="text-2xl">
                  {getStatusEmoji(exercise[`week_${weekNumber}_status`])}
                </div>
              </div>
              
              {/* Progress Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => updateProgress(exercise.id, weekNumber, 'not_started')}
                  className="flex-1 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm"
                >
                  ⭕ Not Started
                </button>
                <button
                  onClick={() => updateProgress(exercise.id, weekNumber, 'tried')}
                  className="flex-1 py-2 bg-yellow-100 rounded-lg hover:bg-yellow-200 text-sm"
                >
                  🟡 Tried
                </button>
                <button
                  onClick={() => updateProgress(exercise.id, weekNumber, 'improving')}
                  className="flex-1 py-2 bg-green-100 rounded-lg hover:bg-green-200 text-sm"
                >
                  🟢 Improving
                </button>
                <button
                  onClick={() => updateProgress(exercise.id, weekNumber, 'mastered')}
                  className="flex-1 py-2 bg-purple-100 rounded-lg hover:bg-purple-200 text-sm"
                >
                  ⭐ Mastered
                </button>
              </div>
              
              {/* Visual Progress Bar */}
              <div className="mt-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(w => (
                    <div
                      key={w}
                      className={`flex-1 h-2 rounded ${
                        exercise[`week_${w}_status`] === 'mastered' ? 'bg-purple-600' :
                        exercise[`week_${w}_status`] === 'improving' ? 'bg-green-500' :
                        exercise[`week_${w}_status`] === 'tried' ? 'bg-yellow-400' :
                        'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Celebration Messages */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
          <h3 className="font-bold mb-2">🎉 Celebrations This Week:</h3>
          <ul className="space-y-1">
            <li className="text-sm">✨ Attempted all exercises!</li>
            <li className="text-sm">🌟 Improvement in fine motor skills!</li>
            <li className="text-sm">💪 Consistency is paying off!</li>
          </ul>
        </div>
        
        {/* Tips */}
        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <h3 className="font-bold mb-2">💡 Tips for Success:</h3>
          <ul className="space-y-1 text-sm">
            <li>• Practice at the same time each day</li>
            <li>• Celebrate small wins</li>
            <li>• If frustrated, take a break and try later</li>
            <li>• Make it fun with music or games</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;