import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExternalAuth } from '@/hooks/useExternalAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ChefHat, Mail, Lock, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn, signUp, signInWithGoogle, resetPasswordForEmail, user } = useExternalAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/search');
    }
  }, [user, navigate]);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (view !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (view === 'forgot') {
        const { error } = await resetPasswordForEmail(email);
        if (error) {
          toast({
            title: 'Error',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Check your email',
            description: 'We have sent you a password reset link.',
          });
          setView('login');
        }
      } else if (view === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have been signed in successfully.',
          });
          navigate('/search');
        }
      } else {
        const { data, error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Error',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else if (data?.user && !data.session) {
          toast({
            title: 'Check your email',
            description: 'We have sent you a verification link. Please confirm your email to log in.',
          });
          setView('login'); // Switch back to login view
        } else {
          toast({
            title: 'Account created!',
            description: 'Welcome to RecipePlanner. Let\'s find some recipes!',
          });
          navigate('/search');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case 'forgot': return 'Reset Password';
      case 'signup': return 'Create Account';
      default: return 'Welcome back';
    }
  }

  const getSubtitle = () => {
    switch (view) {
      case 'forgot': return 'Enter your email to receive a reset link';
      case 'signup': return 'Start your culinary journey today';
      default: return 'Sign in to access your recipes and meal plans';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-warm flex flex-col">
      <div className="container py-4">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-up">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-4">
              <ChefHat className="h-8 w-8" />
            </div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              {getTitle()}
            </h1>
            <p className="text-muted-foreground">
              {getSubtitle()}
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-elevated p-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <form onSubmit={handleSubmit} className="space-y-4">
              {view === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              {view !== 'forgot' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {view === 'login' && (
                      <button
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-xs text-primary font-medium hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
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
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                </div>
              )}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Please wait...' : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  {view === 'forgot' ? 'Remembered your password?' : 'Or continue with'}
                </span>
              </div>
            </div>

            {view === 'forgot' ? (
              <Button
                variant="outline"
                type="button"
                className="w-full"
                onClick={() => setView('login')}
              >
                Back to Sign In
              </Button>
            ) : (
              <Button
                variant="outline"
                type="button"
                className="w-full gap-2"
                size="lg"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  const { error } = await signInWithGoogle();
                  if (error) {
                    setLoading(false);
                    toast({
                      title: 'Error',
                      description: error.message,
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
            )}

            {view !== 'forgot' && (
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {view === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setView(view === 'login' ? 'signup' : 'login');
                      setErrors({});
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    {view === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
