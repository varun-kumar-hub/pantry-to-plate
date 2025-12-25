import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { ChefHat, Search, Heart, Calendar, ShoppingCart, Sparkles, ArrowRight } from 'lucide-react';
import { useExternalAuth } from '@/hooks/useExternalAuth';

export default function Index() {
  const { user } = useExternalAuth();

  const features = [
    {
      icon: Search,
      title: 'Smart Recipe Search',
      description: 'Enter your available ingredients and discover delicious recipes you can make right now.',
    },
    {
      icon: Heart,
      title: 'Save Favourites',
      description: 'Build your personal cookbook by saving recipes you love for quick access anytime.',
    },
    {
      icon: Calendar,
      title: 'Meal Planning',
      description: 'Plan your weekly meals with ease. Organize breakfast, lunch, and dinner for each day.',
    },
    {
      icon: ShoppingCart,
      title: 'Shopping Lists',
      description: 'Auto-generate shopping lists from your meal plans. Never forget an ingredient again.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-warm">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="container relative py-20 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary mb-6 animate-fade-up">
              <Sparkles className="h-4 w-4" />
              <span>Your personal recipe assistant</span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-up" style={{ animationDelay: '0.1s',color:"black"}}>
              Cook Amazing Meals with What You Have
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
              Enter your ingredients, discover recipes, plan your week, and never wonder "what's for dinner?" again. Perfect for students and home cooks.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
              {user ? (
                <Link to="/search">
                  <Button variant="hero" size="xl" className="gap-2">
                    Start Cooking
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="hero" size="xl" className="gap-2">
                      Get Started Free
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button variant="outline" size="xl">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Decorative food images */}
        <div className="container pb-12 hidden md:block">
          <div className="relative h-64 mx-auto max-w-4xl">
            <div className="absolute left-0 top-0 h-48 w-48 rounded-2xl overflow-hidden shadow-elevated rotate-[-6deg] animate-float">
              <img
                src="https://images.unsplash.com/photo-1546549032-9571cd6b27df?w=400"
                alt="Fresh vegetables"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 top-4 h-56 w-56 rounded-2xl overflow-hidden shadow-elevated z-10 animate-float" style={{ animationDelay: '0.5s' }}>
              <img
                src="https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400"
                alt="Delicious pancakes"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-0 top-0 h-48 w-48 rounded-2xl overflow-hidden shadow-elevated rotate-[6deg] animate-float" style={{ animationDelay: '1s' }}>
              <img
                src="https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400"
                alt="Stir fry"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Cook Better
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From finding recipes to planning meals and shopping, we've got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 animate-fade-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container text-center">
          <div className="mx-auto max-w-2xl">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-foreground/10 text-primary-foreground mb-6">
              <ChefHat className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Start Cooking?
            </h2>
            <p className="text-lg text-primary-foreground/80 mb-8">
              Join thousands of home cooks who have simplified their meal planning.
            </p>
            {user ? (
              <Link to="/search">
                <Button variant="secondary" size="xl" className="gap-2">
                  Find Recipes Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth">
                <Button variant="secondary" size="xl" className="gap-2">
                  Create Free Account
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-primary" />
            <span className="font-display font-semibold">RecipePlanner</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 RecipePlanner. Made with ❤️ for home cooks everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
