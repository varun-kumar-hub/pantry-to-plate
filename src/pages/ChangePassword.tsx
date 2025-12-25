import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Lock, ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [error, setError] = useState('');

    const { user, updatePassword, signIn, resetPasswordForEmail } = useExternalAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 1. Validate Form
        const result = passwordSchema.safeParse(newPassword);
        if (!result.success) {
            setError(result.error.errors[0].message);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (oldPassword === newPassword) {
            setError('New password cannot be the same as the old password');
            return;
        }

        setLoading(true);

        try {
            // 2. Add extra security: Verify old password by attempting a sign-in
            // Note: We use the current user's email.
            if (user?.email) {
                const { error: signInError } = await signIn(user.email, oldPassword);
                if (signInError) {
                    setError('Inherited security check failed: Old password is incorrect.');
                    setLoading(false);
                    return;
                }
            }

            // 3. Update Password
            const { error: updateError } = await updatePassword(newPassword);

            if (updateError) {
                throw updateError;
            }

            toast({
                title: 'Password Updated',
                description: 'Your password has been changed successfully.',
            });
            navigate('/search'); // Or back to profile
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!user?.email) return;

        setResetLoading(true);
        const { error } = await resetPasswordForEmail(user.email);
        setResetLoading(false);

        if (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } else {
            toast({
                title: "Email Sent",
                description: "We sent a password reset link to your email.",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-warm flex flex-col">
            <div className="container py-4">
                <Link to="/search" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                    Back to recipes
                </Link>
            </div>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-card rounded-2xl shadow-elevated p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
                            <KeyRound className="h-6 w-6" />
                        </div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            Change Password
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Ensure your account stays secure
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Old Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="oldPassword"
                                    type={showPassword ? "text" : "password"}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
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
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
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
                            {loading ? 'Updating...' : 'Update Password'}
                        </Button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-border text-center">
                        <p className="text-sm text-muted-foreground mb-3">
                            Forgot your password?
                        </p>
                        <Button variant="outline" size="sm" onClick={handleForgotPassword} disabled={resetLoading}>
                            {resetLoading ? "Sending..." : "Reset password via email"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
