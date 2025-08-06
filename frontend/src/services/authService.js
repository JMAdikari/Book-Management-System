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
      console.log('Attempting login with:', { email, password: '******' });
      
      const response = await api.post('/auth/login', {
        email,
        password
      });
      
      console.log('Login response:', response);
      
      // Get token from response (handle both case possibilities)
      const token = response.data?.token || response.data?.Token;
      
      if (token) {
        // Clean up any stray token entries that might exist
        localStorage.removeItem('token');
        
        // Store token in localStorage
        localStorage.setItem('authToken', token);
        
        // Log the token being stored (for debugging)
        console.log('Token stored in localStorage:', token);
        
        return {
          success: true,
          data: response.data,
          token: token,
          message: 'Login successful'
        };
      } else {
        // Log the response data for debugging
        console.log('Response data structure:', Object.keys(response.data));
        console.error('No token found in response data:', response.data);
        
        // Explicitly check if there's a token property with any case
        const lowerCaseData = {};
        if (response.data && typeof response.data === 'object') {
          // Convert all keys to lowercase for case-insensitive check
          Object.keys(response.data).forEach(key => {
            lowerCaseData[key.toLowerCase()] = response.data[key];
          });
          
          if (lowerCaseData.token) {
            const actualToken = lowerCaseData.token;
            console.log('Found token with case-insensitive check:', actualToken);
            
            // Clean up any stray token entries that might exist
            localStorage.removeItem('token');
            
            // Store the token
            localStorage.setItem('authToken', actualToken);
            console.log('Token stored in localStorage:', actualToken);
            
            return {
              success: true,
              data: response.data,
              token: actualToken,
              message: 'Login successful'
            };
          }
        }
        
        return {
          success: false,
          data: response.data,
          message: 'Login failed: No token received'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed';
      
      if (error.response) {
        // The request was made and the server responded with an error
        errorMessage = error.response.data?.Message || `Server error: ${error.response.status}`;
        console.error('Error response:', error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check if the backend is running.';
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request
        errorMessage = `Request error: ${error.message}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token'); // Clean up any stray token entries
    window.location.href = '/login';
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('authToken');
    console.log('Checking authentication token:', token ? 'Token exists' : 'No token found');
    return !!token;
  },

  // Get current auth token
  getToken: () => {
    const token = localStorage.getItem('authToken');
    console.log('Getting authentication token:', token ? 'Token exists' : 'No token found');
    return token;
  }
};

export default authService;
