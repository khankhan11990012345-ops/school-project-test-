import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, LogIn, School } from 'lucide-react';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      
      // Set auth context
      setAuth(response.token, response.user);
      
      // Navigate to the appropriate dashboard based on user role
      navigate(`/dashboard/${response.user.role}`);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <School size={48} />
          </div>
          <h1>MySchool</h1>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to your dashboard</p>
        </div>
        
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">
              <Mail size={18} />
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email or username"
              required
              disabled={loading}
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="auth-input"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
          
          <button
            type="button"
            className="credentials-toggle"
            onClick={() => setShowCredentials(!showCredentials)}
          >
            {showCredentials ? 'Hide' : 'Show'} Demo Credentials
          </button>

          {showCredentials && (
            <div className="demo-credentials">
              <p className="demo-title">Demo Credentials:</p>
              <div className="demo-list">
                <div className="demo-item">
                  <strong>Admin:</strong> admin@school.com / admin123
                </div>
                <div className="demo-item">
                  <strong>Teacher:</strong> teacher1@school.com / teacher123
                </div>
                <div className="demo-item">
                  <strong>Student:</strong> student1@school.com / student123
                </div>
                <div className="demo-item">
                  <strong>Accountant:</strong> accountant@school.com / accountant123
                </div>
              </div>
              <p className="demo-note">
                💡 Tip: You can also use username instead of email (e.g., "admin" instead of "admin@school.com")
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
