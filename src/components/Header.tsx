import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import {
  ChefHat,
  Heart,
  Calendar,
  CheckCircle2,
  Sparkles,
  Loader2,
  KeyRound,
  Settings,
  ShoppingCart,
  LogOut,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const { user, signOut } = useExternalAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary/20 dark:border-white/10 bg-primary text-primary-foreground dark:bg-card dark:text-card-foreground shadow-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-105">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-semibold">
            RecipePlanner
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {user && (
            <>
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-primary-foreground/90 hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-muted">
                  Find Recipes
                </Button>
              </Link>
              <Link to="/favourites">
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground/90 hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-muted">
                  <Heart className="h-4 w-4" />
                  Favourites
                </Button>
              </Link>
              <Link to="/planner">
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground/90 hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-muted">
                  <Calendar className="h-4 w-4" />
                  Meal Plan
                </Button>
              </Link>
              <Link to="/shopping-list">
                <Button variant="ghost" size="sm" className="gap-2 text-primary-foreground/90 hover:bg-white/10 hover:text-white dark:text-foreground dark:hover:bg-muted">
                  <ShoppingCart className="h-4 w-4" />
                  Shopping List
                </Button>
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10 border border-white/20 dark:border-white/10 bg-white/10 dark:bg-muted/50 hover:bg-white/20 dark:hover:bg-muted text-primary-foreground dark:text-foreground"
                >
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-white text-primary font-bold text-lg dark:bg-primary dark:text-primary-foreground">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-elevated border-border/50">
                <div className="px-3 py-2 bg-muted/30 rounded-lg mb-2">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Signed in as</p>
                  <p className="text-sm font-semibold text-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="md:hidden">
                  <Link to="/search" className="w-full cursor-pointer">
                    Find Recipes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link to="/favourites" className="w-full cursor-pointer">
                    <Heart className="mr-2 h-4 w-4" />
                    Favourites
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link to="/planner" className="w-full cursor-pointer">
                    <Calendar className="mr-2 h-4 w-4" />
                    Meal Plan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link to="/shopping-list" className="w-full cursor-pointer">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Shopping List
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="secondary" className="font-semibold text-primary">Get Started</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
