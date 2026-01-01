import React from 'react';
import { cn } from '../../lib/utils.js';

export function Badge({ className = '', children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--panel)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.06em] text-[var(--text)]', className)}>
      {children}
    </span>
  );
}
