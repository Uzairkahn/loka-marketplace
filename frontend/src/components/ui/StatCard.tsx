import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: 'amber' | 'teal';
}

export default function StatCard({ label, value, icon: Icon, accent = 'amber' }: StatCardProps) {
  return (
    <div className="rounded-card border border-white/10 bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">{label}</p>
        <Icon
          className={`h-4 w-4 ${accent === 'amber' ? 'text-amber' : 'text-teal-soft'}`}
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 font-display text-2xl text-ink-primary">{value}</p>
    </div>
  );
}
