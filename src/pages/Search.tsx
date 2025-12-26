import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Loader2, Sparkles, Clock, Utensils, Flame, CheckCircle2, Search as SearchIcon, UtensilsCrossed } from 'lucide-react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { supabase } from '@/integrations/supabase/client';
import { recipes, searchRecipes, Recipe } from '@/data/recipes';
import { RecipeCard } from '@/components/RecipeCard';

// Dedicated interface for AI Recipe
interface AIRecipe {
  recipe_name: string;
  description: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  calories_per_serving: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
  image_url?: string;
  id?: string;
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mode, setMode] = useState<'dish' | 'pantry'>('dish');

  // Pantry Mode State
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecipe, setAiRecipe] = useState<AIRecipe | null>(null);

  // Dish Mode State
  const [dishQuery, setDishQuery] = useState('');
  const [dishResults, setDishResults] = useState<Recipe[]>([]);
  const [hasSearchedDish, setHasSearchedDish] = useState(false);

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useExternalAuth();

  useEffect(() => {
    if (user) loadFavourites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Handle URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const m = searchParams.get('mode') as 'dish' | 'pantry';

    if (m && (m === 'dish' || m === 'pantry')) {
      setMode(m);
      if (q) {
        if (m === 'pantry') {
          // If deep linked with comma sep list
          setIngredientsList(q.split(',').map(s => s.trim()).filter(Boolean));
          // Auto generate if present? Maybe wait for user action in this new flow to be safe,
          // but deep links usually expect action. Let's auto-generate.
          generateAiRecipe(q);
        } else {
          setDishQuery(q);
          performDishSearch(q);
        }
      }
    } else if (q) {
      // Default to dish if mode not specified but query exists
      setDishQuery(q);
      performDishSearch(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const updateMode = (newMode: 'dish' | 'pantry') => {
    setMode(newMode);
    setSearchParams(prev => {
      prev.set('mode', newMode);
      return prev;
    });
  };

  const loadFavourites = async () => {
    try {
      if (!user?.id) return;
      const { data, error } = await supabase
        .from('saved_recipes')
        .select('google_recipe_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavouriteIds(new Set(data?.map((r) => r.google_recipe_id) || []));
    } catch (error) {
      console.error('Error loading favourites:', error);
    }
  };

  const performDishSearch = (query: string) => {
    if (!query.trim()) {
      setDishResults([]);
      setHasSearchedDish(false);
      return;
    }
    const results = searchRecipes(query);
    setDishResults(results);
    setHasSearchedDish(true);
  };

  // State to store the dynamically detected model
  const [modelId, setModelId] = useState<string>('gemini-1.5-flash');

  const getValidModel = async (apiKey: string): Promise<string> => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      if (!response.ok) return 'gemini-1.5-flash';

      const data = await response.json();
      // Find the first model that supports generateContent
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const validModel = data.models?.find((m: any) =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        (m.name.includes('gemini') || m.name.includes('flash') || m.name.includes('pro'))
      );

      if (validModel) {
        // The API returns 'models/gemini-1.5-flash', we need just the name sometimes, but usually the full 'models/...' string works or we strip 'models/' depending on the endpoint.
        // The generate endpoint format is: .../models/{model_id}:generateContent
        // So if validModel.name is 'models/gemini-1.5-flash', we just want 'gemini-1.5-flash' usually, OR we use the full resource name if the URL structure allows.
        // Let's strip 'models/' to be safe as we construct the URL manually.
        return validModel.name.replace('models/', '');
      }
      return 'gemini-1.5-flash';
    } catch (e) {
      console.error("Error fetching models:", e);
      return 'gemini-1.5-flash';
    }
  };

  const handleAddIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (!ingredientsList.includes(trimmed)) {
        setIngredientsList([...ingredientsList, trimmed]);
      }
      setInputValue('');
    }
  };

  const removeIngredient = (index: number) => {
    const newList = [...ingredientsList];
    newList.splice(index, 1);
    setIngredientsList(newList);
  };

  const generateAiRecipe = async (ingredients: string | string[]) => {
    const inputIngredients = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients;

    if (!inputIngredients.trim()) {
      toast({ title: 'Empty Pantry?', description: 'Please add at least one ingredient.', variant: 'destructive' });
      return;
    }

    setIsAiLoading(true);
    setAiRecipe(null);

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
      toast({ title: 'Configuration Error', description: 'Gemini API Key is missing.', variant: 'destructive' });
      setIsAiLoading(false);
      return;
    }

    // Dynamic Model Selection
    let activeModel = modelId;
    // Attempt to verify model if we haven't successfully used one yet (simple optimization)
    try {
      const detected = await getValidModel(GEMINI_API_KEY);
      if (detected) {
        activeModel = detected;
        setModelId(detected);
      }
    } catch (e) {
      console.warn("Failed to detect model, using default");
    }

    const prompt = `
      Act as a creative and helpful professional chef.
      I have these ingredients: "${inputIngredients}".
      
      Your goal is to ALWAYS generate a delicious recipe, no matter what.
      - If the ingredients are sufficient, create a great dish.
      - If the ingredients are few or unusual, use your culinary expertise to suggest a recipe that uses them, assuming the user has basic pantry staples (flour, oil, sugar, water, salt, pepper, simple spices).
      - Do NOT refuse to generate.
      - Do NOT return an error.
      
      Return a STRICT JSON object with this structure:
      {
        "recipe_name": "Recipe Name",
        "description": "A very short, appetizing description (1 sentence).",
        "cooking_time_minutes": 30,
        "difficulty": "Easy",
        "servings": 2,
        "calories_per_serving": 500,
        "ingredients": [
          {"name": "Ingredient 1", "quantity": "amount"},
          {"name": "Ingredient 2", "quantity": "amount"}
        ],
        "instructions": [
          "Step 1 instruction...",
          "Step 2 instruction..."
        ]
      }
    `;

    try {
      console.log("Using Gemini Model:", activeModel);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${activeModel}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || `API Request Failed: ${response.status} (${activeModel})`);
      }

      const data = await response.json();
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('AI returned no content. Please try again.');
      }

      const text = data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);

      if (!jsonMatch) throw new Error('Invalid AI response format');

      const parsedRecipe = JSON.parse(jsonMatch[0]);
      parsedRecipe.id = `ai-${Date.now()}`;

      setAiRecipe(parsedRecipe);

    } catch (error: any) {
      console.error('Generation Error:', error);
      toast({
        title: 'Recipe Generation Failed',
        description: error.message || 'Check API Key/Quota.',
        variant: 'destructive',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleFavourite = (recipe: Recipe) => {
    // Legacy toggle logic placeholder
    toast({ title: 'Feature coming soon!' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />

      <main className="container max-w-6xl mx-auto pb-20 pt-10 px-4">
        {/* Toggle Header */}
        <div className="flex justify-center mb-10">
          <div className="bg-secondary/50 p-1.5 rounded-full inline-flex items-center gap-2">
            <Button
              variant={mode === 'dish' ? 'default' : 'ghost'}
              onClick={() => updateMode('dish')}
              className="rounded-full px-6"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Find a Dish
            </Button>
            <Button
              variant={mode === 'pantry' ? 'default' : 'ghost'}
              onClick={() => updateMode('pantry')}
              className="rounded-full px-6"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              Pantry Search
            </Button>
          </div>
        </div>

        {/* PANTRY MODE - AI GENERATOR */}
        {mode === 'pantry' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10 animate-fade-up">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">What's in your pantry?</h1>
              <p className="text-muted-foreground text-lg mb-8">Type an ingredient and press Enter to add it.</p>

              <div className="relative max-w-xl mx-auto group">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type 'Chicken' then Enter..."
                  className="w-full pl-6 pr-4 py-4 rounded-2xl border-2 border-border/50 bg-card/50 shadow-sm text-lg focus:ring-primary/20 outline-none transition-all"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddIngredient();
                    }
                  }}
                />

                {/* Ingredient Tags Area */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center min-h-[40px]">
                  {ingredientsList.map((ing, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium animate-in fade-in zoom-in duration-300">
                      {ing}
                      <button onClick={() => removeIngredient(idx)} className="hover:text-red-500 transition-colors">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>

                <Button
                  className="mt-6 w-full sm:w-auto h-12 px-8 text-lg rounded-xl gap-2 shadow-lg"
                  onClick={() => generateAiRecipe(ingredientsList)}
                  disabled={isAiLoading || ingredientsList.length === 0}
                >
                  {isAiLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                  {isAiLoading ? 'Creating...' : 'Generate Recipe'}
                </Button>
              </div>
            </div>

            {/* AI Result */}
            {isAiLoading && !aiRecipe && (
              <div className="text-center py-20 animate-in fade-in duration-700">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <ChefHat className="h-8 w-8 text-primary animate-bounce-custom" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Designing your dish...</h3>
                <p className="text-muted-foreground mt-2">Thinking about flavors and textures.</p>
              </div>
            )}

            {aiRecipe && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 bg-card rounded-3xl border border-border/50 shadow-soft overflow-hidden">
                <div className="bg-gradient-warm p-8 text-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-3 opacity-10"><ChefHat className="w-32 h-32 rotate-12" /></div>
                  <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">AI Generated</span>
                  <h2 className="font-display text-3xl font-bold mt-4 mb-2">{aiRecipe.recipe_name}</h2>
                  <p className="text-muted-foreground italic">"{aiRecipe.description}"</p>
                  <div className="flex flex-wrap justify-center gap-4 mt-6">
                    <MetricBadge icon={Clock} label={`${aiRecipe.cooking_time_minutes} min`} />
                    <MetricBadge icon={Utensils} label={`${aiRecipe.servings} Servings`} />
                    <MetricBadge icon={Flame} label={`${aiRecipe.calories_per_serving} kcal`} />
                    <MetricBadge icon={CheckCircle2} label={aiRecipe.difficulty} />
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr,1.5fr] divide-y md:divide-y-0 md:divide-x divide-border/50">
                  <div className="p-8 bg-muted/30">
                    <h3 className="font-bold text-xl mb-4">Ingredients</h3>
                    <ul className="space-y-3">
                      {aiRecipe.ingredients.map((ing, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="h-1.5 w-1.5 mt-2 rounded-full bg-primary shrink-0" />
                          <span><span className="font-medium">{ing.name}</span> <span className="text-muted-foreground text-sm">({ing.quantity})</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-8">
                    <h3 className="font-bold text-xl mb-4">Instructions</h3>
                    <div className="space-y-4">
                      {aiRecipe.instructions.map((step, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center font-bold text-sm shrink-0">{i + 1}</span>
                          <p className="text-foreground/90">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISH MODE - DATABASE SEARCH */}
        {mode === 'dish' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 animate-fade-up">
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Find a Dish</h1>
              <p className="text-muted-foreground text-lg mb-8">Search our collection of delicious recipes.</p>

              <div className="relative max-w-xl mx-auto">
                <input
                  type="text"
                  value={dishQuery}
                  onChange={(e) => {
                    setDishQuery(e.target.value);
                    performDishSearch(e.target.value);
                  }}
                  placeholder="Search for 'Biryani', 'Pasta', etc..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-border/50 bg-card shadow-sm text-lg outline-none focus:ring-primary/20 transition-all"
                />
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6" />
              </div>
            </div>

            {hasSearchedDish && dishResults.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-medium">No recipes found</h3>
                <p>Try searching for something else like "Chicken" or "Rice".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
                {dishResults.map(r => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    isFavourite={favouriteIds.has(r.id)}
                    onToggleFavourite={toggleFavourite}
                  />
                ))}
                {/* Show popular/all recipes if no search query? */}
                {!hasSearchedDish && recipes.map(r => (
                  <RecipeCard
                    key={r.id}
                    recipe={r}
                    isFavourite={favouriteIds.has(r.id)}
                    onToggleFavourite={toggleFavourite}
                  />
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}

// Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MetricBadge({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-lg border border-border/50 text-sm">
      <Icon className="w-4 h-4 text-primary" />
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
}

// Simple Badge Component if missing
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </span>
  );
}
