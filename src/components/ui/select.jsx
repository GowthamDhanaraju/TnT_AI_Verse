import React from 'react';
import { cn } from '../../lib/utils.js';

export const Select = React.forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
