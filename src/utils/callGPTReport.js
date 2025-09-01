// utils/callGPTReport.js
export async function callGPTReportFunction(assessmentId) {
  const res = await fetch('https://dbwdaphrepcjbmxhjgou.supabase.co/functions/v1/gpt-report', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY}` // Optional if backend
    },
    body: JSON.stringify({ assessment_id: assessmentId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to generate report');
  return data;
}
