import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { recipes as initialRecipes, Recipe } from '@/data/recipes';
import { useExternalAuth } from '@/hooks/useExternalAuth';

export function useRecommendations() {
    const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useExternalAuth();

    useEffect(() => {
        // If we have a user, key by ID. If not, use generic 'guest'.
        const sessionKey = user?.id ? `session_recipes_${user.id}` : 'session_recipes_guest';

        const fetchRecipes = async () => {
            // Check session storage first
            const cached = sessionStorage.getItem(sessionKey);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log('Using cached recipes for', sessionKey);
                        setRecipes(parsed);
                        return;
                    }
                } catch (e) {
                    console.error('Failed to parse cached recipes', e);
                }
            }

            setLoading(true);
            try {
                console.log('Fetching new recommendations...');
                const { data, error } = await supabase.functions.invoke('get-recommendations');

                if (error) throw error;

                if (data && data.recipes) {
                    setRecipes(data.recipes);
                    sessionStorage.setItem(sessionKey, JSON.stringify(data.recipes));
                }
            } catch (err: any) {
                console.error('Error fetching recommendations:', err);
                setError(err.message || 'Failed to load recipes');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipes();
    }, [user?.id]); // Re-fetch if user changes

    return { recipes, loading, error };
}
