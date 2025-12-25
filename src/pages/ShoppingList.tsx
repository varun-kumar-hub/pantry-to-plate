import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { useToast } from '@/hooks/use-toast';
import { externalSupabase } from '@/integrations/external-supabase/client';
import { ShoppingCart, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShoppingItem {
  id: string;
  ingredient_name: string;
  quantity: string | null;
  is_purchased: boolean;
}

export default function ShoppingList() {
  const { user, loading: authLoading } = useExternalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadShoppingList();
    }
  }, [user]);

  const loadShoppingList = async () => {
    setLoading(true);
    const { data, error } = await externalSupabase
      .from('shopping_list')
      .select('*')
      .eq('user_id', user?.id)
      .order('is_purchased', { ascending: true })
      .order('ingredient_name', { ascending: true });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load shopping list.',
        variant: 'destructive',
      });
    } else {
      setItems(data);
    }
    setLoading(false);
  };

  const toggleItem = async (item: ShoppingItem) => {
    const newValue = !item.is_purchased;

    await externalSupabase
      .from('shopping_list')
      .update({ is_purchased: newValue })
      .eq('id', item.id);

    setItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, is_purchased: newValue } : i))
    );
  };

  const deleteItem = async (id: string) => {
    await externalSupabase.from('shopping_list').delete().eq('id', id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearPurchased = async () => {
    if (!user) return;

    await externalSupabase
      .from('shopping_list')
      .delete()
      .eq('user_id', user.id)
      .eq('is_purchased', true);

    setItems(prev => prev.filter(i => !i.is_purchased));

    toast({
      title: 'Cleared purchased items',
      description: 'All purchased items have been removed.',
    });
  };

  const clearAll = async () => {
    if (!user) return;

    await externalSupabase.from('shopping_list').delete().eq('user_id', user.id);
    setItems([]);

    toast({
      title: 'Shopping list cleared',
      description: 'All items have been removed.',
    });
  };

  const purchasedCount = items.filter(i => i.is_purchased).length;
  const totalCount = items.length;

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

      <main className="container py-8 max-w-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <ShoppingCart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Shopping List
              </h1>
              <p className="text-muted-foreground">
                {purchasedCount} of {totalCount} items purchased
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link to="/planner">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </Button>
            </Link>
            {purchasedCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearPurchased}>
                Clear Purchased
              </Button>
            )}
            {totalCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive hover:text-destructive">
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${(purchasedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        )}

        {items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all animate-fade-up",
                  item.is_purchased
                    ? "bg-muted/30 border-border"
                    : "bg-card border-border hover:border-primary/30"
                )}
                style={{ animationDelay: `${0.02 * index}s` }}
              >
                <Checkbox
                  checked={item.is_purchased}
                  onCheckedChange={() => toggleItem(item)}
                  className="h-5 w-5"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      "font-medium capitalize transition-colors",
                      item.is_purchased
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {item.ingredient_name}
                  </p>
                  {item.quantity && (
                    <p className="text-sm text-muted-foreground">
                      {item.quantity}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
              <ShoppingCart className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              Your shopping list is empty
            </h3>
            <p className="text-muted-foreground mb-6">
              Plan your meals first, then generate a shopping list
            </p>
            <Link to="/planner">
              <Button variant="default" className="gap-2">
                <Calendar className="h-4 w-4" />
                Go to Meal Planner
              </Button>
            </Link>
          </div>
        )}

        {purchasedCount === totalCount && totalCount > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-primary/10 text-center animate-scale-in">
            <p className="text-primary font-medium">
              🎉 All done! You've got everything on your list!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
