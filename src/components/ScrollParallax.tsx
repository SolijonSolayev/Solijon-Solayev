import React, { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';

interface ParallaxOffsetProps {
  children: React.ReactNode;
  offsetY?: [number, number];
  className?: string;
}

/**
 * Smooth GPU-composited vertical parallax container bound to its own viewport scroll progress.
 */
export const ParallaxLayer: React.FC<ParallaxOffsetProps> = ({
  children,
  offsetY = [24, -24],
  className = '',
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 28,
    mass: 0.35,
  });

  const y = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : offsetY
  );

  return (
    <motion.div ref={ref} style={{ y }} className={`will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
};

interface ParallaxMediaProps {
  src: string;
  alt: string;
  onError?: () => void;
  className?: string;
  intensity?: number;
}

/**
 * Inner media image with subtle vertical counter-parallax inside an overflow-hidden frame.
 */
export const ParallaxImage: React.FC<ParallaxMediaProps> = ({
  src,
  alt,
  onError,
  className = '',
  intensity = 18,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.4,
  });

  const y = useTransform(
    smoothProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-intensity, intensity]
  );

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <motion.img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={onError}
        style={{ y, scale: prefersReducedMotion ? 1 : 1.09 }}
        className={`w-full h-full object-cover will-change-transform ${className}`}
      />
    </div>
  );
};
