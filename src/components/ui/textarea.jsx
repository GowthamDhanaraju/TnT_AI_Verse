import React from 'react';
import { cn } from '../../lib/utils.js';

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-[var(--hairline)] bg-[var(--card)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] shadow-inner focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/70',
        'min-h-[120px] resize-vertical',
        className
      )}
      {...props}
    />
  );
});
