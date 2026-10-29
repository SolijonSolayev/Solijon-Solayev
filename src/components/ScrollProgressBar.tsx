import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion, useScroll, useSpring } from 'motion/react';
import { ThemeMode } from '../App';

interface ScrollProgressBarProps {
  themeMode?: ThemeMode;
  className?: string;
}

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({
  themeMode,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Smooth spring physics for fluid responsiveness without lag
  const scaleX = useSpring(scrollYProgress, {
    stiffness: shouldReduceMotion ? 1000 : 280,
    damping: 32,
    restDelta: 0.0005,
  });

  // Track active theme dynamically in case themeMode prop is not passed directly
  const [isLight, setIsLight] = useState<boolean>(() => {
    if (themeMode) return themeMode === 'light';
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('light');
    }
    return false;
  });

  useEffect(() => {
    if (themeMode) {
      setIsLight(themeMode === 'light');
      return;
    }

    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [themeMode]);

  return (
    <div
      role="progressbar"
      aria-label="Sahifa aylantirish ko'rsatkichi"
      aria-hidden="true"
      className={`fixed top-0 left-0 right-0 h-[3px] z-[100] pointer-events-none ${className}`}
    >
      {/* Background track (subtle semi-transparent guide) */}
      <div
        className={`absolute inset-0 w-full h-full transition-colors duration-300 ${
          isLight ? 'bg-amber-500/15' : 'bg-blue-600/15'
        }`}
      />

      {/* Dynamic Animated Scroll Progress Fill Line */}
      <motion.div
        style={{ scaleX, transformOrigin: '0% 50%' }}
        className={`relative h-full w-full will-change-transform transition-colors duration-300 ${
          isLight
            ? 'bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 shadow-[0_1px_14px_rgba(245,158,11,0.95),0_0_6px_rgba(217,119,6,0.95)]'
            : 'bg-gradient-to-r from-blue-600 via-cyan-400 to-sky-300 shadow-[0_1px_14px_rgba(34,211,238,0.95),0_0_6px_rgba(59,130,246,0.95)]'
        }`}
      />
    </div>
  );
};
