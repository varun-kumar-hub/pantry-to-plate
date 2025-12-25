import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { useToast } from '@/hooks/use-toast';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { recipes, searchRecipes, Recipe } from '@/data/recipes';
import { Search as SearchIcon, X, Sparkles, ChefHat, Clock, Users, Loader2 } from 'lucide-react';

interface AIGeneratedRecipe {
  recipe_name: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
}

export default function Search() {
  const { user, loading: authLoading } = useExternalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Recipe[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Enter ingredients',
        description: 'Please enter at least one ingredient or recipe name.',
        variant: 'destructive',
      });
      return;
    }

    // First search static recipes
    const results = searchRecipes(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
    setAiRecipe(null);

    // If no static results, generate with AI using external Supabase
    if (results.length === 0) {
      setIsGenerating(true);
      try {
        const response = await fetch(
          'https://fmcxgawnbeszoyslawik.supabase.co/functions/v1/generate-recepie',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input: searchQuery.trim() }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (data.recipe) {
          setAiRecipe(data.recipe);
          toast({
            title: 'AI Recipe Generated!',
            description: `Created: ${data.recipe.recipe_name}`,
          });
        } else if (data.error) {
          throw new Error(data.error);
        }
      } catch (error: any) {
        console.error('Error generating recipe:', error);
        toast({
          title: 'Could not generate recipe',
          description: 'Try different ingredients or browse our popular recipes.',
          variant: 'destructive',
        });
      } finally {
        setIsGenerating(false);
      }
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
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
              Enter ingredients or a dish name — we'll find or generate a recipe for you!
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g., chicken, rice, garlic or 'butter chicken'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isGenerating}
                  className="pl-12 pr-10 h-14 text-base rounded-xl"
                />
                {searchQuery && !isGenerating && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setHasSearched(false);
                      setSearchResults([]);
                      setAiRecipe(null);
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
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Find Recipes
                  </>
                )}
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
                  disabled={isGenerating}
                  className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  + {ingredient}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Generated Recipe */}
        {aiRecipe && (
          <div className="max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-accent" />
              <h2 className="font-display text-xl font-semibold text-foreground">
                AI Generated Recipe
              </h2>
            </div>
            <Card className="border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <ChefHat className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">
                      {aiRecipe.recipe_name}
                    </h3>
                  </div>
                  <Badge className={getDifficultyColor(aiRecipe.difficulty)}>
                    {aiRecipe.difficulty}
                  </Badge>
                </div>

                <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{aiRecipe.cooking_time_minutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{aiRecipe.servings} servings</span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                        {aiRecipe.ingredients.length}
                      </span>
                      Ingredients
                    </h4>
                    <ul className="space-y-2">
                      {aiRecipe.ingredients.map((ing, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                          <span className="w-2 h-2 bg-accent rounded-full" />
                          <span className="font-medium text-foreground">{ing.quantity}</span>
                          <span>{ing.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-accent/10 rounded-full flex items-center justify-center text-xs text-accent font-bold">
                        {aiRecipe.instructions.length}
                      </span>
                      Instructions
                    </h4>
                    <ol className="space-y-3">
                      {aiRecipe.instructions.map((step, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
          ) : hasSearched && !aiRecipe && !isGenerating ? (
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
