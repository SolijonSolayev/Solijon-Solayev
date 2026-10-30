import React from 'react';

interface ParallaxOffsetProps {
  children: React.ReactNode;
  offsetY?: [number, number];
  className?: string;
}

/**
 * Lightweight container that avoids forced layout reflows on initial page load.
 */
export const ParallaxLayer: React.FC<ParallaxOffsetProps> = ({
  children,
  className = '',
}) => {
  return <div className={className}>{children}</div>;
};

interface ParallaxMediaProps {
  src: string;
  alt: string;
  onError?: () => void;
  className?: string;
  intensity?: number;
  priority?: boolean;
}

/**
 * High-performance media image with explicit dimensions and zero forced-reflow scroll observers.
 */
export const ParallaxImage: React.FC<ParallaxMediaProps> = ({
  src,
  alt,
  onError,
  className = '',
  priority = false,
}) => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={src}
        alt={alt}
        width={priority ? 800 : 560}
        height={priority ? 450 : 315}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onError={onError}
        className={`w-full h-full object-cover ${className}`}
      />
    </div>
  );
};
