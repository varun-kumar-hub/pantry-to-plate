import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
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
  Loader2,
  PlayCircle,
  UtensilsCrossed,
  Flame,
  Share2
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
  cuisine?: string;
  nutrition?: {
    calories: string | number;
    protein: string;
    carbs: string;
    fats: string;
  };
  tips?: string[];
  serving_ideas?: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];

const generateAIRecipeId = (name: string) => {
  return `ai-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;
};

export default function RecipeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useExternalAuth();
  const { toast } = useToast();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [aiRecipe, setAiRecipe] = useState<AIGeneratedRecipe | null>(null);
  const [aiRecipeId, setAiRecipeId] = useState<string>('');

  const [isFavourite, setIsFavourite] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [selectedMeal, setSelectedMeal] = useState<string>('');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isAIRecipe = id === 'ai-generated' || id?.startsWith('ai-');

  // Auth Redirect
  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  // Load Recipe Data
  useEffect(() => {
    if (id) {
      const passedRecipe = location.state?.recipeData;
      if (passedRecipe) {
        if (isAIRecipe) {
          setAiRecipe({
            recipe_name: passedRecipe.name,
            cooking_time_minutes: passedRecipe.cookingTime,
            difficulty: passedRecipe.difficulty,
            servings: passedRecipe.servings,
            ingredients: passedRecipe.ingredients,
            instructions: passedRecipe.instructions,
            image_url: passedRecipe.image,
            cuisine: passedRecipe.cuisine,
            nutrition: {
              calories: passedRecipe.calories || 'N/A',
              protein: passedRecipe.macronutrients?.protein || '-',
              carbs: passedRecipe.macronutrients?.carbs || '-',
              fats: passedRecipe.macronutrients?.fat || '-'
            },
            tips: passedRecipe.tips,
            serving_ideas: passedRecipe.serving_ideas
          });
          setAiRecipeId(id);
        } else {
          setRecipe(passedRecipe);
        }
        return;
      }

      if (isAIRecipe) {
        const storedRecipe = localStorage.getItem('aiRecipe');
        if (storedRecipe) {
          const parsed = JSON.parse(storedRecipe);
          setAiRecipe(parsed);
          setAiRecipeId(generateAIRecipeId(parsed.recipe_name || parsed.name));
        } else {
          toast({ title: "Recipe not found", description: "This recipe has expired.", variant: "destructive" });
          navigate('/search');
        }
      } else {
        const foundRecipe = getRecipeById(id);
        if (foundRecipe) setRecipe(foundRecipe);
        else navigate('/search');
      }
    }
  }, [id, navigate, isAIRecipe, location.state]);

  // Check Fav Status
  useEffect(() => {
    if (user && recipe) checkFavourite(recipe.id);
  }, [user, recipe]);

  useEffect(() => {
    if (user && aiRecipe && aiRecipeId) checkAIFavourite();
  }, [user, aiRecipe, aiRecipeId]);

  const checkFavourite = async (recipeId: string) => {
    if (!user) return;
    const { data } = await externalSupabase.from('favourite_recipes').select('id').eq('user_id', user.id).eq('recipe_id', recipeId).maybeSingle();
    setIsFavourite(!!data);
  };

  const checkAIFavourite = async () => {
    if (!user || !aiRecipe) return;
    const { data } = await externalSupabase.from('favourite_recipes').select('id, recipe_id').eq('user_id', user.id).eq('recipe_name', aiRecipe.recipe_name).maybeSingle();
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
        await externalSupabase.from('favourite_recipes').delete().eq('user_id', user.id).eq('recipe_name', aiRecipe.recipe_name);
        setIsFavourite(false);
        toast({ title: 'Removed from favourites' });
      } else {
        const recipeData = {
          ...aiRecipe,
          id: aiRecipeId,
          name: aiRecipe.recipe_name,
          cookingTime: aiRecipe.cooking_time_minutes,
          category: 'AI Generated',
          description: `AI-generated recipe for ${aiRecipe.recipe_name}`,
        };
        await externalSupabase.from('favourite_recipes').insert([{ user_id: user.id, recipe_id: aiRecipeId, recipe_name: aiRecipe.recipe_name, recipe_data: recipeData }]);
        setIsFavourite(true);
        toast({ title: 'Added to favourites' });
      }
    } else if (recipe) {
      if (isFavourite) {
        await externalSupabase.from('favourite_recipes').delete().eq('user_id', user.id).eq('recipe_id', recipe.id);
        setIsFavourite(false);
        toast({ title: 'Removed from favourites' });
      } else {
        await externalSupabase.from('favourite_recipes').insert([{ user_id: user.id, recipe_id: recipe.id, recipe_name: recipe.name, recipe_data: JSON.parse(JSON.stringify(recipe)) }]);
        setIsFavourite(true);
        toast({ title: 'Added to favourites' });
      }
    }
  };

  const addToMealPlan = async () => {
    if (!user || !selectedDay || !selectedMeal) {
      toast({ title: 'Select day and meal', variant: 'destructive' });
      return;
    }
    let recipeId: string;
    let recipeName: string;
    let recipeData: any;

    if (isAIRecipe && aiRecipe) {
      recipeId = aiRecipeId;
      recipeName = aiRecipe.recipe_name;
      recipeData = { ...aiRecipe, id: aiRecipeId, name: aiRecipe.recipe_name, cookingTime: aiRecipe.cooking_time_minutes, category: 'AI Generated', description: `AI-generated recipe for ${aiRecipe.recipe_name}` };
    } else if (recipe) {
      recipeId = recipe.id;
      recipeName = recipe.name;
      recipeData = JSON.parse(JSON.stringify(recipe));
    } else return;

    const { error } = await externalSupabase.from('meal_plans').upsert([{ user_id: user.id, day_of_week: selectedDay, meal_type: selectedMeal, recipe_id: recipeId, recipe_name: recipeName, recipe_data: recipeData }], { onConflict: 'user_id,day_of_week,meal_type' });

    if (error) toast({ title: 'Error', description: 'Failed to add to meal plan.', variant: 'destructive' });
    else {
      toast({ title: 'Added to meal plan!' });
      setShowPlannerModal(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (authLoading || (!recipe && !aiRecipe)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-xl font-display font-medium text-muted-foreground">Preparing your kitchen...</p>
      </div>
    );
  }

  // Display Props
  const displayName = isAIRecipe ? aiRecipe?.recipe_name : recipe?.name;
  const displayTime = isAIRecipe ? aiRecipe?.cooking_time_minutes : recipe?.cookingTime;
  const displayServings = isAIRecipe ? aiRecipe?.servings : recipe?.servings;
  const displayDifficulty = isAIRecipe ? aiRecipe?.difficulty : recipe?.difficulty;
  const displayIngredients = isAIRecipe ? aiRecipe?.ingredients : recipe?.ingredients;
  const displayInstructions = isAIRecipe ? aiRecipe?.instructions : recipe?.instructions;
  const displayImage = isAIRecipe ? aiRecipe?.image_url : recipe?.image;
  const displayCategory = isAIRecipe ? 'AI Chef' : recipe?.category;
  const displayTips = isAIRecipe ? aiRecipe?.tips : recipe?.tips;
  const displayServingIdeas = isAIRecipe ? aiRecipe?.serving_ideas : recipe?.serving_ideas;
  const calories = isAIRecipe ? aiRecipe?.nutrition?.calories : 'N/A';

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 pb-20">
      <Header />

      {/* Editorial Hero Section */}
      <div className="relative w-full h-[60vh] md:h-[70vh] flex items-end justify-center pb-20 overflow-hidden">
        {displayImage ? (
          <div className="absolute inset-0">
            <img src={displayImage} className="w-full h-full object-cover" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-background" />
        )}

        <div className="relative z-10 text-center max-w-4xl px-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm uppercase tracking-widest mb-6">
            <Sparkles className="w-4 h-4" /> {displayCategory}
          </div>
          <h1 className="font-display text-6xl md:text-8xl font-black text-foreground mb-6 leading-tight drop-shadow-2xl">
            {displayName}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">{displayTime}m</span>
            </div>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
              <Users className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">{displayServings} servings</span>
            </div>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
              <Flame className="w-5 h-5 text-primary" />
              <span className="font-bold text-lg">{calories} kcal</span>
            </div>
          </div>
        </div>
      </div>

      <main className="container max-w-4xl mx-auto -mt-10 relative z-20 px-4">
        {/* Action Bar */}
        <div className="flex items-center justify-between bg-card/50 backdrop-blur-xl border border-white/10 p-4 rounded-full shadow-lg mb-16">
          <Button variant="ghost" className="rounded-full" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={toggleFavourite} variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/10">
              <Heart className={cn("w-5 h-5", isFavourite && "fill-primary text-primary")} />
            </Button>
            <Button onClick={() => setShowPlannerModal(true)} variant="outline" size="icon" className="rounded-full border-white/10 hover:bg-white/10">
              <Calendar className="w-5 h-5" />
            </Button>
            <Button
              className="rounded-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20"
              onClick={() => {
                navigate(isAIRecipe && aiRecipe ? '/cooking-mode/ai-generated' : `/cooking-mode/${recipe?.id}`);
              }}
            >
              <PlayCircle className="w-5 h-5 mr-2" /> Start Cooking
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_1.5fr] gap-12">
          {/* Left Col: Ingredients */}
          <div className="space-y-8">
            <div className="bg-card rounded-[2rem] p-8 shadow-card border border-border/50 sticky top-24">
              <h3 className="font-display text-3xl font-bold mb-8 flex items-center">
                <ChefHat className="w-8 h-8 mr-3 text-primary" /> Ingredients
              </h3>
              <ul className="space-y-4">
                {displayIngredients?.map((ing: any, i) => {
                  const name = typeof ing === 'string' ? ing : ing.name;
                  const quantity = typeof ing === 'string' ? '' : ing.quantity;
                  return (
                    <li key={i} className="flex items-start justify-between pb-4 border-b border-dashed border-border/50 last:border-0">
                      <span className="font-medium text-lg">{name}</span>
                      {quantity && <span className="text-muted-foreground font-mono">{quantity}</span>}
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Nutritional Badge (AI Only) */}
            {isAIRecipe && aiRecipe?.nutrition && (
              <div className="bg-primary/5 rounded-[2rem] p-8 border border-primary/10">
                <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Nutrition per serving
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Protein</span>
                    <span className="font-bold">{aiRecipe.nutrition.protein}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Carbs</span>
                    <span className="font-bold">{aiRecipe.nutrition.carbs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fats</span>
                    <span className="font-bold">{aiRecipe.nutrition.fats}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Instructions */}
          <div className="space-y-12">
            <div>
              <h3 className="font-display text-3xl font-bold mb-8 flex items-center">
                <UtensilsCrossed className="w-8 h-8 mr-3 text-primary" /> Method
              </h3>
              <div className="space-y-6">
                {displayInstructions?.map((step, i) => (
                  <div
                    key={i}
                    onClick={() => toggleStep(i)}
                    className={cn(
                      "group cursor-pointer p-6 rounded-2xl border transition-all duration-300 hover:scale-[1.01] hover:shadow-lg",
                      completedSteps.has(i) ? "bg-primary/5 border-primary/20 opacity-60" : "bg-card border-border/50 hover:border-primary/30"
                    )}
                  >
                    <div className="flex gap-4">
                      <span className={cn(
                        "flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm",
                        completedSteps.has(i) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                      )}>
                        {completedSteps.has(i) ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </span>
                      <p className="text-lg leading-relaxed text-foreground/90">{step}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            {(displayTips?.length || displayServingIdeas) && (
              <div className="border-t border-border pt-12">
                <div className="grid gap-6">
                  {displayTips && displayTips.length > 0 && (
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-8 rounded-[2rem] border border-amber-200/50 dark:border-amber-800/50">
                      <h4 className="font-display text-2xl font-bold text-amber-700 dark:text-amber-400 mb-4">Chef's Secrets</h4>
                      <ul className="list-disc list-inside space-y-2 text-amber-900/80 dark:text-amber-200/80">
                        {displayTips.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}
                  {displayServingIdeas && (
                    <div className="bg-surface-secondary p-8 rounded-[2rem] border border-border">
                      <h4 className="font-display text-2xl font-bold mb-4">Plating & Serving</h4>
                      <p className="text-muted-foreground text-lg leading-relaxed">{displayServingIdeas}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Meal Plan Modal */}
      <Dialog open={showPlannerModal} onOpenChange={setShowPlannerModal}>
        <DialogContent className="sm:max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center">Add to Meal Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Day</label>
              <Select value={selectedDay} onValueChange={setSelectedDay}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pick a day" /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Meal</label>
              <Select value={selectedMeal} onValueChange={setSelectedMeal}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Pick a meal" /></SelectTrigger>
                <SelectContent>{MEALS.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button onClick={addToMealPlan} className="w-full h-12 rounded-xl text-lg font-bold">Save to Calendar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
