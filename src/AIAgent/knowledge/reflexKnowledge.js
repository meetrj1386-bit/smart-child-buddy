// src/AIAgent/knowledge/reflexKnowledge.js

import { COMPREHENSIVE_REFLEX_DATABASE } from '../../utils/comprehensiveReflexDatabase';

export class ReflexKnowledge {
  constructor() {
    this.reflexDB = COMPREHENSIVE_REFLEX_DATABASE || {};
    
    console.log('📚 Reflex Knowledge Loaded!');
    console.log('📊 Total reflexes in database:', Object.keys(this.reflexDB).length);
    
    // ENHANCED SYMPTOM MAP FROM YOUR PDF!
    this.symptomMap = {
      // MORO REFLEX (from your PDF page 1)
      'motion sickness': ['Moro'],
      'poor eye contact': ['Moro'],
      'light sensitivity': ['Moro'],
      'sound sensitivity': ['Moro'],
      'anxiety': ['Moro'],
      'mood swings': ['Moro'],
      'fight or flight': ['Moro'],
      'poor impulse control': ['Moro'],
      'easily distracted': ['Moro'],
      'adhd': ['Moro'],
      
      // SPINAL GALANT (from your PDF page 2)
      'fidgeting': ['Spinal Galant'],
      'bedwetting': ['Spinal Galant'],
      'bed wetting': ['Spinal Galant'],
      'ants in pants': ['Spinal Galant'],
      'concentration': ['Spinal Galant'],
      
      // TLR (from your PDF page 2)
      'poor balance': ['TLR'],
      'toe walking': ['TLR'],
      'fear of heights': ['TLR'],
      'w-sitting': ['TLR', 'STNR'],
      'poor posture': ['TLR', 'STNR'],
      
      // ATNR (from your PDF page 3)
      'poor handwriting': ['ATNR', 'Palmar Grasp'],
      'crossing midline': ['ATNR'],
      'mixes b and d': ['ATNR'],
      'reading difficulties': ['ATNR', 'TLR'],
      
      // STNR (from your PDF page 3)
      'lays head on desk': ['STNR'],
      'messy eater': ['STNR', 'Rooting'],
      'clumsy': ['STNR', 'ATNR'],
      'skipped crawling': ['STNR'],
      
      // PALMAR GRASP (from your PDF page 4)
      'pencil grip': ['Palmar Grasp'],
      'nail biting': ['Palmar Grasp'],
      'thumb sucking': ['Palmar Grasp'],
      
      // ROOTING/SUCK (from your PDF page 4)
      'picky eating': ['Rooting'],
      'picky eater': ['Rooting'],
      'speech problems': ['Rooting', 'Palmar Grasp'],
      'drooling': ['Rooting'],
      'chewing problems': ['Rooting']
    };
    
    console.log('📋 Symptom mappings loaded:', Object.keys(this.symptomMap).length);
  }
  
  // Enhanced function with multiple symptom detection
  checkForSymptoms(message) {
    const messageLower = message.toLowerCase();
    const foundReflexes = new Set(); // Use Set to avoid duplicates
    const symptoms = [];
    
    // Check each symptom
    Object.entries(this.symptomMap).forEach(([symptom, reflexes]) => {
      if (messageLower.includes(symptom)) {
        console.log(`🎯 Found: "${symptom}" → Reflexes: ${reflexes.join(', ')}`);
        symptoms.push(symptom);
        reflexes.forEach(reflex => foundReflexes.add(reflex));
      }
    });
    
    return {
      symptoms: symptoms,
      reflexes: Array.from(foundReflexes),
      count: foundReflexes.size
    };
  }
  
  // Get detailed info for parent
  getParentFriendlyExplanation(reflexName) {
    const reflex = this.reflexDB[reflexName];
    if (!reflex) return null;
    
    return {
      name: reflex.fullName || reflexName,
      whatItMeans: reflex.whatItDoes,
      whyItMatters: reflex.whyItMatters,
      exercises: reflex.exercises?.slice(0, 2) // Give 2 exercises
    };
  }
}

const reflexKnowledge = new ReflexKnowledge();
export default reflexKnowledge;