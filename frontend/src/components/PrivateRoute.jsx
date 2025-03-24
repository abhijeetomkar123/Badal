import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    // Redirect to login page with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has access to the route based on their role
  const path = location.pathname;
  
  // Redirect researchers to research page if they try to access hospital pages
  if (userRole === 'researcher' && !path.startsWith('/research')) {
    return <Navigate to="/research" replace />;
  }
  
  // Redirect hospital staff to patients page if they try to access research pages
  if (userRole === 'hospital' && path.startsWith('/research')) {
    return <Navigate to="/patients" replace />;
  }

  // If authenticated and authorized, render the protected component
  return children;
};

export default PrivateRoute; 