import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { t } from '../constants/translations';
import { Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: email, error: rpcError } = await supabase.rpc('get_user_email_from_username', {
        p_username: username,
      });

      if (rpcError || !email) {
        throw new Error(t.loginFailed);
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password,
      });

      if (signInError) {
        throw signInError;
      }
      
      toast.success(t.loginSuccess);
      navigate('/dashboard');

    } catch (error: any) {
      toast.error(error.message || t.loginFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <Store className="mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-6 text-3xl font-bold text-text-primary">{t.loginWelcome}</h1>
          <p className="text-text-secondary">{t.loginSubtext}</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">{t.username}</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.password}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" loading={loading} className="w-full">
            {t.login}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
