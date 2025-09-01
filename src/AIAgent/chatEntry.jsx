import React from "react";
import { createRoot } from "react-dom/client";
import ChatInterface from "./components/ChatInterface.jsx";
import "../index.css"; // Tailwind/global styles for chat.html

// Read ?project=... passed from the widget loader
const params = new URLSearchParams(location.search);
const project = params.get("project") || "clinic_demo";

createRoot(document.getElementById("root")).render(
  <ChatInterface widgetMode={true} projectId={project} />
);
