import React from 'react';
import { motion } from 'framer-motion';

interface AegisLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function AegisLogo({ size = 'md', showText = true }: AegisLogoProps) {
  const dimensions = {
    sm: { box: 34, title: 'text-base', sub: 'text-[9px]' },
    md: { box: 42, title: 'text-xl', sub: 'text-[10px]' },
    lg: { box: 56, title: 'text-2xl', sub: 'text-xs' },
  }[size];

  return (
    <motion.div
      className="group inline-flex items-center gap-3 select-none cursor-pointer"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      {/* 3D Isometric Faceted Aegis Crest */}
      <motion.div
        style={{
          width: dimensions.box,
          height: dimensions.box,
          perspective: 800,
        }}
        variants={{
          rest: { rotateX: 0, rotateY: 0, scale: 1 },
          hover: { rotateX: -10, rotateY: 14, scale: 1.06 },
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
        className="relative flex-shrink-0 flex items-center justify-center"
      >
        {/* Ambient 3D Backlight Glow */}
        <div
          className="absolute inset-0 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300 blur-md pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 50% 35%, rgba(16, 185, 129, 0.45), rgba(6, 182, 212, 0.25) 60%, transparent 80%)',
          }}
        />

        {/* Metallic Obsidian 3D Pedestal Base */}
        <div
          className="relative w-full h-full rounded-xl flex items-center justify-center overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, #18181b 0%, #09090b 55%, #052e22 100%)',
            boxShadow:
              'inset 0 1px 1px rgba(255, 255, 255, 0.22), inset 0 -2px 4px rgba(0, 0, 0, 0.85), 0 8px 20px -4px rgba(0, 0, 0, 0.7), 0 0 15px -3px rgba(16, 185, 129, 0.35)',
            border: '1px solid rgba(52, 211, 153, 0.28)',
          }}
        >
          {/* Top Specular Glint */}
          <div
            className="absolute top-0 inset-x-1 h-px pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)',
            }}
          />

          {/* Multi-Faceted 3D Shield & Isometric Core SVG */}
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[82%] h-[82%] drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
          >
            <defs>
              {/* Left Light Facet (Emerald Chrome) */}
              <linearGradient id="aegisFacetLeft" x1="12" y1="6" x2="32" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6ee7b7" />
                <stop offset="45%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#065f46" />
              </linearGradient>

              {/* Right Shadowed Facet (Cyber Cyan / Deep Teal) */}
              <linearGradient id="aegisFacetRight" x1="32" y1="6" x2="52" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="50%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>

              {/* Inner Dark Armor Recess */}
              <linearGradient id="aegisInnerArmor" x1="32" y1="12" x2="32" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#090d16" />
                <stop offset="100%" stopColor="#022c22" />
              </linearGradient>

              {/* Isometric Core Top Face */}
              <linearGradient id="coreTop" x1="22" y1="20" x2="42" y2="32" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ecfdf5" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>

              {/* Isometric Core Left Face */}
              <linearGradient id="coreLeft" x1="20" y1="26" x2="32" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>

              {/* Isometric Core Right Face */}
              <linearGradient id="coreRight" x1="32" y1="26" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" />
              </linearGradient>

              {/* Specular Edge Highlight */}
              <linearGradient id="edgeGlow" x1="32" y1="4" x2="32" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.7" />
              </linearGradient>
            </defs>

            {/* Outer 3D Shield — Left Lit Wing */}
            <path
              d="M32 5L10 14.5V31.5C10 45.2 19.4 55.4 32 60V5Z"
              fill="url(#aegisFacetLeft)"
            />

            {/* Outer 3D Shield — Right Shaded Wing */}
            <path
              d="M32 5L54 14.5V31.5C54 45.2 44.6 55.4 32 60V5Z"
              fill="url(#aegisFacetRight)"
            />

            {/* Beveled Inner Shield Cutout (Creates 3D Rim Depth) */}
            <path
              d="M32 10.5L15 18V31.2C15 41.8 22.2 50.1 32 54.2C41.8 50.1 49 41.8 49 31.2V18L32 10.5Z"
              fill="url(#aegisInnerArmor)"
              stroke="url(#edgeGlow)"
              strokeWidth="1"
            />

            {/* Inner 3D Isometric Hexagonal Vault Cube */}
            {/* Cube Top Diamond */}
            <polygon
              points="32,18 43,24.5 32,31 21,24.5"
              fill="url(#coreTop)"
            />
            {/* Cube Left Face */}
            <polygon
              points="21,24.5 32,31 32,44.5 21,38"
              fill="url(#coreLeft)"
            />
            {/* Cube Right Face */}
            <polygon
              points="43,24.5 32,31 32,44.5 43,38"
              fill="url(#coreRight)"
            />

            {/* Center Vertical Specular Spine */}
            <line
              x1="32"
              y1="5"
              x2="32"
              y2="60"
              stroke="#ffffff"
              strokeOpacity="0.35"
              strokeWidth="0.9"
            />

            {/* Outer Crisp Bevel Rim */}
            <path
              d="M32 5L10 14.5V31.5C10 45.2 19.4 55.4 32 60C44.6 55.4 54 45.2 54 31.5V14.5L32 5Z"
              stroke="url(#edgeGlow)"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>

      {/* 3D Metallic Typography & Subtitle */}
      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className={`flex items-baseline gap-1.5 font-extrabold tracking-tight ${dimensions.title}`}>
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(180deg, #ffffff 0%, #f4f4f5 55%, #a1a1aa 100%)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))',
              }}
            >
              AEGIS
            </span>
            <span
              className="bg-clip-text text-transparent font-bold"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #6ee7b7 0%, #10b981 45%, #22d3ee 100%)',
                filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.28))',
              }}
            >
              PROTOCOL
            </span>
          </div>

          {size !== 'sm' && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
              <span
                className={`font-mono uppercase tracking-[0.22em] text-zinc-400/90 font-medium ${dimensions.sub}`}
              >
                ZERO-KNOWLEDGE SUITE
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default AegisLogo;