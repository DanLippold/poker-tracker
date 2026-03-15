type Status = 'active' | 'paused' | 'completed';

const statusStyles: Record<Status, string> = {
  active: 'bg-[#1a3a25] text-[var(--color-accent)] border-[#2ea04340]',
  paused: 'bg-[#3a2f0a] text-amber-400 border-amber-400/20',
  completed: 'bg-[var(--color-border)]/30 text-[var(--color-muted)] border-[var(--color-border)]',
};

const statusLabels: Record<Status, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
};

interface BadgeProps {
  status: Status;
}

export function Badge({ status }: BadgeProps) {
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded border ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}
