// frontend/src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords)
};

// Patient APIs
export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data) => api.put('/patient/profile', data),
  getDoctors: () => api.get('/patient/doctors'),
  createAppointment: (data) => api.post('/patient/appointments', data),
  getAppointments: (status) => api.get('/patient/appointments', { params: { status } }),
  cancelAppointment: (id) => api.put(`/patient/appointments/${id}/cancel`),
  getMedicalRecords: () => api.get('/patient/medical-records'),
  getPrescriptions: () => api.get('/patient/prescriptions'),
  getPrescriptionDetails: (id) => api.get(`/patient/prescriptions/${id}/details`),
  getBills: (status) => api.get('/patient/bills', { params: { status_tagihan: status } }),
  payBill: (data) => api.post('/patient/payments', data),
  getPaymentHistory: () => api.get('/patient/payments/history'),
  rateDoctor: (data) => api.post('/patient/ratings', data),
  getDoctorRatings: (id) => api.get(`/patient/doctors/${id}/ratings`)
};

// Doctor APIs
export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
  getAppointments: (status) => api.get('/doctor/appointments', { params: { status } }),
  updateAppointmentStatus: (id, status) => api.put(`/doctor/appointments/${id}/status`, { status }),
  getPatients: () => api.get('/doctor/patients'),
  getPatientMedicalRecords: (id) => api.get(`/doctor/patients/${id}/medical-records`),
  createMedicalRecord: (data) => api.post('/doctor/medical-records', data),
  updateMedicalRecord: (id, data) => api.put(`/doctor/medical-records/${id}`, data),
  getMedicines: () => api.get('/doctor/medicines'),
  createPrescription: (data) => api.post('/doctor/prescriptions', data),
  getPrescriptions: () => api.get('/doctor/prescriptions'),
  getRatings: () => api.get('/doctor/ratings'),
  getStatistics: () => api.get('/doctor/statistics')
};

export default api;