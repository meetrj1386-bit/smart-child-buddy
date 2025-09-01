import "../index.css";

import React from "react";
import { createRoot } from "react-dom/client";
import ChatInterface from "../AIAgent/components/ChatInterface";

// read clinic/project id from URL: /chat.html?project=clinic_demo
const params = new URLSearchParams(window.location.search);
const projectId = params.get("project") || "";

createRoot(document.getElementById("root")).render(
  <ChatInterface widgetMode={true} projectId={projectId} />
);
