// src/main.jsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";

// Pages
import IntroPage from "./IntroPage";
import InfoForm from "./pages/InfoFormPage";
import AssessmentPage from "./pages/AssesssmentPage";
import SmartReportPage from "./pages/SmartReportPage";
import TherapyCalendarPage from "./pages/TherapyCalendarPage";

// AI / Components
import ReflexBuddyAI from "./AIAgent/core/ReflexBuddyAI";
import ChatInterface from "./AIAgent/components/ChatInterface";
import ChatWidget from "./AIAgent/components/ChatWidget";
import AnalyticsDashboard from "./AIAgent/components/AnalyticsDashboard";
import DatabaseTest from "./AIAgent/components/DatabaseTest";
import ProgressTracker from "./AIAgent/components/ProgressTracker";
import WidgetPage from "./widget/WidgetPage";
import CustomerPortal from "./admin/CustomerPortal";

// If these are not used here, feel free to remove their imports
// import { AI_CONFIG } from './AIAgent/config/config';
// import reflexKnowledge from './AIAgent/knowledge/reflexKnowledge';

// ---------------- AppWithTest ----------------
const reflexBuddyAI = new ReflexBuddyAI();

const AppWithTest = () => {
  useEffect(() => {
    console.log("🚀 RUNNING AI TEST...");

    const test1 = "My 5 year old is fidgeting all the time and still bedwetting.";
    reflexBuddyAI.chat(test1).then((response) => {
      console.log("🤖 AI Response 1:", response);
    });

    const test2 = "Is my child developing normally?";
    reflexBuddyAI.chat(test2).then((response) => {
      console.log("🤖 AI Response 2:", response);
    });
  }, []);

  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<IntroPage />} />
      <Route path="/info-form" element={<InfoForm />} />
      <Route path="/assessment/:id" element={<AssessmentPage />} />
      <Route path="/therapy-calendar" element={<TherapyCalendarPage />} />
      <Route path="/report/:id" element={<SmartReportPage />} />

      {/* AI / tools */}
      <Route path="/ai-chat" element={<ChatInterface />} />
      <Route path="/test-db" element={<DatabaseTest />} />
      <Route path="/ai-analytics" element={<AnalyticsDashboard />} />
      <Route
        path="/progress"
        element={<ProgressTracker parentEmail="test@email.com" childName="Emma" />}
      />

      {/* Admin / widgets */}
      <Route path="/widget" element={<WidgetPage />} />
      <Route path="/admin" element={<CustomerPortal />} />

      {/* Demo widget page (keep ONE /widget-test route) */}
      <Route
        path="/widget-test"
        element={
          <div className="min-h-screen bg-gray-100">
            {/* Simulated outside website */}
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

            {/* The embeddable widget */}
            <ChatWidget />
          </div>
        }
      />
    </Routes>
  );
};

// ---------------- Single render call ----------------
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <AppWithTest />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>
);
