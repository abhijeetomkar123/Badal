import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { addPatient, predictSkinCancer, uploadGeneticData, uploadPatientScan } from '../services/api';

const AddPatient = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [patientData, setPatientData] = useState({
    name: '',
    age: '',
    gender: '',
    condition: '',
    diagnosis: '',
    treatment: '',
    medical_history: '',
    vitals: {
      blood_pressure: '',
      heart_rate: '',
      temperature: '',
      oxygen_level: ''
    },
    geneticFile: null,
    dicomFile: null,
    skinCancerImage: null,
    skinCancerPreview: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('vitals.')) {
      const vitalName = name.split('.')[1];
      setPatientData(prev => ({
        ...prev,
        vitals: {
          ...prev.vitals,
          [vitalName]: value
        }
      }));
    } else {
      setPatientData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'geneticFile') {
      if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        setPatientData(prev => ({
          ...prev,
          geneticFile: file
        }));
        setError('');
      } else {
        setError('Please upload a valid Excel file (.xlsx)');
        setPatientData(prev => ({
          ...prev,
          geneticFile: null
        }));
      }
    } else if (e.target.name === 'dicomFile') {
      if (file && (file.type === 'application/dicom' || file.name.endsWith('.dcm'))) {
        setPatientData(prev => ({
          ...prev,
          dicomFile: file
        }));
        setError('');
      } else {
        setError('Please upload a valid DICOM file (.dcm)');
        setPatientData(prev => ({
          ...prev,
          dicomFile: null
        }));
      }
    } else if (e.target.name === 'skinCancerImage') {
      if (file && file.type.startsWith('image/')) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image file size should be less than 5MB');
          setPatientData(prev => ({
            ...prev,
            skinCancerImage: null,
            skinCancerPreview: null
          }));
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPatientData(prev => ({
            ...prev,
            skinCancerImage: file,
            skinCancerPreview: reader.result
          }));
        };
        reader.readAsDataURL(file);
        setError('');
      } else {
        setError('Please upload a valid image file (JPG, PNG, etc.)');
        setPatientData(prev => ({
          ...prev,
          skinCancerImage: null,
          skinCancerPreview: null
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Add patient basic info and vitals
      const patientResponse = await addPatient({
        name: patientData.name,
        age: parseInt(patientData.age),
        gender: patientData.gender,
        condition: patientData.condition,
        diagnosis: patientData.diagnosis,
        treatment: patientData.treatment,
        medical_history: patientData.medical_history,
        vitals: patientData.vitals
      });

      // If genetic file exists, upload it
      if (patientData.geneticFile) {
        const formData = new FormData();
        formData.append('file', patientData.geneticFile);
        await uploadGeneticData(patientResponse.id, formData);
      }

      // If DICOM file exists, upload it
      if (patientData.dicomFile) {
        const formData = new FormData();
        formData.append('scan_file', patientData.dicomFile);
        formData.append('scan_type', 'dicom');
        formData.append('about', 'DICOM scan');
        await uploadPatientScan(patientResponse.id, formData);
      }

      // If skin cancer image exists, analyze and upload it
      if (patientData.skinCancerImage) {
        const formData = new FormData();
        formData.append('file', patientData.skinCancerImage);
        
        try {
          const prediction = await predictSkinCancer(formData);
          
          // Upload the image with prediction results
          const scanFormData = new FormData();
          scanFormData.append('scan_file', patientData.skinCancerImage);
          scanFormData.append('scan_type', 'skin_cancer');
          scanFormData.append('about', `Skin cancer scan - ${prediction.prediction.type}`);
          scanFormData.append('prediction_result', JSON.stringify(prediction.prediction));
          await uploadPatientScan(patientResponse.id, scanFormData);
        } catch (error) {
          console.error('Error processing skin cancer image:', error);
          setError('Error processing skin cancer image: ' + error.message);
          return;
        }
      }

      navigate('/patients');
    } catch (err) {
      setError(err.response?.data?.detail || 'Error adding patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-patient-container">
      <div className="page-header">
        <h1>Add New Patient</h1>
        <button onClick={() => navigate('/patients')} className="back-btn">
          Back to Patient List
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="add-patient-form">
        <div className="form-section">
          <h2>Personal Information</h2>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={patientData.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="number"
              id="age"
              name="age"
              value={patientData.age}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              name="gender"
              value={patientData.gender}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-section">
          <h2>Medical Information</h2>
          <div className="form-group">
            <label htmlFor="condition">Current Condition</label>
            <input
              type="text"
              id="condition"
              name="condition"
              value={patientData.condition}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="diagnosis">Diagnosis</label>
            <input
              type="text"
              id="diagnosis"
              name="diagnosis"
              value={patientData.diagnosis}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="treatment">Treatment Plan</label>
            <textarea
              id="treatment"
              name="treatment"
              value={patientData.treatment}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="medical_history">Medical History</label>
            <textarea
              id="medical_history"
              name="medical_history"
              value={patientData.medical_history}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Vitals</h2>
          <div className="form-group">
            <label htmlFor="blood_pressure">Blood Pressure</label>
            <input
              type="text"
              id="blood_pressure"
              name="vitals.blood_pressure"
              value={patientData.vitals.blood_pressure}
              onChange={handleInputChange}
              placeholder="e.g., 120/80"
            />
          </div>
          <div className="form-group">
            <label htmlFor="heart_rate">Heart Rate (bpm)</label>
            <input
              type="number"
              id="heart_rate"
              name="vitals.heart_rate"
              value={patientData.vitals.heart_rate}
              onChange={handleInputChange}
              placeholder="BPM"
            />
          </div>
          <div className="form-group">
            <label htmlFor="temperature">Temperature (°C)</label>
            <input
              type="number"
              id="temperature"
              name="vitals.temperature"
              value={patientData.vitals.temperature}
              onChange={handleInputChange}
              step="0.1"
              placeholder="°C"
            />
          </div>
          <div className="form-group">
            <label htmlFor="oxygen_level">Oxygen Level (%)</label>
            <input
              type="number"
              id="oxygen_level"
              name="vitals.oxygen_level"
              value={patientData.vitals.oxygen_level}
              onChange={handleInputChange}
              step="0.1"
              placeholder="%"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Genetic Data</h2>
          <div className="form-group">
            <label>Upload Genetic Data (Excel File):</label>
            <input
              type="file"
              name="geneticFile"
              accept=".xlsx"
              onChange={handleFileChange}
              className="file-input"
            />
            <p className="file-hint">Please upload an Excel file (.xlsx) containing genetic data</p>
          </div>
        </div>

        <div className="form-section">
          <h2>DICOM Scan</h2>
          <div className="form-group">
            <label>Upload DICOM File:</label>
            <input
              type="file"
              name="dicomFile"
              accept=".dcm,application/dicom"
              onChange={handleFileChange}
              className="file-input"
            />
            <p className="file-hint">Please upload a DICOM file (.dcm)</p>
          </div>
        </div>

        <div className="form-section">
          <h2>Skin Cancer Analysis</h2>
          <div className="form-group">
            <label>Upload Skin Lesion Image:</label>
            <input
              type="file"
              name="skinCancerImage"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <p className="file-hint">Please upload an image of the skin lesion for analysis</p>
            {patientData.skinCancerPreview && (
              <div className="image-preview">
                <img 
                  src={patientData.skinCancerPreview} 
                  alt="Skin lesion preview" 
                  style={{ maxWidth: '200px', marginTop: '10px' }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Adding Patient...' : 'Add Patient'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/patients')}
            className="cancel-btn"
          >
            Cancel
          </button>
        </div>
      </form>
      {loading && <LoadingSpinner />}
    </div>
  );
};

export default AddPatient; 