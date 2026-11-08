import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface WalletHealthScoreProps {
  score: number;
}

export function WalletHealthScore({ score }: WalletHealthScoreProps) {
  const getColor = (s: number) => {
    if (s < 40) return { text: 'text-err-400', bg: 'from-err-500 to-err-400', border: 'border-err-500/30', bgSoft: 'bg-err-500/10' };
    if (s < 75) return { text: 'text-warn-400', bg: 'from-warn-500 to-warn-400', border: 'border-warn-500/30', bgSoft: 'bg-warn-500/10' };
    return { text: 'text-accent-400', bg: 'from-accent-500 to-accent-400', border: 'border-accent-500/30', bgSoft: 'bg-accent-500/10' };
  };

  const getLabel = (s: number) => {
    if (s < 40) return 'AT RISK';
    if (s < 75) return 'MODERATE';
    return 'SECURE';
  };

  const getIcon = (s: number) => {
    if (s < 40) return ShieldX;
    if (s < 75) return ShieldAlert;
    return ShieldCheck;
  };

  const colors = getColor(score);
  const Icon = getIcon(score);
  const label = getLabel(score);
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl ${colors.bgSoft} border ${colors.border}`}>
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
          <circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
          />
          <motion.circle
            cx="36"
            cy="36"
            r="32"
            fill="none"
            stroke="url(#healthGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={score < 40 ? '#f87171' : score < 75 ? '#fbbf24' : '#34d399'} />
              <stop offset="100%" stopColor={score < 40 ? '#ef4444' : score < 75 ? '#f59e0b' : '#10b981'} />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon size={18} className={colors.text} />
        </div>
      </div>
      <div>
        <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Wallet Health</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-lg font-bold font-mono ${colors.text}`}>{score}</span>
          <span className="text-xs text-zinc-500">/ 100</span>
          <span className={`text-xs font-bold ${colors.text}`}>{label}</span>
        </div>
      </div>
    </div>
  );
}
