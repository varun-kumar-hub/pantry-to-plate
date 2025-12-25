import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { recipes, searchRecipes, Recipe } from '@/data/recipes';
import { Search as SearchIcon, X, Sparkles, ChefHat } from 'lucide-react';

export default function Search() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());

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
    const { data } = await supabase
      .from('favourite_recipes')
      .select('recipe_id')
      .eq('user_id', user?.id);
    
    if (data) {
      setFavouriteIds(new Set(data.map(f => f.recipe_id)));
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Enter ingredients',
        description: 'Please enter at least one ingredient or recipe name.',
        variant: 'destructive',
      });
      return;
    }

    const results = searchRecipes(searchQuery);
    setSearchResults(results);
    setHasSearched(true);

    if (results.length === 0) {
      toast({
        title: 'No recipes found',
        description: 'Try different ingredients or browse our popular recipes below.',
      });
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
      await supabase
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
      await supabase.from('favourite_recipes').insert([{
        user_id: user.id,
        recipe_id: recipe.id,
        recipe_name: recipe.name,
        recipe_data: recipe as unknown as Record<string, unknown>,
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
              Enter ingredients separated by commas, or search for a recipe name
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g., chicken, rice, garlic or 'pasta'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-12 pr-10 h-14 text-base rounded-xl"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setHasSearched(false);
                      setSearchResults([]);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              <Button onClick={handleSearch} size="lg" className="h-14 px-8 rounded-xl gap-2">
                <Sparkles className="h-5 w-5" />
                Find Recipes
              </Button>
            </div>

            {/* Quick ingredient suggestions */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['chicken', 'pasta', 'eggs', 'rice', 'tomatoes', 'garlic'].map((ingredient) => (
                <button
                  key={ingredient}
                  onClick={() => {
                    setSearchQuery(prev => 
                      prev ? `${prev}, ${ingredient}` : ingredient
                    );
                  }}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors"
                >
                  + {ingredient}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
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
                Try different ingredients or check out our popular recipes
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
      </main>
    </div>
  );
}
