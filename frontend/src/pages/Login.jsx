import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'hospital'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if already logged in
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    const userRole = localStorage.getItem('userRole');
    if (isAuthenticated && userRole) {
      navigate(userRole === 'hospital' ? '/patients' : '/research');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Demo credentials check
      const validCredentials = {
        hospital: {
          email: 'hospital@demo.com',
          password: 'password'
        },
        researcher: {
          email: 'researcher@demo.com',
          password: 'password'
        }
      };

      const roleCredentials = validCredentials[formData.role];
      if (
        formData.email === roleCredentials.email &&
        formData.password === roleCredentials.password
      ) {
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('isAuthenticated', 'true');
        
        // Navigate to the appropriate page
        navigate(formData.role === 'hospital' ? '/patients' : '/research');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (role) => {
    setFormData({
      email: `${role}@demo.com`,
      password: 'password',
      role: role
    });
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>BADAL</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="form-input"
            >
              <option value="hospital">Hospital Staff</option>
              <option value="researcher">Researcher</option>
            </select>
          </div>
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="demo-credentials">
          <h3>Demo Login</h3>
          <div className="demo-buttons">
            <button
              type="button"
              onClick={() => setDemoCredentials('hospital')}
              className="demo-btn"
            >
              Use Hospital Staff Demo
            </button>
            <button
              type="button"
              onClick={() => setDemoCredentials('researcher')}
              className="demo-btn"
            >
              Use Researcher Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 