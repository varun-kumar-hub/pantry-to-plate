import { ChefHat, Loader2 } from 'lucide-react';

export interface DishVariety {
  variety_name: string;
  short_description: string;
  image_url?: string;
}

interface VarietyCardProps {
  variety: DishVariety;
  onClick: () => void;
  isLoadingImage?: boolean;
}

export function VarietyCard({ variety, onClick, isLoadingImage }: VarietyCardProps) {
  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-xl bg-card border border-border/50 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 hover:border-primary/30 cursor-pointer"
    >
      {/* Image section */}
      <div className="aspect-[16/9] overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
        {variety.image_url ? (
          <img 
            src={variety.image_url} 
            alt={variety.variety_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : isLoadingImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-primary/40" />
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
          {variety.variety_name}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {variety.short_description}
        </p>
      </div>
    </div>
  );
}
