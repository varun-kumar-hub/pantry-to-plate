import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { useToast } from '@/hooks/use-toast';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { getRecipeById, Recipe } from '@/data/recipes';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Heart,
  Calendar,
  CheckCircle2,
  Sparkles,
  Loader2
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

interface AIGeneratedRecipe {
  recipe_name: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  image_url?: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

// Generate a unique ID for AI recipes based on name
const generateAIRecipeId = (name: string) => {
  return `ai-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
};

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useExternalAuth();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiRecipe, setAiRecipe] = useState<AIGeneratedRecipe | null>(null);
  const [aiRecipeId, setAiRecipeId] = useState<string>('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isAIRecipe = id === 'ai-generated';

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id) {
      if (isAIRecipe) {
        // Load AI recipe from localStorage
        const storedRecipe = localStorage.getItem('aiRecipe');
        if (storedRecipe) {
          const parsed = JSON.parse(storedRecipe);
          setAiRecipe(parsed);
          setAiRecipeId(generateAIRecipeId(parsed.recipe_name));
        } else {
          navigate('/search');
        }
      } else {
        const foundRecipe = getRecipeById(id);
        if (foundRecipe) {
          setRecipe(foundRecipe);
        } else {
          navigate('/search');
        }
      }
    }
  }, [id, navigate, isAIRecipe]);

  useEffect(() => {
    if (user && recipe) {
      checkFavourite(recipe.id);
    }
  }, [user, recipe]);

  useEffect(() => {
    if (user && aiRecipe && aiRecipeId) {
      checkAIFavourite();
    }
  }, [user, aiRecipe, aiRecipeId]);

  const checkFavourite = async (recipeId: string) => {
    if (!user) return;

    const { data } = await externalSupabase
      .from('favourite_recipes')
      .select('id')
      .eq('user_id', user.id)
      .eq('recipe_id', recipeId)
      .maybeSingle();

    setIsFavourite(!!data);
  };

  const checkAIFavourite = async () => {
    if (!user || !aiRecipe) return;

    // Check if any AI recipe with same name exists in favourites
    const { data } = await externalSupabase
      .from('favourite_recipes')
      .select('id, recipe_id')
      .eq('user_id', user.id)
      .eq('recipe_name', aiRecipe.recipe_name)
      .maybeSingle();

    if (data) {
      setAiRecipeId(data.recipe_id);
      setIsFavourite(true);
    } else {
      setIsFavourite(false);
    }
  };

  const toggleFavourite = async () => {
    if (!user) return;

    if (isAIRecipe && aiRecipe) {
      if (isFavourite) {
        await externalSupabase
          .from('favourite_recipes')
          .delete()
          .eq('user_id', user.id)
          .eq('recipe_name', aiRecipe.recipe_name);

        setIsFavourite(false);
        toast({
          title: 'Removed from favourites',
          description: `${aiRecipe.recipe_name} has been removed from your favourites.`,
        });
      } else {
        const recipeData = {
          ...aiRecipe,
          id: aiRecipeId,
          name: aiRecipe.recipe_name,
          cookingTime: aiRecipe.cooking_time_minutes,
          category: 'AI Generated',
          description: `AI-generated recipe for ${aiRecipe.recipe_name}`,
        };

        await externalSupabase.from('favourite_recipes').insert([{
          user_id: user.id,
          recipe_id: aiRecipeId,
          recipe_name: aiRecipe.recipe_name,
          recipe_data: recipeData,
        }]);

        setIsFavourite(true);
        toast({
          title: 'Added to favourites',
          description: `${aiRecipe.recipe_name} has been added to your favourites.`,
        });
      }
    } else if (recipe) {
      if (isFavourite) {
        await externalSupabase
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
        await externalSupabase.from('favourite_recipes').insert([{
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
    }
  };

  const addToMealPlan = async () => {
    if (!user || !selectedDay || !selectedMeal) {
      toast({
        title: 'Select day and meal',
        description: 'Please select both a day and meal type.',
        variant: 'destructive',
      });
      return;
    }

    let recipeId: string;
    let recipeName: string;
    let recipeData: any;

    if (isAIRecipe && aiRecipe) {
      recipeId = aiRecipeId;
      recipeName = aiRecipe.recipe_name;
      recipeData = {
        ...aiRecipe,
        id: aiRecipeId,
        name: aiRecipe.recipe_name,
        cookingTime: aiRecipe.cooking_time_minutes,
        category: 'AI Generated',
        description: `AI-generated recipe for ${aiRecipe.recipe_name}`,
      };
    } else if (recipe) {
      recipeId = recipe.id;
      recipeName = recipe.name;
      recipeData = JSON.parse(JSON.stringify(recipe));
    } else {
      return;
    }

    const { error } = await externalSupabase.from('meal_plans').upsert([{
      user_id: user.id,
      day_of_week: selectedDay,
      meal_type: selectedMeal,
      recipe_id: recipeId,
      recipe_name: recipeName,
      recipe_data: recipeData,
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
        description: `${recipeName} added to ${selectedDay}'s ${selectedMeal}.`,
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

  if (authLoading || (!recipe && !aiRecipe)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative bg-card p-4 rounded-full shadow-elevated border border-border/50">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">Loading your recipe...</p>
      </div>
    );
  }

  // Normalize data for display
  const displayName = isAIRecipe ? aiRecipe?.recipe_name : recipe?.name;
  const displayTime = isAIRecipe ? aiRecipe?.cooking_time_minutes : recipe?.cookingTime;
  const displayServings = isAIRecipe ? aiRecipe?.servings : recipe?.servings;
  const displayDifficulty = isAIRecipe ? aiRecipe?.difficulty : recipe?.difficulty;
  const displayIngredients = isAIRecipe ? aiRecipe?.ingredients : recipe?.ingredients;
  const displayInstructions = isAIRecipe ? aiRecipe?.instructions : recipe?.instructions;
  const displayImage = isAIRecipe ? aiRecipe?.image_url : recipe?.image;
  const displayCategory = isAIRecipe ? 'AI Generated' : recipe?.category;
  const displayDescription = isAIRecipe ? `AI-generated recipe for ${aiRecipe?.recipe_name}` : recipe?.description;

  const difficultyColor: Record<string, string> = {
    Easy: 'bg-primary/10 text-primary',
    easy: 'bg-primary/10 text-primary',
    Medium: 'bg-golden/20 text-amber-700',
    medium: 'bg-golden/20 text-amber-700',
    Hard: 'bg-accent/10 text-accent',
    hard: 'bg-accent/10 text-accent',
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
              {displayImage ? (
                <img
                  src={displayImage}
                  alt={displayName || 'Recipe'}
                  className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="w-full aspect-video bg-gradient-to-br from-primary/20 via-accent/10 to-secondary flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-3 animate-pulse">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-lg text-muted-foreground font-medium">AI Generated Recipe</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("px-3 py-1 rounded-full text-sm font-medium", difficultyColor[displayDifficulty || ''] || 'bg-muted text-muted-foreground')}>
                    {displayDifficulty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-background/90 text-foreground flex items-center gap-1">
                    {isAIRecipe && <Sparkles className="w-3 h-3" />}
                    {displayCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions - now available for all recipes */}
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
                {displayIngredients?.map((ingredient, index) => (
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
              {displayName}
            </h1>

            <p className="text-lg text-muted-foreground mb-6">
              {displayDescription}
            </p>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                <span>{displayTime} minutes</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span>{displayServings} servings</span>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground mb-4">
                Step-by-Step Instructions
              </h2>
              <div className="space-y-4">
                {displayInstructions?.map((step, index) => (
                  <button
                    key={index}
                    onClick={() => toggleStep(index)}
                    className={cn(
                      "w-full text-left p-6 rounded-2xl border transition-all duration-300 hover:shadow-md hover:border-primary/50 group",
                      completedSteps.has(index)
                        ? "bg-primary/5 border-primary/20"
                        : "bg-card border-border/60"
                    )}
                  >
                    <div className="flex gap-5">
                      <div className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 shadow-sm",
                        completedSteps.has(index)
                          ? "bg-primary text-primary-foreground scale-110"
                          : "bg-surface-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground"
                      )}>
                        {completedSteps.has(index) ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : (
                          <span className="text-sm font-bold font-mono">{index + 1}</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-foreground pt-0.5 leading-relaxed text-lg",
                        completedSteps.has(index) && "line-through opacity-60 decoration-primary/40"
                      )}>
                        {step}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {displayInstructions && completedSteps.size === displayInstructions.length && (
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
