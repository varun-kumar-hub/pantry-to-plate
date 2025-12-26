import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChefHat, Loader2, Sparkles, UtensilsCrossed, Search as SearchIcon, ArrowRight, Clock, Users, Flame, X } from 'lucide-react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, recipes } from '@/data/recipes';
import { RecipeCard } from '@/components/RecipeCard';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'dish' | 'pantry'>('dish');

  // Pantry Mode State
  const [ingredientsList, setIngredientsList] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [recentPantry, setRecentPantry] = useState<string[][]>([]);

  // Dish Mode State
  const [dishQuery, setDishQuery] = useState('');
  const [dishResults, setDishResults] = useState<Recipe[]>([]);
  const [hasSearchedDish, setHasSearchedDish] = useState(false);

  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useExternalAuth();

  // Load Favorites & History
  useEffect(() => {
    if (user) loadFavourites();
    try {
      const history = localStorage.getItem('pantryHistory');
      if (history) setRecentPantry(JSON.parse(history));
    } catch (e) { console.error(e); }
  }, [user]);

  // Hydrate from URL & Storage
  useEffect(() => {
    const q = searchParams.get('q');
    const m = searchParams.get('mode') as 'dish' | 'pantry';
    const savedRecipes = sessionStorage.getItem('lastGeneratedRecipes');
    const savedMode = sessionStorage.getItem('lastSearchMode');

    if (m === 'pantry' || m === 'dish') {
      setMode(m);
      if (m === 'pantry' && q) {
        setIngredientsList(q.split(',').map(s => s.trim()).filter(Boolean));
      } else if (m === 'dish' && q) {
        setDishQuery(q);
        performDishSearch(q);
      }
    } else if (savedMode === 'pantry' || savedMode === 'dish') {
      setMode(savedMode);
    }

    if (savedRecipes) {
      try {
        setAiRecipes(JSON.parse(savedRecipes));
      } catch (e) {
        console.error("Failed to restore recipes", e);
      }
    }
  }, []);

  // Sync Ingredients to URL
  useEffect(() => {
    if (mode === 'pantry') {
      const newParams = new URLSearchParams(searchParams);
      if (ingredientsList.length > 0) newParams.set('q', ingredientsList.join(','));
      else newParams.delete('q');
      newParams.set('mode', 'pantry');
      setSearchParams(newParams, { replace: true });
    }
  }, [ingredientsList, mode, setSearchParams]);

  const updateMode = (newMode: 'dish' | 'pantry') => {
    // Clear session state when switching modes explicitly
    if (aiRecipes.length > 0) {
      setAiRecipes([]);
      sessionStorage.removeItem('lastGeneratedRecipes');
    }

    setMode(newMode);
    sessionStorage.setItem('lastSearchMode', newMode);

    const newParams = new URLSearchParams(searchParams);
    newParams.set('mode', newMode);
    newParams.delete('q');
    if (newMode === 'dish') setIngredientsList([]);
    else {
      setDishQuery('');
      setDishResults([]);
      setHasSearchedDish(false);
    }
    setSearchParams(newParams);
  };

  const loadFavourites = async () => {
    try {
      if (!user?.id) return;
      const { data, error } = await supabase.from('favourite_recipes').select('recipe_id').eq('user_id', user.id);
      if (error) throw error;
      setFavouriteIds(new Set(data?.map((r) => r.recipe_id) || []));
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
    const newParams = new URLSearchParams(searchParams);
    newParams.set('q', query);
    newParams.set('mode', 'dish');
    setSearchParams(newParams, { replace: true });

    const searchTerms = query.toLowerCase().split(',').map(term => term.trim()).filter(Boolean);
    if (searchTerms.length === 0) return;

    const scored = recipes.map(recipe => {
      const recipeIngredients = recipe.ingredients.map(i => i.name.toLowerCase());
      const recipeName = recipe.name.toLowerCase();
      let matchCount = 0;
      let nameMatch = false;
      searchTerms.forEach(term => {
        if (recipeName.includes(term)) nameMatch = true;
        recipeIngredients.forEach(ingredient => { if (ingredient.includes(term)) matchCount++; });
      });
      return { recipe, score: nameMatch ? 100 + matchCount : matchCount };
    });

    const results = scored.filter(item => item.score > 0).sort((a, b) => b.score - a.score).map(item => item.recipe);
    setDishResults(results);
    setHasSearchedDish(true);
  };

  const handleDishInputChange = (value: string) => {
    setDishQuery(value);
    if (!value.trim()) {
      // Clear everything if input is empty
      setAiRecipes([]);
      sessionStorage.removeItem('lastGeneratedRecipes');
      setDishResults([]);
      setHasSearchedDish(false);
    } else {
      performDishSearch(value);
    }
  };

  const handleAddIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed) {
      if (!ingredientsList.includes(trimmed)) setIngredientsList([...ingredientsList, trimmed]);
      setInputValue('');
    }
  };

  const removeIngredient = (index: number) => {
    const newList = [...ingredientsList];
    newList.splice(index, 1);
    setIngredientsList(newList);
  };

  const generateAiRecipe = async (input: string | string[], skipImage = false) => {
    const query = Array.isArray(input) ? input.join(', ') : input;
    if (!query.trim()) {
      toast({ title: 'Input needed', description: 'Please enter something to generate.', variant: 'destructive' });
      return;
    }

    setIsAiLoading(true);
    setAiRecipes([]);
    sessionStorage.removeItem('lastGeneratedRecipes');

    try {
      const payload = mode === 'dish' ? { dish_name: query } : { ingredients: Array.isArray(input) ? input : [input] };
      const { data, error } = await supabase.functions.invoke('generate-recipe', { body: payload });

      if (error) throw error;
      if (!data?.recipes && !data?.recipe) throw new Error('No content from AI');

      // Handle nested response from Edge Function wrapper: { recipe: { recipes: [...] } }
      // Or direct: { recipes: [...] }
      // Or legacy single: { recipe: { ... } }
      const root = data.recipe || data;
      const rawRecipes = root.recipes || (root.recipe_name ? [root] : []);

      if (!rawRecipes.length) throw new Error('No recipes found in response');

      const fullRecipes: Recipe[] = rawRecipes.map((parsed: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        name: parsed.recipe_name || parsed.name || parsed.title || 'Untitled Recipe',
        description: parsed.description,
        ingredients: parsed.ingredients,
        instructions: parsed.instructions,
        cookingTime: parsed.cooking_time_minutes,
        difficulty: parsed.difficulty as any,
        category: 'Dinner',
        diet: 'non-veg',
        image: skipImage ? undefined : 'https://images.unsplash.com/photo-1546833999-b9f581a1996d', // Default until fetched
        servings: parsed.servings,
        cuisine: parsed.cuisine,
        calories: parsed.calories,
        macronutrients: parsed.macronutrients,
        tips: parsed.tips || [],
        serving_ideas: parsed.serving_ideas || ''
      }));

      setAiRecipes(fullRecipes);
      sessionStorage.setItem('lastGeneratedRecipes', JSON.stringify(fullRecipes));
      sessionStorage.setItem('lastSearchMode', mode); // Persist mode on generation

      if (mode === 'pantry' && Array.isArray(input)) {
        const newHistory = [input, ...recentPantry.filter(i => JSON.stringify(i) !== JSON.stringify(input))].slice(0, 3);
        setRecentPantry(newHistory);
        localStorage.setItem('pantryHistory', JSON.stringify(newHistory));
      }

      // Fetch images in background ONLY if not skipped
      if (!skipImage) {
        fullRecipes.forEach(async (recipe, idx) => {
          try {
            const { data: imgData } = await supabase.functions.invoke('fetch-dish-image', {
              body: { dish_name: recipe.name }
            });
            if (imgData?.image_url) {
              setAiRecipes(prev => {
                const updated = [...prev];
                if (updated[idx]) updated[idx] = { ...updated[idx], image: imgData.image_url };
                sessionStorage.setItem('lastGeneratedRecipes', JSON.stringify(updated));
                return updated;
              });
            }
          } catch (e) {
            console.error("Image fetch failed for", recipe.name, e);
          }
        });
      }

    } catch (error: any) {
      console.error('Generation Error Full Details:', error);
      toast({
        title: 'Chef is experimenting...',
        description: 'We couldn\'t generate the full menu right now. Please try again.',
        className: 'bg-background text-foreground border border-border/50 shadow-xl'
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleFavourite = (recipe: Recipe) => toast({ title: 'Coming soon' });

  const handleAiRecipeClick = (recipe: Recipe) => {
    // Save to localStorage as backup for robustness (matches backend schema expected by Detail page)
    const aiFormat = {
      recipe_name: recipe.name,
      cooking_time_minutes: recipe.cookingTime,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image_url: recipe.image,
      cuisine: recipe.cuisine,
      nutrition: {
        calories: recipe.calories,
        protein: recipe.macronutrients?.protein,
        carbs: recipe.macronutrients?.carbs,
        fats: recipe.macronutrients?.fat
      },
      tips: recipe.tips,
      serving_ideas: recipe.serving_ideas,
      description: recipe.description
    };
    localStorage.setItem('aiRecipe', JSON.stringify(aiFormat));
    navigate(`/recipe/${recipe.id}`, { state: { recipeData: recipe } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <Header />

      <main className="relative min-h-[calc(100vh-64px)] flex flex-col items-center pt-24 pb-20 px-4 md:px-8">

        {/* Massive Ambient Glow */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/20 blur-[180px] rounded-full pointer-events-none -z-10" />

        {/* Minimalist Switcher */}
        <div className="mb-16 bg-white/5 backdrop-blur-2xl p-1.5 rounded-full border border-zinc-200/50 dark:border-white/10 shadow-xl inline-flex relative z-20">
          <button
            onClick={() => updateMode('dish')}
            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'dish' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            Find a Dish
          </button>
          <button
            onClick={() => updateMode('pantry')}
            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all duration-300 ${mode === 'pantry' ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'}`}
          >
            My Pantry
          </button>
        </div>

        {/* --- DYNAMIC MODE CONTENT --- */}

        {/* PANTRY MODE - "Mad Libs" Style Input */}
        {mode === 'pantry' && (
          <div className="w-full max-w-5xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-display text-3xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
              What's inside <br /> <span className="text-primary">your kitchen?</span>
            </h1>

            <div className="max-w-3xl mx-auto relative group mb-8">
              <div className="relative flex items-center justify-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                  placeholder="e.g. Chicken, Rice..."
                  className="w-full bg-transparent border-b-2 border-foreground/20 focus:border-primary text-center text-2xl md:text-4xl font-display font-bold py-2 placeholder:text-muted-foreground/50 outline-none transition-all duration-300"
                />
                {inputValue && (
                  <button
                    onClick={handleAddIngredient}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full hover:scale-110 transition-transform shadow-lg"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                )}
              </div>
              <p className="mt-4 text-muted-foreground text-sm uppercase tracking-widest opacity-60">Press Enter to add ingredient</p>
            </div>

            {/* Ingredients Grid - Compact Pills */}
            <div className="flex flex-wrap justify-center gap-2 min-h-[40px] mb-8">
              {ingredientsList.map((ing, idx) => (
                <span
                  key={idx}
                  className="group animate-in zoom-in spin-in-3 duration-300 inline-flex items-center gap-2 pl-3 pr-1.5 py-1 rounded-full bg-card border border-border/50 text-sm font-bold shadow-sm hover:shadow-md transition-all"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="p-0.5 rounded-full bg-muted/50 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                  >
                    <UtensilsCrossed className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {ingredientsList.length === 0 && (
                <div className="flex flex-col items-center justify-center text-muted-foreground/30 py-2">
                  <p className="text-sm font-medium">Add ingredients to start</p>
                </div>
              )}
            </div>

            {/* Repositioned Generate Button - Conditional */}
            {ingredientsList.length > 0 && (
              <div className="flex justify-center mb-8 animate-in slide-in-from-bottom-4 fade-in">
                <Button
                  onClick={() => generateAiRecipe(ingredientsList)}
                  disabled={isAiLoading}
                  className="h-12 px-8 rounded-full text-base font-bold shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all bg-primary text-primary-foreground"
                >
                  {isAiLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  {isAiLoading ? "Cooking..." : "Invent a Recipe"}
                </Button>
              </div>
            )}


            {/* Recent Pantry Searches */}
            {recentPantry.length > 0 && (
              <div className="max-w-2xl mx-auto border-t border-border/40 pt-6">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50 mb-4">Recent Inventions</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {recentPantry.slice(0, 3).map((items, idx) => (
                    <button
                      key={idx}
                      onClick={() => setIngredientsList(items)}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-secondary/30 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20"
                    >
                      {items.join(', ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* DISH MODE - Minimalist Search */}
        {mode === 'dish' && (
          <div className="w-full max-w-5xl text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter mb-4 leading-tight">
              I'm craving...
            </h1>
            <div className="max-w-4xl mx-auto relative mt-12 mb-16">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              {dishQuery && (
                <button
                  onClick={() => handleDishInputChange('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
              <input
                type="text"
                value={dishQuery}
                onChange={(e) => handleDishInputChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && dishQuery.trim() && generateAiRecipe(dishQuery)}
                placeholder="Pasta, Sushi, Tacos..."
                className="w-full bg-secondary/30 hover:bg-secondary/50 focus:bg-background border border-transparent focus:border-primary pl-12 pr-14 py-3 rounded-xl text-xl md:text-2xl font-display font-bold placeholder:text-muted-foreground/60 outline-none transition-all duration-300 shadow-sm"
              />
            </div>

            {/* Default State: Popular Tags (No Images) */}
            {!hasSearchedDish && aiRecipes.length === 0 && (
              <div className="max-w-2xl mx-auto">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50 mb-6">Popular Conversations</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Healthy Dinner', 'Quick Pasta', 'Vegan Curry', 'Gluten Free', 'Spicy Tacos', 'Comfort Food'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleDishInputChange(tag)}
                      className="px-6 py-2 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-medium"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSearchedDish && dishResults.length === 0 && aiRecipes.length === 0 ? (
              <div className="mt-10">
                <p className="text-xl text-muted-foreground mb-6">It's not in our cookbook, but we can make it.</p>
                <Button
                  onClick={() => generateAiRecipe(dishQuery)}
                  className="h-12 px-8 rounded-full text-lg font-bold shadow-2xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate "{dishQuery}"
                </Button>
              </div>
            ) : (
              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
                {hasSearchedDish && dishResults.map(r => (
                  <RecipeCard key={r.id} recipe={r} isFavourite={favouriteIds.has(r.id)} onToggleFavourite={toggleFavourite} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI RECIPES GRID - Minimalist Image Tiles */}
        {aiRecipes.length > 0 && !isAiLoading && (
          <div className="w-full max-w-6xl mt-24 mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center mb-8">
              <h2 className="font-display text-xs md:text-sm font-medium italic text-muted-foreground/40 max-w-xl mx-auto leading-relaxed">
                "{["Cooking is love made visible.", "Good food is the foundation of genuine happiness.", "People who love to eat are always the best people.", "First we eat, then we do everything else."][Math.floor(Math.random() * 4)]}"
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {aiRecipes.map(recipe => (
                <div
                  key={recipe.id}
                  onClick={() => handleAiRecipeClick(recipe)}
                  className={`group relative h-64 w-full md:w-[320px] lg:w-[380px] rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 shrink-0 ${!recipe.image ? 'bg-slate-900 border border-white/10' : 'bg-muted/20'}`}
                >
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10 opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-[10px] font-bold tracking-wider uppercase">
                        {recipe.cookingTime} min
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-white text-xl leading-tight mb-1 drop-shadow-md line-clamp-2">
                      {recipe.name}
                    </h3>
                    <p className="text-white/70 text-xs line-clamp-1 italic">
                      {recipe.description.substring(0, 50)}...
                    </p>
                  </div>

                  {/* Image */}
                  {recipe.image && (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12 mb-20 animate-in fade-in slide-in-from-bottom-8">
              <Button
                onClick={() => generateAiRecipe(mode === 'dish' ? dishQuery : ingredientsList, mode === 'pantry')}
                variant="outline"
                className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary text-primary transition-all"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {mode === 'dish' ? 'Find more variations' : 'Invent different recipes'}
              </Button>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isAiLoading && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-3xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <Loader2 className="w-24 h-24 text-primary animate-spin mb-8" />
            <h2 className="font-display text-4xl md:text-5xl font-bold animate-pulse">Designing your dish</h2>
          </div>
        )}

      </main>
    </div>
  );
}
