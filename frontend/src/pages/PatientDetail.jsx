import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { getPatientDetail, updatePatient, updatePatientVitals, uploadPatients } from '../services/api';

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const patientData = await getPatientDetail(id);
        // Initialize all nested objects with default values
        const patientWithDefaults = {
          ...patientData,
          vitals: patientData.vitals || {
            bloodPressure: '',
            heartRate: '',
            temperature: '',
            oxygenLevel: ''
          },
          radiology: patientData.radiology || {
            xRays: [],
            mriScans: [],
            ctScans: []
          },
          genetics: patientData.genetics || {
            dnaAnalysis: {
              date: '',
              findings: '',
              riskFactors: []
            },
            familyHistory: {
              conditions: [],
              relationships: []
            },
            geneticMarkers: {
              tested: [],
              results: ''
            }
          }
        };
        setPatient(patientWithDefaults);
        setEditedPatient(patientWithDefaults);
      } catch (error) {
        setError('Failed to fetch patient details: ' + error.message);
        console.error('Error fetching patient details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVitalsChange = (e) => {
    const { name, value } = e.target;
    setEditedPatient(prev => ({
      ...prev,
      vitals: {
        ...(prev.vitals || {}),
        [name]: value
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    try {
      // Update patient information
      const updatedPatient = await updatePatient(id, {
        name: editedPatient.name,
        age: editedPatient.age,
        gender: editedPatient.gender,
        status: editedPatient.status,
        condition: editedPatient.condition,
        diagnosis: editedPatient.diagnosis,
        treatment: editedPatient.treatment,
        medical_history: editedPatient.medical_history
      });

      // Update vitals if they exist
      if (editedPatient.vitals) {
        await updatePatientVitals(id, editedPatient.vitals);
      }

      setPatient(updatedPatient);
      setIsEditing(false);
    } catch (error) {
      setError('Failed to save changes: ' + error.message);
      console.error('Error saving patient details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setUploadStatus('');

    try {
      const result = await uploadPatients(file);
      setUploadStatus(`Successfully uploaded ${result.length} patients`);
      // Refresh patient data
      const updatedData = await getPatientDetail(id);
      setPatient(updatedData);
      setEditedPatient(updatedData);
    } catch (error) {
      setError('Failed to upload file: ' + error.message);
      console.error('Error uploading file:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="patient-detail-container">
      <div className="patient-detail-header">
        <h1>Patient Details</h1>
        <div className="header-actions">
          <div className="file-upload">
            <input
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileUpload}
              id="file-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="file-upload" className="upload-btn">
              Upload XLS File
            </label>
          </div>
          {isEditing ? (
            <>
              <button onClick={handleSave} className="save-btn">
                Save Changes
              </button>
              <button onClick={() => setIsEditing(false)} className="cancel-btn">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="edit-btn">
              Edit Patient
            </button>
          )}
          <button onClick={() => navigate('/patients')} className="back-btn">
            Back to List
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {uploadStatus && <div className="success-message">{uploadStatus}</div>}

      <div className="patient-info-grid">
        <div className="info-section">
          <h2>Personal Information</h2>
          <div className="info-content">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    name="name"
                    value={editedPatient.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Age:</label>
                  <input
                    type="number"
                    name="age"
                    value={editedPatient.age}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Gender:</label>
                  <select
                    name="gender"
                    value={editedPatient.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <p><strong>Name:</strong> {patient.name}</p>
                <p><strong>Age:</strong> {patient.age}</p>
                <p><strong>Gender:</strong> {patient.gender}</p>
              </>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Medical Information</h2>
          <div className="info-content">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Status:</label>
                  <select
                    name="status"
                    value={editedPatient.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="recovered">Recovered</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Condition:</label>
                  <input
                    type="text"
                    name="condition"
                    value={editedPatient.condition}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Diagnosis:</label>
                  <textarea
                    name="diagnosis"
                    value={editedPatient.diagnosis}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Treatment:</label>
                  <textarea
                    name="treatment"
                    value={editedPatient.treatment}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            ) : (
              <>
                <p><strong>Status:</strong> <span className={`status ${patient.status}`}>{patient.status}</span></p>
                <p><strong>Condition:</strong> {patient.condition}</p>
                <p><strong>Diagnosis:</strong> {patient.diagnosis}</p>
                <p><strong>Treatment:</strong> {patient.treatment}</p>
              </>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Vitals</h2>
          <div className="info-content">
            {isEditing ? (
              <>
                <div className="form-group">
                  <label>Blood Pressure:</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    value={editedPatient.vitals?.bloodPressure || ''}
                    onChange={handleVitalsChange}
                  />
                </div>
                <div className="form-group">
                  <label>Heart Rate:</label>
                  <input
                    type="text"
                    name="heartRate"
                    value={editedPatient.vitals?.heartRate || ''}
                    onChange={handleVitalsChange}
                  />
                </div>
                <div className="form-group">
                  <label>Temperature:</label>
                  <input
                    type="text"
                    name="temperature"
                    value={editedPatient.vitals?.temperature || ''}
                    onChange={handleVitalsChange}
                  />
                </div>
                <div className="form-group">
                  <label>Oxygen Level:</label>
                  <input
                    type="text"
                    name="oxygenLevel"
                    value={editedPatient.vitals?.oxygenLevel || ''}
                    onChange={handleVitalsChange}
                  />
                </div>
              </>
            ) : (
              <>
                <p><strong>Blood Pressure:</strong> {patient.vitals?.bloodPressure || 'Not recorded'}</p>
                <p><strong>Heart Rate:</strong> {patient.vitals?.heartRate || 'Not recorded'}</p>
                <p><strong>Temperature:</strong> {patient.vitals?.temperature || 'Not recorded'}</p>
                <p><strong>Oxygen Level:</strong> {patient.vitals?.oxygenLevel || 'Not recorded'}</p>
              </>
            )}
          </div>
        </div>

        <div className="info-section">
          <h2>Radiology Information</h2>
          <div className="info-content">
            <div className="radiology-subsection">
              <h3>X-Rays</h3>
              {patient.radiology.xRays.map((xray, index) => (
                <div key={`xray-${index}`} className="radiology-item">
                  <p><strong>Date:</strong> {xray.date}</p>
                  <p><strong>Type:</strong> {xray.type}</p>
                  <p><strong>Findings:</strong> {xray.findings}</p>
                  {xray.imageUrl && (
                    <div className="image-preview">
                      <img src={xray.imageUrl} alt={`X-Ray ${index + 1}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="radiology-subsection">
              <h3>MRI Scans</h3>
              {patient.radiology.mriScans.map((mri, index) => (
                <div key={`mri-${index}`} className="radiology-item">
                  <p><strong>Date:</strong> {mri.date}</p>
                  <p><strong>Type:</strong> {mri.type}</p>
                  <p><strong>Findings:</strong> {mri.findings}</p>
                  {mri.imageUrl && (
                    <div className="image-preview">
                      <img src={mri.imageUrl} alt={`MRI Scan ${index + 1}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="radiology-subsection">
              <h3>CT Scans</h3>
              {patient.radiology.ctScans.map((ct, index) => (
                <div key={`ct-${index}`} className="radiology-item">
                  <p><strong>Date:</strong> {ct.date}</p>
                  <p><strong>Type:</strong> {ct.type}</p>
                  <p><strong>Findings:</strong> {ct.findings}</p>
                  {ct.imageUrl && (
                    <div className="image-preview">
                      <img src={ct.imageUrl} alt={`CT Scan ${index + 1}`} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>Genetic Information</h2>
          <div className="info-content">
            <div className="genetics-subsection">
              <h3>DNA Analysis</h3>
              <p><strong>Date:</strong> {patient.genetics.dnaAnalysis.date}</p>
              <p><strong>Findings:</strong> {patient.genetics.dnaAnalysis.findings}</p>
              <div className="risk-factors">
                <strong>Risk Factors:</strong>
                <ul>
                  {patient.genetics.dnaAnalysis.riskFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="genetics-subsection">
              <h3>Family History</h3>
              <div className="family-conditions">
                <strong>Known Conditions:</strong>
                <ul>
                  {patient.genetics.familyHistory.conditions.map((condition, index) => (
                    <li key={index}>{condition}</li>
                  ))}
                </ul>
              </div>
              <div className="family-relationships">
                <strong>Family Members:</strong>
                <ul>
                  {patient.genetics.familyHistory.relationships.map((relation, index) => (
                    <li key={index}>{relation}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="genetics-subsection">
              <h3>Genetic Markers</h3>
              <p><strong>Tested Markers:</strong> {patient.genetics.geneticMarkers.tested.join(', ')}</p>
              <p><strong>Results:</strong> {patient.genetics.geneticMarkers.results}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail; 