import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import authService from '../services/authService';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await authService.register({
        username,
        email,
        passwordHash: password,
      });
      
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-sm border border-white/20">
          <h2 className="text-2xl font-extrabold mb-6 text-center text-white">Create Account</h2>
          {error && <p className="text-red-300 mb-4 text-center text-sm bg-red-500/20 p-2 rounded-lg border border-red-300/30">{error}</p>}
          {success && (
            <p className="text-green-300 mb-4 text-center text-sm bg-green-500/20 p-2 rounded-lg border border-green-300/30">
              Registration successful! Redirecting to login...
            </p>
          )}
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-200 mb-2 text-sm font-semibold">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm placeholder-gray-300"
                placeholder="Enter your username"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-200 mb-2 text-sm font-semibold">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm placeholder-gray-300"
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-200 mb-2 text-sm font-semibold">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-white/30 bg-white/10 backdrop-blur-md text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 text-sm placeholder-gray-300"
                placeholder="Enter your password"
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white/20 backdrop-blur-md text-white p-3 rounded-lg text-sm font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 disabled:bg-white/10 disabled:cursor-not-allowed border border-white/30"
            >
              {loading ? 'Creating Account...' : '✨ Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-gray-200 font-semibold underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;