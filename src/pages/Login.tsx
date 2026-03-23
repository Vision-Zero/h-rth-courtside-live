import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn } from 'lucide-react';
import hbcLogo from '@/assets/hbc-logo.webp';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
      setLoading(false);
    });

    // Seed admin user on first visit
    seedAdmin();
  }, [navigate]);

  const seedAdmin = async () => {
    setSeeding(true);
    try {
      await supabase.functions.invoke('seed-admin');
    } catch (e) {
      // ignore - admin may already exist
    }
    setSeeding(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const email = username.includes('@') ? username : `${username}@hbc-live.app`;

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Falsche Zugangsdaten');
      setLoading(false);
      return;
    }

    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="font-display text-xl text-primary animate-pulse">LADEN...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <img src={hbcLogo} alt="HBC" className="w-24 h-24 object-contain" />
      <h1 className="font-display text-4xl tracking-[0.3em] text-primary glow-yellow">
        HBC BROADCASTING
      </h1>
      <form onSubmit={handleLogin} className="glass p-6 w-full max-w-sm space-y-4" style={{ borderBottom: '2px solid hsl(var(--hbc-gold))' }}>
        <h2 className="font-display text-xl tracking-wider text-foreground text-center">LOGIN</h2>
        <Input
          placeholder="Benutzername"
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="bg-secondary border-border"
          autoComplete="username"
        />
        <Input
          type="password"
          placeholder="Passwort"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="bg-secondary border-border"
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-destructive text-center">{error}</p>}
        <Button type="submit" className="w-full btn-press font-display tracking-wider" disabled={loading || seeding}>
          <LogIn className="w-4 h-4 mr-2" /> ANMELDEN
        </Button>
      </form>
    </div>
  );
};

export default Login;
