import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { soundEffects } from '../utils/soundEffects';
import { triggerHaptic } from '../hooks/useHapticFeedback';

interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article';
  enableTilt?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  onClick,
  as = 'div',
  enableTilt = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const lastSoundTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    setIsHovered(true);
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 600) {
      soundEffects.playCyberGlitch();
      triggerHaptic('glitch');
      lastSoundTimeRef.current = now;
    }
  };

  const handleClick = () => {
    triggerHaptic('medium');
    if (onClick) {
      soundEffects.playClick();
      onClick();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    if (enableTilt) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -3.5;
      const rotateY = ((x - centerX) / centerX) * 3.5;
      setTilt({ rotateX, rotateY });
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (enableTilt) {
      setTilt({ rotateX: 0, rotateY: 0 });
    }
  };

  const Component = as === 'article' ? motion.article : motion.div;

  return (
    <Component
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={
        enableTilt
          ? {
              rotateX: tilt.rotateX,
              rotateY: tilt.rotateY,
              y: isHovered ? -4 : 0,
            }
          : {
              y: isHovered ? -3 : 0,
            }
      }
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      style={enableTilt ? { transformPerspective: 1100 } : undefined}
      className={`relative overflow-hidden spotlight-card-wrapper ${className}`}
    >
      {/* Pointer-following dynamic spotlight (Cobalt in dark, Royal Amber Gold in light) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-200"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(460px circle at ${mousePos.x}px ${mousePos.y}px, var(--spotlight-color, rgba(37, 99, 235, 0.13)), transparent 70%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col justify-between spotlight-glitch-target">
        {children}
      </div>
    </Component>
  );
};
