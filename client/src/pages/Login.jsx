import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
