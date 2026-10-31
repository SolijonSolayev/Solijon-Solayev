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
  aspectRatio?: string;
}

/**
 * High-performance media image with explicit aspect-ratio placeholder and zero forced-reflow scroll observers.
 */
export const ParallaxImage: React.FC<ParallaxMediaProps> = ({
  src,
  alt,
  onError,
  className = '',
  priority = false,
  aspectRatio,
}) => {
  const [loaded, setLoaded] = React.useState<boolean>(priority);
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  React.useEffect(() => {
    if (priority) {
      setLoaded(true);
      return;
    }
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [src, priority]);

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#09090D]"
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-zinc-900/90 via-zinc-800/40 to-zinc-900/90 animate-pulse"
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        width={priority ? 800 : 560}
        height={priority ? 450 : 315}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={onError}
        style={aspectRatio ? { aspectRatio } : undefined}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
      />
    </div>
  );
};
