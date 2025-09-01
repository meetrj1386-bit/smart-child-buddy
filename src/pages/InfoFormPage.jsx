import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const InfoFormPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const [formData, setFormData] = useState({
    parentName: "",
    email: "",
    phone: "",
    childFirstName: "",
    childLastName: "",
    age: "",
    gender: "",
    mainConcerns: "",
    file: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, file: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      parentName,
      email,
      phone,
      childFirstName,
      childLastName,
      age,
      gender,
      mainConcerns,
      file
    } = formData;

    const assessmentId = uuidv4();
    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase.from("assessments").insert([
        {
          id: assessmentId,
          parent_name: parentName,
          parent_email: email,
          parent_phone: phone,
          child_first_name: childFirstName,
          child_last_name: childLastName,
          child_age: parseInt(age),
          child_gender: gender,
          parent_concerns: mainConcerns,
          responses: {},
          narrative_json: {},
          status: "in_progress"
        }
      ]);

      if (insertError) {
        console.error("Insert error:", insertError);
        setIsSubmitting(false);
        return;
      }

      if (file) {
        const filePath = `${assessmentId}/${file.name}`;
        const { error: storageError } = await supabase.storage
          .from("assessment-files")
          .upload(filePath, file);

        if (!storageError) {
          const fileUrl = supabase.storage.from("assessment-files").getPublicUrl(filePath).data.publicUrl;
          const { error: fileInsertError } = await supabase.from("uploaded_files").insert([
            {
              assessment_id: assessmentId,
              file_name: file.name,
              file_url: fileUrl,
              file_type: file.type
            }
          ]);

          if (fileInsertError) {
            console.error("File insert error:", fileInsertError);
          }
        } else {
          console.error("Storage error:", storageError);
        }
      }

      navigate(`/assessment/${assessmentId}`);
    } catch (err) {
      console.error("Unexpected error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf8f5 0%, #f5f2ed 100%)' }}>
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
             style={{ background: 'radial-gradient(circle, rgba(107, 91, 149, 0.4), transparent)' }}></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl" 
             style={{ background: 'radial-gradient(circle, rgba(212, 165, 116, 0.4), transparent)' }}></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-20 bg-white/80 backdrop-blur-md shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
         <img 
  src="/Logo_Smart.png" // Or use {Logo} if import works
  alt="Smart Child Buddy Logo" 
  width="120" 
  height="120"
  style={{ objectFit: 'contain' }}
/>
          
            </div>
            
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: '#6b5b95' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 lg:px-8 py-12">
        {/* Header Section */}
     
     {/* Header Section */}


{/* Header Section - Remove duplicate logo, keep it simple */}
<div className="text-center mb-8">
  <h1 className="text-3xl lg:text-4xl mb-2 font-semibold" 
      style={{ 
        fontFamily: "'Playfair Display', Georgia, serif",
        color: '#2c2c2c' 
      }}>
    Tell Us About Your Child
  </h1>
  <p className="text-base" style={{ color: '#5a5a5a' }}>
    Complete this form to begin the personalized assessment journey
  </p>
</div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Section 1: Parent Information */}
          <div className="p-8" style={{ 
            background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Parent Information
              </h2>
            </div>
          </div>
          
          <div className="p-8" style={{ background: 'rgba(107, 91, 149, 0.03)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Parent's Name *
                </label>
                <input
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="Your full name"
                  onFocus={(e) => e.target.style.borderColor = '#6b5b95'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="your@email.com"
                  onFocus={(e) => e.target.style.borderColor = '#6b5b95'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="(555) 123-4567"
                  onFocus={(e) => e.target.style.borderColor = '#6b5b95'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Child Information */}
          <div className="p-8" style={{ 
            background: 'linear-gradient(135deg, #87a08e, #6b5b95)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl">👶</span>
              </div>
              <h2 className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Child Information
              </h2>
            </div>
          </div>
          
          <div className="p-8" style={{ background: 'rgba(135, 160, 142, 0.03)' }}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Child's First Name *
                </label>
                <input
                  type="text"
                  name="childFirstName"
                  value={formData.childFirstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="First name"
                  onFocus={(e) => e.target.style.borderColor = '#87a08e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Child's Last Name *
                </label>
                <input
                  type="text"
                  name="childLastName"
                  value={formData.childLastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="Last name"
                  onFocus={(e) => e.target.style.borderColor = '#87a08e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Age *
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  required
                  min="0"
                  max="18"
                  className="w-full px-4 py-3 rounded-lg transition-all"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none'
                  }}
                  placeholder="Child's age in years"
                  onFocus={(e) => e.target.style.borderColor = '#87a08e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg transition-all appearance-none"
                  style={{ 
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    outline: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#87a08e'}
                  onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Additional Information */}
          <div className="p-8" style={{ 
            background: 'linear-gradient(135deg, #d4a574, #87a08e)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-xl">💭</span>
              </div>
              <h2 className="text-2xl font-light" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Additional Information
              </h2>
            </div>
          </div>
          
          <div className="p-8" style={{ background: 'rgba(212, 165, 116, 0.03)' }}>
        <div className="mb-6">
  <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
    Main Concerns & Development Areas
  </label>
  <div className="mb-3 flex flex-wrap gap-2">
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(107, 91, 149, 0.1)', color: '#6b5b95' }}>
      Speech & Language
    </span>
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(135, 160, 142, 0.1)', color: '#87a08e' }}>
      Behavior & Social Skills
    </span>
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(212, 165, 116, 0.1)', color: '#d4a574' }}>
      Motor Skills
    </span>
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(107, 91, 149, 0.1)', color: '#6b5b95' }}>
      Sensory Processing
    </span>
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(135, 160, 142, 0.1)', color: '#87a08e' }}>
      Learning & Attention
    </span>
  </div>
  <textarea
    name="mainConcerns"
    value={formData.mainConcerns}
    onChange={handleChange}
    className="w-full px-4 py-3 rounded-lg transition-all resize-none"
    style={{ 
      border: '2px solid #e2e8f0',
      background: 'white',
      outline: 'none',
      minHeight: '120px'
    }}
    rows="4"
    placeholder="Please share your concerns about your child's development. Consider areas like:
- Speech delays or communication challenges
- Behavioral concerns or emotional regulation
- Physical coordination or motor skills
- Sensory sensitivities or processing issues
- Learning difficulties or attention challenges
- Social interaction or play skills"
    onFocus={(e) => e.target.style.borderColor = '#d4a574'}
    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
  />
  <p className="text-xs mt-2" style={{ color: '#8b8b8b' }}>
    The more specific you are, the better we can tailor our assessment to your child's unique needs
  </p>
</div>

<div>
  <label className="block text-sm font-medium mb-3" style={{ color: '#4a5568', letterSpacing: '0.025em' }}>
    Upload Assessment Reports (optional)
  </label>
  <p className="text-xs mb-3" style={{ color: '#718096' }}>
    Have previous evaluations? Upload any Speech, OT, PT, ABA, or psychological assessment reports to help us better understand your child's needs.
  </p>
  <div className="relative">
    <input
      type="file"
      accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
      onChange={handleFileChange}
      className="hidden"
      id="file-upload"
    />
    <label
      htmlFor="file-upload"
      className="block w-full p-8 rounded-lg text-center cursor-pointer transition-all group"
      style={{ 
        border: '2px dashed #d4a574',
        background: 'rgba(212, 165, 116, 0.02)'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.background = 'rgba(212, 165, 116, 0.08)';
        e.currentTarget.style.borderColor = '#6b5b95';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.background = 'rgba(212, 165, 116, 0.02)';
        e.currentTarget.style.borderColor = '#d4a574';
      }}
    >
      {formData.file ? (
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
               style={{ background: 'linear-gradient(135deg, #87a08e, #6b5b95)' }}>
            <span className="text-2xl">✓</span>
          </div>
          <p className="font-medium" style={{ color: '#4a5568' }}>
            {formData.file.name}
          </p>
          <p className="text-xs" style={{ color: '#8b8b8b' }}>
            Click to change file
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto transition-all"
               style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
            <span className="text-2xl">📎</span>
          </div>
          <p className="font-medium" style={{ color: '#4a5568' }}>
            Upload Previous Assessments
          </p>
          <p className="text-xs" style={{ color: '#8b8b8b' }}>
            Speech, OT, PT, ABA, Psychological Reports
          </p>
          <p className="text-xs" style={{ color: '#8b8b8b' }}>
            PDF, Word, or Image files (Max 10MB)
          </p>
        </div>
      )}
    </label>
  </div>
</div>
          </div>

          {/* Submit Section */}
          <div className="p-8" style={{ 
            background: 'linear-gradient(135deg, rgba(250, 248, 245, 0.8), rgba(245, 242, 237, 0.8))',
            borderTop: '1px solid rgba(212, 165, 116, 0.2)'
          }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 font-semibold rounded-full transition-all duration-200 transform ${
                isSubmitting
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              }`}
              style={{ 
                background: isSubmitting 
                  ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                  : 'linear-gradient(135deg, #6b5b95, #87a08e)',
                color: 'white',
                fontSize: '14px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Assessment...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Begin Smart Assessment
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Trust Badges */}
     

        {/* Footer */}
     
      </div>

      {/* Terms Modal - With luxury styling */}
      {showTerms && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <h2 className="text-3xl font-light mb-6" 
                style={{ 
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#2c2c2c' 
                }}>
              Terms & Conditions
            </h2>
            
            <div className="space-y-6 text-sm" style={{ color: '#5a5a5a' }}>
              <section>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#6b5b95' }}>Medical Disclaimer</h3>
                <p>
                  Smart Child Buddy provides an educational assessment tool designed to help parents understand potential developmental patterns. 
                  This assessment:
                </p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Is NOT a medical diagnostic tool</li>
                  <li>Is NOT FDA approved or evaluated</li>
                  <li>Does NOT replace professional medical evaluation</li>
                  <li>Cannot diagnose, treat, cure, or prevent any condition</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#6b5b95' }}>Consent and Understanding</h3>
                <p>By using this service, you acknowledge that:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>You are the parent or legal guardian of the child being assessed</li>
                  <li>You are 18 years of age or older</li>
                  <li>The information you provide is accurate to the best of your knowledge</li>
                  <li>Assessment results are educational suggestions, not medical prescriptions</li>
                  <li>You will consult appropriate healthcare professionals for medical concerns</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#6b5b95' }}>Data Privacy</h3>
                <p>Your information is:</p>
                <ul className="list-disc ml-6 mt-2 space-y-1">
                  <li>Encrypted and stored securely</li>
                  <li>Used solely for generating your assessment</li>
                  <li>Never sold to third parties</li>
                  <li>Deletable upon request to support@smartchildbuddy.com</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#6b5b95' }}>Limitation of Liability</h3>
                <p>
                  Smart Child Buddy, its creators, and affiliates are not liable for any direct, indirect, incidental, 
                  or consequential damages arising from the use of this assessment or implementation of any suggestions provided.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-lg mb-3" style={{ color: '#6b5b95' }}>Professional Consultation</h3>
                <p>
                  Always seek the advice of qualified healthcare providers, including but not limited to pediatricians, 
                  occupational therapists, speech therapists, or other specialists for proper diagnosis and treatment.
                </p>
              </section>
            </div>

            <button
              onClick={() => setShowTerms(false)}
              className="mt-8 w-full py-3 text-white font-semibold rounded-full hover:shadow-lg transition-all"
              style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-20px) rotate(120deg);
          }
          66% {
            transform: translateY(-10px) rotate(240deg);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          33% {
            transform: translateY(-10px) rotate(-120deg);
          }
          66% {
            transform: translateY(-20px) rotate(-240deg);
          }
        }
        
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 20s ease-in-out infinite;
          animation-delay: 5s;
        }
      `}</style>

      {/* Enhanced Footer Section */}
<footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200 mt-12">
  {/* Main Footer Content */}
  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      
      {/* Company Info */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <img 
           src="/Logo_Smart.png"
            alt="Smart Child Buddy" 
            width="50" 
            height="50"
            style={{ objectFit: 'contain' }}
          />
          <h3 className="text-lg font-semibold" style={{ color: '#6b5b95' }}>
            Smart Child Buddy
          </h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Empowering parents with knowledge about primitive reflexes and child development.
        </p>
        <p className="text-xs text-gray-500">
          © 2024 Smart Child Buddy.<br />
          All rights reserved.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">Learn More</h4>
        <ul className="space-y-2">
          <li>
            <button onClick={() => navigate('/')} className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Home
            </button>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              How It Works
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Success Stories
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Get Started
            </a>
          </li>
        </ul>
      </div>

      {/* Resources */}
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">Resources</h4>
        <ul className="space-y-2">
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              About Primitive Reflexes
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Research & Studies
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Find Professionals
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              FAQ
            </a>
          </li>
        </ul>
      </div>

      {/* Contact & Social */}
      <div>
        <h4 className="font-semibold mb-4 text-gray-800">Connect With Us</h4>
        
        {/* Social Media Icons */}
       
        <div className="flex gap-3 mb-4">
          {/* Facebook */}
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
            aria-label="Facebook"
          >
            <svg className="w-5 h-5 text-gray-600 hover:text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Twitter/X */}
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-sky-100 flex items-center justify-center transition-colors"
            aria-label="Twitter"
          >
            <svg className="w-5 h-5 text-gray-600 hover:text-sky-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>

          {/* Instagram */}
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-pink-100 flex items-center justify-center transition-colors"
            aria-label="Instagram"
          >
            <svg className="w-5 h-5 text-gray-600 hover:text-pink-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
            </svg>
          </a>

          {/* LinkedIn */}
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors"
            aria-label="LinkedIn"
          >
            <svg className="w-5 h-5 text-gray-600 hover:text-blue-700" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>

          {/* YouTube */}
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors"
            aria-label="YouTube"
          >
            <svg className="w-5 h-5 text-gray-600 hover:text-red-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>


        {/* Contact Info */}
        <div className="space-y-2 text-sm text-gray-600">
          <p>Email: support@smartchildbuddy.com</p>
          <p>Phone: 1-800-XXX-XXXX</p>
        </div>
      </div>
    </div>
  </div>

  {/* Bottom Bar */}
  <div className="bg-gray-50 border-t border-gray-200 py-4">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
        <div className="flex gap-4 mb-2 md:mb-0">
          <button 
            onClick={() => setShowTerms(true)}
            className="hover:text-gray-700 transition-colors"
          >
            Terms & Conditions
          </button>
          <button 
            onClick={() => setShowTerms(true)}
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </button>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Contact Us
          </a>
        </div>
        <p>Educational Tool • Not Medical Advice • Consult Professionals</p>
      </div>
    </div>
  </div>
</footer>
    
    </div>




  );
};

export default InfoFormPage;