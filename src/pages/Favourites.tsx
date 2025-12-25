import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { RecipeCard } from '@/components/RecipeCard';
import { Button } from '@/components/ui/button';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { useToast } from '@/hooks/use-toast';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { Recipe } from '@/data/recipes';
import { Heart, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FavouriteRecipe {
  id: string;
  recipe_id: string;
  recipe_name: string;
  recipe_data: Recipe;
}

export default function Favourites() {
  const { user, loading: authLoading } = useExternalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [favourites, setFavourites] = useState<FavouriteRecipe[]>([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    const { data, error } = await externalSupabase
      .from('favourite_recipes')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favourites.',
        variant: 'destructive',
      });
    } else {
      setFavourites(data as unknown as FavouriteRecipe[]);
    }
    setLoading(false);
  };

  const removeFavourite = async (recipe: Recipe) => {
    if (!user) return;

    await externalSupabase
      .from('favourite_recipes')
      .delete()
      .eq('user_id', user.id)
      .eq('recipe_id', recipe.id);

    setFavourites(prev => prev.filter(f => f.recipe_id !== recipe.id));

    toast({
      title: 'Removed from favourites',
      description: `${recipe.name} has been removed from your favourites.`,
    });
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
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Your Favourites
            </h1>
            <p className="text-muted-foreground">
              {favourites.length} saved recipe{favourites.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {favourites.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favourites.map((favourite, index) => (
              <div
                key={favourite.id}
                className="animate-fade-up"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <RecipeCard
                  recipe={favourite.recipe_data}
                  isFavourite={true}
                  onToggleFavourite={removeFavourite}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <Heart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              No favourites yet
            </h3>
            <p className="text-muted-foreground mb-6">
              Start exploring recipes and save your favourites here
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
