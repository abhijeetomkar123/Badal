import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPatients } from '../services/api';

const PatientList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive, critical

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(patientsData);
      } catch (err) {
        setError('Failed to fetch patients: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        patient.condition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        patient.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || patient.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="patient-list-container">
      <div className="patient-list-header">
        <h1>Patient List</h1>
        <Link to="/patients/add" className="add-patient-btn">
          Add New Patient
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters">
        <input
          type="text"
          placeholder="Search patients by name, condition, or diagnosis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Patients</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="patient-grid">
        {filteredPatients.map(patient => (
          <div
            key={patient.id}
            className="patient-card"
            onClick={() => navigate(`/patients/${patient.id}`)}
          >
            <h3>{patient.name}</h3>
            <p>Age: {patient.age}</p>
            <p>Condition: {patient.condition || 'N/A'}</p>
            <p>Diagnosis: {patient.diagnosis || 'N/A'}</p>
            <p className={`status status-${patient.status.toLowerCase()}`}>
              {patient.status}
            </p>
            {patient.vitals && (
              <div className="vitals-summary">
                <p>BP: {patient.vitals.blood_pressure || 'N/A'}</p>
                <p>HR: {patient.vitals.heart_rate || 'N/A'} bpm</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <div className="no-results">
          No patients found matching your search criteria.
        </div>
      )}
    </div>
  );
};

export default PatientList; 