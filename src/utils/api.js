import axios from 'axios';

const API_BASE_URL = "https://feesmanagementbackend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login') && window.location.pathname !== '/') {
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);



// API functions
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  //change password
  
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  }
};

export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard');
    return response;
  },
  
  getAll: async () => {
    const response = await api.get('/admin');
    return response;
  },
  
  add: async (adminData) => {
    const response = await api.post('/admin/add', adminData);
    return response;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/admin/${id}`);
    return response;
  }
};

export const studentAPI = {
  getAll: async () => {
    const response = await api.get('/students/show-students');
    return response;
  },
  
  getById: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response;
  },
  
  getByStudentId: async (studentId) => {
    const response = await api.get(`/students/${studentId}/fees`);
    return response;
  },
  
  create: async (studentData) => {
    const response = await api.post('/students/add-student', studentData);
    return response;
  },
  
  update: async (id, studentData) => {
    const response = await api.put(`/students/${id}`, studentData);
    return response;
  },
  
  delete: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response;
  }
};

export const feeAPI = {
  getAll: async () => {
    const response = await api.get('/fees');
    return response;
  },
  
  getById: async (feeId) => {
    const response = await api.get(`/fees/${feeId}`);
    return response;
  },
  
  getByStudentId: async (studentId) => {
    const response = await api.get(`/students/${studentId}/fees`);
    return response;
  },
  
  create: async (feeData) => {
    const response = await api.post('/fees', feeData);
    return response;
  },
  
  payFee: async (feeId) => {
    const response = await api.put(`/fees/${feeId}/pay`);
    return response;
  },
  
  update: async (feeId, feeData) => {
    const response = await api.put(`/fees/${feeId}`, feeData);
    return response;
  },
  
  delete: async (feeId) => {
    const response = await api.delete(`/fees/${feeId}`);
    return response;
  },
  
  getDueFees: async () => {
    const response = await api.get('/fees/due');
    return response;
  },
  
  getUpcomingFees: async () => {
    const response = await api.get('/fees/upcoming');
    return response;
  }
};

export const notificationAPI = {
  sendEmail: async (emailData) => {
    const response = await api.post('/notifications/send-email', emailData);
    return response;
  },
  
  sendSMS: async (smsData) => {
    const response = await api.post('/notifications/send-sms', smsData);
    return response;
  },
  
  makeCall: async (callData) => {
    const response = await api.post('/notifications/make-call', callData);
    return response;
  },
  
  sendBulkNotifications: async (bulkData) => {
    const response = await api.post('/notifications/send-bulk', bulkData);
    return response;
  }
};

export default api;