class m{constructor(e){this.apiKey=e||"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"}async prepareComprehensiveContext(e,n,o,i){return console.log("📚 Preparing comprehensive AI context with all parent inputs..."),{parentConcerns:{mainConcerns:e.main_concerns||"",hasSpecificConcerns:!!e.main_concerns,concernsAnalysis:this.analyzeParentConcerns(e.main_concerns)},childInfo:{name:e.child_first_name,age:e.child_age,gender:e.child_gender,birthHistory:e.child_birth_history,diagnoses:e.child_diagnoses,medications:e.child_medications},uploadedDocuments:await this.processUploadedDocuments(i),assessmentResponses:n,questionsStructure:o}}analyzeParentConcerns(e){if(!e)return{categories:[],keywords:[],severity:"none"};const n=e.toLowerCase(),o={categories:[],keywords:[],severity:"mild",specificAreas:[]};Object.entries({speech:["speech","talk","language","words","articulation","stutter","pronunciation"],motor:["walk","run","balance","clumsy","coordination","falls","movement"],behavior:["tantrum","aggressive","behavior","emotional","anxiety","attention","hyperactive"],social:["friends","social","play","interaction","shy","withdrawn"],sensory:["sensitive","texture","sound","light","touch","sensory"],academic:["reading","writing","learning","school","homework","concentrate"],feeding:["eating","food","picky","swallow","chew","weight"]}).forEach(([s,c])=>{c.some(d=>n.includes(d))&&(o.categories.push(s),o.keywords.push(...c.filter(d=>n.includes(d))))});const r=["severe","significant","major","extreme","crisis","emergency"],t=["concerned","worried","struggling","difficulty","problems"];r.some(s=>n.includes(s))?o.severity="severe":t.some(s=>n.includes(s))&&(o.severity="moderate");const a=e.split(/[.!?]+/);return o.specificAreas=a.filter(s=>s.trim().length>10),o}async processUploadedDocuments(e){if(!e||e.length===0)return{hasDocuments:!1,documentCount:0,summary:"No documents uploaded",extractedInfo:[]};console.log(`📄 Processing ${e.length} uploaded documents...`);const n={hasDocuments:!0,documentCount:e.length,documents:[],extractedInfo:[],keyFindings:[]};for(const o of e){const i={fileName:o.file_name,fileType:o.file_type,url:o.file_url,extractedText:"",analysis:{}};o.file_name.toLowerCase().includes("report")||o.file_name.toLowerCase().includes("evaluation")||o.file_name.toLowerCase().includes("assessment")?(i.importance="high",i.documentType="professional_report"):o.file_name.toLowerCase().includes("iep")||o.file_name.toLowerCase().includes("504")?(i.importance="high",i.documentType="educational_plan"):(i.importance="medium",i.documentType="supporting_document"),o.file_type==="application/pdf"?i.extractedText=await this.extractPDFText(o.file_url):o.file_type.includes("image")?i.extractedText=await this.extractImageText(o.file_url):o.file_type.includes("text")&&(i.extractedText=await this.fetchTextContent(o.file_url)),i.extractedText&&(i.analysis=this.analyzeDocumentContent(i.extractedText),n.keyFindings.push(...i.analysis.findings)),n.documents.push(i)}return n.summary=this.createDocumentsSummary(n.documents),n}analyzeDocumentContent(e){const n={findings:[],diagnoses:[],recommendations:[],scores:[],concerns:[]},o=e.toLowerCase();["autism","adhd","add","dyslexia","dyspraxia","anxiety","depression"].forEach(s=>{o.includes(s)&&(n.diagnoses.push(s),n.findings.push(`${s} mentioned in documents`))});const r=/(\d+)(th)?\s*(percentile|%ile|percent)/gi,t=e.match(r);if(t&&(n.scores.push(...t),n.findings.push(`Test scores found: ${t.join(", ")}`)),o.includes("recommend")){const s=o.indexOf("recommend"),c=e.substring(s,Math.min(s+200,e.length));n.recommendations.push(c),n.findings.push("Professional recommendations found in documents")}return["occupational therapy","speech therapy","physical therapy","aba","behavioral therapy"].forEach(s=>{o.includes(s)&&(n.recommendations.push(s),n.findings.push(`${s} mentioned in documents`))}),n}createDocumentsSummary(e){if(e.length===0)return"No documents to summarize";const n=[],o={};e.forEach(t=>{o[t.documentType]=(o[t.documentType]||0)+1}),n.push(`Reviewed ${e.length} document(s):`),Object.entries(o).forEach(([t,a])=>{n.push(`- ${a} ${t.replace("_"," ")}`)});const i=new Set;e.forEach(t=>{var a;(a=t.analysis)!=null&&a.diagnoses&&t.analysis.diagnoses.forEach(s=>i.add(s))}),i.size>0&&n.push(`
Diagnoses mentioned: ${Array.from(i).join(", ")}`);const r=new Set;return e.forEach(t=>{var a;(a=t.analysis)!=null&&a.recommendations&&t.analysis.recommendations.forEach(s=>{typeof s=="string"&&s.length<100&&r.add(s)})}),r.size>0&&n.push(`
Therapies/Interventions mentioned: ${Array.from(r).join(", ")}`),n.join(`
`)}async extractPDFText(e){return console.log("📑 PDF extraction needed for:",e),"[PDF content would be extracted here - implement with pdf.js or cloud service]"}async extractImageText(e){return console.log("🖼️ OCR needed for:",e),"[Image text would be extracted here - implement with OCR service]"}async fetchTextContent(e){try{return await(await fetch(e)).text()}catch(n){return console.error("Error fetching text content:",n),""}}generateEnhancedPrompt(e,n,o){var r;return`
You are an expert pediatric developmental specialist analyzing a comprehensive assessment. 
Please provide a detailed, personalized report considering ALL available information.

=== PARENT'S PRIMARY CONCERNS ===
${e.parentConcerns.mainConcerns||"No specific concerns mentioned"}

Concern Analysis:
- Categories: ${e.parentConcerns.concernsAnalysis.categories.join(", ")||"General"}
- Severity: ${e.parentConcerns.concernsAnalysis.severity}
- Keywords: ${e.parentConcerns.concernsAnalysis.keywords.join(", ")||"None"}

=== UPLOADED MEDICAL/EDUCATIONAL DOCUMENTS ===
${e.uploadedDocuments.summary}

Key Findings from Documents:
${e.uploadedDocuments.keyFindings.join(`
`)||"No documents uploaded"}

=== CHILD INFORMATION ===
- Name: ${e.childInfo.name}
- Age: ${e.childInfo.age} years
- Gender: ${e.childInfo.gender}
- Birth History: ${e.childInfo.birthHistory||"Not provided"}
- Known Diagnoses: ${((r=e.childInfo.diagnoses)==null?void 0:r.join(", "))||"None reported"}
- Current Medications: ${e.childInfo.medications||"None"}

=== ASSESSMENT RESULTS (Smart Scoring) ===
${JSON.stringify(n.categoryScores,null,2)}

Red Flags Identified:
${n.redFlags.map(t=>`- ${t.issue} (${t.category})`).join(`
`)||"None"}

=== PRIMITIVE REFLEX ANALYSIS ===
${o.reflexes.map(t=>`- ${t.name}: ${t.retentionLevel}% retention - ${t.impact}`).join(`
`)||"No significant retention"}

=== YOUR TASK ===
Please provide a comprehensive analysis that:

1. DIRECTLY ADDRESSES the parent's specific concerns mentioned above
2. INTEGRATES findings from uploaded documents (if any)
3. EXPLAINS how assessment results relate to parent's concerns
4. PROVIDES specific recommendations targeting the parent's worried areas
5. CONNECTS reflex retention to the specific symptoms parent described
6. OFFERS hope and actionable steps specifically for their concerns

Write in a warm, professional tone that shows you've carefully considered everything the parent shared.
Begin with: "Thank you for sharing your concerns about [specific concerns]. Based on [child's name]'s assessment and the documents you provided..."

Make sure to:
- Reference specific concerns the parent mentioned
- Acknowledge any diagnoses or previous evaluations from uploaded documents
- Explain findings in context of parent's worries
- Provide targeted recommendations for their specific situation
`}}export{m as EnhancedAIContext};
