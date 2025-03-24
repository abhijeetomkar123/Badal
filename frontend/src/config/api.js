// Backend API URL - change this to your backend server URL
export const API_BASE_URL = 'http://localhost:8000/api';

// API Endpoints
export const ENDPOINTS = {
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Patient endpoints
  PATIENTS: '/patients',
  PATIENT_DETAIL: (id) => `/patients/${id}`,
  PATIENT_UPDATE: (id) => `/patients/${id}`,
  PATIENT_VITALS: (id) => `/patients/${id}/vitals`,
  PATIENT_SCANS: (id) => `/patients/${id}/scans`,
  PATIENT_GENETIC: (id) => `/patients/${id}/genetic`,
  
  // ML Model endpoints
  SKIN_CANCER_PREDICT: '/ml/predict/skin',
  GENETIC_CANCER_PREDICT: '/ml/predict/genetic',
  
  // Research endpoints
  RESEARCH_DATA: '/research/data',
  RESEARCH_DOWNLOAD: '/research/download'
};

// Request headers
export const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// File upload headers
export const getFileHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    // Don't set Content-Type for file uploads
  };
}; 