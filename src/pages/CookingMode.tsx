import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { getRecipeById, Recipe } from '@/data/recipes';
import {
    ArrowLeft,
    ArrowRight,
    X,
    Maximize2,
    CheckCircle2,
    ChefHat,
    Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// Reusing interface for AI consistency
interface AIGeneratedRecipe {
    recipe_name: string;
    cooking_time_minutes: number;
    difficulty: string;
    servings: number;
    ingredients: { name: string; quantity: string }[];
    instructions: string[];
    image_url?: string;
}

export default function CookingMode() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useExternalAuth();

    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [aiRecipe, setAiRecipe] = useState<AIGeneratedRecipe | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [showIngredients, setShowIngredients] = useState(false);
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);

    const isAIRecipe = id === 'ai-generated';

    // Auth & Data Loading
    useEffect(() => {
        if (!authLoading && !user) navigate('/auth');
    }, [user, authLoading, navigate]);

    useEffect(() => {
        if (id) {
            if (isAIRecipe) {
                const stored = localStorage.getItem('aiRecipe');
                if (stored) setAiRecipe(JSON.parse(stored));
                else navigate('/search');
            } else {
                const found = getRecipeById(id);
                if (found) setRecipe(found);
                else navigate('/search');
            }
        }
    }, [id, navigate, isAIRecipe]);

    // Wake Lock Implementation
    useEffect(() => {
        const requestWakeLock = async () => {
            try {
                if ('wakeLock' in navigator) {
                    const sentinel = await navigator.wakeLock.request('screen');
                    setWakeLock(sentinel);
                    console.log('Wake Lock active');
                }
            } catch (err) {
                console.error('Wake Lock error:', err);
            }
        };

        requestWakeLock();

        return () => {
            if (wakeLock) wakeLock.release();
        };
    }, []);

    const instructions = isAIRecipe ? aiRecipe?.instructions : recipe?.instructions;
    const ingredients = isAIRecipe ? aiRecipe?.ingredients : recipe?.ingredients;
    const recipeName = isAIRecipe ? aiRecipe?.recipe_name : recipe?.name;

    if (!instructions || !ingredients) return null;

    const progress = ((currentStep + 1) / instructions.length) * 100;
    const isFinished = currentStep === instructions.length;

    const handleNext = () => {
        if (currentStep < instructions.length) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        } else {
            // Logic if checking prev on first step? Do nothing or confirm exit.
        }
    };

    const handleExit = () => {
        if (isAIRecipe) navigate('/recipe/ai-generated');
        else if (recipe) navigate(`/recipe/${recipe.id}`);
        else navigate('/search');
    };

    return (
        <div className="fixed inset-0 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setShowIngredients(true)}>
                        <ChefHat className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-display font-bold text-lg leading-tight line-clamp-1">
                            {recipeName}
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Cooking Mode • Keeps screen on
                        </p>
                    </div>
                </div>

                <Button variant="ghost" size="icon" onClick={handleExit}>
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted w-full">
                <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                {!isFinished ? (
                    <div className="max-w-2xl w-full">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-bold mb-6">
                            Step {currentStep + 1} / {instructions.length}
                        </span>
                        <p className="font-display text-3xl md:text-4xl font-medium text-foreground leading-relaxed">
                            {instructions[currentStep]}
                        </p>
                    </div>
                ) : (
                    <div className="max-w-md w-full text-center">
                        <div className="mb-6 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-green-600 animate-bounce">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                        <h2 className="font-display text-3xl font-bold mb-4">Bon Appétit!</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                            You've completed this recipe. Hope it tastes amazing!
                        </p>
                        <Button size="lg" onClick={handleExit} className="w-full">
                            Finish Cooking
                        </Button>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            {!isFinished && (
                <div className="p-6 border-t border-border bg-card flex items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className="flex-1 h-14 text-lg"
                    >
                        <ArrowLeft className="mr-2 h-5 w-5" /> Previous Step
                        
                    </Button>
                    <Button
                        variant="default"
                        size="lg"
                        onClick={handleNext}
                        className="flex-[2] h-14 text-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        Next Step <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </div>
            )}

            {/* Ingredients Dialog (Peek) */}
            <Dialog open={showIngredients} onOpenChange={setShowIngredients}>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Ingredients List</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <ul className="space-y-3">
                            {ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between border-b border-border pb-2 last:border-0">
                                    <span className="font-medium">{ing.name}</span>
                                    <span className="text-muted-foreground">{ing.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <Button onClick={() => setShowIngredients(false)} className="w-full">
                        Close
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}
