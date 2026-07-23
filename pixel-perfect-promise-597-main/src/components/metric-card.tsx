import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  loading?: boolean;
}

export function MetricCard({ title, value, icon: Icon, loading }: MetricCardProps) {
  return (
    <Card className="border-border/60 shadow-[var(--shadow-soft)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-lg">
      <CardContent className="flex items-center justify-between gap-3 p-4 sm:p-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground sm:text-3xl">
            {loading ? "…" : value}
          </p>
        </div>
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/15">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}
