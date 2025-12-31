import React from 'react';
import { cn } from '../../lib/utils.js';

const variants = {
  default: 'bg-[var(--accent)] text-[#0b1224] border border-transparent hover:opacity-90',
  ghost: 'bg-[var(--card)] text-[var(--text)] border border-[var(--border)] hover:border-[var(--accent)]',
};

export const Button = React.forwardRef(function Button(
  { className = '', variant = 'default', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold transition-colors',
        variants[variant] || variants.default,
        className
      )}
      {...props}
    />
  );
});
