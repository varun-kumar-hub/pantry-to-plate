import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { getRecipeById, Recipe } from '@/data/recipes';
import {
    ArrowLeft,
    ArrowRight,
    X,
    CheckCircle2,
    ChefHat,
    PlayCircle,
    Maximize2,
    Minimize2
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
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

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
        }
    };

    const handleExit = () => {
        if (id) {
            navigate(`/recipe/${id}`);
        } else {
            navigate('/search');
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] text-foreground overflow-hidden font-sans selection:bg-primary/30">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow delay-1000" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            </div>

            {/* Floating Header */}
            <header className="fixed top-6 left-0 right-0 z-50 px-6 flex justify-center pointer-events-none">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 pr-2 shadow-2xl flex items-center gap-6 pointer-events-auto ring-1 ring-black/20 max-w-4xl w-full justify-between">

                    {/* Title & Meta */}
                    <div className="flex items-center gap-4 overflow-hidden">
                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <ChefHat className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="font-display font-semibold text-sm md:text-base truncate leading-tight tracking-wide">
                                {recipeName}
                            </h1>
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-muted-foreground uppercase tracking-widest font-medium">
                                <span>Cooking Mode</span>
                                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                <span>Screen Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowIngredients(true)}
                            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground h-9 w-9"
                            title="View Ingredients"
                        >
                            <ChefHat className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleFullscreen}
                            className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground h-9 w-9 hidden md:flex"
                            title="Toggle Fullscreen"
                        >
                            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                        </Button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleExit}
                            className="rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white h-9 w-9 transition-colors"
                            title="Exit"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 h-full flex flex-col items-center justify-center p-6 md:p-12">
                {!isFinished ? (
                    <div className="w-full max-w-3xl perspective-1000">
                        {/* Progress Indicator */}
                        <div className="mb-12 flex justify-center">
                            <div className="bg-white/5 backdrop-blur-md rounded-full px-4 py-1.5 border border-white/10 flex items-center gap-3 shadow-lg">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Step {currentStep + 1} of {instructions.length}</span>
                                {/* Mini Progress Bar */}
                                <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${((currentStep + 1) / instructions.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Instructional Card */}
                        <div className="group relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-purple-500/30 rounded-[2rem] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />
                            <div className="relative bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-16 text-center shadow-2xl ring-1 ring-white/5 transform transition-all duration-500 hover:scale-[1.01]">
                                <p className="font-display text-2xl md:text-4xl lg:text-5xl font-medium text-balance leading-snug tracking-tight text-white/90">
                                    {instructions[currentStep]}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="max-w-xl w-full text-center relative z-20">
                        <div className="absolute inset-0 bg-green-500/20 blur-[100px] rounded-full opacity-20" />
                        <div className="relative bg-[#121212]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-12 shadow-2xl ring-1 ring-white/5">
                            <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-500/10 text-green-400 ring-2 ring-green-500/20 shadow-[0_0_40px_-10px_rgba(74,222,128,0.3)] animate-bounce-subtle">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h2 className="font-display text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-white/60">
                                Bon Appétit!
                            </h2>
                            <p className="text-muted-foreground text-lg mb-10 leading-relaxed font-light">
                                You've completed this recipe. We hope it tastes amazing!
                            </p>
                            <Button
                                size="lg"
                                onClick={handleExit}
                                className="w-full h-14 text-lg font-medium rounded-xl bg-white text-black hover:bg-white/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                Finish Cooking
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Bottom Controls */}
            {!isFinished && (
                <div className="fixed bottom-10 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
                    <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex items-center gap-2 pointer-events-auto ring-1 ring-white/5 transition-transform hover:scale-[1.02]">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={cn(
                                "rounded-full h-14 px-8 text-base font-medium transition-all hover:bg-white/10 text-muted-foreground hover:text-white disabled:opacity-30",
                            )}
                        >
                            <ArrowLeft className="mr-2 h-5 w-5" /> Back
                        </Button>

                        <div className="h-8 w-px bg-white/10" />

                        <Button
                            variant="default"
                            size="lg"
                            onClick={handleNext}
                            className="rounded-full h-14 px-10 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                        >
                            Next Step <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Ingredients Modal */}
            <Dialog open={showIngredients} onOpenChange={setShowIngredients}>
                <DialogContent className="max-h-[85vh] overflow-y-auto bg-[#121212]/95 backdrop-blur-3xl border-white/10 text-foreground sm:max-w-lg p-0 gap-0 rounded-3xl shadow-2xl">
                    <DialogHeader className="p-6 pb-2 border-b border-white/5 sticky top-0 bg-[#121212]/95 z-10 backdrop-blur-md">
                        <DialogTitle className="font-display text-2xl tracking-tight">Ingredients List</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 pt-2">
                        <ul className="space-y-1">
                            {ingredients.map((ing, i) => (
                                <li key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 group">
                                    <span className="font-medium text-base group-hover:text-primary transition-colors">{ing.name}</span>
                                    <span className="text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded-md text-sm">{ing.quantity}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-4 border-t border-white/5 bg-white/5 sticky bottom-0 backdrop-blur-md">
                        <Button onClick={() => setShowIngredients(false)} className="w-full rounded-xl h-12 text-base shadow-lg" size="lg">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
