import { type ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'accent' | 'cyber';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function Badge({ children, variant = 'neutral', size = 'sm', pulse = false }: BadgeProps) {
  const variants = {
    success: 'bg-accent-500/10 text-accent-400 border-accent-500/20',
    error: 'bg-err-500/10 text-err-400 border-err-500/20',
    warning: 'bg-warn-500/10 text-warn-400 border-warn-500/20',
    info: 'bg-cyber-500/10 text-cyber-400 border-cyber-500/20',
    neutral: 'bg-white/5 text-zinc-400 border-white/10',
    accent: 'bg-accent-500/15 text-accent-300 border-accent-500/30',
    cyber: 'bg-cyber-500/15 text-cyber-300 border-cyber-500/30',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${variants[variant]} ${sizes[size]} ${
        pulse ? 'relative' : ''
      }`}
    >
      {pulse && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {children}
    </span>
  );
}
