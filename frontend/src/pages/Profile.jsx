import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';

function Profile() {
  const [user, setUser] = useState({ username: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      // Check if user is authenticated before making API call
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/user/profile');
        setUser(response.data);
        setFormData({ username: response.data.username, email: response.data.email, password: '' });
        setError('');
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError('Failed to load profile');
        if (err.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await api.put('/user/profile', formData);
      setUser(response.data);
      setFormData({ ...formData, password: '' });
      setSuccess('Profile updated successfully');
      setError('');
      setEditMode(false);
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.Message || 'Failed to update profile');
      setSuccess('');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 px-6">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-full border border-white/30 mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white">My Profile</h2>
            <p className="text-gray-300 text-sm mt-2">Manage your account information and preferences</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-md border border-red-300/30 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-300 text-xl mr-3">⚠️</span>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 backdrop-blur-md border border-green-300/30 rounded-lg">
              <div className="flex items-center">
                <span className="text-green-300 text-xl mr-3">✅</span>
                <p className="text-green-300 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-gray-300 text-lg">Loading your profile...</p>
            </div>
          ) : !editMode ? (
            <div>
              {/* Profile Display Mode */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🏷️</span>
                    <label className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Username</label>
                  </div>
                  <p className="text-white font-medium text-lg">{user.username}</p>
                </div>
                <div className="bg-white/5 backdrop-blur-md p-6 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">📧</span>
                    <label className="text-gray-300 text-sm font-semibold uppercase tracking-wide">Email</label>
                  </div>
                  <p className="text-white font-medium text-lg break-all">{user.email}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500/20 backdrop-blur-md text-white p-4 rounded-lg font-semibold hover:bg-blue-500/30 hover:scale-105 transition-all duration-300 border border-blue-400/30 flex items-center justify-center"
                >
                  <span className="text-xl mr-2">✏️</span>
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-500/20 backdrop-blur-md text-white p-4 rounded-lg font-semibold hover:bg-red-500/30 hover:scale-105 transition-all duration-300 border border-red-400/30 flex items-center justify-center"
                >
                  <span className="text-xl mr-2">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              {/* Profile Edit Mode */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="flex items-center text-gray-200 mb-3 text-sm font-semibold">
                    <span className="text-xl mr-2">🏷️</span>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder-gray-300 text-lg"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center text-gray-200 mb-3 text-sm font-semibold">
                    <span className="text-xl mr-2">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder-gray-300 text-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center text-gray-200 mb-3 text-sm font-semibold">
                    <span className="text-xl mr-2">🔐</span>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 placeholder-gray-300 text-lg"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs text-gray-400 mt-2 flex items-center">
                    <span className="mr-1">💡</span>
                    Optional: Leave empty to keep your current password
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="bg-green-500/20 backdrop-blur-md text-white p-4 rounded-lg font-semibold hover:bg-green-500/30 hover:scale-105 transition-all duration-300 disabled:bg-green-500/10 disabled:cursor-not-allowed border border-green-400/30"
                >
                  {updating ? (
                    <span className="flex items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Saving Changes...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <span className="text-xl mr-2">💾</span>
                      Save Changes
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="bg-gray-500/20 backdrop-blur-md text-white p-4 rounded-lg font-semibold hover:bg-gray-500/30 hover:scale-105 transition-all duration-300 border border-gray-400/30 flex items-center justify-center"
                >
                  <span className="text-xl mr-2">❌</span>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;