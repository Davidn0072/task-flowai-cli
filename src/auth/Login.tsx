import { useState } from 'react';
import { api } from '../shared/api';
import './Login.css';

const DEBUG_ACCOUNTS = [
  { email: 'david@example.com', password: '123456' },
  { email: 'noa@test.com', password: '123456' },
  { email: 'john@test.com', password: '123456' },
  { email: 'jane@test.com', password: '123456' },
  { email: 'andrey@test.com', password: '123456' },
  { email: 'mariana@test.com', password: '12346' },
];

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLoginSuccess, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Email and password are required');
      return;
    }

    try {
      setLoading(true);
      const data = await api.post<{ user: { id: number; username: string; email: string }; token: string }>(
        '/api/auth/login',
        { email: loginEmail, password: loginPassword }
      );

      if (!data.token) {
        throw new Error('Server did not return an authentication token');
      }

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('token', data.token);

      onLoginSuccess(data.user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    await performLogin(email, password);
  };

  const debugQuickLogin = async (testAccount: { email: string; password: string }) => {
    setEmail(testAccount.email);
    setPassword(testAccount.password);
    await performLogin(testAccount.email, testAccount.password);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">TaskFlow</h1>
        <p className="login-subtitle">Welcome back</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="switch-button"
            disabled={loading}
          >
            Register here
          </button>
        </p>

        {import.meta.env.DEV && (
          <div className="debug-section">
            <p className="debug-label">🔧 DEBUG - Quick Login</p>
            <div className="debug-buttons">
              {DEBUG_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => debugQuickLogin(account)}
                  disabled={loading}
                  className="debug-button"
                >
                  {account.email.split('@')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
