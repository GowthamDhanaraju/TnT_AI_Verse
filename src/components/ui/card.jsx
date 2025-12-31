import React from 'react';
import { cn } from '../../lib/utils.js';

export function Card({ className = '', children }) {
  return (
    <div className={cn('rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 shadow-none', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={cn('mb-2 flex items-start justify-between gap-2', className)}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h3 className={cn('text-base font-semibold leading-tight', className)}>{children}</h3>;
}

export function CardDescription({ className = '', children }) {
  return <p className={cn('text-sm text-[var(--muted)]', className)}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={cn('grid gap-3', className)}>{children}</div>;
}
