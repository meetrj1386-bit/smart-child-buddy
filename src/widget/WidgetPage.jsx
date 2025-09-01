// src/widget/WidgetPage.jsx - Dynamic responsive version
import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from '../AIAgent/components/ChatInterface';
import ReflexBuddyAI from '../AIAgent/core/ReflexBuddyAI';
import { supabase } from '../utils/supabaseClient';

function WidgetPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState('welcome');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [initialConcern, setInitialConcern] = useState('');
  const [reflexBuddy] = useState(new ReflexBuddyAI());
  const containerRef = useRef(null);
  const [config, setConfig] = useState({
    branding: {
      primaryColor: '#667eea',
      name: 'Child Development AI',
      greeting: 'Hi There! 👋',
      tagline: "Let's help your child thrive together"
    },
    menuOptions: []
  });
  
  const urlParams = new URLSearchParams(window.location.search);
  const widgetId = urlParams.get('widgetId') || 'default';
  
  useEffect(() => {
    loadConfiguration();
  }, [widgetId]);
  
  // Clean up body styles on widget page
  useEffect(() => {
    if (window.location.pathname === '/widget') {
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
    }
  }, []);
  
  const loadConfiguration = async () => {
    try {
      const { data: customer } = await supabase
        .from('widget_customers')
        .select('*')
        .eq('widget_id', widgetId)
        .single();
      
      if (customer) {
        const { data: configData } = await supabase
          .from('widget_configs')
          .select('*')
          .eq('customer_id', customer.id)
          .single();
        
        if (configData && customer.is_active) {
          setConfig(configData.config);
        }
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }
  };

  const toggleWidget = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    
    if (newState) {
      setStage('welcome');
      setMessages([]);
      setInitialConcern('');
    }
    
    if (window.parent !== window) {
      window.parent.postMessage(newState ? 'widget-open' : 'widget-close', '*');
    }
  };

  const handleConcernSubmit = (concern) => {
    if (concern.trim()) {
      setInitialConcern(concern);
      setStage('pre-form');
    }
  };

  const handleMenuClick = (option) => {
    if (option.action === 'external_link') {
      window.open(option.url, '_blank');
    } else if (option.action === 'assessment') {
      setStage('pre-form');
    } else {
      setStage('chat');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const userData = {
      parentName: formData.get('parentName'),
      email: formData.get('email'),
      childName: formData.get('childName'),
      childAge: formData.get('childAge')
    };
    
    setUserInfo(userData);
    
    reflexBuddy.setChildInfo({
      name: userData.childName,
      age: parseInt(userData.childAge)
    });
    
    setStage('chat');
    
    setMessages([
      { 
        type: 'bot', 
        content: `Thank you ${userData.parentName}! I understand you're concerned about ${userData.childName}. Let me help you with: "${initialConcern}". I'll ask you some questions to better understand how to help.`
      }
    ]);
    
    setTimeout(async () => {
      setLoading(true);
      try {
        const response = await reflexBuddy.chat(initialConcern);
        setMessages(prev => [...prev, { type: 'bot', content: response.message }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [...prev, { 
          type: 'bot', 
          content: 'I apologize, I had trouble processing that. Could you please try again?' 
        }]);
      } finally {
        setLoading(false);
      }
    }, 1000);
  };

  const sendMessage = async (message) => {
    setLoading(true);
    setMessages(prev => [...prev, { type: 'user', content: message }]);
    
    try {
      const response = await reflexBuddy.chat(message);
      setMessages(prev => [...prev, { type: 'bot', content: response.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: 'I apologize, I had trouble processing that. Could you please try again?' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Check if in iframe
  const inIframe = window.self !== window.top;

  // Closed state - button
  if (!isOpen) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '30px',
        background: config.branding.primaryColor || '#667eea',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s',
        zIndex: 99999
      }}
      onClick={toggleWidget}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        💬
      </div>
    );
  }

  // Open state - dynamic height widget
  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        width: '380px',
        height: inIframe ? '100%' : 'min(600px, 80vh)', // Dynamic height
        maxHeight: inIframe ? '100%' : '600px',
        minHeight: '400px',
        bottom: inIframe ? '0' : '20px',
        right: inIframe ? '0' : '20px',
        background: 'white',
        borderRadius: inIframe ? '0' : '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header - Fixed height */}
      <div style={{
        background: config.branding.primaryColor || '#667eea',
        color: 'white',
        padding: '12px 14px',
        minHeight: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: inIframe ? '0' : '12px 12px 0 0',
        flexShrink: 0
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {config.branding.greeting}
          </div>
          <div style={{ fontSize: '11px', opacity: 0.9 }}>
            {config.branding.tagline}
          </div>
        </div>
        <button
          onClick={toggleWidget}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            width: '26px',
            height: '26px',
            borderRadius: '13px',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>

      {/* Content Area - Flexible */}
      {stage === 'welcome' && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1,
          minHeight: 0 // Important for Firefox
        }}>
          {/* Scrollable content */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            background: '#f9f9f9'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginTop: 0,
                marginBottom: '8px',
                color: '#333' 
              }}>
                We're here to help! 💝
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: '#666', 
                marginBottom: '10px',
                lineHeight: '1.4'
              }}>
                Please help us understand your child better. Share any concerns about:
              </p>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '6px' 
              }}>
                <div style={{ 
                  padding: '8px', 
                  background: '#f0f4ff', 
                  borderRadius: '6px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#4a5568'
                }}>
                  🗣️ Speech &<br/>Language
                </div>
                <div style={{ 
                  padding: '8px', 
                  background: '#fff0f0', 
                  borderRadius: '6px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#4a5568'
                }}>
                  😤 Behavior &<br/>Emotions
                </div>
                <div style={{ 
                  padding: '8px', 
                  background: '#f0fff4', 
                  borderRadius: '6px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#4a5568'
                }}>
                  🍽️ Feeding &<br/>Eating
                </div>
                <div style={{ 
                  padding: '8px', 
                  background: '#fffaf0', 
                  borderRadius: '6px',
                  fontSize: '11px',
                  textAlign: 'center',
                  color: '#4a5568'
                }}>
                  📚 Learning &<br/>Development
                </div>
              </div>
            </div>
            
            {/* Dynamic menu options - scrolls if too many */}
            {config.menuOptions?.map((option, i) => (
              <button
                key={i}
                onClick={() => handleMenuClick(option)}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '6px',
                  background: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#667eea';
                  e.currentTarget.style.transform = 'translateX(2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ fontSize: '18px' }}>{option.icon}</span>
                <span style={{ flex: 1 }}>{option.label}</span>
                <span style={{ color: '#999' }}>→</span>
              </button>
            ))}
          </div>
          
          {/* Input area - Fixed at bottom */}
          <div style={{
            padding: '10px',
            borderTop: '1px solid #e0e0e0',
            background: 'white',
            borderRadius: inIframe ? '0' : '0 0 12px 12px',
            flexShrink: 0
          }}>
            <div style={{ position: 'relative' }}>
              <input
                placeholder="Type your concern..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleConcernSubmit(e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '20px',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.parentElement.querySelector('input');
                  if (input.value.trim()) {
                    handleConcernSubmit(input.value);
                    input.value = '';
                  }
                }}
                style={{
                  position: 'absolute',
                  right: '4px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: config.branding.primaryColor || '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
              >
                →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {stage === 'pre-form' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#f9f9f9'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '14px', color: '#333' }}>
              Thank you for sharing! 
            </h3>
            <p style={{ fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
              Before we understand what's going on with your child, please help us with your details.
            </p>
            
            {initialConcern && (
              <div style={{
                background: '#f8f9fa',
                padding: '10px',
                borderRadius: '6px',
                marginBottom: '12px',
                borderLeft: '3px solid #667eea'
              }}>
                <small style={{ fontSize: '10px', color: '#888' }}>Your concern:</small>
                <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#333' }}>{initialConcern}</p>
              </div>
            )}
            
            <button
              onClick={() => setStage('form')}
              style={{
                width: '100%',
                padding: '10px',
                background: config.branding.primaryColor || '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                marginTop: '12px'
              }}
            >
              Continue →
            </button>
          </div>
        </div>
      )}
      
      {stage === 'form' && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          background: '#f9f9f9'
        }}>
          <form onSubmit={handleFormSubmit} style={{
            background: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ marginTop: 0, fontSize: '14px', marginBottom: '12px', color: '#333' }}>
              Parent & Child Information
            </h3>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#555' }}>
                Parent Name *
              </label>
              <input
                name="parentName"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#555' }}>
                Email *
              </label>
              <input
                name="email"
                type="email"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#555' }}>
                Child Name *
              </label>
              <input
                name="childName"
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', color: '#555' }}>
                Child Age *
              </label>
              <input
                name="childAge"
                type="number"
                required
                min="1"
                max="18"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '10px',
                background: config.branding.primaryColor || '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Start Assessment
            </button>
          </form>
        </div>
      )}
      
      {stage === 'chat' && (
        <div style={{
          flex: 1,
          minHeight: 0,
          background: '#f9f9f9'
        }}>
          <ChatInterface
            messages={messages}
            onSendMessage={sendMessage}
            loading={loading}
            widgetMode={true}
          />
        </div>
      )}
    </div>
  );
}

export default WidgetPage;