import React from 'react';
import { cn } from '../../lib/utils.js';

export function Badge({ className = '', children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--card)] px-2 py-1 text-xs font-semibold text-[var(--text)]', className)}>
      {children}
    </span>
  );
}
