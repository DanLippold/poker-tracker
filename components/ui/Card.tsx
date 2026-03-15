import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className = '', ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg ${className}`}
    />
  );
}
