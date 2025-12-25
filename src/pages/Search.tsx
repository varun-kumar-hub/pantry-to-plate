import { useState, useEffect } from 'react';
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
import { recipes, searchRecipes, Recipe } from '@/data/recipes';
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

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
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

  const generateDishImage = async (dishName: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-dish-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dish_name: dishName }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      return data.image_url || null;
    } catch (error) {
      console.error('Error generating image:', error);
      return null;
    }
  };

  const generateImagesForVarieties = async (varietiesList: DishVariety[]) => {
    // Generate images for all varieties in parallel
    const imagePromises = varietiesList.map(async (variety) => {
      setLoadingImages(prev => new Set(prev).add(variety.variety_name));
      
      const imageUrl = await generateDishImage(variety.variety_name);
      
      setLoadingImages(prev => {
        const next = new Set(prev);
        next.delete(variety.variety_name);
        return next;
      });

      return { varietyName: variety.variety_name, imageUrl };
    });

    const results = await Promise.all(imagePromises);

    // Update varieties with generated images
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
        title: 'Enter a dish name',
        description: 'Please enter a dish name to find varieties.',
        variant: 'destructive',
      });
      return;
    }

    // Search static recipes for reference
    const results = searchRecipes(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
    setVarieties([]);
    setAiRecipe(null);
    setDishName(searchQuery.trim());

    // Fetch dish varieties
    setIsLoading(true);
    setSearchState('varieties');
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-dish-varieties`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dish_name: searchQuery.trim() }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.varieties && data.varieties.length > 0) {
        setVarieties(data.varieties);
        setIsLoading(false);
        
        toast({
          title: 'Varieties Found!',
          description: `Found ${data.varieties.length} varieties. Generating images...`,
        });

        // Generate images for all varieties in background
        generateImagesForVarieties(data.varieties);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setIsLoading(false);
        toast({
          title: 'No varieties found',
          description: 'Try a different dish name.',
          variant: 'destructive',
        });
        setSearchState('initial');
      }
    } catch (error: any) {
      console.error('Error fetching varieties:', error);
      toast({
        title: 'Could not find varieties',
        description: 'Try a different dish name.',
        variant: 'destructive',
      });
      setSearchState('initial');
      setIsLoading(false);
    }
  };

  const handleVarietyClick = async (variety: DishVariety) => {
    setIsLoading(true);

    try {
      // Generate recipe
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-recipe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ input: variety.variety_name }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (data.recipe) {
        // Set recipe with the pre-generated image from variety
        const recipeWithImage = {
          ...data.recipe,
          image_url: variety.image_url || null,
        };
        
        // Store recipe and navigate directly to detail page
        sessionStorage.setItem('aiRecipe', JSON.stringify(recipeWithImage));
        navigate('/recipe/ai-generated');
        
        toast({
          title: 'Recipe Generated!',
          description: `Created: ${data.recipe.recipe_name}`,
        });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Could not generate recipe',
        description: 'Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleAIRecipeClick = () => {
    if (aiRecipe) {
      sessionStorage.setItem('aiRecipe', JSON.stringify(aiRecipe));
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

  const popularRecipes = recipes.slice(0, 6);
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
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g., biryani, pizza, pasta, curry..."
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
                    Find Varieties
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
              </h2>
              {loadingImages.size > 0 && (
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading images...
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}
