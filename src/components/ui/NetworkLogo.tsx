import type { NetworkConfig } from '@/types';

interface NetworkLogoProps {
  network: NetworkConfig;
  size?: number;
}

function Logo({ id, color }: { id: number; color: string }) {
  switch (id) {
    case 1:
      return (
        <>
          <polygon points="12,2 18,9 12,12 6,9" fill="#fff" fillOpacity=".95" />
          <polygon points="12,13 18,10 12,22" fill={color} />
          <polygon points="12,13 6,10 12,22" fill={color} fillOpacity=".7" />
          <polygon points="12,2 18,9 12,12 6,9" fill="none" stroke={color} strokeWidth=".4" />
        </>
      );
    case 8453:
      return (
        <>
          <circle cx="12" cy="12" r="11" fill={color} />
          <path d="M5 13.5a7 7 0 0 1 14 0" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M5.5 13.5a6.5 6.5 0 0 0 13 0" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity=".6" />
          <circle cx="12" cy="13.5" r="1" fill="#fff" />
        </>
      );
    case 42161:
      return (
        <>
          <polygon points="12,2 20,6.5 20,17.5 12,22 4,17.5 4,6.5" fill={color} fillOpacity=".15" stroke={color} strokeWidth="1.2" />
          <path d="M8 6.5 L13 12 L8 17.5" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 6.5 L9 12 L14 17.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 10:
      return (
        <>
          <circle cx="12" cy="12" r="10.5" fill={color} />
          <text x="12" y="15.5" textAnchor="middle" fontSize="8" fontWeight="800" fontStyle="italic" fill="#fff" fontFamily="system-ui">OP</text>
        </>
      );
    case 137:
      return (
        <>
          <polygon points="9,2 15,6 15,12 9,16 3,12 3,6" fill={color} />
          <polygon points="15,8 21,12 21,18 15,22 9,18 9,12" fill={color} fillOpacity=".55" />
        </>
      );
    case 0:
      return (
        <>
          <defs>
            <linearGradient id="sol-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#9945ff" />
              <stop offset="100%" stopColor="#14f195" />
            </linearGradient>
          </defs>
          <polygon points="7,6 19,6 21,9 9,9" fill="url(#sol-g)" />
          <polygon points="9,9 21,9 19,12 7,12" fill="url(#sol-g)" fillOpacity=".8" />
          <polygon points="7,12 19,12 21,15 9,15" fill="url(#sol-g)" />
          <polygon points="9,15 21,15 19,18 7,18" fill="url(#sol-g)" fillOpacity=".8" />
        </>
      );
    case 43114:
      return (
        <>
          <circle cx="12" cy="12" r="10.5" fill={color} />
          <path d="M6.5 16.5L9.5 8L12.5 16.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12.5 16.5L15 12.5L17.5 16.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    case 56:
      return (
        <>
          <polygon points="12,3 17,12 12,21 7,12" fill={color} />
          <polygon points="4,6 7,8 4,10" fill={color} fillOpacity=".75" />
          <polygon points="20,6 17,8 20,10" fill={color} fillOpacity=".75" />
          <polygon points="4,14 7,16 4,18" fill={color} fillOpacity=".75" />
          <polygon points="20,14 17,16 20,18" fill={color} fillOpacity=".75" />
        </>
      );
    case 324:
      return (
        <>
          <path d="M4 9L9 4L9 8L14 4" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M20 15L15 20L15 16L10 20" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="1.4" fill={color} />
        </>
      );
    case 59144:
      return (
        <>
          <line x1="6" y1="18" x2="18" y2="6" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="18" cy="6" r="2.4" fill={color} />
          <circle cx="6" cy="18" r="1.4" fill={color} fillOpacity=".6" />
        </>
      );
    case 534352:
      return (
        <>
          <path d="M5 16a7 7 0 0 1 14 0" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <path d="M8 16a4 4 0 0 1 8 0" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" opacity=".7" />
          <circle cx="12" cy="13" r="1.6" fill={color} />
        </>
      );
    case 81457:
      return (
        <>
          <circle cx="12" cy="12" r="10.5" fill="#0a0a0a" stroke={color} strokeWidth="1" />
          <polygon points="13,3 6,13 11,13 9,21 18,9 13,9" fill={color} />
        </>
      );
    case 146:
      return (
        <>
          <defs>
            <linearGradient id="sonic-g" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff4444" />
              <stop offset="100%" stopColor="#f60d39" />
            </linearGradient>
          </defs>
          <circle cx="12" cy="12" r="10.5" fill="none" stroke="url(#sonic-g)" strokeWidth="2" strokeDasharray="3 2" />
          <path d="M5 12c3-4 7-4 10 0M7 15c2-2 4-2 6 0" fill="none" stroke="url(#sonic-g)" strokeWidth="1.8" strokeLinecap="round" />
        </>
      );
    case 5000:
      return (
        <>
          <polygon points="12,3 20,8 20,16 12,21 4,16 4,8" fill={color} fillOpacity=".18" stroke={color} strokeWidth="1.2" />
          <path d="M12 7L16 10V14L12 17L8 14V10L12 7Z" fill={color} />
        </>
      );
    case 80094:
      return (
        <>
          <polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill={color} fillOpacity=".2" stroke={color} strokeWidth="1.2" />
          <circle cx="12" cy="9" r="2.2" fill={color} />
          <path d="M8 14L12 18L16 14" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </>
      );
    default:
      return <circle cx="12" cy="12" r="10" fill={color} fillOpacity=".25" stroke={color} strokeWidth="1.2" />;
  }
}

export function NetworkLogo({ network, size = 20 }: NetworkLogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <Logo id={network.id} color={network.logoColor} />
    </svg>
  );
}
