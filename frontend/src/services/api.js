import axios from 'axios';
import { API_BASE_URL, ENDPOINTS, getFileHeaders, getHeaders } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to handle CORS
api.interceptors.request.use((config) => {
  config.headers['Access-Control-Allow-Origin'] = '*';
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Auth API calls
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

export const register = async (userData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.REGISTER}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return response.json();
};

// Patients API calls
export const getPatients = async () => {
  try {
    const response = await api.get('/patients/');
    return response.data;
  } catch (error) {
    console.error('Error fetching patients:', error);
    throw error;
  }
};

export const getPatientDetail = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient details:', error);
    throw error;
  }
};

export const addPatient = async (patientData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(patientData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add patient');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error adding patient:', error);
    throw error;
  }
};

export const updatePatient = async (id, data) => {
  try {
    const response = await api.put(`/patients/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
};

// Patient Vitals API calls
export const updatePatientVitals = async (id, vitals) => {
  try {
    const response = await api.post(`/patients/${id}/vitals`, vitals);
    return response.data;
  } catch (error) {
    console.error('Error updating patient vitals:', error);
    throw error;
  }
};

// Patient Scans API calls
export const uploadPatientScan = async (id, scanData) => {
  const formData = new FormData();
  formData.append('about', scanData.about);
  formData.append('scan_type', scanData.scan_type);
  formData.append('scan_file', scanData.file);
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PATIENT_SCANS(id)}`, {
    method: 'POST',
    headers: getFileHeaders(),
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload scan');
  }
  
  return response.json();
};

// Patient Genetic Data API calls
export const uploadGeneticData = async (patientId, formData) => {
  try {
    const response = await api.post(`/patients/${patientId}/genetic`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ML Model API calls
export const predictSkinCancer = async (imageFile) => {  // Changed parameter name to avoid confusion

  
  try {
    const response = await fetch(`${API_BASE_URL}/ml/predict/skin`, {
      method: 'POST',
      body: imageFile,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to analyze skin cancer image');
    }

    return await response.json();
  } 
  catch (error) {
    console.error('Error in skin cancer prediction:', error);
    throw error;
  }
};

export const predictGeneticCancer = async (formData) => {
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS.GENETIC_CANCER_PREDICT}`, {
    method: 'POST',
    headers: getFileHeaders(),
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to process genetic data');
  }
  
  return response.json();
};

// Research API calls
export const getResearchData = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(
    `${API_BASE_URL}${ENDPOINTS.RESEARCH_DATA}?${queryString}`,
    {
      headers: getHeaders()
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch research data');
  }
  
  return response.json();
};

export const downloadResearchData = async (format, filters = {}) => {
  const queryString = new URLSearchParams({ ...filters, format }).toString();
  const response = await fetch(
    `${API_BASE_URL}${ENDPOINTS.RESEARCH_DOWNLOAD}?${queryString}`,
    {
      headers: getHeaders()
    }
  );
  
  if (!response.ok) {
    throw new Error('Failed to download research data');
  }
  
  return response.blob();
};

export const generateReport = async (filters) => {
  const response = await fetch(`${API_BASE_URL}/api/research/report`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(filters),
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate report');
  }
  
  return response.json();
};

export const uploadPatients = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await api.post('/patients/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading patients:', error);
    throw error;
  }
};

export const deletePatient = async (id) => {
  try {
    const response = await api.delete(`/patients/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
};

export default api; 