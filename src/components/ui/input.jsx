import React from 'react';
import { cn } from '../../lib/utils.js';

export const Input = React.forwardRef(function Input({ className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70',
        className
      )}
      {...props}
    />
  );
});
