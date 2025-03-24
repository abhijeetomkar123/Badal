import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientList from './pages/PatientList';
import PatientDetail from './pages/PatientDetail';
import AddPatient from './pages/AddPatient';
import ResearcherDashboard from './pages/ResearcherDashboard';
import PredictionTools from './pages/PredictionTools';
import PrivateRoute from './components/PrivateRoute';
import './styles/index.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Hospital Staff Routes */}
            <Route
              path="/patients"
              element={
                <PrivateRoute allowedRoles={['hospital']}>
                  <PatientList />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/add"
              element={
                <PrivateRoute allowedRoles={['hospital']}>
                  <AddPatient />
                </PrivateRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <PrivateRoute allowedRoles={['hospital']}>
                  <PatientDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/predictions"
              element={
                <PrivateRoute allowedRoles={['hospital']}>
                  <PredictionTools />
                </PrivateRoute>
              }
            />
            
            {/* Researcher Routes */}
            <Route
              path="/research"
              element={
                <PrivateRoute allowedRoles={['researcher']}>
                  <ResearcherDashboard />
                </PrivateRoute>
              }
            />

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App; 