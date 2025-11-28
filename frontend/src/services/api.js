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

// --- AUTH APIs ---
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  changePassword: (passwords) => api.put('/auth/change-password', passwords)
};

// --- PATIENT APIs ---
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
  checkStatus: (id) => api.get(`/patient/bills/${id}/status`),
  getBillDetails: (id) => api.get(`/patient/bills/${id}/details`),
  getDoctorRatings: (id) => api.get(`/patient/doctors/${id}/ratings`),
  requestRawatInap: (data) => api.post('/patient/rawat-inap/request', data),
  getAvailableRooms: () => api.get('/patient/rawat-inap/available-rooms'),
};

// --- DOCTOR APIs ---
export const doctorAPI = {
  getProfile: () => api.get('/doctor/profile'),
  updateProfile: (data) => api.put('/doctor/profile', data),
  getAppointments: (status) => api.get('/doctor/appointments', { params: { status } }),
  updateAppointmentStatus: (id, status) => api.put(`/doctor/appointments/${id}/status`, { status }),
  getPatients: (status) => api.get('/doctor/patients', { params: { status } }),
  getPatientMedicalRecords: (id) => api.get(`/doctor/patients/${id}/medical-records`),
  createMedicalRecord: (data) => api.post('/doctor/medical-records', data),
  updateMedicalRecord: (id, data) => api.put('/doctor/medical-records/${id}', data),
  getMedicines: () => api.get('/doctor/medicines'),
  createPrescription: (data) => api.post('/doctor/prescriptions', data),
  getPrescriptions: () => api.get('/doctor/prescriptions'),
  getRatings: () => api.get('/doctor/ratings'),
  getStatistics: () => api.get('/doctor/statistics'),
  getMyInpatients: () => api.get('/doctor/my-inpatients'),
  admitPatient: (data) => api.post('/doctor/patient/admit', data),
  dischargePatient: (id) => api.put(`/doctor/patient/${id}/discharge`),
};

// ==========================================================
// 4. ADMIN APIs (TERAKHIR)
// ==========================================================
export const adminAPI = {
  getStats: () => api.get('/admin/dashboard-stats'),
  
  // Master Data
  getAllDoctors: () => api.get('/admin/master/doctors'), 
  getAvailableRooms: () => api.get('/admin/master/available-rooms'), 

  // Manajemen Obat (CRUD)
  getMedicines: () => api.get('/admin/medicines'), 
  addMedicine: (data) => api.post('/admin/medicines', data), 
  updateMedicine: (id, data) => api.put(`/admin/medicines/${id}`, data), 
  deleteMedicine: (id) => api.delete(`/admin/medicines/${id}`), 

  // --- RAWAT INAP ADMIN CONTROL (NEW) ---
  getRawatInapRequests: () => api.get('/admin/rawat-inap/requests'), 
  approveRawatInap: (id, data) => api.put(`/admin/rawat-inap/${id}/approve`, data), // PUT /admin/rawat-inap/:id/approve
  dischargeAndBill: (id) => api.put(`/admin/rawat-inap/${id}/discharge-bill`), // PUT /admin/rawat-inap/:id/discharge-bill
  // --------------------------------------

  // Laporan (View Oracle)
  getDoctorReports: () => api.get('/admin/reports/doctors'),
  getDeptReports: () => api.get('/admin/reports/departments'),
};

export default api;