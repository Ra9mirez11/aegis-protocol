import { type ReactNode, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-gradient-to-r from-accent-500 to-cyber-500 text-white hover:from-accent-400 hover:to-cyber-400 shadow-lg shadow-accent-500/20',
    secondary:
      'bg-white/5 text-zinc-200 hover:bg-white/10 border border-white/10',
    ghost: 'text-zinc-400 hover:text-white hover:bg-white/5',
    danger:
      'bg-gradient-to-r from-err-500 to-err-600 text-white hover:from-err-400 hover:to-err-500 shadow-lg shadow-err-500/20',
    outline:
      'border border-accent-500/40 text-accent-400 hover:bg-accent-500/10 hover:border-accent-500/60',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`rounded-lg font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...(props as any)}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </motion.button>
  );
}
