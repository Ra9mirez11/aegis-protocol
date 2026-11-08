import { type ReactNode, useCallback, useState } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  spotlight?: boolean;
  tilt3d?: boolean;
  borderBeam?: boolean;
}

export function Card({
  children,
  className = '',
  hover = true,
  delay = 0,
  spotlight = true,
  tilt3d = false,
  borderBeam = false,
}: CardProps) {
  const [spotlightPos, setSpotlightPos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (spotlight) setSpotlightPos({ x, y });

      if (tilt3d) {
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const maxTilt = 4;
        setTilt({
          rx: -((y - cy) / cy) * maxTilt,
          ry: ((x - cx) / cx) * maxTilt,
        });
      }
    },
    [spotlight, tilt3d]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rx: 0, ry: 0 });
  }, []);

  const spotlightStyle = spotlight
    ? ({
        ['--spotlight-radial' as string]: `radial-gradient(450px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(16, 185, 129, 0.12), transparent 40%)`,
      } as React.CSSProperties)
    : {};

  const baseClass = spotlight
    ? 'spotlight-card noise-overlay'
    : `glass-card ${hover ? 'glass-card-hover' : ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`${baseClass} ${borderBeam ? 'border-beam' : ''} rounded-xl ${className}`}
      style={spotlightStyle}
    >
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-[4]"
        style={
          tilt3d
            ? {
                transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.12s ease-out',
              }
            : undefined
        }
      >
        {children}
      </div>
    </motion.div>
  );
}
