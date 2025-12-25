import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/components/theme-provider";
import { useExternalAuth } from "@/hooks/useExternalAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Moon, Sun, User, Utensils, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { externalSupabase } from "@/integrations/external-supabase/client";

export default function Settings() {
    const { theme, setTheme } = useTheme();
    const { user } = useExternalAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState("");
    const [vegetarianOnly, setVegetarianOnly] = useState(false);
    const [nonVegetarianOnly, setNonVegetarianOnly] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load saved preferences from LocalStorage OR User Metadata
        // LocalStorage takes precedence for "unsaved" changes session, but Metadata is source of truth across devices

        const savedName = localStorage.getItem("userDisplayName");

        // Helper to parse 'true'/'false' strings, defaulting to false if null
        const getLocalBool = (key: string) => localStorage.getItem(key) === "true";

        if (savedName) {
            setDisplayName(savedName);
        } else if (user?.user_metadata?.full_name) {
            setDisplayName(user.user_metadata.full_name);
        }

        // Priority: LocalStorage -> User Metadata -> Default (false)
        const localVeg = localStorage.getItem("vegetarianOnly");
        if (localVeg !== null) {
            setVegetarianOnly(localVeg === "true");
        } else if (user?.user_metadata?.vegetarian_only !== undefined) {
            setVegetarianOnly(user.user_metadata.vegetarian_only);
        }

        const localNonVeg = localStorage.getItem("nonVegetarianOnly");
        if (localNonVeg !== null) {
            setNonVegetarianOnly(localNonVeg === "true");
        } else if (user?.user_metadata?.non_vegetarian_only !== undefined) {
            setNonVegetarianOnly(user.user_metadata.non_vegetarian_only);
        }

    }, [user]);

    const handleVegChange = (checked: boolean) => {
        setVegetarianOnly(checked);
        if (checked) setNonVegetarianOnly(false);
    };

    const handleNonVegChange = (checked: boolean) => {
        setNonVegetarianOnly(checked);
        if (checked) setVegetarianOnly(false);
    };

    const [pendingTheme, setPendingTheme] = useState<string>("system");

    useEffect(() => {
        // Initialize pending theme from current theme
        setPendingTheme(theme);
    }, [theme]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // Apply the theme only on save
            setTheme(pendingTheme as any);

            // Save locally
            localStorage.setItem("userDisplayName", displayName);
            localStorage.setItem("vegetarianOnly", String(vegetarianOnly));
            localStorage.setItem("nonVegetarianOnly", String(nonVegetarianOnly));

            // Save to Supabase metadata if logged in
            if (user) {
                // Explicitly check/refresh session to ensure we have a valid token
                const { data: { session }, error: sessionError } = await externalSupabase.auth.getSession();

                if (sessionError || !session) {
                    console.warn("Session missing or expired, attempting refresh...");
                    // Try one refresh attempt
                    const { data: { session: refreshedSession }, error: refreshError } = await externalSupabase.auth.refreshSession();
                    if (refreshError || !refreshedSession) {
                        throw new Error("Auth session missing");
                    }
                }

                const { error } = await externalSupabase.auth.updateUser({
                    data: {
                        full_name: displayName,
                        vegetarian_only: vegetarianOnly,
                        non_vegetarian_only: nonVegetarianOnly
                    }
                });
                if (error) throw error;
            }

            toast({
                title: "Settings Saved",
                description: "Your preferences, including theme, have been updated.",
            });
        } catch (error: any) {
            console.error("Settings Sync Error:", error);

            // Check if it's an auth session error
            if (error.message === "Auth session missing" || error.status === 401 || error.message.includes("session")) {
                toast({
                    title: "Saved to Device Only",
                    description: "Settings saved locally. Please Sign Out and Log In again to sync with your account.",
                    // Using default variant to be less alarming, but informative
                });
            } else {
                toast({
                    title: "Sync Warning",
                    description: "Settings saved locally, but failed to sync with server.",
                    variant: "destructive",
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container py-8 max-w-2xl">
                <div className="mb-8">

                    <h1 className="font-display text-3xl font-bold">Settings</h1>
                    <p className="text-muted-foreground">Manage your app experience</p>
                </div>

                <div className="space-y-8">
                    {/* Appearance Section */}
                    <section className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Sun className="h-5 w-5" /> Appearance
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="theme-select">Theme</Label>
                                <div className="text-sm text-muted-foreground">
                                    Select your preferred color mode
                                </div>
                            </div>
                            <Select value={pendingTheme} onValueChange={(val: any) => setPendingTheme(val)}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" /> Light
                                        </div>
                                    </SelectItem>

                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" /> Dark
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    {/* Profile Section */}
                    <section className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <User className="h-5 w-5" /> Profile
                        </h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={user?.email || ""} disabled className="bg-muted" />
                                <p className="text-xs text-muted-foreground">Managed via Google/Email Auth</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="displayName">Display Name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your Name"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Preferences Section */}
                    <section className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Utensils className="h-5 w-5" /> Dietary Preferences
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="veg-mode" className="cursor-pointer">Vegetarian Only</Label>
                                <div className="text-sm text-muted-foreground">
                                    Hide non-vegetarian recipes from search results
                                </div>
                            </div>
                            <Switch
                                id="veg-mode"
                                checked={vegetarianOnly}
                                onCheckedChange={handleVegChange}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="non-veg-mode" className="cursor-pointer">Non-Vegetarian Only</Label>
                                <div className="text-sm text-muted-foreground">
                                    Hide vegetarian recipes from search results
                                </div>
                            </div>
                            <Switch
                                id="non-veg-mode"
                                checked={nonVegetarianOnly}
                                onCheckedChange={handleNonVegChange}
                            />
                        </div>
                    </section>

                    {/* Security Section */}
                    <section className="space-y-4 bg-card p-6 rounded-xl border border-border shadow-sm">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Lock className="h-5 w-5" /> Security
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label>Password</Label>
                                <div className="text-sm text-muted-foreground">
                                    Change your password to keep your account secure
                                </div>
                            </div>
                            <Button variant="outline" onClick={() => navigate('/change-password')}>
                                Change Password
                            </Button>
                        </div>
                    </section>

                    {/* Save Button */}
                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4">
                        <Link
                            to="/search"
                            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        <Button size="lg" onClick={handleSave} disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
