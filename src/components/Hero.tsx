import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, GitBranch, KeyRound, Lock, Network, ShieldCheck, Zap } from 'lucide-react';

type ModuleTab = 'dustsweeper' | 'approvalsentinel' | 'inheritsafe';

interface HeroProps {
  onGetStarted: () => void;
  onSelectModule?: (tab: ModuleTab) => void;
}

const TELEMETRY_PILLS = [
  { icon: Lock, label: 'AES-256-GCM Client-Side' },
  { icon: GitBranch, label: 'GF(256) Shamir Split' },
  { icon: Network, label: '15 Networks Ready' },
];

const MODULE_LINKS = [
  { icon: Zap, label: 'DustSweeper', color: 'text-accent-400' },
  { icon: ShieldCheck, label: 'Approval Sentinel', color: 'text-cyber-400' },
  { icon: KeyRound, label: 'InheritSafe Vault', color: 'text-accent-400' },
];

function IsometricCube({ tone = 'emerald' }: { tone?: 'emerald' | 'cyan' }) {
  const isCyan = tone === 'cyan';
  return (
    <svg viewBox="0 0 36 36" className="w-6 h-6" fill="none" aria-hidden="true">
      <polygon points="18,4 32,11 18,18 4,11" fill={isCyan ? '#22d3ee' : '#34d399'} fillOpacity=".85" />
      <polygon points="4,11 18,18 18,31 4,24" fill={isCyan ? '#0891b2' : '#10b981'} />
      <polygon points="32,11 18,18 18,31 32,24" fill={isCyan ? '#0369a1' : '#06b6d4'} />
      <path d="M18 4L4 11V24L18 31L32 24V11L18 4Z" stroke="white" strokeOpacity=".65" />
      <circle cx="18" cy="11" r="2" fill="white" />
    </svg>
  );
}

function ReactorCore() {
  return (
    <div className="relative flex flex-col items-center">
      <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center" style={{ background: 'radial-gradient(circle, rgba(16,185,129,.32), rgba(6,182,212,.16) 50%, transparent 72%)' }}>
        <svg className="absolute inset-0 w-full h-full orbit-fast" viewBox="0 0 140 140" aria-hidden="true">
          <circle cx="70" cy="70" r="58" fill="none" stroke="rgba(52,211,153,.4)" strokeWidth="1.2" strokeDasharray="18 28" />
          <circle cx="70" cy="70" r="65" fill="none" stroke="rgba(6,182,212,.22)" strokeWidth="1" strokeDasharray="2 10" />
        </svg>
        <div className="w-24 h-24 rounded-2xl bg-zinc-950/90 border border-accent-400/50 shadow-[0_0_45px_rgba(16,185,129,0.4),inset_0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center backdrop-blur-xl core-pulse">
          <svg viewBox="0 0 80 80" className="w-16 h-16" fill="none" aria-hidden="true">
            <polygon points="40,6 70,22 70,58 40,74 10,58 10,22" fill="rgba(16,185,129,.08)" stroke="rgba(52,211,153,.5)" strokeWidth="1.5" />
            <polygon points="40,14 64,27 40,40 16,27" fill="url(#core-top)" />
            <polygon points="16,27 40,40 40,66 16,53" fill="url(#core-left)" />
            <polygon points="40,40 64,27 64,53 40,66" fill="url(#core-right)" />
            <polygon points="40,22 52,28.5 40,35 28,28.5" fill="#ecfdf5" />
            <polyline points="16,27 40,40 64,27" stroke="white" strokeWidth="1.4" strokeOpacity=".85" />
            <line x1="40" y1="40" x2="40" y2="66" stroke="#a7f3d0" strokeWidth="1.4" />
            <circle cx="40" cy="40" r="3" fill="white" />
            <defs>
              <linearGradient id="core-top" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#a7f3d0" /><stop offset="1" stopColor="#10b981" /></linearGradient>
              <linearGradient id="core-left" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#10b981" /><stop offset="1" stopColor="#047857" /></linearGradient>
              <linearGradient id="core-right" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#22d3ee" /><stop offset="1" stopColor="#0369a1" /></linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <div className="-mt-1 px-2.5 py-0.5 rounded-full bg-zinc-950/90 border border-accent-500/40 shadow-lg">
        <span className="text-[9px] font-mono font-bold tracking-widest text-accent-300 uppercase">AEGIS ZK-CORE</span>
      </div>
    </div>
  );
}

function TelemetryCard({ type }: { type: 'dust' | 'approval' | 'vault' }) {
  if (type === 'dust') {
    return (
      <div className="w-44 sm:w-52 rounded-2xl p-3.5 border backdrop-blur-2xl transition-transform duration-200 hover:scale-105" style={{ background: 'linear-gradient(145deg,rgba(16,20,24,.92),rgba(10,12,16,.96))', borderColor: 'rgba(16,185,129,.45)', boxShadow: '0 20px 40px -12px rgba(0,0,0,.85),0 0 28px rgba(16,185,129,.22),inset 0 1px 0 rgba(255,255,255,.15)' }}>
        <div className="flex items-center justify-between gap-2 mb-2.5"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shrink-0"><IsometricCube /></div><div><p className="text-xs font-bold text-white leading-tight">DustSweeper</p><p className="text-[10px] text-emerald-400 font-mono">Funnel &amp; Tax Engine</p></div></div><span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">LIVE</span></div>
        <div className="grid grid-cols-2 gap-1.5 mb-2"><div className="px-2 py-1 rounded-lg bg-white/[.04] border border-white/[.06]"><p className="text-[9px] text-zinc-500 font-mono">SWEEP</p><p className="text-[11px] font-mono font-bold text-emerald-400">+0.084 ETH</p></div><div className="px-2 py-1 rounded-lg bg-white/[.04] border border-white/[.06]"><p className="text-[9px] text-zinc-500 font-mono">IRS 8949</p><p className="text-[11px] font-mono font-bold text-cyan-400">-$4,520</p></div></div>
        <div className="h-1.5 rounded-full overflow-hidden bg-white/10"><div className="h-full rounded-full" style={{ width: '86%', background: 'linear-gradient(90deg,#10b981,#22d3ee)' }} /></div>
      </div>
    );
  }

  if (type === 'approval') {
    return (
      <div className="w-44 sm:w-52 rounded-2xl p-3.5 border backdrop-blur-2xl transition-transform duration-200 hover:scale-105" style={{ background: 'linear-gradient(145deg,rgba(14,21,28,.92),rgba(9,13,18,.96))', borderColor: 'rgba(6,182,212,.45)', boxShadow: '0 20px 40px -12px rgba(0,0,0,.85),0 0 28px rgba(6,182,212,.22),inset 0 1px 0 rgba(255,255,255,.15)' }}>
        <div className="flex items-center justify-between gap-2 mb-2.5"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-center shrink-0"><svg viewBox="0 0 36 36" className="w-6 h-6" fill="none" aria-hidden="true"><path d="M18 3L31 9V18c0 7.5-5.8 13.2-13 15C10.8 31.2 5 25.5 5 18V9L18 3Z" fill="#06b6d4" fillOpacity=".25" stroke="#22d3ee" strokeWidth="1.6" /><path d="M18 3L31 9V18c0 7.5-5.8 13.2-13 15V3Z" fill="#0891b2" fillOpacity=".45" /><path d="M13 18l3.5 3.5 7-7" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></div><div><p className="text-xs font-bold text-white leading-tight">Approval Sentinel</p><p className="text-[10px] text-cyan-400 font-mono">0x095ea7b3 Guard</p></div></div><span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">SHIELD</span></div>
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white/[.04] border border-white/[.06] mb-2 font-mono text-[10px]"><span className="text-amber-400 line-through">UNLIMITED</span><span className="text-zinc-500">→</span><span className="text-cyan-300 font-bold">0x00 REVOKED</span></div>
        <div className="h-1.5 rounded-full overflow-hidden bg-white/10"><div className="h-full rounded-full" style={{ width: '94%', background: 'linear-gradient(90deg,#06b6d4,#34d399)' }} /></div>
      </div>
    );
  }

  return (
    <div className="w-56 sm:w-64 rounded-2xl p-3.5 border backdrop-blur-2xl transition-transform duration-200 hover:scale-105" style={{ background: 'linear-gradient(145deg,rgba(16,22,20,.94),rgba(10,14,12,.98))', borderColor: 'rgba(52,211,153,.5)', boxShadow: '0 24px 48px -12px rgba(0,0,0,.9),0 0 32px rgba(16,185,129,.28),inset 0 1px 0 rgba(255,255,255,.18)' }}>
      <div className="flex items-center justify-between gap-2 mb-2"><div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center shrink-0"><IsometricCube /></div><div><p className="text-xs font-bold text-white leading-tight">Shamir 2-of-2 Vault</p><p className="text-[10px] text-emerald-400 font-mono">GF(256) Dead Man&apos;s Switch</p></div></div><span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">ARMED</span></div>
      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[.04] border border-white/[.06]"><svg viewBox="0 0 120 26" className="w-28 h-5 shrink-0" aria-hidden="true"><polyline fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="heartbeat-anim" points="0,14 22,14 30,14 36,4 42,23 48,9 54,17 60,14 85,14 92,5 98,22 104,14 120,14" /></svg><div className="flex-1 flex flex-col gap-1 text-[9px] font-mono"><div className="flex justify-between text-emerald-300"><span>SHARE A</span><span>SHARE B</span></div><div className="grid grid-cols-2 gap-1"><div className="h-1 rounded bg-emerald-400" /><div className="h-1 rounded bg-cyan-400" /></div></div></div>
    </div>
  );
}

export function Hero({ onGetStarted, onSelectModule }: HeroProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 6, ry: -8 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    setTilt({ rx: -((mouseY - rect.height / 2) / (rect.height / 2)) * 16, ry: ((mouseX - rect.width / 2) / (rect.width / 2)) * 16 });
    setGlowPos({ x: (mouseX / rect.width) * 100, y: (mouseY / rect.height) * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 6, ry: -8 });
    setGlowPos({ x: 50, y: 50 });
  }, []);

  return (
    <div className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-24">
      <div className="absolute inset-0 grid-overlay pointer-events-none" /><div className="absolute inset-0 radial-glow pointer-events-none" /><div className="absolute inset-0 radial-glow-cyan pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6"><div className="grid lg:grid-cols-[1.08fr_1fr] gap-10 lg:gap-12 items-center min-h-[540px]">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: .7 }} className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, delay: .1 }} className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[.04] border border-white/10 self-start backdrop-blur-md"><span className="w-2 h-2 rounded-full bg-accent-400 led-glow text-accent-400" /><span className="text-xs font-mono text-zinc-300 tracking-wider">ZERO-KNOWLEDGE · CLIENT-SIDE · NON-CUSTODIAL</span></motion.div>
          <div><h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.05]">Clean Wallets.<br /><span className="gradient-text">Harvest Losses.</span><br />Secure Inheritance.</h1><p className="text-base sm:text-lg text-zinc-400 max-w-xl mt-4 leading-relaxed">The institutional Web3 security &amp; treasury enclave. Sweep dust tokens, burn rugged positions for IRS/EU tax-loss harvesting, and arm a zero-knowledge Shamir dead man&apos;s switch — 100% in-browser.</p></div>
          <div className="flex flex-wrap gap-2.5">{TELEMETRY_PILLS.map(({ icon: Icon, label }, index) => <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4, delay: .3 + index * .08 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[.03] border border-white/[.08]"><Icon size={13} className="text-accent-400" /><span className="text-xs font-mono text-zinc-300">{label}</span></motion.div>)}</div>
          <div className="flex flex-col sm:flex-row items-start gap-3.5 pt-2"><button onClick={onGetStarted} className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-accent-500 via-emerald-500 to-cyber-500 text-white font-semibold shadow-[0_0_30px_rgba(16,185,129,.3)] hover:shadow-[0_0_40px_rgba(6,182,212,.5)] hover:scale-[1.02] transition-all"><span>Launch Dashboard</span><ArrowDown size={18} className="group-hover:translate-y-0.5 transition-transform" /></button><a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[.04] border border-white/10 text-zinc-300 font-medium hover:bg-white/10 hover:border-white/20 transition-all">How It Works</a></div>
          <div className="flex flex-wrap gap-2 pt-1">{MODULE_LINKS.map(({ icon: Icon, label, color }, index) => { const tabIds: ModuleTab[] = ['dustsweeper', 'approvalsentinel', 'inheritsafe']; return <button key={label} onClick={() => onSelectModule?.(tabIds[index])} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[.02] border border-white/[.06] text-xs text-zinc-400 hover:text-white hover:border-accent-400/40 hover:shadow-[0_0_16px_rgba(16,185,129,.12)] transition-all"><Icon size={13} className={color} />{label}</button>; })}</div>
        </motion.div>

        <div className="relative flex items-center justify-center min-h-[430px] sm:min-h-[490px] lg:min-h-[540px] select-none" style={{ perspective: '1300px' }}>
          <div ref={stageRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="relative w-[350px] h-[410px] sm:w-[460px] sm:h-[460px] cursor-grab active:cursor-grabbing" style={{ transformStyle: 'preserve-3d', transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`, transition: 'transform .14s ease-out' }}>
            <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%,rgba(16,185,129,.28),rgba(6,182,212,.14) 42%,transparent 68%)`, transform: 'translateZ(-60px)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-40px)' }}><svg className="w-full h-full orbit-slow" viewBox="0 0 460 460"><circle cx="230" cy="230" r="205" fill="none" stroke="rgba(16,185,129,.3)" strokeWidth="1.2" strokeDasharray="6 10" /><circle cx="230" cy="230" r="192" fill="none" stroke="rgba(255,255,255,.04)" /><circle cx="435" cy="230" r="4.5" fill="#10b981" /><circle cx="25" cy="230" r="3.5" fill="#06b6d4" /><circle cx="230" cy="25" r="3" fill="#34d399" /></svg></div>
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(-20px)' }}><svg className="w-full h-full orbit-reverse-slow" viewBox="0 0 460 460"><circle cx="230" cy="230" r="152" fill="none" stroke="rgba(6,182,212,.22)" strokeWidth="1.2" strokeDasharray="2 12" /><polygon points="230,95 347,162 347,298 230,365 113,298 113,162" fill="none" stroke="rgba(16,185,129,.12)" /><circle cx="347" cy="162" r="3.5" fill="#22d3ee" /><circle cx="113" cy="298" r="3.5" fill="#10b981" /></svg></div>
            <div className="absolute inset-0 pointer-events-none" style={{ transform: 'translateZ(15px)' }}><svg className="w-full h-full" viewBox="0 0 460 460"><defs><linearGradient id="conduit-1" x1="230" y1="215" x2="95" y2="82" gradientUnits="userSpaceOnUse"><stop stopColor="#10b981" stopOpacity=".9" /><stop offset="1" stopColor="#10b981" stopOpacity=".15" /></linearGradient><linearGradient id="conduit-2" x1="230" y1="215" x2="368" y2="105" gradientUnits="userSpaceOnUse"><stop stopColor="#06b6d4" stopOpacity=".9" /><stop offset="1" stopColor="#06b6d4" stopOpacity=".15" /></linearGradient><linearGradient id="conduit-3" x1="230" y1="215" x2="230" y2="378" gradientUnits="userSpaceOnUse"><stop stopColor="#34d399" stopOpacity=".9" /><stop offset="1" stopColor="#34d399" stopOpacity=".15" /></linearGradient></defs><path d="M230 215L95 82" stroke="url(#conduit-1)" strokeWidth="2" strokeDasharray="5 5" className="beam-pulse" /><path d="M230 215L368 105" stroke="url(#conduit-2)" strokeWidth="2" strokeDasharray="5 5" className="beam-pulse" /><path d="M230 215L230 378" stroke="url(#conduit-3)" strokeWidth="2" strokeDasharray="5 5" className="beam-pulse" /><circle r="3.5" fill="#34d399"><animateMotion dur="2.4s" repeatCount="indefinite" path="M230 215L95 82" /></circle><circle r="3.5" fill="#22d3ee"><animateMotion dur="2.8s" repeatCount="indefinite" path="M230 215L368 105" /></circle><circle r="3.5" fill="#6ee7b7"><animateMotion dur="2.1s" repeatCount="indefinite" path="M230 215L230 378" /></circle></svg></div>
            <div className="absolute pointer-events-none" style={{ left: '50%', top: '46%', transform: 'translate(-50%,-50%) translateZ(45px)' }}><ReactorCore /></div>
            <div className="absolute cursor-pointer rounded-2xl hover:shadow-[0_0_24px_rgba(16,185,129,.2)] transition-shadow" role="button" tabIndex={0} onClick={() => onSelectModule?.('dustsweeper')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelectModule?.('dustsweeper'); }} style={{ left: '21%', top: '18%', transform: 'translate(-50%,-50%) translateZ(70px)' }}><TelemetryCard type="dust" /></div>
            <div className="absolute cursor-pointer rounded-2xl hover:shadow-[0_0_24px_rgba(6,182,212,.2)] transition-shadow" role="button" tabIndex={0} onClick={() => onSelectModule?.('approvalsentinel')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelectModule?.('approvalsentinel'); }} style={{ left: '80%', top: '23%', transform: 'translate(-50%,-50%) translateZ(55px)' }}><TelemetryCard type="approval" /></div>
            <div className="absolute cursor-pointer rounded-2xl hover:shadow-[0_0_24px_rgba(52,211,153,.2)] transition-shadow" role="button" tabIndex={0} onClick={() => onSelectModule?.('inheritsafe')} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onSelectModule?.('inheritsafe'); }} style={{ left: '50%', top: '83%', transform: 'translate(-50%,-50%) translateZ(85px)' }}><TelemetryCard type="vault" /></div>
          </div>
        </div>
      </div></div>
    </div>
  );
}
