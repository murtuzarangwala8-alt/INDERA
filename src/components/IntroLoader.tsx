import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IntroLoader: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the intro has already played in the current browser session
    const hasPlayed = sessionStorage.getItem('indera-intro-played');
    if (hasPlayed === 'true') {
      setLoading(false);
      return;
    }

    // Set timer to complete loading sequence
    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('indera-intro-played', 'true');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: '-100%',
            transition: { duration: 0.9, ease: [0.85, 0, 0.15, 1] }
          }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0b0b0b] overflow-hidden select-none"
        >
          {/* Subtle Ambient Gold Light Halo */}
          <div 
            className="absolute w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
            }}
          />

          <div className="relative flex flex-col items-center text-center px-6">
            {/* Serif Typography Signature */}
            <motion.h1
              initial={{ opacity: 0, letterSpacing: '0.2em', y: 15 }}
              animate={{ 
                opacity: 1, 
                letterSpacing: '0.45em',
                y: 0,
                transition: { duration: 1.6, ease: [0.16, 1, 0.3, 1] } 
              }}
              exit={{ 
                opacity: 0,
                y: -10,
                transition: { duration: 0.5, ease: 'easeIn' }
              }}
              className="font-serif text-ivory text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.45em] uppercase leading-none select-none"
            >
              INDÉRA
            </motion.h1>

            {/* Custom Brand Signature Subtitle */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 0.45,
                transition: { delay: 0.7, duration: 1.2 } 
              }}
              exit={{ opacity: 0 }}
              className="font-sans text-gold-400 text-[9px] sm:text-[10px] tracking-[0.6em] uppercase mt-4 select-none block mr-[-0.6em]"
            >
              Indian Heritage • European Elegance
            </motion.span>

            {/* Minimal High-End Gold Progress Line */}
            <div className="w-48 h-[1px] bg-ivory/10 mt-8 relative overflow-hidden">
              <motion.div 
                initial={{ left: '-100%' }}
                animate={{ 
                  left: '100%',
                  transition: { duration: 2.2, ease: [0.4, 0, 0.2, 1] }
                }}
                className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-gold-400 to-transparent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroLoader;
