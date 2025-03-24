// Format date to a readable string
export const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format patient status for display
export const formatPatientStatus = (status) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// Calculate age from date of birth
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Format vital signs with units
export const formatVitalSigns = (vitals) => {
  return {
    bloodPressure: `${vitals.bloodPressure} mmHg`,
    heartRate: `${vitals.heartRate} bpm`,
    temperature: `${vitals.temperature}°F`,
    oxygenLevel: `${vitals.oxygenLevel}%`,
  };
};

// Check if user has required role
export const hasRole = (userRoles, requiredRole) => {
  return userRoles.includes(requiredRole);
};

// Format error messages for display
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  return 'An unexpected error occurred';
};

// Generate random ID (for temporary use before API integration)
export const generateTempId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Sort patients by various criteria
export const sortPatients = (patients, criteria = 'name', order = 'asc') => {
  return [...patients].sort((a, b) => {
    let compareA = a[criteria];
    let compareB = b[criteria];
    
    if (criteria === 'name') {
      compareA = compareA.toLowerCase();
      compareB = compareB.toLowerCase();
    }
    
    if (order === 'asc') {
      return compareA > compareB ? 1 : -1;
    } else {
      return compareA < compareB ? 1 : -1;
    }
  });
};

// Filter patients by search term
export const filterPatients = (patients, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return patients.filter(patient => 
    patient.name.toLowerCase().includes(term) ||
    patient.condition.toLowerCase().includes(term) ||
    patient.status.toLowerCase().includes(term)
  );
};

// Calculate statistics for research dashboard
export const calculateStatistics = (patients) => {
  const total = patients.length;
  const activeCount = patients.filter(p => p.status === 'active').length;
  const recoveredCount = patients.filter(p => p.status === 'recovered').length;
  const criticalCount = patients.filter(p => p.status === 'critical').length;
  
  return {
    total,
    activePercentage: ((activeCount / total) * 100).toFixed(1),
    recoveredPercentage: ((recoveredCount / total) * 100).toFixed(1),
    criticalPercentage: ((criticalCount / total) * 100).toFixed(1),
  };
};

// Validate password strength
export const isStrongPassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
}; 