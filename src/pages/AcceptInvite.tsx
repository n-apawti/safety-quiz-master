import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AcceptInvite = () => {
  const navigate = useNavigate();
  const { companySlug } = useParams<{ companySlug: string }>();
  const { toast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [tokenError, setTokenError] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const init = async () => {
      // Parse the URL hash that Supabase appends after invite click
      // e.g. #access_token=...&refresh_token=...&type=invite
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Exchange the one-time tokens for a live session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          setTokenError('This invite link is invalid or has already been used. Please ask your admin to send a new invite.');
          return;
        }

        setUserEmail(data.session.user.email ?? '');
        setIsReady(true);

        // Clear hash from URL bar (cosmetic)
        window.history.replaceState(null, '', window.location.pathname);
      } else {
        // No hash tokens — check if user is already signed in (e.g. page refresh)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserEmail(session.user.email ?? '');
          setIsReady(true);
        } else {
          setTokenError('No invite token found. Please use the link from your invitation email.');
        }
      }
    };

    init();
  }, []);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({ title: 'Password too short', description: 'Password must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please make sure both passwords match.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    setIsDone(true);
    setIsLoading(false);

    // Redirect to the company home the invite was for
    setTimeout(() => {
      if (companySlug) {
        navigate(`/${companySlug}`);
      } else {
        navigate('/');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="p-3 rounded-xl bg-primary">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="text-sm text-muted-foreground">Set a password to activate your account</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create your password</CardTitle>
            {userEmail && (
              <CardDescription>
                Setting up account for <span className="font-medium text-foreground">{userEmail}</span>
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {tokenError ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <p className="text-sm text-muted-foreground">{tokenError}</p>
                <Button variant="outline" className="mt-2" onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            ) : isDone ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <p className="font-medium text-foreground">Password set!</p>
                <p className="text-sm text-muted-foreground">Redirecting you now…</p>
              </div>
            ) : !isReady ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
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
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate Account'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcceptInvite;
