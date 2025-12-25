import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Recipe } from '@/data/recipes';
import { Calendar, X, ShoppingCart, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealPlan {
  id: string;
  day_of_week: string;
  meal_type: string;
  recipe_id: string;
  recipe_name: string;
  recipe_data: Recipe;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const MEALS = ['breakfast', 'lunch', 'dinner'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export default function Planner() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadMealPlans();
    }
  }, [user]);

  const loadMealPlans = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load meal plans.',
        variant: 'destructive',
      });
    } else {
      setMealPlans(data as unknown as MealPlan[]);
    }
    setLoading(false);
  };

  const removeMeal = async (day: string, meal: string) => {
    if (!user) return;

    await supabase
      .from('meal_plans')
      .delete()
      .eq('user_id', user.id)
      .eq('day_of_week', day)
      .eq('meal_type', meal);

    setMealPlans(prev => prev.filter(p => !(p.day_of_week === day && p.meal_type === meal)));

    toast({
      title: 'Meal removed',
      description: 'The meal has been removed from your plan.',
    });
  };

  const getMeal = (day: string, meal: string): MealPlan | undefined => {
    return mealPlans.find(p => p.day_of_week === day && p.meal_type === meal);
  };

  const generateShoppingList = async () => {
    if (!user) return;

    // Clear existing shopping list
    await supabase
      .from('shopping_list')
      .delete()
      .eq('user_id', user.id);

    // Collect all ingredients from meal plans
    const ingredientMap = new Map<string, string>();
    
    mealPlans.forEach(plan => {
      plan.recipe_data.ingredients.forEach(ing => {
        const key = ing.name.toLowerCase();
        if (ingredientMap.has(key)) {
          // Combine quantities (simplified)
          ingredientMap.set(key, ingredientMap.get(key) + ', ' + ing.quantity);
        } else {
          ingredientMap.set(key, ing.quantity);
        }
      });
    });

    // Insert into shopping list
    const items = Array.from(ingredientMap.entries()).map(([name, quantity]) => ({
      user_id: user.id,
      ingredient_name: name,
      quantity,
      is_purchased: false,
    }));

    if (items.length > 0) {
      await supabase.from('shopping_list').insert(items);
      
      toast({
        title: 'Shopping list generated!',
        description: `${items.length} ingredients added to your shopping list.`,
      });
      
      navigate('/shopping-list');
    } else {
      toast({
        title: 'No meals planned',
        description: 'Add some meals to your plan first.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Weekly Meal Plan
              </h1>
              <p className="text-muted-foreground">
                Plan your meals for the week
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link to="/search">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Add Recipes
              </Button>
            </Link>
            <Button onClick={generateShoppingList} className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Generate Shopping List
            </Button>
          </div>
        </div>

        {/* Desktop view */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="p-3"></div>
              {DAYS.map(day => (
                <div key={day} className="p-3 text-center">
                  <span className="font-medium text-foreground capitalize">{day}</span>
                </div>
              ))}
            </div>

            {MEALS.map(meal => (
              <div key={meal} className="grid grid-cols-8 gap-2 mb-2">
                <div className="p-3 flex items-center">
                  <span className="font-medium text-muted-foreground capitalize">{meal}</span>
                </div>
                {DAYS.map(day => {
                  const plannedMeal = getMeal(day, meal);
                  return (
                    <div
                      key={`${day}-${meal}`}
                      className={cn(
                        "relative min-h-[100px] rounded-xl border p-3 transition-all",
                        plannedMeal
                          ? "bg-card border-primary/20 shadow-soft"
                          : "bg-muted/30 border-border hover:border-primary/30"
                      )}
                    >
                      {plannedMeal ? (
                        <>
                          <Link to={`/recipe/${plannedMeal.recipe_id}`} className="block">
                            <p className="font-medium text-sm text-foreground line-clamp-2 hover:text-primary transition-colors">
                              {plannedMeal.recipe_name}
                            </p>
                          </Link>
                          <button
                            onClick={() => removeMeal(day, meal)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </>
                      ) : (
                        <Link
                          to="/search"
                          className="flex h-full items-center justify-center text-muted-foreground text-sm hover:text-primary transition-colors"
                        >
                          + Add
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-4">
          {DAYS.map(day => (
            <div key={day} className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-display text-lg font-semibold text-foreground capitalize mb-3">
                {day}
              </h3>
              <div className="space-y-2">
                {MEALS.map(meal => {
                  const plannedMeal = getMeal(day, meal);
                  return (
                    <div
                      key={`${day}-${meal}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        plannedMeal ? "bg-primary/5" : "bg-muted/30"
                      )}
                    >
                      <div>
                        <span className="text-xs text-muted-foreground uppercase">{meal}</span>
                        {plannedMeal ? (
                          <Link to={`/recipe/${plannedMeal.recipe_id}`}>
                            <p className="font-medium text-foreground hover:text-primary transition-colors">
                              {plannedMeal.recipe_name}
                            </p>
                          </Link>
                        ) : (
                          <p className="text-muted-foreground">No meal planned</p>
                        )}
                      </div>
                      {plannedMeal ? (
                        <button
                          onClick={() => removeMeal(day, meal)}
                          className="p-2 rounded-full bg-destructive/10 text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      ) : (
                        <Link to="/search">
                          <Button size="sm" variant="ghost">
                            Add
                          </Button>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {mealPlans.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Start planning your week
            </h3>
            <p className="text-muted-foreground mb-6">
              Search for recipes and add them to your meal plan
            </p>
            <Link to="/search">
              <Button variant="default" className="gap-2">
                <Search className="h-4 w-4" />
                Find Recipes
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
