import { Clock, Users, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AIGeneratedRecipe {
  recipe_name: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  image_url?: string;
}

interface AIRecipeCardProps {
  recipe: AIGeneratedRecipe;
  onClick: () => void;
  isLoadingImage?: boolean;
}

export function AIRecipeCard({ recipe, onClick, isLoadingImage }: AIRecipeCardProps) {
  const difficultyColor: Record<string, string> = {
    easy: 'bg-primary/10 text-primary',
    medium: 'bg-golden/20 text-amber-700',
    hard: 'bg-accent/10 text-accent',
  };

  const getDifficultyClass = (difficulty: string) => {
    return difficultyColor[difficulty.toLowerCase()] || 'bg-muted text-muted-foreground';
  };

  return (
    <div
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer"
    >
      {/* Image or placeholder */}
      <div className="aspect-[4/3] overflow-hidden">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.recipe_name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary flex items-center justify-center">
            {isLoadingImage ? (
              <div className="text-center p-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground font-medium">Generating image...</p>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground font-medium">AI Generated</p>
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", getDifficultyClass(recipe.difficulty))}>
            {recipe.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-background mb-2 line-clamp-1">
          {recipe.recipe_name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-background/80">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cooking_time_minutes} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
