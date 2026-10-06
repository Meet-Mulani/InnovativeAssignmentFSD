import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const Register = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'OWNER',
    phone: '',
    city: '',
    street: '',
    longitude: '',
    latitude: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...formData };
      
      if (payload.role === 'SITTER') {
        payload.longitude = parseFloat(payload.longitude);
        payload.latitude = parseFloat(payload.latitude);
      }
      
      await register(payload);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Join PawsOut</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-bold text-sm ${formData.role === 'OWNER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setFormData({...formData, role: 'OWNER'})}
            >
              Pet Owner
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg font-bold text-sm ${formData.role === 'SITTER' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              onClick={() => setFormData({...formData, role: 'SITTER'})}
            >
              Pet Sitter
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
            <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
          </div>

          {formData.role === 'SITTER' && (
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-4">
              <h3 className="font-bold text-sm text-indigo-900">Service Location & Coordinates</h3>
              <p className="text-xs text-indigo-700">We need your coordinates to show you in local search results!</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                  <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Street / Locality</label>
                  <input type="text" name="street" required value={formData.street} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Longitude</label>
                  <input type="number" step="any" name="longitude" required value={formData.longitude} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" placeholder="e.g. 72.5714" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Latitude</label>
                  <input type="number" step="any" name="latitude" required value={formData.latitude} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:outline-none" placeholder="e.g. 23.0225" />
                </div>
              </div>

              <button 
                type="button" 
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setFormData(prev => ({
                        ...prev,
                        longitude: pos.coords.longitude,
                        latitude: pos.coords.latitude
                      }));
                    }, () => alert("Could not fetch location. Please enter manually."));
                  }
                }}
                className="w-full py-2 bg-indigo-200 hover:bg-indigo-300 text-indigo-900 text-xs font-bold rounded-lg transition"
              >
                📍 Auto-detect My Coordinates
              </button>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-70 mt-2">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};
