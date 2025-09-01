// src/AIAgent/components/AnalyticsDashboard.jsx

import React, { useState, useEffect } from 'react';
import aiSupabaseService from '../services/supabaseService';
import { supabase } from '../../utils/supabaseClient';

const AnalyticsDashboard = () => {
  const [stats, setStats] = useState({
    totalConversations: 0,
    uniqueSessions: 0,
    commonReflexes: [],
    recentQuestions: [],
    todayCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get today's conversations
      const today = new Date().toISOString().split('T')[0];
      const { data: todayData } = await supabase
        .from('ai_conversations')
        .select('*')
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      // Get all conversations for stats
      const { data: allData } = await supabase
        .from('ai_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Get unique sessions
      const { data: sessions } = await supabase
        .from('ai_sessions')
        .select('*');

      // Count reflexes
      const reflexCounts = {};
      allData?.forEach(conv => {
        conv.reflexes_identified?.forEach(reflex => {
          reflexCounts[reflex] = (reflexCounts[reflex] || 0) + 1;
        });
      });

      // Sort reflexes by frequency
      const sortedReflexes = Object.entries(reflexCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([reflex, count]) => ({ reflex, count }));

      setStats({
        totalConversations: allData?.length || 0,
        uniqueSessions: sessions?.length || 0,
        commonReflexes: sortedReflexes,
        recentQuestions: todayData?.slice(0, 5) || [],
        todayCount: todayData?.length || 0
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          AI Analytics Dashboard
        </h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-purple-600">{stats.totalConversations}</div>
            <div className="text-gray-600">Total Conversations</div>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600">{stats.uniqueSessions}</div>
            <div className="text-gray-600">Unique Sessions</div>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-green-600">{stats.todayCount}</div>
            <div className="text-gray-600">Today's Questions</div>
          </div>
          
          <div className="bg-yellow-50 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {stats.totalConversations > 0 ? 
                Math.round(stats.commonReflexes.length / stats.totalConversations * 100) : 0}%
            </div>
            <div className="text-gray-600">Have Reflexes</div>
          </div>
        </div>

        {/* Common Reflexes */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Most Common Reflexes Found</h2>
            {stats.commonReflexes.length > 0 ? (
              <div className="space-y-3">
                {stats.commonReflexes.map(({ reflex, count }) => (
                  <div key={reflex} className="flex justify-between items-center">
                    <span className="font-medium">{reflex}</span>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                      {count} times
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reflexes identified yet</p>
            )}
          </div>

          {/* Recent Questions */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">Recent Questions</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats.recentQuestions.map((q, idx) => (
                <div key={idx} className="border-b pb-2">
                  <p className="text-sm text-gray-700">{q.user_message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(q.created_at).toLocaleTimeString()}
                    {q.reflexes_identified?.length > 0 && (
                      <span className="ml-2 text-purple-600">
                        → {q.reflexes_identified.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-6 text-center">
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            Refresh Analytics
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;