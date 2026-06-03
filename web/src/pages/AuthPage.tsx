import { useState } from 'react';
import { useAuthStore } from '../authStore';

export default function AuthPage() {
  const { mockSignIn, mockSignUp } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('wayne');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await mockSignUp(email, password);
      } else {
        await mockSignIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>D-NET</h1>
        <p>{isSignUp ? 'Create your dream profile' : 'Sign in to access your universe'}</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username or Email</label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your username or email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Create Profile' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle" onClick={() => { setIsSignUp(!isSignUp); setError(''); }}>
          {isSignUp ? 'Already have a profile? Sign In' : "Don't have a profile? Create one"}
        </div>
      </div>
    </div>
  );
}
