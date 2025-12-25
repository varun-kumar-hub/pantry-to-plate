import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getRecipeById, Recipe } from '@/data/recipes';
import { 
  ArrowLeft, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      const foundRecipe = getRecipeById(id);
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        navigate('/search');
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    if (user && recipe) {
      checkFavourite();
    }
  }, [user, recipe]);

  const checkFavourite = async () => {
    if (!user || !recipe) return;

    const { data } = await supabase
      .from('favourite_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id)
      .maybeSingle();

    setIsFavourite(!!data);
  };

  const toggleFavourite = async () => {
    if (!user || !recipe) return;

    if (isFavourite) {
      await supabase
        .from('favourite_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id);

      setIsFavourite(false);
      toast({
        title: 'Removed from favourites',
        description: `${recipe.name} has been removed from your favourites.`,
      });
    } else {
      await supabase.from('favourite_recipes').insert([{
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        recipe_data: JSON.parse(JSON.stringify(recipe)),
      }]);

      setIsFavourite(true);
      toast({
        title: 'Added to favourites',
        description: `${recipe.name} has been added to your favourites.`,
      });
    }
  };

  const addToMealPlan = async () => {
    if (!user || !recipe || !selectedDay || !selectedMeal) {
      toast({
        title: 'Select day and meal',
        description: 'Please select both a day and meal type.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await supabase.from('meal_plans').upsert([{
      user_id: user.id,
      day_of_week: selectedDay,
      meal_type: selectedMeal,
      recipe_id: recipe.id,
      recipe_name: recipe.name,
      recipe_data: JSON.parse(JSON.stringify(recipe)),
    }], {
      onConflict: 'user_id,day_of_week,meal_type',
    });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add to meal plan. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Added to meal plan!',
        description: `${recipe.name} added to ${selectedDay}'s ${selectedMeal}.`,
      });
      setShowPlannerModal(false);
      setSelectedDay('');
      setSelectedMeal('');
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  if (authLoading || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const difficultyColor = {
    Easy: 'bg-primary/10 text-primary',
    Medium: 'bg-golden/20 text-amber-700',
    Hard: 'bg-accent/10 text-accent',
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left column - Image and basic info */}
          <div>
            <div className="relative rounded-2xl overflow-hidden shadow-elevated mb-6">
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-3 py-1 rounded-full text-sm font-medium", difficultyColor[recipe.difficulty])}>
                    {recipe.difficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-background/90 text-foreground">
                    {recipe.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <Button
                variant={isFavourite ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={toggleFavourite}
              >
                <Heart className={cn("h-5 w-5", isFavourite && "fill-current")} />
                {isFavourite ? 'Saved' : 'Save to Favourites'}
              </Button>
              <Button
                variant="default"
                className="flex-1 gap-2"
                onClick={() => setShowPlannerModal(true)}
              >
                <Calendar className="h-5 w-5" />
                Add to Meal Plan
              </Button>
            </div>

            {/* Ingredients */}
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <span className="text-foreground capitalize">{ingredient.name}</span>
                    <span className="text-muted-foreground">{ingredient.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right column - Details and instructions */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              {recipe.name}
            </h1>
            
            <p className="text-lg text-muted-foreground mb-6">
              {recipe.description}
            </p>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>{recipe.cookingTime} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>{recipe.servings} servings</span>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Step-by-Step Instructions
              </h2>
              <div className="space-y-4">
                {recipe.instructions.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all duration-200",
                      completedSteps.has(index)
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border hover:border-primary/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors",
                        completedSteps.has(index)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {completedSteps.has(index) ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-medium">{index + 1}</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-foreground pt-1",
                        completedSteps.has(index) && "line-through opacity-60"
                      )}>
                        {step}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {completedSteps.size === recipe.instructions.length && (
                <div className="mt-6 p-4 rounded-xl bg-primary/10 text-center">
                  <p className="text-primary font-medium">
                    🎉 Congratulations! You've completed all the steps!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add to Meal Plan Modal */}
      <Dialog open={showPlannerModal} onOpenChange={setShowPlannerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Add to Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map(day => (
                    <SelectItem key={day} value={day} className="capitalize">
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Meal</label>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a meal" />
                </SelectTrigger>
                <SelectContent>
                  {MEALS.map(meal => (
                    <SelectItem key={meal} value={meal} className="capitalize">
                      {meal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button onClick={addToMealPlan} className="w-full" size="lg">
              Add to Plan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
