import { ChefHat } from 'lucide-react';

export interface DishVariety {
  variety_name: string;
  short_description: string;
}

interface VarietyCardProps {
  variety: DishVariety;
  onClick: () => void;
}

export function VarietyCard({ variety, onClick }: VarietyCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-card border border-border/50 p-5 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 cursor-pointer"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
          <ChefHat className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
            {variety.variety_name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {variety.short_description}
          </p>
        </div>
      </div>
    </div>
  );
}
