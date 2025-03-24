import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    criticalCases: 0,
    recoveredPatients: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching dashboard data
    const fetchDashboardData = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats({
          totalPatients: 150,
          activePatients: 45,
          criticalCases: 8,
          recoveredPatients: 97,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="dashboard-container">
      <h1>Hospital Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <p className="stat-number">{stats.totalPatients}</p>
          <Link to="/patients" className="view-all">View All Patients</Link>
        </div>
        <div className="stat-card">
          <h3>Active Patients</h3>
          <p className="stat-number">{stats.activePatients}</p>
        </div>
        <div className="stat-card critical">
          <h3>Critical Cases</h3>
          <p className="stat-number">{stats.criticalCases}</p>
        </div>
        <div className="stat-card recovered">
          <h3>Recovered</h3>
          <p className="stat-number">{stats.recoveredPatients}</p>
        </div>
      </div>
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <Link to="/patients/new" className="action-btn">
            Add New Patient
          </Link>
          <Link to="/patients" className="action-btn">
            View Patient List
          </Link>
          <Link to="/researcher-dashboard" className="action-btn">
            Research Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard; 