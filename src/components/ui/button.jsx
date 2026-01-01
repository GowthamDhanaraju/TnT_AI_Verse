import React from 'react';
import { cn } from '../../lib/utils.js';

const variants = {
  default:
    'bg-gradient-to-r from-[var(--accent)] to-[var(--accent-strong)] text-[#04101a] border border-transparent shadow-[0_10px_30px_rgba(34,211,238,0.35)] hover:brightness-105',
  ghost:
    'bg-[var(--card)] text-[var(--text)] border border-[var(--hairline)] hover:border-[var(--accent)] hover:bg-[var(--panel)]',
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-all duration-200',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
