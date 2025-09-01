// ReportPage.jsx (Final Version with Export)
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import html2pdf from "html2pdf.js";

const ReportPage = () => {
  const { id: assessmentId } = useParams();
  const [report, setReport] = useState(null);
  const reportRef = useRef();

  useEffect(() => {
    const fetchReport = async () => {
      const { data, error } = await supabase
        .from("assessment_reports")
        .select("summary, roadmap_json, reflex_json, scores, parent_tips")
        .eq("assessment_id", assessmentId)
        .single();
      if (!error) setReport(data);
    };
    fetchReport();
  }, [assessmentId]);

  const downloadPDF = () => {
    const element = reportRef.current;
    html2pdf().from(element).save("child-assessment-report.pdf");
  };

  if (!report)
    return <div className="text-center p-10 text-gray-500">Loading report...</div>;

  const { summary, scores, roadmap_json, reflex_json, parent_tips } = report;
  const roadmap = JSON.parse(roadmap_json || "[]");
  const reflexes = JSON.parse(reflex_json || "[]");

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold text-purple-700">Child Development Report</h1>
        <button
          onClick={downloadPDF}
          className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700"
        >
          Download PDF
        </button>
      </div>

      <div
        ref={reportRef}
        className="bg-white shadow-lg rounded-3xl p-8 border border-purple-200"
      >
        <p className="text-gray-700 mb-6 whitespace-pre-line">{summary}</p>

        <h2 className="text-2xl font-semibold text-purple-600 mb-2">Scores by Area</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {scores &&
            Object.entries(scores).map(([area, score]) => (
              <div
                key={area}
                className="bg-purple-50 border border-purple-200 p-4 rounded-xl"
              >
                <p className="text-sm font-medium text-gray-600">{area}</p>
                <p className="text-xl font-bold text-purple-700">{score}/10</p>
              </div>
            ))}
        </div>

        <h2 className="text-2xl font-semibold text-purple-600 mb-2">Reflexes to Work On</h2>
        <ul className="list-disc list-inside text-gray-800 mb-6">
          {reflexes.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>

        <h2 className="text-2xl font-semibold text-purple-600 mb-2">3-Month Roadmap</h2>
        <div className="space-y-4 mb-6">
          {roadmap.map((month, i) => (
            <div
              key={i}
              className="bg-gray-50 border border-gray-200 p-4 rounded-xl"
            >
              <h3 className="text-lg font-bold text-gray-700 mb-1">Month {i + 1}</h3>
              <ul className="list-disc list-inside text-gray-800">
                {month.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {parent_tips && (
          <>
            <h2 className="text-2xl font-semibold text-purple-600 mb-2">Parent Tips</h2>
            <p className="text-gray-800 whitespace-pre-line">{parent_tips}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
