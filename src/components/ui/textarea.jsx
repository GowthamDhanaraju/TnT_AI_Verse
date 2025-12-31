import React from 'react';
import { cn } from '../../lib/utils.js';

export const Textarea = React.forwardRef(function Textarea({ className = '', ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-md border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/60',
        'min-h-[120px] resize-vertical',
        className
      )}
      {...props}
    />
  );
});
