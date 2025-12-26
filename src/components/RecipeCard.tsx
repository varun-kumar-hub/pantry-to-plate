import { Link } from 'react-router-dom';
import { Recipe } from '@/data/recipes';
import { Clock, Users, ChefHat, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RecipeCardProps {
  recipe: Recipe;
  isFavourite?: boolean;
  onToggleFavourite?: (recipe: Recipe) => void;
  onAddToPlanner?: (recipe: Recipe) => void;
  showActions?: boolean;
}

export function RecipeCard({
  recipe,
  isFavourite = false,
  onToggleFavourite,
  onAddToPlanner,
  showActions = true,
}: RecipeCardProps) {
  const difficultyColor = {
    Easy: 'bg-primary/10 text-primary',
    Medium: 'bg-golden/20 text-amber-700',
    Hard: 'bg-accent/10 text-accent',
  };

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
      </div>

      {showActions && onToggleFavourite && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavourite(recipe);
          }}
          className={cn(
            "absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 backdrop-blur-sm transition-all duration-200 hover:scale-110",
            isFavourite ? "text-accent" : "text-muted-foreground hover:text-accent"
          )}
        >
          <Heart className={cn("h-5 w-5", isFavourite && "fill-current")} />
        </button>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", difficultyColor[recipe.difficulty])}>
            {recipe.difficulty}
          </span>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-background/90 text-foreground">
            {recipe.category}
          </span>
        </div>
        <h3 className="font-display text-xl font-semibold text-background mb-2 line-clamp-1">
          {recipe.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-background/80">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{recipe.cookingTime} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{recipe.servings} servings</span>
          </div>
        </div>
      </div>

      <Link
        to={`/recipe/${recipe.id}`}
        state={{ recipeData: recipe }}
        className="absolute inset-0"
      >
        <span className="sr-only">View {recipe.name}</span>
      </Link>

      {showActions && onAddToPlanner && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              onAddToPlanner(recipe);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            Add to Plan
          </Button>
        </div>
      )}
    </div>
  );
}
