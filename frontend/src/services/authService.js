import api from './api';

// Authentication service
export const authService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        message: response.data.Message || 'Registration successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || 'Registration failed'
      };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.Token) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.Token);
      }
      
      return {
        success: true,
        data: response.data,
        token: response.data.Token,
        message: 'Login successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || 'Login failed'
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get current auth token
  getToken: () => {
    return localStorage.getItem('authToken');
  }
};

export default authService;
