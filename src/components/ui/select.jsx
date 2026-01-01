import React from 'react';
import { cn } from '../../lib/utils.js';

export const Select = React.forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
