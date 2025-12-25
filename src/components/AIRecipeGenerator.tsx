import { useState } from 'react';
import { Sparkles, ChefHat, Clock, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneratedRecipe {
  recipe_name: string;
  cooking_time_minutes: number;
  difficulty: string;
  servings: number;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
}

export function AIRecipeGenerator() {
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<GeneratedRecipe | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast({
        title: 'Input required',
        description: 'Please enter ingredients or a dish name',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-recipe', {
        body: { input: input.trim() },
      });

      if (error) throw error;

      if (data.recipe) {
        setGeneratedRecipe(data.recipe);
        toast({
          title: 'Recipe generated!',
          description: `Created: ${data.recipe.recipe_name}`,
        });
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Error generating recipe:', error);
      toast({
        title: 'Generation failed',
        description: error.message || 'Failed to generate recipe. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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

  return (
    <div className="space-y-6">
      <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-primary/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-accent" />
            <h3 className="font-display text-xl font-semibold text-foreground">AI Recipe Generator</h3>
          </div>
          <p className="text-muted-foreground mb-4">
            Enter ingredients you have or a dish name, and our AI will create a custom recipe for you!
          </p>
          <div className="flex gap-3">
            <Input
              placeholder="e.g., chicken, garlic, lemon OR butter chicken"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerate()}
              className="flex-1"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedRecipe && (
        <Card className="border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <ChefHat className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {generatedRecipe.recipe_name}
                </h3>
              </div>
              <Badge className={getDifficultyColor(generatedRecipe.difficulty)}>
                {generatedRecipe.difficulty}
              </Badge>
            </div>

            <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{generatedRecipe.cooking_time_minutes} mins</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{generatedRecipe.servings} servings</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs text-primary font-bold">
                    {generatedRecipe.ingredients.length}
                  </span>
                  Ingredients
                </h4>
                <ul className="space-y-2">
                  {generatedRecipe.ingredients.map((ing, idx) => (
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
                    {generatedRecipe.instructions.length}
                  </span>
                  Instructions
                </h4>
                <ol className="space-y-3">
                  {generatedRecipe.instructions.map((step, idx) => (
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
      )}
    </div>
  );
}
