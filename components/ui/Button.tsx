'use client';

import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[var(--color-accent)] text-white hover:opacity-90',
  secondary: 'bg-[var(--color-surface)] text-[var(--color-foreground)] border border-[var(--color-border)] hover:border-[var(--color-muted)]',
  danger: 'bg-[var(--color-danger)] text-white hover:opacity-90',
  ghost: 'text-[var(--color-muted)] hover:text-[var(--color-foreground)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded-md font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    />
  );
}
