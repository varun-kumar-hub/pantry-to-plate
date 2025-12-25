import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { updatePassword, session } = useExternalAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        // If no session, they shouldn't be here (Supabase link logs them in automatically)
        // However, we give it a moment to initialize.
        if (!session && !loading) {
            // Potentially redirect to login if session never appears, 
            // but for now we assume the link works correctly.
        }
    }, [session, loading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        const result = passwordSchema.safeParse(newPassword);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        setLoading(true);

        try {
            const { error: updateError } = await updatePassword(newPassword);

            if (updateError) throw updateError;

            toast({
                title: 'Password Reset Successful',
                description: 'You have been logged in with your new password.',
            });
            navigate('/search');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-warm flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-card rounded-2xl shadow-elevated p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
                        <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-foreground">
                        Reset Password
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="newPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="New secure password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-destructive font-medium text-center">{error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Resetting...' : 'Set New Password'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
