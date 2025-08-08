import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import Navbar from '../components/Navbar';

function Profile() {
  const [user, setUser] = useState({ username: '', email: '' });
  const [editMode, setEditMode] = useState(false);
  const [editGoalsMode, setEditGoalsMode] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [goalData, setGoalData] = useState({ monthlyTarget: 3, yearlyTarget: 36 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [bookStats, setBookStats] = useState({ total: 0, reading: 0, finished: 0, wantToRead: 0 });
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
        
        // Fetch book statistics
        try {
          const booksResponse = await api.get('/books');
          const books = booksResponse.data;
          const stats = {
            total: books.length,
            reading: books.filter(book => book.readingStatus === 'Reading').length,
            finished: books.filter(book => book.readingStatus === 'Finished').length,
            wantToRead: books.filter(book => book.readingStatus === 'Want to Read').length,
            favorites: books.filter(book => book.isFavorite).length
          };
          setBookStats(stats);
        } catch (err) {
          console.error('Failed to fetch book stats:', err);
        }
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

  const handleGoalUpdate = () => {
    // Here you would typically save to backend
    setSuccess('Reading goals updated successfully!');
    setEditGoalsMode(false);
    // You can add API call here to save goals to backend
  };

  const handleGoalCancel = () => {
    // Reset to original values if needed
    setGoalData({ monthlyTarget: 3, yearlyTarget: 36 });
    setEditGoalsMode(false);
  };

  const getReadingProgress = () => {
    if (bookStats.total === 0) return 0;
    return Math.round((bookStats.finished / bookStats.total) * 100);
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-primary)' }}>
      <Navbar />
      
      {/* Standard Page Content */}
      <div className="pt-20 px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 card">
              <span className="text-5xl">👤</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-glass-primary mb-2">Welcome back, {user.username}!</h1>
            <p className="text-glass-secondary text-lg">{getTodayDate()}</p>
          </div>

          

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl border backdrop-blur-md bg-red-500/20 border-red-500/30 max-w-2xl mx-auto">
              <div className="flex items-center">
                <span className="text-red-300 text-xl mr-3">⚠️</span>
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl border backdrop-blur-md bg-green-500/20 border-green-500/30 max-w-2xl mx-auto">
              <div className="flex items-center">
                <span className="text-green-300 text-xl mr-3"></span>
                <p className="text-green-300 text-sm font-medium">{success}</p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 mb-6" style={{ borderBottomColor: 'var(--text-primary)' }}></div>
            <p className="text-glass-secondary text-xl">Loading your dashboard...</p>
          </div>
        ) : !editMode ? (
          <div className="space-y-8">
            {/* Daily Overview Section */}
            <section>
              <h2 className="text-2xl font-bold text-glass-primary mb-6 flex items-center">
              
                Daily Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card text-center bg-gradient-to-br from-cyan-500/15 to-blue-600/15 border-cyan-400/25 shadow-md shadow-cyan-500/10">
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-2xl font-bold text-glass-primary">{bookStats.total}</h3>
                  <p className="text-glass-secondary">Total Books</p>
                </div>
                <div className="card text-center bg-gradient-to-br from-amber-500/15 to-orange-600/15 border-amber-400/25 shadow-md shadow-amber-500/10">
                  <div className="text-4xl mb-3">📖</div>
                  <h3 className="text-2xl font-bold text-glass-primary">{bookStats.reading}</h3>
                  <p className="text-glass-secondary">Currently Reading</p>
                </div>
                <div className="card text-center bg-gradient-to-br from-green-500/15 to-emerald-600/15 border-green-400/25 shadow-md shadow-green-500/10">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-2xl font-bold text-glass-primary">{bookStats.finished}</h3>
                  <p className="text-glass-secondary">Completed</p>
                </div>
                <div className="card text-center bg-gradient-to-br from-pink-500/15 to-rose-600/15 border-pink-400/25 shadow-md shadow-pink-500/10">
                  <div className="text-4xl mb-3">❤️</div>
                  <h3 className="text-2xl font-bold text-glass-primary">{bookStats.favorites}</h3>
                  <p className="text-glass-secondary">Favorites</p>
                </div>
              </div>
            </section>

            {/* Reading Progress Section */}
            <section>
              <h2 className="text-2xl font-bold text-glass-primary mb-6 flex items-center">
                
                Reading Progress & AI Analysis
              </h2>
              <div className="grid grid-cols-1 gap-8">
                <div className="card bg-gradient-to-br from-violet-500/12 to-purple-600/12 border-violet-400/25 shadow-md shadow-violet-500/10">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-semibold text-glass-primary">Completion Rate</h3>
                    <span className="text-4xl font-bold text-glass-primary">{getReadingProgress()}%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-6 mb-6">
                    <div 
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-6 rounded-full transition-all duration-500"
                      style={{ width: `${getReadingProgress()}%` }}
                    ></div>
                  </div>
                  <p className="text-glass-secondary text-lg">
                    You've completed {bookStats.finished} out of {bookStats.total} books in your library
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card bg-gradient-to-br from-sky-500/12 to-blue-600/12 border-sky-400/25 shadow-md shadow-sky-500/10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-semibold text-glass-primary">Reading Goals</h3>
                      {!editGoalsMode && (
                        <button
                          onClick={() => setEditGoalsMode(true)}
                          className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center gap-2 text-sm"
                        >
                         
                          Edit Goals
                        </button>
                      )}
                    </div>
                    
                    {!editGoalsMode ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-glass-secondary text-lg">Monthly Target</span>
                          <span className="text-glass-primary font-semibold text-xl">{goalData.monthlyTarget} books</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-glass-secondary text-lg">This Month</span>
                          <span className="text-glass-primary font-semibold text-xl">{Math.min(bookStats.finished, goalData.monthlyTarget)} books</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-glass-secondary text-lg">Average per Month</span>
                          <span className="text-glass-primary font-semibold text-xl">{Math.round(bookStats.finished / 12 * 10) / 10} books</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-glass-secondary text-lg">Yearly Goal</span>
                          <span className="text-glass-primary font-semibold text-xl">{goalData.yearlyTarget} books</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-glass-secondary text-sm font-semibold mb-2">
                             Monthly Target
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={goalData.monthlyTarget}
                            onChange={(e) => setGoalData({ ...goalData, monthlyTarget: parseInt(e.target.value) || 1 })}
                            className="glass-input w-full text-lg"
                            placeholder="Enter monthly target"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-glass-secondary text-sm font-semibold mb-2">
                             Yearly Target
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="365"
                            value={goalData.yearlyTarget}
                            onChange={(e) => setGoalData({ ...goalData, yearlyTarget: parseInt(e.target.value) || 1 })}
                            className="glass-input w-full text-lg"
                            placeholder="Enter yearly target"
                          />
                        </div>
                        
                        <div className="pt-4 border-t border-white/20">
                          <div className="flex gap-3">
                            <button
                              onClick={handleGoalUpdate}
                              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                            >
                              
                              Save Goals
                            </button>
                            <button
                              onClick={handleGoalCancel}
                              className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white flex-1 py-3 px-4 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2"
                            >
                            
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card bg-gradient-to-br from-indigo-500/12 to-purple-600/12 border-indigo-400/25 shadow-md shadow-indigo-500/10">
                    <div className="flex items-center mb-6">
                      
                      <h3 className="text-2xl font-semibold text-glass-primary">AI Reading Analysis</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                           
                          <span className="text-glass-primary font-semibold">Reading Pattern</span>
                        </div>
                        <p className="text-glass-secondary text-sm">Most active on weekends, prefer fiction genre</p>
                      </div>
                      
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                         
                          <span className="text-glass-primary font-semibold">Recommendation</span>
                        </div>
                        <p className="text-glass-secondary text-sm">Try sci-fi novels to diversify your reading</p>
                      </div>
                      
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="flex items-center mb-2">
                           
                          <span className="text-glass-primary font-semibold">Reading Speed</span>
                        </div>
                        <p className="text-glass-secondary text-sm">Average: 2.5 books per month - Above average!</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/30">
                      <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-lg transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                        
                        Get Detailed AI Analysis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions Section */}
            <section>
              <h2 className="text-2xl font-bold text-glass-primary mb-6 flex items-center">
                 
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => navigate('/catalog')}
                  className="card text-left transition-all duration-300 bg-gradient-to-br from-blue-500/15 to-indigo-600/15 border-blue-400/25 shadow-md shadow-blue-500/10"
                >
                  <div className="flex items-center mb-4">
                     
                    <div>
                      <h3 className="text-xl font-semibold text-glass-primary">My Library</h3>
                      <p className="text-glass-secondary text-sm">Manage your book collection</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="card text-left transition-all duration-300 bg-gradient-to-br from-emerald-500/15 to-teal-600/15 border-emerald-400/25 shadow-md shadow-emerald-500/10"
                >
                  <div className="flex items-center mb-4">
                     
                    <div>
                      <h3 className="text-xl font-semibold text-glass-primary">Discover Books</h3>
                      <p className="text-glass-secondary text-sm">Find your next great read</p>
                    </div>
                  </div>
                </button>

                <div className="card bg-gradient-to-br from-purple-500/15 to-pink-600/15 border-purple-400/25 shadow-md shadow-purple-500/10">
                  <div className="flex items-center mb-4">
                     
                    <div>
                      <h3 className="text-xl font-semibold text-glass-primary">Reading Streak</h3>
                      <p className="text-glass-secondary text-sm">7 days and counting!</p>
                    </div>
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-rose-500/15 to-red-600/15 border-rose-400/25 shadow-md shadow-rose-500/10">
                  <div className="flex items-center mb-4">
                     
                    <div>
                      <h3 className="text-xl font-semibold text-glass-primary">Achievements</h3>
                      <p className="text-glass-secondary text-sm">Bookworm level unlocked</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional spacing below Quick Actions */}
            <div className="mb-8"></div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="max-w-2xl mx-auto">
            <div className="card">
              <h2 className="text-3xl font-bold text-glass-primary mb-8 text-center">Edit Profile</h2>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold text-glass-secondary">
                     
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="glass-input w-full text-lg"
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold text-glass-secondary">
                     
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="glass-input w-full text-lg"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center mb-3 text-sm font-semibold text-glass-secondary">
                     
                    New Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="glass-input w-full text-lg"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-xs mt-2 flex items-center text-glass-muted">
                     
                    Optional: Leave empty to keep your current password
                  </p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="submit" 
                    disabled={updating}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex-1 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <span className="flex items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 mr-3 border-white"></div>
                        Saving Changes...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                         
                        Save Changes
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white flex-1 py-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 font-semibold"
                  >
                    <span className="flex items-center justify-center">
                     
                      Cancel
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;