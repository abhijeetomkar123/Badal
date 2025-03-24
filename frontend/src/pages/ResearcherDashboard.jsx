import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const ResearcherDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [patientData, setPatientData] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState('all');

  useEffect(() => {
    const fetchAnonymizedData = async () => {
      try {
        // Simulated API call - replace with actual backend call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPatientData([
          {
            id: 'P001',
            age: 45,
            gender: 'Male',
            condition: 'Hypertension',
            vitals: {
              bloodPressure: '140/90',
              heartRate: '75',
              temperature: '98.6',
              oxygenLevel: '98'
            },
            genetics: {
              dnaAnalysis: {
                findings: 'Variant in ACE gene',
                riskFactors: ['Cardiovascular disease', 'Salt sensitivity']
              },
              geneticMarkers: ['ACE', 'AGT', 'NR3C2']
            },
            dicomStudies: 3
          },
          {
            id: 'P002',
            age: 32,
            gender: 'Female',
            condition: 'Diabetes Type 2',
            vitals: {
              bloodPressure: '120/80',
              heartRate: '82',
              temperature: '98.4',
              oxygenLevel: '97'
            },
            genetics: {
              dnaAnalysis: {
                findings: 'TCF7L2 gene variant',
                riskFactors: ['Insulin resistance', 'Obesity']
              },
              geneticMarkers: ['TCF7L2', 'KCNJ11', 'PPARG']
            },
            dicomStudies: 2
          }
        ]);
      } catch (err) {
        setError('Failed to fetch research data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnonymizedData();
  }, []);

  const conditions = ['all', ...new Set(patientData.map(p => p.condition))];
  
  const filteredData = selectedCondition === 'all'
    ? patientData
    : patientData.filter(p => p.condition === selectedCondition);

  const handleDownloadCSV = () => {
    // Convert the filtered data to CSV format
    const headers = [
      'ID',
      'Age',
      'Gender',
      'Condition',
      'Blood Pressure',
      'Heart Rate',
      'Temperature',
      'Oxygen Level',
      'Genetic Findings',
      'Risk Factors',
      'Genetic Markers',
      'DICOM Studies'
    ];

    const csvData = filteredData.map(patient => [
      patient.id,
      patient.age,
      patient.gender,
      patient.condition,
      patient.vitals.bloodPressure,
      patient.vitals.heartRate,
      patient.vitals.temperature,
      patient.vitals.oxygenLevel,
      patient.genetics.dnaAnalysis.findings,
      patient.genetics.dnaAnalysis.riskFactors.join('; '),
      patient.genetics.geneticMarkers.join('; '),
      patient.dicomStudies
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `research_data_${selectedCondition}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleDownloadJSON = () => {
    // Create and trigger download
    const jsonContent = JSON.stringify(filteredData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `research_data_${selectedCondition}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="researcher-dashboard">
      <h1>Research Data Analysis</h1>
      {error && <div className="error-message">{error}</div>}

      <div className="research-controls">
        <div className="control-group">
          <label htmlFor="condition-filter">Filter by Condition:</label>
          <select
            id="condition-filter"
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="form-input"
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="download-buttons">
          <button onClick={handleDownloadCSV} className="download-btn">
            Download CSV
          </button>
          <button onClick={handleDownloadJSON} className="download-btn">
            Download JSON
          </button>
        </div>
      </div>

      <div className="research-grid">
        <div className="research-card">
          <h2>Patient Demographics</h2>
          <div className="demographics-stats">
            <div className="stat-item">
              <span className="stat-label">Total Patients:</span>
              <span className="stat-value">{filteredData.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Average Age:</span>
              <span className="stat-value">
                {Math.round(
                  filteredData.reduce((acc, p) => acc + p.age, 0) / filteredData.length
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="research-card">
          <h2>Genetic Analysis</h2>
          <div className="genetics-stats">
            <div className="stat-item">
              <span className="stat-label">Common Markers:</span>
              <ul className="markers-list">
                {Array.from(
                  new Set(filteredData.flatMap(p => p.genetics.geneticMarkers))
                ).map(marker => (
                  <li key={marker}>{marker}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="research-card">
          <h2>Medical Imaging</h2>
          <div className="imaging-stats">
            <div className="stat-item">
              <span className="stat-label">Total DICOM Studies:</span>
              <span className="stat-value">
                {filteredData.reduce((acc, p) => acc + p.dicomStudies, 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="research-table-container">
        <h2>Anonymized Patient Records</h2>
        <div className="table-wrapper">
          <table className="research-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Condition</th>
                <th>Genetic Findings</th>
                <th>Risk Factors</th>
                <th>Genetic Markers</th>
                <th>DICOM Studies</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(patient => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.age}</td>
                  <td>{patient.gender}</td>
                  <td>{patient.condition}</td>
                  <td>{patient.genetics.dnaAnalysis.findings}</td>
                  <td>{patient.genetics.dnaAnalysis.riskFactors.join(', ')}</td>
                  <td>{patient.genetics.geneticMarkers.join(', ')}</td>
                  <td>{patient.dicomStudies}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResearcherDashboard; 