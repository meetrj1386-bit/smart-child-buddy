// src/AIAgent/components/DatabaseTest.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import reflexBuddyAI from '../core/ReflexBuddyAI';

const DatabaseTest = () => {
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  useEffect(() => {
    loadDatabaseStats();
  }, []);
  
  const loadDatabaseStats = async () => {
    const stats = {};
    
    // Count exercises
    const { count: exerciseCount } = await supabase
      .from('exercise_library')
      .select('*', { count: 'exact', head: true });
    stats.exercises = exerciseCount;
    
    // Count questions
    const { count: questionCount } = await supabase
      .from('smart_questions')
      .select('*', { count: 'exact', head: true });
    stats.questions = questionCount;
    
    // Count patterns
    const { count: patternCount } = await supabase
      .from('concern_patterns')
      .select('*', { count: 'exact', head: true });
    stats.patterns = patternCount;
    
    setStats(stats);
  };
  
  const runTest = async (scenario) => {
    setLoading(true);
    
    let concern, age;
    
    switch(scenario) {
      case 'adhd':
        concern = "My 5 year old can't sit still, always fidgeting, can't focus on anything";
        age = 5;
        break;
      case 'autism':
        concern = "My 3 year old doesn't talk, no eye contact, lines up toys, flaps hands";
        age = 3;
        break;
      case 'speech':
        concern = "My 4 year old can't speak clearly, drools, very picky eater";
        age = 4;
        break;
      case 'motor':
        concern = "My 6 year old has terrible handwriting, clumsy, can't ride a bike";
        age = 6;
        break;
    }
    
    // Process with AI
    const response = await reflexBuddyAI.chat(concern, { childAge: age });
    
    // Get the analysis details
    const analysis = await reflexBuddyAI.processParentConcern(concern, age);
    
    setTestResults({
      scenario,
      concern,
      age,
      response: response.message,
      analysis
    });
    
    setLoading(false);
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Database Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">🧪 Database Test Dashboard</h1>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.exercises || 0}</div>
            <div className="text-sm text-gray-600">Exercises</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{stats.questions || 0}</div>
            <div className="text-sm text-gray-600">Questions</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.patterns || 0}</div>
            <div className="text-sm text-gray-600">Patterns</div>
          </div>
        </div>
        
        {/* Test Scenarios */}
        <h2 className="text-lg font-bold mb-3">Run Test Scenarios:</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => runTest('adhd')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            disabled={loading}
          >
            Test ADHD (5yr)
          </button>
          <button
            onClick={() => runTest('autism')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            disabled={loading}
          >
            Test Autism (3yr)
          </button>
          <button
            onClick={() => runTest('speech')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            disabled={loading}
          >
            Test Speech (4yr)
          </button>
          <button
            onClick={() => runTest('motor')}
            className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            disabled={loading}
          >
            Test Motor (6yr)
          </button>
        </div>
      </div>
      
      {/* Test Results */}
      {testResults.concern && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Test Results: {testResults.scenario?.toUpperCase()}</h2>
          
          {/* Input */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-bold mb-2">Parent Concern:</h3>
            <p className="text-sm">{testResults.concern}</p>
            <p className="text-sm mt-2">Child Age: {testResults.age} years</p>
          </div>
          
          {/* Analysis */}
          {testResults.analysis && (
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Patterns Found:</h3>
                {testResults.analysis.patterns?.map((p, idx) => (
                  <div key={idx} className="text-sm mb-1">
                    • {p.category} - {p.subcategory}
                  </div>
                ))}
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-bold mb-2">Reflexes Identified:</h3>
                {testResults.analysis.reflexes?.map((r, idx) => (
                  <div key={idx} className="text-sm mb-1">• {r}</div>
                ))}
              </div>
            </div>
          )}
          
          {/* Exercises Found */}
          {testResults.analysis?.exercises && (
            <div className="bg-yellow-50 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">Exercises Recommended:</h3>
              {testResults.analysis.exercises.map((ex, idx) => (
                <div key={idx} className="text-sm mb-2">
                  <span className="font-semibold">{idx + 1}. {ex.exercise_name}</span>
                  <span className="text-gray-600"> - {ex.skill_areas?.join(', ')}</span>
                </div>
              ))}
            </div>
          )}
          
          {/* AI Response */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="font-bold mb-2">AI Response:</h3>
            <div className="text-sm whitespace-pre-wrap">{testResults.response}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;