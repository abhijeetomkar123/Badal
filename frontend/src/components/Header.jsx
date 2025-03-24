import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    navigate('/');
  };

  const renderNavLinks = () => {
    if (!isAuthenticated) {
      return (
        <>
          <Link to="/" className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </>
      );
    }

    if (userRole === 'hospital') {
      return (
        <>
          <Link to="/patients" className="nav-link">Patients</Link>
          <Link to="/patients/add" className="nav-link">Add Patient</Link>
          <Link to="/predictions" className="nav-link">AI Predictions</Link>
        </>
      );
    }

    if (userRole === 'researcher') {
      return (
        <Link to="/research" className="nav-link">Research Dashboard</Link>
      );
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <Link to={isAuthenticated ? (userRole === 'hospital' ? '/patients' : '/research') : '/'}>
            BADAL
          </Link>
        </div>
        
        <nav className="nav-links">
          {renderNavLinks()}
          {isAuthenticated && (
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header; 