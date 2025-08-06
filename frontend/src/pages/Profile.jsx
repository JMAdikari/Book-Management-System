import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();

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

    // Check if edit mode should be enabled from URL parameters
    if (searchParams.get('edit') === 'true') {
      setEditMode(true);
    }
  }, [navigate, searchParams]);

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
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-primary)' }}>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20 px-6">
        <div style={{ 
          background: 'var(--glass-bg-primary)', 
          backdropFilter: 'var(--blur-md)',
          border: '1px solid var(--glass-border-light)'
        }} className="p-8 rounded-xl shadow-2xl w-full max-w-4xl">
          <div className="text-center mb-8">
            <div style={{ 
              background: 'var(--glass-bg-secondary)', 
              border: '1px solid var(--glass-border-medium)'
            }} className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4">
              <span className="text-4xl">👤</span>
            </div>
            <h2 className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>My Profile</h2>
            <p style={{ color: 'var(--text-secondary)' }} className="text-sm mt-2">Manage your account information and book collection</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg border" style={{ 
              background: 'var(--glass-error)', 
              border: '1px solid var(--border-error)',
              backdropFilter: 'var(--blur-md)'
            }}>
              <div className="flex items-center">
                <span className="text-red-300 text-xl mr-3">⚠️</span>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-lg border" style={{ 
              background: 'var(--glass-success)', 
              border: '1px solid var(--border-success)',
              backdropFilter: 'var(--blur-md)'
            }}>
              <div className="flex items-center">
                <span className="text-green-300 text-xl mr-3">✅</span>
                <p className="text-green-300 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4" style={{ borderBottomColor: 'var(--text-primary)' }}></div>
              <p style={{ color: 'var(--text-secondary)' }} className="text-lg">Loading your profile...</p>
            </div>
          ) : !editMode ? (
            <div>
              {/* Profile Display Mode */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="p-6 rounded-lg border transition-all duration-300 hover:scale-105" style={{ 
                  background: 'var(--glass-bg-tertiary)', 
                  border: '1px solid var(--glass-border-light)',
                  backdropFilter: 'var(--blur-sm)'
                }}>
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">🏷️</span>
                    <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold uppercase tracking-wide">Username</label>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium text-lg">{user.username}</p>
                </div>
                <div className="p-6 rounded-lg border transition-all duration-300 hover:scale-105" style={{ 
                  background: 'var(--glass-bg-tertiary)', 
                  border: '1px solid var(--glass-border-light)',
                  backdropFilter: 'var(--blur-sm)'
                }}>
                  <div className="flex items-center mb-3">
                    <span className="text-2xl mr-3">📧</span>
                    <label style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold uppercase tracking-wide">Email</label>
                  </div>
                  <p style={{ color: 'var(--text-primary)' }} className="font-medium text-lg break-all">{user.email}</p>
                </div>
              </div>

              {/* Navigation Cards */}
              <div className="mb-8">
                <h3 style={{ color: 'var(--text-primary)' }} className="text-xl font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">📚</span>
                  Book Management
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/catalog')}
                    className="p-6 rounded-lg font-semibold hover:scale-105 transition-all duration-300 text-left"
                    style={{ 
                      background: 'var(--glass-info)', 
                      border: '1px solid var(--border-info)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'var(--blur-md)'
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-3xl mr-3">📖</span>
                      <span className="text-lg">My Book Catalog</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">View, edit, and manage your personal book collection</p>
                  </button>
                  <button
                    onClick={() => navigate('/search')}
                    className="p-6 rounded-lg font-semibold hover:scale-105 transition-all duration-300 text-left"
                    style={{ 
                      background: 'var(--glass-success)', 
                      border: '1px solid var(--border-success)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'var(--blur-md)'
                    }}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-3xl mr-3">🔍</span>
                      <span className="text-lg">Search Books</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)' }} className="text-sm">Discover and add new books to your collection</p>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid md:grid-cols-2 gap-4">
                
               
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>
              {/* Profile Edit Mode */}
              <div className="space-y-6 mb-8">
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xl mr-2">🏷️</span>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-lg focus:outline-none focus:ring-2 text-lg"
                    style={{ 
                      background: 'var(--glass-bg-secondary)', 
                      border: '1px solid var(--glass-border-light)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'var(--blur-md)'
                    }}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xl mr-2">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-lg focus:outline-none focus:ring-2 text-lg"
                    style={{ 
                      background: 'var(--glass-bg-secondary)', 
                      border: '1px solid var(--glass-border-light)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'var(--blur-md)'
                    }}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xl mr-2">🔐</span>
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-lg focus:outline-none focus:ring-2 text-lg"
                    style={{ 
                      background: 'var(--glass-bg-secondary)', 
                      border: '1px solid var(--glass-border-light)',
                      color: 'var(--text-primary)',
                      backdropFilter: 'var(--blur-md)'
                    }}
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs mt-2 flex items-center" style={{ color: 'var(--text-muted)' }}>
                    <span className="mr-1">💡</span>
                    Optional: Leave empty to keep your current password
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <button 
                  type="submit" 
                  disabled={updating}
                  className="p-4 rounded-lg font-semibold hover:scale-105 transition-all duration-300 disabled:cursor-not-allowed"
                  style={{ 
                    background: updating ? 'var(--glass-bg-tertiary)' : 'var(--glass-success)', 
                    border: '1px solid var(--border-success)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'var(--blur-md)'
                  }}
                >
                  {updating ? (
                    <span className="flex items-center justify-center">
                      <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 mr-3" style={{ borderBottomColor: 'var(--text-primary)' }}></div>
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
                  className="p-4 rounded-lg font-semibold hover:scale-105 transition-all duration-300 flex items-center justify-center"
                  style={{ 
                    background: 'var(--glass-bg-secondary)', 
                    border: '1px solid var(--glass-border-light)',
                    color: 'var(--text-primary)',
                    backdropFilter: 'var(--blur-md)'
                  }}
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