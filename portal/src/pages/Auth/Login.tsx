import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login: setAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="login-container">
      <div className="login-card">
        <h1>Scholyman</h1>
        <h2>Login</h2>
        
        {error && (
          <div className="error-message" style={{ 
            padding: '0.75rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fee', 
            color: '#c33', 
            borderRadius: '0.5rem',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={loading}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
              className="form-input"
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
            <p><strong>Demo Credentials:</strong></p>
            <p>Admin: admin@school.com / admin123</p>
            <p>Teacher: teacher1@school.com / teacher123</p>
            <p>Student: student1@school.com / student123</p>
            <p>Accountant: accountant@school.com / accountant123</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
              You can also use username instead of email (e.g., "admin" instead of "admin@school.com")
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
