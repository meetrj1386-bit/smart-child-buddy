// utils/enhancedAIContext.js
// Enhanced system that fully utilizes parent inputs and uploaded documents

export class EnhancedAIContext {
  constructor(apiKey) {
    this.apiKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  }

  // Main function to prepare comprehensive context
  async prepareComprehensiveContext(assessmentData, responses, questions, uploadedFiles) {
    console.log("📚 Preparing comprehensive AI context with all parent inputs...");
    
    const context = {
      // 1. PARENT CONCERNS (from text input)
      parentConcerns: {
        mainConcerns: assessmentData.main_concerns || '',
        hasSpecificConcerns: !!assessmentData.main_concerns,
        concernsAnalysis: this.analyzeParentConcerns(assessmentData.main_concerns)
      },
      
      // 2. CHILD INFORMATION
      childInfo: {
        name: assessmentData.child_first_name,
        age: assessmentData.child_age,
        gender: assessmentData.child_gender,
        birthHistory: assessmentData.child_birth_history,
        diagnoses: assessmentData.child_diagnoses,
        medications: assessmentData.child_medications
      },
      
      // 3. UPLOADED DOCUMENTS
      uploadedDocuments: await this.processUploadedDocuments(uploadedFiles),
      
      // 4. ASSESSMENT RESPONSES
      assessmentResponses: responses,
      
      // 5. QUESTIONS STRUCTURE
      questionsStructure: questions
    };
    
    return context;
  }

  // Analyze parent concerns text
  analyzeParentConcerns(concernsText) {
    if (!concernsText) return { categories: [], keywords: [], severity: 'none' };
    
    const concerns = concernsText.toLowerCase();
    const analysis = {
      categories: [],
      keywords: [],
      severity: 'mild',
      specificAreas: []
    };
    
    // Check for category-specific concerns
    const categoryKeywords = {
      speech: ['speech', 'talk', 'language', 'words', 'articulation', 'stutter', 'pronunciation'],
      motor: ['walk', 'run', 'balance', 'clumsy', 'coordination', 'falls', 'movement'],
      behavior: ['tantrum', 'aggressive', 'behavior', 'emotional', 'anxiety', 'attention', 'hyperactive'],
      social: ['friends', 'social', 'play', 'interaction', 'shy', 'withdrawn'],
      sensory: ['sensitive', 'texture', 'sound', 'light', 'touch', 'sensory'],
      academic: ['reading', 'writing', 'learning', 'school', 'homework', 'concentrate'],
      feeding: ['eating', 'food', 'picky', 'swallow', 'chew', 'weight']
    };
    
    // Identify concern categories
    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => concerns.includes(keyword))) {
        analysis.categories.push(category);
        analysis.keywords.push(...keywords.filter(k => concerns.includes(k)));
      }
    });
    
    // Determine severity
    const severeKeywords = ['severe', 'significant', 'major', 'extreme', 'crisis', 'emergency'];
    const moderateKeywords = ['concerned', 'worried', 'struggling', 'difficulty', 'problems'];
    
    if (severeKeywords.some(k => concerns.includes(k))) {
      analysis.severity = 'severe';
    } else if (moderateKeywords.some(k => concerns.includes(k))) {
      analysis.severity = 'moderate';
    }
    
    // Extract specific phrases
    const sentences = concernsText.split(/[.!?]+/);
    analysis.specificAreas = sentences.filter(s => s.trim().length > 10);
    
    return analysis;
  }

  // Process uploaded documents
  async processUploadedDocuments(uploadedFiles) {
    if (!uploadedFiles || uploadedFiles.length === 0) {
      return {
        hasDocuments: false,
        documentCount: 0,
        summary: 'No documents uploaded',
        extractedInfo: []
      };
    }
    
    console.log(`📄 Processing ${uploadedFiles.length} uploaded documents...`);
    
    const processedDocs = {
      hasDocuments: true,
      documentCount: uploadedFiles.length,
      documents: [],
      extractedInfo: [],
      keyFindings: []
    };
    
    for (const file of uploadedFiles) {
      const docInfo = {
        fileName: file.file_name,
        fileType: file.file_type,
        url: file.file_url,
        extractedText: '',
        analysis: {}
      };
      
      // Determine document type and importance
      if (file.file_name.toLowerCase().includes('report') || 
          file.file_name.toLowerCase().includes('evaluation') ||
          file.file_name.toLowerCase().includes('assessment')) {
        docInfo.importance = 'high';
        docInfo.documentType = 'professional_report';
      } else if (file.file_name.toLowerCase().includes('iep') || 
                 file.file_name.toLowerCase().includes('504')) {
        docInfo.importance = 'high';
        docInfo.documentType = 'educational_plan';
      } else {
        docInfo.importance = 'medium';
        docInfo.documentType = 'supporting_document';
      }
      
      // Extract text based on file type
      if (file.file_type === 'application/pdf') {
        // For production, you'd use a PDF extraction service
        docInfo.extractedText = await this.extractPDFText(file.file_url);
      } else if (file.file_type.includes('image')) {
        // For production, you'd use OCR
        docInfo.extractedText = await this.extractImageText(file.file_url);
      } else if (file.file_type.includes('text')) {
        // Text files can be read directly
        docInfo.extractedText = await this.fetchTextContent(file.file_url);
      }
      
      // Analyze extracted text for key information
      if (docInfo.extractedText) {
        docInfo.analysis = this.analyzeDocumentContent(docInfo.extractedText);
        processedDocs.keyFindings.push(...docInfo.analysis.findings);
      }
      
      processedDocs.documents.push(docInfo);
    }
    
    // Create summary of all documents
    processedDocs.summary = this.createDocumentsSummary(processedDocs.documents);
    
    return processedDocs;
  }

  // Analyze document content for key information
  analyzeDocumentContent(text) {
    const analysis = {
      findings: [],
      diagnoses: [],
      recommendations: [],
      scores: [],
      concerns: []
    };
    
    const textLower = text.toLowerCase();
    
    // Look for diagnoses
    const diagnosisKeywords = ['diagnosed', 'diagnosis', 'disorder', 'syndrome', 'condition'];
    const commonDiagnoses = ['autism', 'adhd', 'add', 'dyslexia', 'dyspraxia', 'anxiety', 'depression'];
    
    commonDiagnoses.forEach(diagnosis => {
      if (textLower.includes(diagnosis)) {
        analysis.diagnoses.push(diagnosis);
        analysis.findings.push(`${diagnosis} mentioned in documents`);
      }
    });
    
    // Look for scores/percentiles
    const scorePattern = /(\d+)(th)?\s*(percentile|%ile|percent)/gi;
    const matches = text.match(scorePattern);
    if (matches) {
      analysis.scores.push(...matches);
      analysis.findings.push(`Test scores found: ${matches.join(', ')}`);
    }
    
    // Look for recommendations
    if (textLower.includes('recommend')) {
      const recommendIndex = textLower.indexOf('recommend');
      const recommendText = text.substring(recommendIndex, Math.min(recommendIndex + 200, text.length));
      analysis.recommendations.push(recommendText);
      analysis.findings.push('Professional recommendations found in documents');
    }
    
    // Look for therapy mentions
    const therapies = ['occupational therapy', 'speech therapy', 'physical therapy', 'aba', 'behavioral therapy'];
    therapies.forEach(therapy => {
      if (textLower.includes(therapy)) {
        analysis.recommendations.push(therapy);
        analysis.findings.push(`${therapy} mentioned in documents`);
      }
    });
    
    return analysis;
  }

  // Create summary of all documents
  createDocumentsSummary(documents) {
    if (documents.length === 0) return 'No documents to summarize';
    
    const summary = [];
    
    // Count document types
    const docTypes = {};
    documents.forEach(doc => {
      docTypes[doc.documentType] = (docTypes[doc.documentType] || 0) + 1;
    });
    
    summary.push(`Reviewed ${documents.length} document(s):`);
    Object.entries(docTypes).forEach(([type, count]) => {
      summary.push(`- ${count} ${type.replace('_', ' ')}`);
    });
    
    // Collect all diagnoses
    const allDiagnoses = new Set();
    documents.forEach(doc => {
      if (doc.analysis?.diagnoses) {
        doc.analysis.diagnoses.forEach(d => allDiagnoses.add(d));
      }
    });
    
    if (allDiagnoses.size > 0) {
      summary.push(`\nDiagnoses mentioned: ${Array.from(allDiagnoses).join(', ')}`);
    }
    
    // Collect all recommendations
    const allRecommendations = new Set();
    documents.forEach(doc => {
      if (doc.analysis?.recommendations) {
        doc.analysis.recommendations.forEach(r => {
          if (typeof r === 'string' && r.length < 100) {
            allRecommendations.add(r);
          }
        });
      }
    });
    
    if (allRecommendations.size > 0) {
      summary.push(`\nTherapies/Interventions mentioned: ${Array.from(allRecommendations).join(', ')}`);
    }
    
    return summary.join('\n');
  }

  // Placeholder functions for document extraction (implement with actual services)
  async extractPDFText(url) {
    // In production, use a service like pdf.js or cloud service
    console.log('📑 PDF extraction needed for:', url);
    return '[PDF content would be extracted here - implement with pdf.js or cloud service]';
  }

  async extractImageText(url) {
    // In production, use OCR service like Tesseract or cloud OCR
    console.log('🖼️ OCR needed for:', url);
    return '[Image text would be extracted here - implement with OCR service]';
  }

  async fetchTextContent(url) {
    try {
      const response = await fetch(url);
      return await response.text();
    } catch (error) {
      console.error('Error fetching text content:', error);
      return '';
    }
  }

  // Generate enhanced AI prompt with all context
  generateEnhancedPrompt(context, smartAnalysis, reflexAnalysis) {
    const prompt = `
You are an expert pediatric developmental specialist analyzing a comprehensive assessment. 
Please provide a detailed, personalized report considering ALL available information.

=== PARENT'S PRIMARY CONCERNS ===
${context.parentConcerns.mainConcerns || 'No specific concerns mentioned'}

Concern Analysis:
- Categories: ${context.parentConcerns.concernsAnalysis.categories.join(', ') || 'General'}
- Severity: ${context.parentConcerns.concernsAnalysis.severity}
- Keywords: ${context.parentConcerns.concernsAnalysis.keywords.join(', ') || 'None'}

=== UPLOADED MEDICAL/EDUCATIONAL DOCUMENTS ===
${context.uploadedDocuments.summary}

Key Findings from Documents:
${context.uploadedDocuments.keyFindings.join('\n') || 'No documents uploaded'}

=== CHILD INFORMATION ===
- Name: ${context.childInfo.name}
- Age: ${context.childInfo.age} years
- Gender: ${context.childInfo.gender}
- Birth History: ${context.childInfo.birthHistory || 'Not provided'}
- Known Diagnoses: ${context.childInfo.diagnoses?.join(', ') || 'None reported'}
- Current Medications: ${context.childInfo.medications || 'None'}

=== ASSESSMENT RESULTS (Smart Scoring) ===
${JSON.stringify(smartAnalysis.categoryScores, null, 2)}

Red Flags Identified:
${smartAnalysis.redFlags.map(rf => `- ${rf.issue} (${rf.category})`).join('\n') || 'None'}

=== PRIMITIVE REFLEX ANALYSIS ===
${reflexAnalysis.reflexes.map(r => `- ${r.name}: ${r.retentionLevel}% retention - ${r.impact}`).join('\n') || 'No significant retention'}

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
`;

    return prompt;
  }
}

// Enhanced handleSubmit function update
export async function enhancedHandleSubmitWithContext(
  assessmentId,
  assessmentData,
  formData,
  smartQuestions,
  supabase,
  navigate,
  setLoading
) {
  console.log("🚀 Starting Enhanced AI Report Generation with Parent Inputs...");
  
  setLoading(true);
  
  try {
    // Step 1: Import necessary modules
    const { analyzeResponsesWithSmartScoring, mapResponsesToReflexesWithSmartScoring } = 
      await import('./smartScoringSystem');
    const { AIReportGenerator } = await import('./aiReportGenerator');
    const { EnhancedAIContext } = await import('./enhancedAIContext');
    
    // Step 2: Fetch uploaded files if any
    let uploadedFiles = [];
    if (assessmentData.child_first_name) {
      const { data: files } = await supabase
        .from('uploaded_files')
        .select('*')
        .eq('assessment_id', assessmentId);
      
      uploadedFiles = files || [];
      console.log(`📎 Found ${uploadedFiles.length} uploaded file(s)`);
    }
    
    // Step 3: Perform smart analysis
    console.log("🧠 Analyzing with smart scoring...");
    const smartAnalysis = analyzeResponsesWithSmartScoring(formData, smartQuestions);
    const reflexAnalysis = mapResponsesToReflexesWithSmartScoring(formData, smartQuestions);
    
    // Step 4: Prepare enhanced context
    console.log("📚 Preparing comprehensive context with parent inputs...");
    const contextGenerator = new EnhancedAIContext();
    const enhancedContext = await contextGenerator.prepareComprehensiveContext(
      assessmentData,
      formData,
      smartQuestions,
      uploadedFiles
    );
    
    // Log what we're using
    console.log("📝 Parent Concerns:", enhancedContext.parentConcerns.mainConcerns || 'None');
    console.log("📄 Documents:", enhancedContext.uploadedDocuments.documentCount);
    console.log("🔍 Concern Categories:", enhancedContext.parentConcerns.concernsAnalysis.categories);
    
    // Step 5: Generate AI report with enhanced context
    console.log("🤖 Generating AI report with full context...");
    const aiGenerator = new AIReportGenerator();
    
    // Override the context preparation to use enhanced context
    aiGenerator.prepareAIContext = () => enhancedContext;
    
    // Generate enhanced prompt
    const enhancedPrompt = contextGenerator.generateEnhancedPrompt(
      enhancedContext,
      smartAnalysis,
      reflexAnalysis
    );
    
    // Generate report with enhanced context
    const comprehensiveReport = await aiGenerator.generateComprehensiveReport(
      assessmentData,
      formData,
      smartQuestions,
      uploadedFiles
    );
    
    // Add parent context summary to report
    comprehensiveReport.parentContext = {
      concerns: enhancedContext.parentConcerns,
      documentsProvided: enhancedContext.uploadedDocuments.summary,
      keyFindingsFromDocs: enhancedContext.uploadedDocuments.keyFindings
    };
    
    console.log("✅ Enhanced report generated with parent inputs!");
    
    // Save and navigate (rest of the code remains the same)
    // ... [continue with database save and navigation]
    
    return comprehensiveReport;
    
  } catch (error) {
    console.error("Error in enhanced report generation:", error);
    throw error;
  }
}