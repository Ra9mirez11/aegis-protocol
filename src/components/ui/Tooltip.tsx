import { type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  return (
    <span className="tooltip-wrapper">
      {children}
      <span className="tooltip-content">{content}</span>
    </span>
  );
}
