import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';

// --- NEW: How It Works (3-step) ---

const HowItWorks = ({ onStart }) => (

  <section id="how-it-works" className="py-14 px-6 lg:px-12">
    <div className="max-w-7xl mx-auto">
      <h2 className="text-3xl lg:text-4xl font-light text-center mb-3"
          style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#2c2c2c' }}>
        How Smart Child Buddy Works
      </h2>
      <p className="text-center text-base mb-10" style={{ color: '#5a5a5a' }}>
        A simple 3-step journey to uncover your child’s hidden potential.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1 */}
        <div className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
             style={{ background: 'linear-gradient(135deg, rgba(107,91,149,0.06), rgba(135,160,142,0.06))' }}>
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Tell Us About Your Child</h3>
          <p className="text-sm" style={{ color: '#5a5a5a' }}>
            2-minute form with age, concerns, and basics. No login needed.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
             style={{ background: 'linear-gradient(135deg, rgba(212,165,116,0.06), rgba(107,91,149,0.06))' }}>
          <div className="text-4xl mb-3">🧠</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#d4a574' }}>Smart AI-Powered Assessment</h3>
          <p className="text-sm" style={{ color: '#5a5a5a' }}>
            Personalized questions based on age & concerns. Takes ~15 minutes.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
             style={{ background: 'linear-gradient(135deg, rgba(135,160,142,0.06), rgba(212,165,116,0.06))' }}>
          <div className="text-4xl mb-3">📄</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: '#87a08e' }}>Get Your Reflex Report</h3>
          <p className="text-sm" style={{ color: '#5a5a5a' }}>
            Clear insights, reflex mapping, and a step-by-step roadmap you can start today.
          </p>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={onStart}
          className="px-8 py-3 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
        >
          Start My Assessment
        </button>
      </div>
    </div>
  </section> 
);

// --- NEW: Trust & Social Proof strip ---
const TrustStrip = () => (
  <section className="py-10 px-6 lg:px-12 bg-white/80 backdrop-blur-sm">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '👨‍👩‍👧‍👦', big: '1,000+', small: 'Families Helped' },
          { icon: '🧩', big: '8', small: 'Reflex Patterns' },
          { icon: '⏱️', big: '15 min', small: 'Avg. Time' },
          { icon: '⭐', big: '4.9/5', small: 'Parent Ratings' },
        ].map((s, i) => (
          <div key={i} className="text-center rounded-2xl p-6 shadow-md"
               style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(254,245,240,0.6))' }}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-semibold"
                 style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {s.big}
            </div>
            <div className="text-xs uppercase tracking-wider" style={{ color: '#718096' }}>{s.small}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// --- NEW: Pricing clarity banner ---
const PricingBanner = ({ onStart }) => (
  <section className="py-8 px-6 lg:px-12">
    <div className="max-w-5xl mx-auto rounded-2xl p-6 text-center shadow-lg"
         style={{ background: 'linear-gradient(135deg, rgba(107,91,149,0.08), rgba(212,165,116,0.08))' }}>
      <p className="text-base mb-4" style={{ color: '#5a5a5a' }}>
        <span className="font-semibold" style={{ color: '#6b5b95' }}>Simple pricing:</span> just <span className="font-semibold">$10–$15</span> per assessment — no subscriptions, no hidden fees.
      </p>
      <button
        onClick={onStart}
        className="px-6 py-2.5 text-sm font-medium text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
        style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
      >
        Start for $10–$15
      </button>
    </div>
  </section>
);


export default function IntroPage() {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const testimonials = [
    { text: "Finally understood the connection between primitive reflexes and my child's challenges!", author: "Sarah M., Mom of 5-year-old" },
    { text: "This helped me have better conversations with our OT about what to focus on.", author: "Michael D., Dad of 6-year-old" },
    { text: "Great educational tool - helped me understand what our therapist was working on.", author: "Jennifer K., Mom of 7-year-old" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const runTests = async () => {
    console.log('Running tests...');
    // Test functionality preserved
  };

  useEffect(() => {
  const HEADER_OFFSET = 88; // sticky header height (adjust if needed)

  function scrollToHash(hash, replace = false) {
    if (!hash) return;
    const id = hash.replace('#', '');
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
    window.scrollTo({ top: y, behavior: 'smooth' });
    if (replace) window.history.replaceState(null, '', `#${id}`);
  }

  // 1) On initial load with an existing hash
  if (window.location.hash) {
    // slight delay so layout is ready
    setTimeout(() => scrollToHash(window.location.hash, true), 0);
  }

  // 2) Intercept clicks on in-page anchors anywhere on the page
  function onClick(e) {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    // allow only known anchors to be offset-scrolled
    if (!href || href === '#') return;
    e.preventDefault();
    scrollToHash(href, true);
  }

  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}, []);


  return (

  <>
<meta name="viewport" content="width=device-width, initial-scale=1" />

  <Helmet prioritizeSeoTags>
    <link rel="icon" href="/favicon.ico" />
<meta name="theme-color" content="#6b5b95" />

    <title>Smart Child Buddy — Parent-friendly learning about autism, ADHD, speech delay & behavior</title>
    <meta
      name="description"
      content="Smart Child Buddy helps parents understand connections between early development and common concerns like autism, ADHD, speech delay, nonverbal communication, sensory issues, behavior and learning—through a short educational assessment and a clear report."
    />
    <meta
      name="keywords"
      content="autism, ADHD, speech delay, nonverbal, behavior, sensory processing, occupational therapy, physical therapy, speech therapy, parent education, developmental milestones, learning challenges, handwriting, attention, anxiety, balance, coordination, primitive reflexes, parent guide"
    />
    <link rel="canonical" href="https://smartchildbuddy.com/" />

    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Smart Child Buddy" />
    <meta property="og:url" content="https://smartchildbuddy.com/" />
    <meta property="og:title" content="Smart Child Buddy — Understand autism, ADHD, speech & behavior with parent-friendly insights" />
    <meta property="og:description" content="A short, guided, educational assessment for parents—get a clear, friendly report about patterns related to attention, speech, movement, learning and more." />
    <meta property="og:image" content="https://smartchildbuddy.com/og-cover.jpg" />
    <meta property="og:image:alt" content="Smart Child Buddy—parent and child learning together" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Smart Child Buddy — Parent-friendly insights for autism, ADHD, speech & behavior" />
    <meta name="twitter:description" content="Understand common concerns like attention, speech delay, nonverbal communication, sensory and behavior with a short educational assessment." />
    <meta name="twitter:image" content="https://smartchildbuddy.com/og-cover.jpg" />

    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="googlebot" content="index,follow" />
    <meta name="bingbot" content="index,follow" />

    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Smart Child Buddy",
        "url": "https://smartchildbuddy.com/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://smartchildbuddy.com/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })}
    </script>

    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": "Smart Child Buddy Educational Assessment",
        "brand": "Smart Child Buddy",
        "description":
          "A short, parent-friendly educational assessment with a clear report about attention, speech, behavior, sensory and learning.",
        "image": ["https://smartchildbuddy.com/og-cover.jpg"],
        "url": "https://smartchildbuddy.com/",
        "offers": {
          "@type": "Offer",
          "price": "15.00",
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock",
          "url": "https://smartchildbuddy.com/info-form"
        }
      })}
    </script>

    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is Smart Child Buddy a medical or diagnostic tool?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Smart Child Buddy is an educational tool to help parents understand development. It does not diagnose or replace professional evaluation."
            }
          },
          {
            "@type": "Question",
            "name": "What areas can this help me learn about?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Parents commonly explore attention (ADHD), communication (speech delay or nonverbal), social development (autism), sensory processing, behavior, balance, coordination and handwriting challenges."
            }
          },
          {
            "@type": "Question",
            "name": "How long does the educational assessment take?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Most parents finish in about 10–15 minutes and receive a friendly report right away."
            }
          },
          {
            "@type": "Question",
            "name": "How much does it cost?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The assessment is a simple one-time payment (typically $10–$15). There are no subscriptions."
            }
          }
        ]
      })}
    </script>
  </Helmet>




    



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
            {/* Logo Section */}
        
        {/* Logo Section */}
<div className="flex items-center gap-3">
<img 
  src="/Logo_Smart.png"
  alt="Smart Child Buddy Logo" 
  width="150" 
  height="120"
  style={{ objectFit: 'contain' }}
/>


</div>
            
            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#problems" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Common Patterns</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors">Success Stories</a>
              <button
                onClick={() => navigate('/info-form')}
                className="px-6 py-2.5 text-sm font-medium text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
              >
                Start Learning
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-16 pb-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" 
                   style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                <span style={{ color: '#d4a574' }}>💝</span>
                <span className="text-sm font-medium" style={{ color: '#6b5b95' }}>
                  For Parents Who Feel Something's Missing
                </span>
              </div>
              
           <h1 className="text-5xl lg:text-6xl font-light leading-tight mb-6" 
    style={{ 
      fontFamily: "'Playfair Display', Georgia, serif",
      color: '#2c2c2c'
    }}>
  Is Your Child{' '}
  <span style={{ 
    display: 'inline',  // Changed from 'block' to 'inline'
    background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  }}>
    Struggling?
  </span>
</h1>
              
              <div className="space-y-4 mb-8">
                <p className="text-xl leading-relaxed" style={{ color: '#5a5a5a' }}>
                  <strong style={{ color: '#6b5b95' }}>If your child has autism, ADHD, or developmental delays...</strong> 
                </p>
                <p className="text-lg" style={{ color: '#718096' }}>
                  There might be a missing piece that no one has explained to you
                </p>
                <p className="text-base" style={{ color: '#8b8b8b' }}>
                  Hidden patterns in your child's nervous system could be the key to understanding their challenges
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/info-form')}
                  className="group px-8 py-4 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
                >
                  <span className="font-semibold uppercase tracking-wider text-sm">Discover What's Missing</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
              
              <div className="flex gap-6 text-sm" style={{ color: '#718096' }}>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="#87a08e" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Finally Get Answers
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="#87a08e" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hope for Progress
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="#87a08e" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  You're Not Alone
                </span>
              </div>
            </div>
            
            {/* Right Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "8", label: "Reflex Patterns", icon: "🧠" },
                { number: "15min", label: "Learning Time", icon: "⏰" },
                { number: "OT/PT/ST", label: "Professional Types", icon: "👩‍⚕️" },
                { number: "1000+", label: "Families Educated", icon: "👨‍👩‍👧‍👦" }
              ].map((stat, idx) => (
                <div key={idx} className="text-center rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" 
                     style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 245, 240, 0.6))' }}>
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-light mb-2" 
                       style={{ 
                         fontFamily: "'Playfair Display', Georgia, serif",
                         background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
                         WebkitBackgroundClip: 'text',
                         WebkitTextFillColor: 'transparent'
                       }}>
                    {stat.number}
                  </div>
                  <div className="text-xs uppercase tracking-wider" style={{ color: '#718096' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

<div id="how" style={{ position: "relative", top: "-96px" }} aria-hidden="true"></div>

{/* ↓↓↓ Add these right after the Hero section closing tag */}
<HowItWorks onStart={() => navigate('/info-form')} />
<TrustStrip />
<PricingBanner onStart={() => navigate('/info-form')} />



      {/* Emotional Connection Section - NEW */}
      <section className="py-16 px-6 lg:px-12 bg-white/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-light mb-6" 
                style={{ 
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: '#2c2c2c' 
                }}>
              You're Not Imagining It
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: '#5a5a5a' }}>
              That feeling that something's been overlooked... that there's a piece of the puzzle missing... 
              that your child is capable of so much more. You're right.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* For Autism Parents */}
            <div className="text-center p-6 rounded-2xl" 
                 style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.05), rgba(107, 91, 149, 0.1))' }}>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                   style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                💙
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#6b5b95' }}>
                If Your Child Has Autism
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                Beyond the diagnosis, there may be underlying patterns affecting sensory processing, 
                self-regulation, and daily functioning that reflexes can help explain.
              </p>
            </div>

            {/* For ADHD/Behavioral Parents */}
            <div className="text-center p-6 rounded-2xl" 
                 style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.05), rgba(212, 165, 116, 0.1))' }}>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                   style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
                ⚡
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#d4a574' }}>
                If Your Child Has ADHD
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                The hyperactivity, fidgeting, and attention challenges might not just be "behavioral" - 
                there could be nervous system patterns that make sitting still nearly impossible.
              </p>
            </div>

            {/* For Developmental Delay Parents */}
            <div className="text-center p-6 rounded-2xl" 
                 style={{ background: 'linear-gradient(135deg, rgba(135, 160, 142, 0.05), rgba(135, 160, 142, 0.1))' }}>
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-4"
                   style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                🌱
              </div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#87a08e' }}>
                If Your Child is "Behind"
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: '#5a5a5a' }}>
                Delays in speech, motor skills, or learning might have a common root cause that, 
                when addressed, can unlock rapid progress across multiple areas.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="inline-block p-6 rounded-2xl" 
                 style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.08), rgba(135, 160, 142, 0.08))' }}>
              <h3 className="text-2xl font-semibold mb-3" style={{ color: '#6b5b95' }}>
                What if the answer isn't more therapy...
              </h3>
              <p className="text-lg mb-4" style={{ color: '#5a5a5a' }}>
                What if it's understanding the <strong>foundation</strong> that needs to be addressed first?
              </p>
              <button
                onClick={() => navigate('/info-form')}
                className="px-8 py-3 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
              >
                Find Your Child's Foundation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Notice Section */}
      <section className="py-12 px-6 lg:px-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl shadow-xl overflow-hidden bg-white border-l-4" style={{ borderLeftColor: '#6b5b95' }}>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center" style={{ color: '#6b5b95' }}>
                <span className="text-3xl mr-3">📚</span>
                Important: This is an Educational Tool
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3" style={{ color: '#87a08e' }}>What This Tool Does:</h3>
                  <ul className="space-y-2 text-sm" style={{ color: '#5a5a5a' }}>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#87a08e' }}>✓</span>
                      <span>Explores potential connections between primitive reflexes and development</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#87a08e' }}>✓</span>
                      <span>Provides information to discuss with qualified professionals</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#87a08e' }}>✓</span>
                      <span>Helps you understand what OTs, PTs, and STs may be working on</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span style={{ color: '#87a08e' }}>✓</span>
                      <span>Offers research-based educational content</span>
                    </li>
                  </ul>
                </div>
           <div>
  <h3 className="font-semibold mb-3" style={{ color: '#d4a574' }}>Worth Every Penny Because:</h3>
  <ul className="space-y-2 text-sm" style={{ color: '#5a5a5a' }}>
    <li className="flex items-start gap-2">
      <span style={{ color: '#87a08e' }}>✓</span>
      <span>One insight could unlock your child's potential</span>
    </li>
    <li className="flex items-start gap-2">
      <span style={{ color: '#87a08e' }}>✓</span>
      <span>Understanding = better advocacy for your child</span>
    </li>
    <li className="flex items-start gap-2">
      <span style={{ color: '#87a08e' }}>✓</span>
      <span>Costs less than a pizza dinner, benefits last a lifetime</span>
    </li>
    <li className="flex items-start gap-2">
      <span style={{ color: '#87a08e' }}>✓</span>
      <span>Join thousands who say "I wish I knew this sooner!"</span>
    </li>
  </ul>
</div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                <p className="text-sm" style={{ color: '#6b5b95' }}>
                  <strong>Always consult with licensed professionals:</strong> Pediatricians, Occupational Therapists, Physical Therapists, 
                  Speech-Language Pathologists, Reflex Integration Specialists, and other qualified healthcare providers for proper evaluation and treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Key Benefits Section */}
      <section className="py-16 px-6 lg:px-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-12" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2c2c2c' 
              }}>
            Why Parents Find This Helpful
          </h2>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" 
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 245, 240, 0.6))',
                   border: '1px solid rgba(212, 165, 116, 0.2)' 
                 }}>
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#6b5b95' }}>Learn About Connections</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>
                Understand how early reflex patterns may relate to behaviors and challenges you observe
              </p>
            </div>

            <div className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" 
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 245, 240, 0.6))',
                   border: '1px solid rgba(212, 165, 116, 0.2)' 
                 }}>
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#6b5b95' }}>Better Conversations</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>
                Have more informed discussions with therapists and healthcare providers
              </p>
            </div>

            <div className="rounded-xl p-8 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1" 
                 style={{ 
                   background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(254, 245, 240, 0.6))',
                   border: '1px solid rgba(212, 165, 116, 0.2)' 
                 }}>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#6b5b95' }}>Focus Your Support</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#718096' }}>
                Understand what professionals might focus on and why certain activities help
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-World Examples Section - EXPANDED */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-4" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2c2c2c' 
              }}>
            See How Reflex Connections Work in Daily Life
          </h2>
          <p className="text-center mb-12 text-lg" style={{ color: '#718096' }}>
            Understanding these patterns helps you know what to discuss with professionals
          </p>
          
          {/* Scrollable Examples Container */}
          <div className="relative">
            <div className="overflow-x-auto pb-6">
              <div className="flex gap-6 w-max">
                
                {/* Moro Reflex */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1), rgba(107, 91, 149, 0.2))' }}>
                      😰
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Moro Reflex</h3>
                    <p className="text-sm text-gray-500">The Anxious, Easily Startled Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Meltdowns over small changes, jumps at sounds, constantly on edge, difficulty sleeping"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained Moro (startle) reflex keeps nervous system in constant "alert mode"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Could we explore Moro reflex integration alongside anxiety support strategies?"</p>
                    </div>
                  </div>
                </div>

                {/* ATNR */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.2))' }}>
                      ✏️
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>ATNR</h3>
                    <p className="text-sm text-gray-500">The Struggling Writer/Reader</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Messy handwriting, homework battles, difficulty reading across page, mixing up b/d"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained ATNR makes crossing body midline and bilateral coordination difficult</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Should we assess ATNR patterns alongside fine motor and visual-motor skills?"</p>
                    </div>
                  </div>
                </div>

                {/* Spinal Galant */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(135, 160, 142, 0.1), rgba(135, 160, 142, 0.2))' }}>
                      🪑
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Spinal Galant</h3>
                    <p className="text-sm text-gray-500">The Fidgety, Can't-Sit-Still Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Can't sit still, constantly moving, bedwetting past age 5, hates tight waistbands"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained Spinal Galant causes hypersensitivity and constant movement urges</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Could we explore Spinal Galant integration alongside ADHD evaluation?"</p>
                    </div>
                  </div>
                </div>

                {/* STNR */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1), rgba(107, 91, 149, 0.2))' }}>
                      📚
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>STNR</h3>
                    <p className="text-sm text-gray-500">The Poor-Posture, Desk-Avoiding Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"W-sitting, slouching at desk, head on table when writing, difficulty copying from board"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained STNR makes it difficult to maintain good posture during desk work</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Should we assess STNR alongside core strength and postural control?"</p>
                    </div>
                  </div>
                </div>

                {/* TLR */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.2))' }}>
                      🤸
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>TLR</h3>
                    <p className="text-sm text-gray-500">The Clumsy, Balance-Challenged Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Poor balance, motion sickness, difficulty with stairs, appears lazy or low energy"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained TLR affects balance, spatial awareness, and muscle tone regulation</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Could we explore TLR integration alongside vestibular and balance training?"</p>
                    </div>
                  </div>
                </div>

                {/* Palmar Grasp */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(135, 160, 142, 0.1), rgba(135, 160, 142, 0.2))' }}>
                      ✋
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Palmar Grasp</h3>
                    <p className="text-sm text-gray-500">The Poor-Grip, Hand-Fatigue Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Poor pencil grip, hand fatigue when writing, difficulty with buttons/zippers, sticky fingers"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained Palmar Grasp prevents proper hand relaxation and fine motor control</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Should we explore Palmar integration alongside fine motor and handwriting support?"</p>
                    </div>
                  </div>
                </div>

                {/* Rooting */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.1), rgba(107, 91, 149, 0.2))' }}>
                      👄
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Rooting</h3>
                    <p className="text-sm text-gray-500">The Picky Eater, Speech-Delayed Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Very picky eating, speech delays, drooling past age 2, thumb sucking, oral sensitivities"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained Rooting reflex affects oral motor control and feeding patterns</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Should we explore Rooting integration alongside speech and feeding therapy?"</p>
                    </div>
                  </div>
                </div>

                {/* Babinski */}
                <div className="bg-white rounded-2xl p-6 shadow-lg min-w-[340px]">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl mb-4"
                         style={{ background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.1), rgba(212, 165, 116, 0.2))' }}>
                      🦶
                    </div>
                    <h3 className="text-xl font-semibold mb-2" style={{ color: '#6b5b95' }}>Babinski</h3>
                    <p className="text-sm text-gray-500">The Toe-Walking, Tripping Child</p>
                  </div>
                  
                  <div className="space-y-4 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                      <p className="font-medium text-red-700 mb-2">What Parent Sees:</p>
                      <p className="text-gray-600">"Toe walking, frequent tripping, awkward running, difficulty with stairs, foot sensitivity"</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#6b5b95' }}>Possible Connection:</p>
                      <p className="text-gray-600">Retained Babinski affects proper foot placement and walking patterns</p>
                    </div>
                    
                    <div className="flex items-center justify-center py-2">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                    
                    <div className="p-3 rounded-lg" style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                      <p className="font-medium mb-2" style={{ color: '#87a08e' }}>Professional Discussion:</p>
                      <p className="text-gray-600">"Could we explore Babinski integration alongside gait and foot development?"</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            
            {/* Scroll indicators */}
            <div className="flex justify-center mt-6">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                </svg>
                Scroll to explore all 8 primitive reflexes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </p>
            </div>
          </div>

          {/* Value Proposition Box */}
          <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 mt-12" style={{ borderLeftColor: '#87a08e' }}>
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-4" style={{ color: '#6b5b95' }}>
                Why This Understanding Is Valuable
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                       style={{ background: 'rgba(107, 91, 149, 0.1)' }}>
                    💡
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: '#6b5b95' }}>Informed Conversations</h4>
                  <p className="text-sm" style={{ color: '#718096' }}>
                    Arrive at appointments with specific questions and observations to discuss
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                       style={{ background: 'rgba(135, 160, 142, 0.1)' }}>
                    🎯
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: '#6b5b95' }}>Targeted Support</h4>
                  <p className="text-sm" style={{ color: '#718096' }}>
                    Understand why certain activities and approaches might help your child
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-2xl mb-3"
                       style={{ background: 'rgba(212, 165, 116, 0.1)' }}>
                    🤝
                  </div>
                  <h4 className="font-semibold mb-2" style={{ color: '#6b5b95' }}>Better Partnerships</h4>
                  <p className="text-sm" style={{ color: '#718096' }}>
                    Work more effectively with therapists when you understand the "why" behind interventions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-light text-center mb-12" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2c2c2c' 
              }}>
            Understanding the Reflex-Development Connection
          </h2>
          
          <div className="rounded-2xl shadow-xl overflow-hidden bg-white">
            <div className="grid lg:grid-cols-2">
              {/* Information Column */}
              <div className="p-8" style={{ borderRight: '1px solid rgba(212, 165, 116, 0.2)' }}>
                <h3 className="font-semibold text-xl mb-6" style={{ color: '#4a5568' }}>
                  Research Suggests Connections
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl" style={{ color: '#87a08e' }}>🧠</span>
                    <div>
                      <span className="font-medium" style={{ color: '#6b5b95' }}>Moro Reflex: </span>
                      <span className="text-sm" style={{ color: '#4a5568' }}>
                        May relate to anxiety, startle responses, and emotional regulation challenges
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-xl" style={{ color: '#87a08e' }}>✍️</span>
                    <div>
                      <span className="font-medium" style={{ color: '#6b5b95' }}>ATNR: </span>
                      <span className="text-sm" style={{ color: '#4a5568' }}>
                        May connect to handwriting difficulties and crossing body midline
                      </span>
                    </div>
                  </div>
                  
                  <div className="my-4 border-t" style={{ borderColor: 'rgba(212, 165, 116, 0.2)' }}></div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-xl" style={{ color: '#87a08e' }}>🎯</span>
                    <div>
                      <span className="font-medium" style={{ color: '#6b5b95' }}>Professional Insight: </span>
                      <span className="text-sm" style={{ color: '#4a5568' }}>
                        Occupational and Physical Therapists often work on these patterns
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Connection */}
              <div className="p-8" style={{ background: 'linear-gradient(135deg, rgba(107, 91, 149, 0.05), rgba(212, 165, 116, 0.05))' }}>
                <h3 className="font-semibold text-xl mb-6" style={{ color: '#4a5568' }}>Professional Partners</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-light" style={{ color: '#6b5b95' }}>OT</div>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#718096' }}>
                      Occupational Therapy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-light" style={{ color: '#6b5b95' }}>PT</div>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#718096' }}>
                      Physical Therapy
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-light" style={{ color: '#6b5b95' }}>SLP</div>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#718096' }}>
                      Speech-Language Pathology
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-light" style={{ color: '#6b5b95' }}>RIS</div>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: '#718096' }}>
                      Reflex Integration Specialist
                    </p>
                  </div>
                </div>
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2">
                    <span className="text-2xl" style={{ color: '#d4a574' }}>🤝</span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: '#718096' }}>
                    Designed to complement professional care
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 px-6 lg:px-12" style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="mb-6">
            <span className="text-5xl opacity-50">❝</span>
          </div>
          <p className="text-2xl font-light italic mb-6" style={{ lineHeight: '1.6' }}>
            {testimonials[currentTestimonial].text}
          </p>
          <p className="font-medium">
            — {testimonials[currentTestimonial].author}
          </p>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentTestimonial === idx ? 'bg-white w-8' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Common Patterns Section */}
      <section id="problems" className="py-16 px-6 lg:px-12 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-light text-center mb-4" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2c2c2c' 
              }}>
            Common Developmental Patterns to Explore
          </h2>
          <p className="text-center mb-10" style={{ color: '#718096' }}>
            Research suggests these may relate to primitive reflex patterns
          </p>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: "😰", title: "Emotional Regulation", desc: "Anxiety, big reactions" },
              { emoji: "✏️", title: "School Challenges", desc: "Handwriting, sitting still" },
              { emoji: "🤸", title: "Movement", desc: "Balance, coordination" },
              { emoji: "😴", title: "Sleep Issues", desc: "Restless, frequent waking" },
              { emoji: "🗣️", title: "Communication", desc: "Speech, language development" },
              { emoji: "🎯", title: "Attention", desc: "Focus, concentration" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-lg p-5 shadow-md hover:shadow-xl transition-all transform hover:-translate-y-1 bg-white">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{item.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-base" style={{ color: '#4a5568' }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: '#718096' }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-light mb-6" 
              style={{ 
                fontFamily: "'Playfair Display', Georgia, serif",
                color: '#2c2c2c' 
              }}>
            Ready to Learn More?
          </h2>
          <p className="text-xl mb-8" style={{ color: '#718096' }}>
            Start exploring how primitive reflexes may relate to your child's development
          </p>
          
          <button
            onClick={() => navigate('/info-form')}
            className="group px-10 py-4 text-white rounded-full shadow-xl hover:shadow-2xl transform hover:scale-[1.02] transition-all inline-flex items-center gap-3"
            style={{ 
              background: 'linear-gradient(135deg, #6b5b95, #87a08e)',
              fontSize: '14px',
              fontWeight: '600',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            <span>Begin Learning Journey</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          
          <p className="mt-6 text-sm" style={{ color: '#8b8b8b' }}>
            Educational purpose only • Always consult professionals • Evidence-informed content
          </p>
        </div>
      </section>

      <section id="faq" className="py-12 px-6 lg:px-12 bg-white/70">
  <div className="max-w-5xl mx-auto">
    <h2 className="text-3xl font-light mb-6">Parent FAQs</h2>

    <details className="rounded-lg p-4 mb-3 bg-white shadow">
      <summary className="font-medium">Is this a diagnostic test?</summary>
      <p className="mt-2 text-sm text-gray-600">
        No—this is an educational tool for parents. It does not diagnose or replace professional evaluation.
      </p>
    </details>

    <details className="rounded-lg p-4 mb-3 bg-white shadow">
      <summary className="font-medium">What topics can I learn about?</summary>
      <p className="mt-2 text-sm text-gray-600">
        Families often explore autism, ADHD, speech delay or nonverbal communication, sensory processing, behavior,
        handwriting, balance and coordination.
      </p>
    </details>

    <details className="rounded-lg p-4 mb-3 bg-white shadow">
      <summary className="font-medium">How long does it take?</summary>
      <p className="mt-2 text-sm text-gray-600">About 10–15 minutes for most parents.</p>
    </details>

    <details className="rounded-lg p-4 mb-3 bg-white shadow">
      <summary className="font-medium">What does it cost?</summary>
      <p className="mt-2 text-sm text-gray-600">A simple one-time payment (typically $10–$15). No subscriptions.</p>
    </details>
  </div>
</section>


      {/* Footer */}
    

      {/* Enhanced Legal Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4" style={{ color: '#4a5568' }}>
              Terms of Service, Privacy Policy & Legal Disclaimers
            </h2>
            
            <div className="space-y-6 text-sm" style={{ color: '#4a5568' }}>
              
              {/* Critical Educational Disclaimer */}
              <section className="border-l-4 pl-4" style={{ borderLeftColor: '#d97070' }}>
                <h3 className="font-bold text-lg mb-2" style={{ color: '#d97070' }}>IMPORTANT: Educational Content Only</h3>
                <div className="bg-red-50 p-3 rounded mb-3">
                  <p className="font-semibold text-red-800">
                    This tool provides general educational information about primitive reflex theory. 
                    It does NOT assess, evaluate, diagnose, or provide recommendations for any specific child.
                  </p>
                </div>
                <p className="mb-2"><strong>This service is NOT:</strong></p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>A medical, developmental, or psychological assessment</li>
                  <li>A diagnostic tool or screening instrument</li>
                  <li>Medical advice, treatment, or therapeutic intervention</li>
                  <li>A substitute for professional evaluation by licensed practitioners</li>
                  <li>Validated for clinical or therapeutic use</li>
                </ul>
              </section>

              {/* AI Generated Content */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>AI-Generated Content Disclosure</h3>
                <p>
                  This service uses artificial intelligence (AI) to generate educational content. 
                  AI-generated information may contain errors, inaccuracies, or outdated information. 
                  Users should independently verify all information with qualified professionals.
                </p>
              </section>

              {/* Age and Authority Verification */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>User Eligibility & Authority</h3>
                <p>By using this service, you confirm that:</p>
                <ul className="list-disc ml-6 mt-2">
                  <li>You are 18 years of age or older</li>
                  <li>You are the parent or legal guardian of any child whose information you provide</li>
                  <li>You have the legal authority to provide information about the child</li>
                  <li>You understand this is educational content, not professional assessment</li>
                </ul>
              </section>

              {/* Professional Consultation */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Mandatory Professional Consultation</h3>
                <div className="bg-blue-50 p-3 rounded mb-3">
                  <p className="font-semibold text-blue-800">
                    For any developmental concerns, you MUST consult with appropriately licensed professionals:
                  </p>
                </div>
                <ul className="list-disc ml-6 mt-2">
                  <li><strong>Medical concerns:</strong> Pediatricians, Developmental Pediatricians</li>
                  <li><strong>Motor skills:</strong> Occupational Therapists, Physical Therapists</li>
                  <li><strong>Communication:</strong> Speech-Language Pathologists</li>
                  <li><strong>Behavioral/Emotional:</strong> Child Psychologists, Psychiatrists</li>
                  <li><strong>Reflex integration:</strong> Certified reflex integration specialists</li>
                </ul>
              </section>

              {/* Theory Limitations */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Scientific Theory Acknowledgment</h3>
                <p>
                  Primitive reflex integration theory represents one perspective in child development. 
                  The scientific community continues to research and evaluate these approaches. 
                  This tool presents theoretical information that:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>May not reflect mainstream medical consensus</li>
                  <li>Should be discussed with healthcare providers</li>
                  <li>Cannot predict individual outcomes</li>
                  <li>Must be considered alongside other developmental factors</li>
                </ul>
              </section>

              {/* Liability and Risk */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Limitation of Liability & Assumption of Risk</h3>
                <p>
                  You acknowledge and agree that:
                </p>
                <ul className="list-disc ml-6 mt-2">
                  <li>Use of this educational tool is entirely at your own risk</li>
                  <li>Smart Child Buddy makes no warranties about accuracy or completeness</li>
                  <li>We are not liable for any decisions made based on this information</li>
                  <li>You will not delay seeking professional help based on this content</li>
                  <li>Individual results and experiences vary significantly</li>
                </ul>
              </section>

              {/* Data Privacy */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Data Privacy & Security</h3>
                <p><strong>Information Collection:</strong> We collect only information you voluntarily provide.</p>
                <p><strong>Data Use:</strong> Information is used solely to generate educational content.</p>
                <p><strong>Data Security:</strong> All data is encrypted and stored securely.</p>
                <p><strong>Data Sharing:</strong> We do not sell or share personal information with third parties.</p>
                <p><strong>Data Retention:</strong> Data is retained only as long as necessary for service provision.</p>
                <p><strong>Your Rights:</strong> You may request data deletion by contacting support.</p>
              </section>

              {/* Jurisdiction */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Governing Law & Jurisdiction</h3>
                <p>
                  These terms are governed by applicable laws. Any disputes will be resolved 
                  in accordance with the jurisdiction where Smart Child Buddy is operated. 
                  If any provision is found unenforceable, the remaining provisions remain in effect.
                </p>
              </section>

              {/* Contact Information */}
              <section>
                <h3 className="font-semibold text-lg mb-2" style={{ color: '#6b5b95' }}>Contact & Questions</h3>
                <p>
                  For questions about these terms, privacy practices, or to request data deletion, 
                  contact us at: [Your Contact Information]
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Last Updated: {new Date().toLocaleDateString()} | Version 2.0
                </p>
              </section>
            </div>

            <div className="mt-6 space-y-3">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Before Proceeding:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• I understand this is educational content only, not professional assessment</li>
                  <li>• I will consult licensed professionals for any developmental concerns</li>
                  <li>• I am the parent/legal guardian with authority to provide child information</li>
                  <li>• I acknowledge the limitations and risks described above</li>
                </ul>
              </div>
              
              <button
                onClick={() => setShowDisclaimer(false)}
                className="w-full py-3 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                style={{ background: 'linear-gradient(135deg, #6b5b95, #87a08e)' }}
              >
                I Understand and Accept These Terms
              </button>
            </div>
          </div>
        </div>
      )}


{/* Enhanced Footer Section - Add this right before the disclaimer modal */}
<footer className="bg-gradient-to-b from-white to-gray-50 border-t border-gray-200">
  {/* Main Footer Content */}
  <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      
      {/* Company Info */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-4">
          <img 
       src="/Logo_Smart.png"
            alt="Smart Child Buddy" 
            width="40" 
            height="40"
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
            <a href="#problems" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Common Patterns
            </a>
          </li>
          <li>
      
<a
  href="#how-it-works"
  className="text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    const el = document.getElementById('how-it-works');
    if (!el) return;
    const headerOffset = 88; // your sticky header height
    const y = el.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
    // also fix the URL hash so refresh/deep-links work:
    history.replaceState(null, '', '#how-it-works');
  }}
>
  How It Works
</a>



          </li>
          <li>
            <a href="#testimonials" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
              Success Stories
            </a>
          </li>
          <li>
            <button 
              onClick={() => navigate('/info-form')}
              className="text-sm text-gray-600 hover:text-purple-600 transition-colors"
            >
              Get Started
            </button>
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
            onClick={() => setShowDisclaimer(true)}
            className="hover:text-gray-700 transition-colors"
          >
            Terms & Conditions
          </button>
          <button 
            onClick={() => setShowDisclaimer(true)}
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </button>
          <a href="#" className="hover:text-gray-700 transition-colors">
            Accessibility
          </a>
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
       </>

  );
}