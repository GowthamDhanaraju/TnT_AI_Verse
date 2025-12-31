import React from 'react';
import { cn } from '../../lib/utils.js';

export function Label({ className = '', children, ...props }) {
  return (
    <label className={cn('text-sm font-medium text-[var(--muted)]', className)} {...props}>
      {children}
    </label>
  );
}
