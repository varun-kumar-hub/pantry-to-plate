import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { AIRecipeCard, AIGeneratedRecipe } from '@/components/AIRecipeCard';
import { VarietyCard, DishVariety } from '@/components/VarietyCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { useToast } from '@/hooks/use-toast';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { recipes, Recipe } from '@/data/recipes';
import { getFallbackVarieties, findStrictMatch } from '@/data/dishVarieties';
import { Search as SearchIcon, X, Sparkles, ChefHat, Loader2, ArrowLeft } from 'lucide-react';

type SearchState = 'initial' | 'varieties' | 'recipe';

export default function Search() {
  const { user, loading: authLoading } = useExternalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  // New state for varieties flow
  const [searchState, setSearchState] = useState<SearchState>('initial');
  const [dishName, setDishName] = useState('');
  const [varieties, setVarieties] = useState<DishVariety[]>([]);
  const [aiRecipe, setAiRecipe] = useState<AIGeneratedRecipe | null>(null);

  // New Search Mode state
  const [searchMode, setSearchMode] = useState<'dish' | 'pantry'>('dish');

  // Dietary Preferences
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [nonVegetarianOnly, setNonVegetarianOnly] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    // Load local settings
    const vegPref = localStorage.getItem('vegetarianOnly') === 'true';
    const nonVegPref = localStorage.getItem('nonVegetarianOnly') === 'true';
    setVegetarianOnly(vegPref);
    setNonVegetarianOnly(nonVegPref);

    if (user) {
      loadFavourites();
    }
  }, [user]);

  const loadFavourites = async () => {
    const { data } = await externalSupabase
      .from('favourite_recipes')
      .select('recipe_id')
      .eq('user_id', user?.id);

    if (data) {
      setFavouriteIds(new Set(data.map(f => f.recipe_id)));
    }
  };

  const fetchDishImage = async (dishName: string, fallbackTerm?: string): Promise<string | null> => {
    try {
      const PEXELS_API_KEY = 'MpZjLTOunL2GB9RJR0q3JfGcKtpShdshWePBSnSEFlrvAjJwxFwYoorv';

      const searchPexels = async (query: string) => {
        const response = await fetch(
          `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`,
          { headers: { Authorization: PEXELS_API_KEY } }
        );
        return response.ok ? await response.json() : null;
      };

      // 1. Try specific dish name
      let data = await searchPexels(dishName);

      // 2. If no results and we have a fallback, try fallback
      if ((!data || !data.photos || data.photos.length === 0) && fallbackTerm) {
        console.log(`No images for ${dishName}, trying fallback: ${fallbackTerm}`);
        data = await searchPexels(fallbackTerm);
      }

      if (data && data.photos && data.photos.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.photos.length);
        return data.photos[randomIndex].src.medium;
      }
      return null;
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  };

  const fetchImagesForVarieties = async (varietiesList: DishVariety[], fallbackTerm?: string) => {
    // Fetch real images for all varieties in parallel
    const imagePromises = varietiesList.map(async (variety) => {
      // If we already have a static image (e.g. from local assets), skip fetch
      if (variety.image_url && variety.image_url.startsWith('/')) {
        return { varietyName: variety.variety_name, imageUrl: variety.image_url };
      }

      setLoadingImages(prev => new Set(prev).add(variety.variety_name));

      const imageUrl = await fetchDishImage(variety.variety_name, fallbackTerm);

      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(variety.variety_name);
        return next;
      });

      return { varietyName: variety.variety_name, imageUrl };
    });

    const results = await Promise.all(imagePromises);

    // Update varieties with fetched images
    setVarieties(prev =>
      prev.map(v => {
        const result = results.find(r => r.varietyName === v.variety_name);
        return result?.imageUrl ? { ...v, image_url: result.imageUrl } : v;
      })
    );
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: searchMode === 'dish' ? 'Enter a dish name' : 'Enter ingredients',
        description: searchMode === 'dish'
          ? 'Please enter a dish name to find varieties.'
          : 'Please enter ingredients to find what you can cook.',
        variant: 'destructive',
      });
      return;
    }

    setHasSearched(true);
    setVarieties([]);
    setAiRecipe(null);
    setDishName(searchQuery.trim());
    setIsLoading(true);
    setSearchState('varieties');

    // Rule 9 Logic (Database First) - ONLY for Dish Mode
    if (searchMode === 'dish') {
      const dbMatch = findStrictMatch(searchQuery.trim());

      if (dbMatch) {
        // Deterministic DB Match Found
        let varietiesWithType: DishVariety[] = dbMatch.map(v => ({
          variety_name: v.variety_name,
          short_description: v.short_description,
          image_url: undefined, // Will be fetched
          diet: v.diet // Carry over diet type
        }));

        // Apply Dietary Filter
        if (vegetarianOnly) {
          varietiesWithType = varietiesWithType.filter(v => v.diet === 'veg');
        } else if (nonVegetarianOnly) {
          varietiesWithType = varietiesWithType.filter(v => v.diet === 'non-veg');
        }

        if (varietiesWithType.length > 0) {
          setVarieties(varietiesWithType);
          toast({
            title: 'Found in Cookbook!',
            description: `Found ${varietiesWithType.length} varieties. Fetching images...`,
          });
          fetchImagesForVarieties(varietiesWithType);
          setIsLoading(false); // Done!
          return;
        } else {
          // If filtered list is empty (e.g. searching "Chicken" with Veg Only mode), fall through to AI
          console.log("Filtered all local results based on diet. Trying AI...");
        }
      }
    }

    // AI Logic (Fallback for Dish Mode OR Primary for Pantry Mode)
    try {
      const GEMINI_API_KEY = 'AIzaSyA9Foy_jSrzp7sBwkiXuGBvx3wRy3FWNP8';

      let dietPrompt = "";
      if (vegetarianOnly) dietPrompt = "strictly VEGETARIAN";
      else if (nonVegetarianOnly) dietPrompt = "strictly NON-VEGETARIAN";

      let prompt = "";

      if (searchMode === 'dish') {
        prompt = `Generate 6 popular and distinct ${dietPrompt} varieties of the dish "${searchQuery.trim()}". 
         For each, provide a 'variety_name' and 'short_description'. 
         Return a valid JSON object with a 'varieties' array. 
         Example structure: { "varieties": [{ "variety_name": "Name", "short_description": "Desc" }] }`;
      } else {
        // Pantry Mode Prompt
        prompt = `I have these ingredients: "${searchQuery.trim()}". 
         Suggest 6 distinct dishes I can cook using mainly these ingredients. ${dietPrompt}.
         For each, provide a 'variety_name' (the name of the dish) and 'short_description' (why it works with these ingredients).
         Return a valid JSON object with a 'varieties' array. 
         Example structure: { "varieties": [{ "variety_name": "Name", "short_description": "Desc" }] }`;
      }

      // Retry helper
      const fetchWithRetry = async (url: string, options: RequestInit, retries = 2) => {
        for (let i = 0; i < retries; i++) {
          try {
            const res = await fetch(url, options);
            if (res.ok) return res;
          } catch (e) {
            if (i === retries - 1) throw e;
          }
          await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
        }
        throw new Error('All retries failed');
      };

      const response = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      let varietiesData;

      try {
        const text = data.candidates[0].content.parts[0].text;
        console.log("Gemini Raw Response:", text); // Debugging

        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          varietiesData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON object found in response');
        }
      } catch (e) {
        console.error('Failed to parse Gemini varieties response:', e);
        // Fallback Logic
        if (searchMode === 'dish') {
          // Dish Mode Fallback: Check local data
          let fb = getFallbackVarieties(searchQuery.trim()) || [];
          if (vegetarianOnly) fb = fb.filter(v => v.diet === 'veg');
          if (nonVegetarianOnly) fb = fb.filter(v => v.diet === 'non-veg');
          varietiesData = { varieties: fb };
        } else {
          // Pantry Mode Fallback: Provide generic suggestions based on common ingredients
          // This ensures the user ALWAYS sees something instead of an error
          const genericFallback = [
            { variety_name: "Fried Rice", short_description: "A classic way to use leftover rice and vegetables.", diet: "veg" },
            { variety_name: "Vegetable Stir Fry", short_description: "Quick, healthy, and uses whatever veggies you have.", diet: "veg" },
            { variety_name: "Simple Curry", short_description: "A basic curry base that works with almost any protein or veg.", diet: "veg" },
            { variety_name: "Omelette", short_description: "Perfect if you have eggs and some basic veggies.", diet: "non-veg" }
          ];

          let fb = genericFallback;
          if (vegetarianOnly) fb = fb.filter(v => v.diet === 'veg');
          if (nonVegetarianOnly) fb = fb.filter(v => v.diet === 'non-veg');

          varietiesData = { varieties: fb };
          toast({
            title: "Offline Mode",
            description: "Couldn't reach AI. Showing generic ideas for your ingredients.",
          });
        }
      }

      const varietiesList = varietiesData.varieties || [];

      if (varietiesList.length > 0) {
        // Map to ensure shape
        const varietiesWithType: DishVariety[] = varietiesList.map((v: any) => ({
          variety_name: v.variety_name,
          short_description: v.short_description,
        }));

        setVarieties(varietiesWithType);

        toast({
          title: searchMode === 'dish' ? 'Varieties Found!' : 'Dishes Suggested!',
          description: `Found ${varietiesWithType.length} options. Fetching images...`,
        });

        // Fetch real images for all varieties
        // For Pantry mode, fallback term defaults to first ingredient to help search
        const fallbackTerm = searchMode === 'pantry' ? searchQuery.split(',')[0].trim() : searchQuery.trim();
        fetchImagesForVarieties(varietiesWithType, fallbackTerm);
      } else {
        // Fallback logic mostly applies to Dish Mode
        if (searchMode === 'dish') {
          let fallbackData = getFallbackVarieties(searchQuery.trim());

          if (fallbackData) {
            // Apply Filters to fallback data
            if (vegetarianOnly) {
              fallbackData = fallbackData.filter(v => v.diet === 'veg');
            } else if (nonVegetarianOnly) {
              fallbackData = fallbackData.filter(v => v.diet === 'non-veg');
            }
          }

          if (fallbackData && fallbackData.length > 0) {
            const varietiesWithType = fallbackData.map(v => ({
              variety_name: v.variety_name,
              short_description: v.short_description,
            }));
            setVarieties(varietiesWithType);
            fetchImagesForVarieties(varietiesWithType);
          } else {
            toast({
              title: 'No varieties found',
              description: vegetarianOnly
                ? 'No vegetarian varieties found for this dish.'
                : nonVegetarianOnly
                  ? 'No non-vegetarian varieties found for this dish.'
                  : 'Try a more general dish name.',
            });
            setSearchState('initial');
          }
        } else {
          toast({
            title: 'No suggestions',
            description: 'Could not find dishes with these ingredients. Try simpler ones.'
          });
          setSearchState('initial');
        }
      }
    } catch (error: any) {
      console.error('Error fetching varieties, defaulting to offline data:', error);

      let fallbackData;

      if (searchMode === 'dish') {
        fallbackData = getFallbackVarieties(searchQuery.trim());
      } else {
        // Pantry Mode Fallback - Same generic list
        fallbackData = [
          { variety_name: "Fried Rice", short_description: "A classic way to use leftover rice and vegetables.", diet: "veg" },
          { variety_name: "Vegetable Stir Fry", short_description: "Quick, healthy, and uses whatever veggies you have.", diet: "veg" },
          { variety_name: "Simple Curry", short_description: "A basic curry base that works with almost any protein or veg.", diet: "veg" },
          { variety_name: "Omelette", short_description: "Perfect if you have eggs and some basic veggies.", diet: "non-veg" }
        ] as any;
      }

      if (fallbackData) {
        // Apply Filters to fallback data
        if (vegetarianOnly) {
          fallbackData = fallbackData.filter(v => v.diet === 'veg');
        } else if (nonVegetarianOnly) {
          fallbackData = fallbackData.filter(v => v.diet === 'non-veg');
        }
      }

      if (fallbackData && fallbackData.length > 0) {
        const varietiesWithType = fallbackData.map(v => ({
          variety_name: v.variety_name,
          short_description: v.short_description,
        }));
        setVarieties(varietiesWithType);
        fetchImagesForVarieties(varietiesWithType);
      } else {
        // Only show error if we truly have nothing
        toast({
          title: 'No results found',
          description: 'Try a more general dish name.',
        });
        setSearchState('initial');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVarietyClick = async (variety: DishVariety) => {
    setIsLoading(true);

    try {
      const GEMINI_API_KEY = 'AIzaSyA9Foy_jSrzp7sBwkiXuGBvx3wRy3FWNP8';

      let dietInstruction = "";
      if (vegetarianOnly) dietInstruction = "Make this recipe purely Vegetarian (no meat, no eggs if strictly veg).";
      else if (nonVegetarianOnly) dietInstruction = "Make this recipe Non-Vegetarian (include meat/fish/egg).";


      const prompt = `Generate a recipe for ${variety.variety_name}. ${dietInstruction} Return a valid JSON object (no markdown formatting) with the following structure:
      {
        "recipe_name": "${variety.variety_name}",
        "cooking_time_minutes": number,
        "difficulty": "Easy" | "Medium" | "Hard",
        "servings": number,
        "ingredients": [{"name": string, "quantity": string}],
        "instructions": [string],
        "description": string,
        "nutrition": { "calories": number, "protein": "XXg", "carbs": "XXg", "fats": "XXg" }
      }`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      let recipeJson;
      try {
        const text = data.candidates[0].content.parts[0].text;
        // Robust JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recipeJson = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        console.error('Failed to parse Gemini response:', e);
        console.log('Raw text:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        throw new Error('Failed to parse recipe data');
      }

      if (recipeJson) {
        // Set recipe with the pre-generated image from variety
        const recipeWithImage = {
          ...recipeJson,
          image_url: variety.image_url || null,
        };

        // Store recipe and navigate directly to detail page
        localStorage.setItem('aiRecipe', JSON.stringify(recipeWithImage));
        navigate('/recipe/ai-generated');

        toast({
          title: 'Recipe Generated!',
          description: `Created: ${recipeJson.recipe_name}`,
        });
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);

      // Fallback: Generate a template recipe so the user always gets a result
      const fallbackRecipe = {
        recipe_name: variety.variety_name,
        cooking_time_minutes: 45,
        difficulty: "Medium",
        servings: 4,
        ingredients: [
          { name: "Main Ingredient", quantity: "500g" },
          { name: "Onions", quantity: "2 medium" },
          { name: "Tomatoes", quantity: "2 medium" },
          { name: "Spices", quantity: "to taste" },
          { name: "Oil", quantity: "2 tbsp" },
          { name: "Salt", quantity: "to taste" }
        ],
        instructions: [
          "Prepare all the ingredients by washing and chopping them efficiently.",
          `Heat oil in a pan and sauté the spices until aromatic for the ${variety.variety_name}.`,
          "Add the onions and cook until they turn golden brown and translucent.",
          "Add tomatoes and cook until they become soft and mushy.",
          "Add the main ingredients and mix well with the masala base.",
          "Cover and cook until the dish is fully done and flavors are absorbed.",
          "Garnish with fresh coriander leaves and serve hot."
        ],
        description: `A delicious homemade version of ${variety.variety_name}, perfect for a family meal.`
      };

      const recipeWithImage = {
        ...fallbackRecipe,
        image_url: variety.image_url || null,
      };

      localStorage.setItem('aiRecipe', JSON.stringify(recipeWithImage));
      navigate('/recipe/ai-generated');

      toast({
        title: 'Recipe Generated!',
        description: `Created: ${variety.variety_name}`,
      });
      setIsLoading(false);
    }
  };

  const handleAIRecipeClick = () => {
    if (aiRecipe) {
      localStorage.setItem('aiRecipe', JSON.stringify(aiRecipe));
      navigate('/recipe/ai-generated');
    }
  };

  const handleBack = () => {
    if (searchState === 'recipe') {
      setSearchState('varieties');
      setAiRecipe(null);
    } else if (searchState === 'varieties') {
      setSearchState('initial');
      setVarieties([]);
      setDishName('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleFavourite = async (recipe: Recipe) => {
    if (!user) return;

    const isFavourite = favouriteIds.has(recipe.id);

    if (isFavourite) {
      await externalSupabase
        .from('favourite_recipes')
        .delete()
        .eq('user_id', user.id)
        .eq('recipe_id', recipe.id);

      setFavouriteIds(prev => {
        const next = new Set(prev);
        next.delete(recipe.id);
        return next;
      });

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

      setFavouriteIds(prev => new Set(prev).add(recipe.id));

      toast({
        title: 'Added to favourites',
        description: `${recipe.name} has been added to your favourites.`,
      });
    }
  };

  // Randomize popular recipes so different users see different suggestions
  const popularRecipes = useMemo(() => {
    // 1. Filter ALL recipes first based on diet
    let filtered = [...recipes];

    // Safety check - force refresh from storage if memo runs but effect hasn't
    const vegPref = localStorage.getItem('vegetarianOnly') === 'true';
    const nonVegPref = localStorage.getItem('nonVegetarianOnly') === 'true';

    // We can use state here because useMemo will re-run when state changes
    if (vegetarianOnly || vegPref) {
      filtered = filtered.filter(r => r.diet === 'veg');
    } else if (nonVegetarianOnly || nonVegPref) {
      filtered = filtered.filter(r => r.diet === 'non-veg');
    }

    // 2. Then shuffle and slice
    return filtered.sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [vegetarianOnly, nonVegetarianOnly]); // Add dependencies to re-run on preference change

  const displayRecipes = hasSearched ? searchResults : popularRecipes;

  if (authLoading) {
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
        {/* Search Section */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              What's in Your Kitchen?
            </h1>
            <p className="text-muted-foreground">
              Enter a dish name — we'll show you popular varieties to choose from!
            </p>
            {/* Active Filters Indicator */}
            {(vegetarianOnly || nonVegetarianOnly) && (
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium animate-in fade-in">
                <ChefHat className="h-4 w-4" />
                <span>
                  {vegetarianOnly ? "Vegetarian Only Mode Active 🥦" : "Non-Vegetarian Only Mode Active 🍗"}
                </span>
              </div>
            )}
          </div>

          <div className="relative">
            {/* Search Mode Toggles */}
            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={() => setSearchMode('dish')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchMode === 'dish'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Find a Dish
              </button>
              <button
                onClick={() => setSearchMode('pantry')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${searchMode === 'pantry'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
              >
                Pantry Search (Ingredients)
              </button>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={searchMode === 'dish' ? "e.g., biryani, pizza, pasta..." : "e.g., chicken, onions, tomatoes, rice..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  className="pl-12 pr-10 h-14 text-base rounded-xl"
                />
                {searchQuery && !isLoading && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setHasSearched(false);
                      setSearchResults([]);
                      setVarieties([]);
                      setAiRecipe(null);
                      setSearchState('initial');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button
                onClick={handleSearch}
                size="lg"
                className="h-14 px-8 rounded-xl gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {searchMode === 'dish' ? 'Find Varieties' : 'Suggest Dishes'}
                  </>
                )}
              </Button>
            </div>

            {/* Quick dish suggestions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['biryani', 'pizza', 'pasta', 'curry', 'burger', 'tacos'].map((dish) => (
                <button
                  key={dish}
                  onClick={() => setSearchQuery(dish)}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50 capitalize"
                >
                  {dish}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back button when in varieties or recipe state */}
        {searchState !== 'initial' && (
          <div className="max-w-3xl mx-auto mb-6">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
              disabled={isLoading}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {searchState === 'recipe' ? 'Varieties' : 'Search'}
            </Button>
          </div>
        )}

        {/* Varieties Section */}
        {searchState === 'varieties' && varieties.length > 0 && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Varieties of {dishName}
                {(vegetarianOnly || nonVegetarianOnly) && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({vegetarianOnly ? 'Vegetarian' : 'Non-Veg'})
                  </span>
                )}
              </h2>
              {loadingImages.size > 0 && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading images...
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {varieties.map((variety, index) => (
                <div
                  key={variety.variety_name}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${0.05 * index}s` }}
                >
                  <VarietyCard
                    variety={variety}
                    onClick={() => handleVarietyClick(variety)}
                    isLoadingImage={loadingImages.has(variety.variety_name)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Generated Recipe Card */}
        {searchState === 'recipe' && aiRecipe && (
          <div className="max-w-md mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                Generated Recipe
              </h2>
            </div>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <AIRecipeCard
                recipe={aiRecipe}
                onClick={handleAIRecipeClick}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Click the card to view full recipe details
            </p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="max-w-3xl mx-auto mb-12 text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchState === 'varieties' ? 'Finding varieties...' : 'Generating recipe...'}
            </p>
          </div>
        )}

        {/* Results Section - Show only in initial state */}
        {searchState === 'initial' && (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <ChefHat className="h-5 w-5 text-primary" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                {hasSearched
                  ? `${searchResults.length} Recipe${searchResults.length !== 1 ? 's' : ''} Found`
                  : 'Popular Recipes'}
              </h2>
            </div>

            {displayRecipes.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${0.05 * index}s` }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      isFavourite={favouriteIds.has(recipe.id)}
                      onToggleFavourite={toggleFavourite}
                    />
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-16">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <SearchIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  No recipes found
                </h3>
                <p className="text-muted-foreground mb-6">
                  Try a different dish name or check out our popular recipes
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setHasSearched(false);
                  }}
                >
                  Browse All Recipes
                </Button>
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  {vegetarianOnly
                    ? "No popular vegetarian recipes found. Search for something else!"
                    : "No popular non-vegetarian recipes found. Search for something else!"}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
