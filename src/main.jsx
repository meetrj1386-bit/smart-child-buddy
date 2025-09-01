// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import IntroPage from "./IntroPage";
import InfoForm from "./pages/InfoFormPage"; 
import AssessmentPage from "./pages/AssesssmentPage";
import ReportPage from './pages/ReportPage';
import SmartReportPage from './pages/SmartReportPage';
import TherapyCalendarPage from './pages/TherapyCalendarPage';
import { AI_CONFIG } from './AIAgent/config/config';
import { useEffect } from 'react';
import reflexKnowledge from './AIAgent/knowledge/reflexKnowledge';
import ReflexBuddyAI from './AIAgent/core/ReflexBuddyAI';  
 // ADD THIS
import ChatInterface from './AIAgent/components/ChatInterface';
import ChatWidget from './AIAgent/components/ChatWidget';
import AnalyticsDashboard from './AIAgent/components/AnalyticsDashboard';
import DatabaseTest from './AIAgent/components/DatabaseTest';
import ProgressTracker from './AIAgent/components/ProgressTracker';
import WidgetPage from './widget/WidgetPage';
import CustomerPortal from './admin/CustomerPortal';




// Test Component
const reflexBuddyAI = new ReflexBuddyAI();

const AppWithTest = () => {
  useEffect(() => {
    console.log('🚀 RUNNING AI TEST...');
    
    // Test 1: Message with reflexes
    const test1 = "My 5 year old is fidgeting all the time and still bedwetting.";
    reflexBuddyAI.chat(test1).then(response => {
      console.log('🤖 AI Response 1:', response);
    });
    
    // Test 2: General question
    const test2 = "Is my child developing normally?";
    reflexBuddyAI.chat(test2).then(response => {
      console.log('🤖 AI Response 2:', response);
    });
  }, []);
  
  // Return the Routes directly (not App)
  return (
    <Routes>
      <Route path="/widget" element={<WidgetPage />} />
<Route path="/admin" element={<CustomerPortal />} />

      <Route path="/" element={<IntroPage />} />
      <Route path="/info-form" element={<InfoForm />} />
      <Route path="/assessment/:id" element={<AssessmentPage />} />
      <Route path="/therapy-calendar" element={<TherapyCalendarPage />} />
      <Route path="/report/:id" element={<SmartReportPage />} />
        <Route path="/ai-chat" element={<ChatInterface />} />
        <Route path="/test-db" element={<DatabaseTest />} />
<Route path="/progress" element={<ProgressTracker parentEmail="test@email.com" childName="Emma" />} />

<Route path="/widget-test" element={
  <div className="min-h-screen bg-gray-100 p-10">
    <h1 className="text-3xl mb-4">Therapy Center Website</h1>
    <p>This is a demo of how the widget looks on a therapy center's website.</p>
    <ChatWidget />
  </div>
} />
<Route path="/ai-analytics" element={<AnalyticsDashboard />} />

<Route path="/widget-test" element={
  <div className="min-h-screen bg-gray-100">
    {/* Simulating a therapy center website */}
    <nav className="bg-white shadow p-4">
      <h1 className="text-2xl font-bold">ABC Therapy Center</h1>
    </nav>
    
    <div className="p-8">
      <h2 className="text-3xl mb-4">Welcome to Our Center</h2>
      <p className="mb-4">We specialize in pediatric occupational therapy...</p>
      
      <div className="bg-white p-6 rounded-lg shadow mb-4">
        <h3 className="text-xl font-bold mb-2">Our Services</h3>
        <ul className="list-disc ml-6">
          <li>Sensory Integration</li>
          <li>Fine Motor Skills</li>
          <li>Primitive Reflex Integration</li>
        </ul>
      </div>
      
      <p className="text-gray-600">
        Try our AI assistant in the bottom right corner for instant answers!
      </p>
    </div>
    
    {/* THE WIDGET - This is all they need to add! */}
    <ChatWidget />
  </div>
} />
    </Routes>

    
  );
};

let hasRun = false;
if (!hasRun) {
  hasRun = true;
  console.log('🚀 RUNNING AI TEST...');
  // Your test code
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppWithTest />
    </BrowserRouter>
  </React.StrictMode>
);