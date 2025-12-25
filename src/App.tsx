import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ExternalAuthProvider } from "@/hooks/useExternalAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import RecipeDetail from "./pages/RecipeDetail";
import Favourites from "./pages/Favourites";
import Planner from "./pages/Planner";
import ShoppingList from "./pages/ShoppingList";
import CookingMode from "./pages/CookingMode";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./components/theme-provider";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ExternalAuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/search" element={<Search />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/cooking-mode/:id" element={<CookingMode />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/shopping-list" element={<ShoppingList />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ExternalAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
