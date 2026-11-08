import { motion } from 'framer-motion';
import { Card } from './ui/Card';

export function BentoHowItWorks() {
  return (
    <div id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20 scroll-mt-20">
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 mb-4"
        >
          <span className="w-2 h-2 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />
          <span className="text-xs font-mono text-zinc-300 tracking-wider">ARCHITECTURE · 3-STAGE ZERO-KNOWLEDGE PIPELINE</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3"
        >
          Three Autonomous Engines.
          <br />
          <span className="gradient-text">One Impenetrable Enclave.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm text-zinc-500 max-w-2xl mx-auto leading-relaxed"
        >
          Client-side asset consolidation, bytecode allowance firewalling, and cryptographic Shamir estate continuity — engineered for zero-custody execution.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(280px,auto)]">
        <Card spotlight tilt3d className="p-6 md:col-span-1 md:row-span-2" delay={0}>
          <BentoCard01 />
        </Card>
        <Card spotlight tilt3d className="p-6 md:col-span-2" delay={0.1}>
          <BentoCard02 />
        </Card>
        <Card spotlight tilt3d className="p-6 md:col-span-2" delay={0.2}>
          <BentoCard03 />
        </Card>
      </div>
    </div>
  );
}

function FunnelBadge() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
        <polygon points="20,4 34,12 20,20 6,12" fill="#34d399" fillOpacity=".9" />
        <polygon points="10,15 20,20 20,34 14,28" fill="#10b981" />
        <polygon points="30,15 20,20 20,34 26,28" fill="#06b6d4" />
        <circle cx="20" cy="12" r="2" fill="#fff" />
      </svg>
    </div>
  );
}

function ShieldBadge() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
        <path d="M20 4 L33 10 V20 C33 28 27 34 20 36 C13 34 7 28 7 20 V10 L20 4 Z" fill="#06b6d4" fillOpacity=".25" stroke="#22d3ee" strokeWidth="1.8" />
        <path d="M20 4 L33 10 V20 C33 28 27 34 20 36 V4 Z" fill="#0891b2" fillOpacity=".4" />
        <path d="M14 20 L18 24 L27 15" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function VaultBadge() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 shadow-[0_0_20px_rgba(52,211,153,0.25)] flex items-center justify-center shrink-0">
      <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none" aria-hidden="true">
        <polygon points="20,4 33,11 33,27 20,34 7,27 7,11" fill="#10b981" fillOpacity=".22" stroke="#34d399" strokeWidth="1.6" />
        <polygon points="20,10 28,15 20,20 12,15" fill="#6ee7b7" />
        <polygon points="12,17 20,22 20,30 12,25" fill="#10b981" />
        <polygon points="28,17 20,22 20,30 28,25" fill="#22d3ee" />
      </svg>
    </div>
  );
}

function BentoCard01() {
  const taxRows = [
    { sym: 'SCM', color: '#f7a30a', basis: '$620.00', loss: '$500.00' },
    { sym: 'RUG', color: '#ff4444', basis: '$1,400.00', loss: '$1,200.00' },
    { sym: 'HNY', color: '#fbbf24', basis: '$95.00', loss: '$75.00' },
    { sym: 'MNX', color: '#8247e5', basis: '$340.00', loss: '$300.00' },
  ];
  const totalLoss = taxRows.reduce((s, r) => s + parseFloat(r.loss.replace('$', '').replace(',', '')), 0);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-start gap-3">
        <FunnelBadge />
        <div className="flex-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-1.5">
            <span className="text-[9px] font-mono font-bold text-emerald-300 tracking-wider">STAGE 01 · ASSET &amp; TAX ENGINE</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">Sweep Dust &amp; Harvest Losses</h3>
        </div>
      </div>

      {/* 3D Funnel SVG Diagram */}
      <div className="rounded-xl bg-black/40 border border-white/[0.06] p-2">
        <svg viewBox="0 0 280 120" className="w-full h-28" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="funnel-path-1" x1="40" y1="20" x2="140" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34d399" stopOpacity=".8" /><stop offset="1" stopColor="#34d399" stopOpacity=".15" />
            </linearGradient>
            <linearGradient id="funnel-path-2" x1="40" y1="50" x2="140" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" stopOpacity=".8" /><stop offset="1" stopColor="#06b6d4" stopOpacity=".15" />
            </linearGradient>
            <linearGradient id="funnel-path-3" x1="40" y1="80" x2="140" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" stopOpacity=".8" /><stop offset="1" stopColor="#fbbf24" stopOpacity=".15" />
            </linearGradient>
            <linearGradient id="funnel-path-4" x1="40" y1="105" x2="140" y2="60" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f43f5e" stopOpacity=".8" /><stop offset="1" stopColor="#f43f5e" stopOpacity=".15" />
            </linearGradient>
          </defs>
          {/* Input nodes */}
          <circle cx="40" cy="20" r="9" fill="#f7a30f22" stroke="#f7a30f" strokeWidth="1" />
          <text x="40" y="23" textAnchor="middle" fontSize="7" fontWeight="700" fill="#f7a30f" fontFamily="monospace">SHB</text>
          <circle cx="40" cy="50" r="9" fill="#06b6d422" stroke="#06b6d4" strokeWidth="1" />
          <text x="40" y="53" textAnchor="middle" fontSize="7" fontWeight="700" fill="#06b6d4" fontFamily="monospace">PEP</text>
          <circle cx="40" cy="80" r="9" fill="#3d8c4022" stroke="#3d8c40" strokeWidth="1" />
          <text x="40" y="83" textAnchor="middle" fontSize="7" fontWeight="700" fill="#3d8c40" fontFamily="monospace">SCM</text>
          <circle cx="40" cy="105" r="9" fill="#ff444422" stroke="#ff4444" strokeWidth="1" />
          <text x="40" y="108" textAnchor="middle" fontSize="7" fontWeight="700" fill="#ff4444" fontFamily="monospace">RUG</text>
          {/* Laser paths */}
          <path d="M49 20 L131 55" stroke="url(#funnel-path-1)" strokeWidth="1.5" strokeDasharray="4 3" className="beam-pulse" />
          <path d="M49 50 L131 58" stroke="url(#funnel-path-2)" strokeWidth="1.5" strokeDasharray="4 3" className="beam-pulse" />
          <path d="M49 80 L131 62" stroke="url(#funnel-path-3)" strokeWidth="1.5" strokeDasharray="4 3" className="beam-pulse" />
          <path d="M49 105 L131 65" stroke="url(#funnel-path-4)" strokeWidth="1.5" strokeDasharray="4 3" className="beam-pulse" />
          {/* Animated particles */}
          <circle r="2.5" fill="#34d399"><animateMotion dur="2s" repeatCount="indefinite" path="M49 20 L131 55" /></circle>
          <circle r="2.5" fill="#22d3ee"><animateMotion dur="2.4s" repeatCount="indefinite" path="M49 50 L131 58" /></circle>
          <circle r="2.5" fill="#fbbf24"><animateMotion dur="2.1s" repeatCount="indefinite" path="M49 80 L131 62" /></circle>
          <circle r="2.5" fill="#f43f5e"><animateMotion dur="2.6s" repeatCount="indefinite" path="M49 105 L131 65" /></circle>
          {/* Central 3D prism */}
          <polygon points="140,45 158,53 158,67 140,75 122,67 122,53" fill="rgba(16,185,129,.15)" stroke="#34d399" strokeWidth="1.2" />
          <polygon points="140,49 154,56 140,63 126,56" fill="#6ee7b7" />
          <polygon points="126,58 140,65 140,72 126,65" fill="#10b981" />
          <polygon points="154,58 140,65 140,72 154,65" fill="#06b6d4" />
          {/* Output paths */}
          <path d="M158 55 L220 30" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity=".5" />
          <path d="M158 65 L220 90" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity=".5" />
          <circle r="2" fill="#34d399"><animateMotion dur="1.8s" repeatCount="indefinite" path="M158 55 L220 30" /></circle>
          <circle r="2" fill="#22d3ee"><animateMotion dur="2s" repeatCount="indefinite" path="M158 65 L220 90" /></circle>
          {/* Output badges */}
          <rect x="220" y="22" width="55" height="16" rx="8" fill="#10b9811a" stroke="#34d399" strokeWidth=".8" />
          <text x="247" y="33" textAnchor="middle" fontSize="7" fontWeight="700" fill="#34d399" fontFamily="monospace">+0.084 ETH</text>
          <rect x="220" y="82" width="55" height="16" rx="8" fill="#f43f5e1a" stroke="#f43f5e" strokeWidth=".8" />
          <text x="247" y="93" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fb7185" fontFamily="monospace">0x00..dEaD</text>
        </svg>
      </div>

      {/* IRS Tax Ledger */}
      <div className="rounded-xl bg-gradient-to-b from-white/[0.04] to-white/[0.015] border border-white/10 p-3.5 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-bold text-zinc-400 tracking-wider">IRS FORM 8949 / EU TAX LEDGER</span>
          <span className="px-2 py-0.5 rounded-full text-[8px] font-mono font-bold bg-accent-500/15 text-accent-400 border border-accent-500/25">CSV &amp; PDF READY</span>
        </div>
        <div className="space-y-2 flex-1">
          {taxRows.map((row, i) => (
            <motion.div
              key={row.sym}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-2.5 text-[10px] font-mono"
            >
              <span className="monogram-badge w-5 h-5 text-[7px]" style={{ backgroundColor: `${row.color}22`, color: row.color }}>{row.sym}</span>
              <span className="text-zinc-500 flex-1">Cost basis {row.basis} → $0.00</span>
              <span className="text-rose-400 font-bold">-${row.loss}</span>
            </motion.div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-white/10">
          <span className="text-[10px] font-mono font-bold text-zinc-400">TOTAL HARVESTED LOSS</span>
          <span className="text-sm font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-emerald-400">-${totalLoss.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-white/5">
          <span className="text-[8px] font-mono text-zinc-600">SHA-256 PROOF · 0x8f4e...91c2</span>
        </div>
      </div>
    </div>
  );
}

function BentoCard02() {
  const rows = [
    { sym: 'USC', label: 'USDC', color: '#2775ca', spender: 'Uniswap V2', addr: '0x7a..e4', risk: 'CRITICAL' },
    { sym: 'LNK', label: 'LINK', color: '#2a5ada', spender: 'Unverified Router', addr: '0x3b..1c', risk: 'CRITICAL' },
    { sym: 'UNI', label: 'UNI', color: '#ff007a', spender: 'Bridge Proxy', addr: '0x4a..8f', risk: 'CRITICAL' },
    { sym: 'PEP', label: 'PEPE', color: '#3d8c40', spender: 'Drainer Risk', addr: '0x9f..1a', risk: 'CRITICAL' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-start gap-3">
        <ShieldBadge />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-mono font-bold text-cyan-300 tracking-wider">STAGE 02 · BYTECODE FIREWALL</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[.04] border border-white/[.08] text-[9px] font-mono text-zinc-400">SELECTOR 0x095ea7b3 → 0x00</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">Approval Sentinel &amp; Drainer Firewall</h3>
        </div>
      </div>

      {/* Threat Matrix Table */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden flex-1">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 px-3 py-2 bg-white/[0.03] text-[9px] font-mono text-zinc-600 uppercase tracking-wider">
          <span>Token</span><span>Spender</span><span>Allowance</span><span className="text-right">Status</span>
        </div>
        {rows.map((row, i) => (
          <motion.div
            key={row.sym}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.08 }}
            className="grid grid-cols-[auto_1fr_auto_auto] gap-2 px-3 py-2.5 items-center text-[11px] font-mono border-t border-white/[0.04]"
          >
            <div className="flex items-center gap-2">
              <span className="monogram-badge w-6 h-6 text-[8px]" style={{ backgroundColor: `${row.color}22`, color: row.color }}>{row.sym}</span>
              <span className="text-zinc-300 font-semibold">{row.label}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-zinc-400 text-[10px]">{row.spender}</span>
              <span className="text-zinc-600 text-[9px]">{row.addr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-rose-400 line-through text-[9px]">{row.risk} 2²⁵⁶-1</span>
              <span className="text-cyber-400 font-bold text-[10px]">→ 0x00</span>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-500/15 border border-accent-500/25 text-accent-400 text-[9px] font-bold">
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                REVOKED
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom telemetry */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/[.03] border border-white/[.06]">
        <span className="text-[10px] font-mono text-zinc-500">BATCH CALLDATA EXECUTION · 1 TRANSACTION</span>
        <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-accent-400">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />
          +36 HEALTH SCORE BOOST
        </span>
      </div>
    </div>
  );
}

function BentoCard03() {
  const pipelineSteps = [
    { num: '01', label: 'PBKDF2-SHA256', sub: '150,000 Iterations · 128-bit Salt' },
    { num: '02', label: 'AES-256-GCM', sub: 'Client-Side Authenticated Cipher' },
    { num: '03', label: 'Shamir GF(256)', sub: '2-of-2 Polynomial Split' },
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-start gap-3">
        <VaultBadge />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-mono font-bold text-emerald-300 tracking-wider">STAGE 03 · ZERO-KNOWLEDGE INHERITANCE</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-white/[.04] border border-white/[.08] text-[9px] font-mono text-zinc-400">GF(2⁸) POLY 0x11B</span>
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">InheritSafe 2-of-2 Dead Man&apos;s Switch</h3>
        </div>
      </div>

      {/* 3-Stage Pipeline Bar */}
      <div className="flex items-center gap-2">
        {pipelineSteps.map((step, i) => (
          <div key={step.num} className="flex items-center gap-2 flex-1">
            <div className="flex-1 rounded-xl bg-white/[.04] border border-white/[.08] p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-mono font-bold text-accent-400">{step.num}</span>
                <span className="text-[10px] font-mono font-semibold text-white">{step.label}</span>
              </div>
              <p className="text-[8px] font-mono text-zinc-500 leading-tight">{step.sub}</p>
            </div>
            {i < pipelineSteps.length - 1 && (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0" aria-hidden="true">
                <path d="M3 10H16M12 5L17 10L12 15" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity=".5" />
                <circle r="1.5" fill="#34d399"><animateMotion dur="1.5s" repeatCount="indefinite" path="M3 10H16" /></circle>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Dual Share Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-3 border border-emerald-500/20 bg-emerald-500/[.05]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Share A</span>
            <span className="text-[8px] font-mono text-zinc-500">Beneficiary Key</span>
          </div>
          <p className="text-[9px] font-mono text-accent-400 mb-1.5">p(1) = a₀ ⊕ a₁</p>
          <div className="px-2 py-1 rounded bg-black/30 border border-white/5 mb-2">
            <span className="text-[9px] font-mono text-zinc-400">8f4a..c901</span>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-[8px] font-mono text-zinc-500">OFFLINE / ZERO RISK ALONE</span>
        </div>
        <div className="rounded-xl p-3 border border-cyan-500/20 bg-cyan-500/[.05]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-white">Share B</span>
            <span className="text-[8px] font-mono text-zinc-500">Time-Locked Switch</span>
          </div>
          <p className="text-[9px] font-mono text-cyber-400 mb-1.5">p(2) = a₀ ⊕ (a₁ · 2)</p>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/10 mb-1.5">
            <div className="h-full rounded-full" style={{ width: '92%', background: 'linear-gradient(90deg,#06b6d4,#34d399)' }} />
          </div>
          <span className="text-[8px] font-mono text-zinc-500">89d 23h remaining</span>
          <div className="mt-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-[8px] font-mono text-cyber-400">AUTO-RELEASE ON TIMEOUT</span>
          </div>
        </div>
      </div>

      {/* Full-width ECG Heartbeat */}
      <div className="rounded-xl bg-white/[.02] border border-white/[.06] p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 led-glow" style={{ color: '#10b981' }} />
            <span className="text-[10px] font-mono text-zinc-500 tracking-wider">HEARTBEAT MONITOR · ARMED &amp; ACTIVE</span>
          </div>
        </div>
        <svg viewBox="0 0 600 36" className="w-full h-9" fill="none" aria-hidden="true">
          <path
            d="M0,18 L40,18 L48,18 L53,8 L60,28 L66,18 L95,18 L105,18 L110,5 L117,31 L123,18 L155,18 L165,18 L170,9 L177,27 L183,18 L215,18 L225,18 L230,7 L237,29 L243,18 L275,18 L285,18 L290,6 L297,30 L303,18 L335,18 L345,18 L350,10 L357,26 L363,18 L395,18 L405,18 L410,5 L417,31 L423,18 L455,18 L465,18 L470,8 L477,28 L483,18 L515,18 L525,18 L530,7 L537,29 L543,18 L575,18 L585,18 L590,9 L597,27 L600,18"
            fill="none"
            stroke="#10b981"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle r="2.5" fill="#34d399">
            <animateMotion dur="3s" repeatCount="indefinite" path="M0,18 L40,18 L48,18 L53,8 L60,28 L66,18 L95,18 L105,18 L110,5 L117,31 L123,18 L155,18 L165,18 L170,9 L177,27 L183,18 L215,18 L225,18 L230,7 L237,29 L243,18 L275,18 L285,18 L290,6 L297,30 L303,18 L335,18 L345,18 L350,10 L357,26 L363,18 L395,18 L405,18 L410,5 L417,31 L423,18 L455,18 L465,18 L470,8 L477,28 L483,18 L515,18 L525,18 L530,7 L537,29 L543,18 L575,18 L585,18 L590,9 L597,27 L600,18" />
          </circle>
        </svg>
      </div>
    </div>
  );
}
