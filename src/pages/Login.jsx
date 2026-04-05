import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Gem, LogIn } from 'lucide-react';
import { useAuth, useToast } from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isAuthLoading } = useAuth();
  const { addToast } = useToast();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthLoading && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      addToast('Login successful', 'success');
      navigate('/', { replace: true });
    } catch (error) {
      addToast(error.message || 'Login failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md glass-card-static p-7">
        <div className="flex items-center gap-3 mb-7">
          <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center">
            <Gem size={20} color="#0F0F1A" strokeWidth={2.3} />
          </div>
          <div>
            <h1 className="text-lg font-bold gold-text">Shreehans RKS Khushi</h1>
            <p className="text-xs text-text-tertiary">Jewellery Management Login</p>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2" disabled={isSubmitting}>
            <LogIn size={15} />
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-5 text-xs text-text-tertiary space-y-1">
          <p>Demo users:</p>
          <p>Admin: admin / admin123</p>
          <p>Staff: staff / staff123</p>
        </div>
      </div>
    </div>
  );
}
