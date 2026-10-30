"use client"

import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Sparkles, ArrowUpRight, Layers } from 'lucide-react';
import { soundEffects } from '@/src/utils/soundEffects';
import { triggerHaptic } from '@/src/hooks/useHapticFeedback';

export interface Card10Props {
  title: string;
  value: string | number;
  description?: string;
  change?: string;
  changeType?: 'positive' | 'neutral' | 'negative';
  icon?: React.ReactNode;
  category?: string;
  badge?: string;
  progress?: number;
  subMetrics?: Array<{ label: string; value: string | number }>;
  imageUrl?: string;
  className?: string;
  onClick?: () => void;
  actionText?: string;
}

export const Card10: React.FC<Card10Props> = ({
  title,
  value,
  description,
  change,
  changeType = 'positive',
  icon,
  category,
  badge,
  progress,
  subMetrics,
  imageUrl,
  className = '',
  onClick,
  actionText,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const lastSoundTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 400) {
      soundEffects.playClick();
      triggerHaptic('light');
      lastSoundTimeRef.current = now;
    }
  };

  const handleClick = () => {
    soundEffects.playClick();
    triggerHaptic('medium');
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`group relative rounded-2xl bg-[#0F0F12] border border-zinc-800/90 overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-600/10 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* Background Ambient Glow on Hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-600/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      />

      {/* Optional Top Cover Image Banner */}
      {imageUrl && (
        <div className="relative aspect-16/9 w-full overflow-hidden bg-[#050505] border-b border-zinc-800">
          {!imgFailed ? (
            <img
              src={imageUrl}
              alt={title}
              width={560}
              height={315}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 via-[#0F0F12] to-[#050505] text-center">
              <Layers className="w-8 h-8 text-blue-500 mb-2" />
              {category && <span className="text-xs font-mono-tabular text-zinc-400">{category}</span>}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F12] via-black/30 to-transparent pointer-events-none" />
          {badge && (
            <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-black/70 border border-white/10 backdrop-blur-md text-[11px] font-mono-tabular text-blue-300 font-medium">
              {badge}
            </div>
          )}
        </div>
      )}

      {/* Main Content Box */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Top Header Row */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400 group-hover:scale-105 group-hover:bg-blue-600/25 transition-all">
                  {icon}
                </div>
              )}
              <div>
                {category && (
                  <span className="text-[11px] font-mono-tabular uppercase tracking-wider text-blue-400 block mb-0.5 font-medium">
                    {category}
                  </span>
                )}
                <h3 className="font-display text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {title}
                </h3>
              </div>
            </div>

            {/* Badge or Change Indicator (if no cover image) */}
            {!imageUrl && badge ? (
              <span className="shrink-0 text-[11px] font-mono-tabular px-2.5 py-0.5 rounded-full bg-blue-600/15 border border-blue-500/30 text-blue-300 font-medium">
                {badge}
              </span>
            ) : change ? (
              <div
                className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-mono-tabular px-2 py-0.5 rounded-md font-medium border ${
                  changeType === 'positive'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : changeType === 'negative'
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}
              >
                {changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-zinc-400" />
                )}
                <span>{change}</span>
              </div>
            ) : null}
          </div>

          {/* Main Metric / Metric Value */}
          <div className="my-2">
            {value && (
              <div className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-blue-300 transition-colors">
                {value}
              </div>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-zinc-400 mt-1.5 leading-relaxed line-clamp-3">
                {description}
              </p>
            )}
          </div>
        </div>

        <div>
          {/* Optional Progress Bar */}
          {typeof progress === 'number' && (
            <div className="mt-3 pt-2">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-1.5 font-mono-tabular">
                <span>Bajarilish</span>
                <span className="text-blue-400 font-medium">{Math.min(100, Math.max(0, progress))}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-sky-400 rounded-full"
                />
              </div>
            </div>
          )}

          {/* Sub-Metrics Row */}
          {subMetrics && subMetrics.length > 0 && (
            <div className="mt-3 pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-3 text-xs">
              {subMetrics.map((sm, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="text-[11px] text-zinc-400 block truncate">{sm.label}</span>
                  <span className="font-mono-tabular font-semibold text-zinc-200">{sm.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer Action Text */}
          {actionText && (
            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs text-blue-400 group-hover:text-blue-300 transition-colors font-medium">
              <span>{actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Card10;
