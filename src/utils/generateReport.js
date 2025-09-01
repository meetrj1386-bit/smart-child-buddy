// utils/generateReport.js
import { supabase } from "./supabaseClient";

export const generateReport = async (assessmentId) => {
  try {
    const response = await fetch(
      "https://dbwdaphrepcjbmxhjgou.supabase.co/functions/v1/gpt-report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`, // Optional if needed
        },
        body: JSON.stringify({ assessment_id: assessmentId }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Failed to generate report: ${errText}`);
    }

    return await response.json();
  } catch (err) {
    console.error("GPT Report error:", err);
    return { success: false };
  }
};
