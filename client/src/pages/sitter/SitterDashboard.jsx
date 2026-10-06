import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Loader2, CalendarClock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SitterDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Rates State
  const [showRatesModal, setShowRatesModal] = useState(false);
  const [rates, setRates] = useState({ daySittingRate: 500, walkingRate: 200 });
  const [savingRates, setSavingRates] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await axiosClient.get('/bookings');
      setBookings(res.data.data);
    } catch (error) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get('/sitters/profile/me');
      if (res.data.data && res.data.data.rates) {
        setRates({
          daySittingRate: res.data.data.rates.daySitting || 500,
          walkingRate: res.data.data.rates.walking || 200
        });
      }
    } catch (error) {
      console.error('Failed to load profile rates');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axiosClient.patch(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleUpdateRates = async (e) => {
    e.preventDefault();
    setSavingRates(true);
    try {
      await axiosClient.put('/sitters/profile', {
        daySittingRate: rates.daySittingRate,
        walkingRate: rates.walkingRate
      });
      alert('Rates updated successfully!');
      setShowRatesModal(false);
    } catch (err) {
      alert('Failed to update rates');
    } finally {
      setSavingRates(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">Sitter Dashboard</h1>
        <div className="flex flex-wrap gap-3 justify-end">
          <button onClick={() => setShowRatesModal(true)} className="text-sm font-bold bg-amber-100 text-amber-700 px-4 py-2 rounded-lg">Manage Rates</button>
          <Link to="/sitter/availability" className="text-sm font-bold bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg">Availability</Link>
          <Link to="/sitter/credentials" className="text-sm font-bold bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg">Certifications</Link>
        </div>
      </div>

      {showRatesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Rates</h2>
            <form onSubmit={handleUpdateRates} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Day Sitting Rate (₹)</label>
                <input 
                  type="number" min="0" required
                  value={rates.daySittingRate}
                  onChange={e => setRates({...rates, daySittingRate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Dog Walking Rate (₹)</label>
                <input 
                  type="number" min="0" required
                  value={rates.walkingRate}
                  onChange={e => setRates({...rates, walkingRate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowRatesModal(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-xl">Cancel</button>
                <button type="submit" disabled={savingRates} className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl">{savingRates ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border border-gray-200">No booking requests yet.</div>
        ) : bookings.map(booking => (
          <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-gray-900 text-lg">{booking.petId?.name} ({booking.petId?.breed})</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Service: {booking.serviceType === 'WALKING' ? 'Dog Walking' : 'Day Sitting'}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                Owner: {booking.ownerId?.name} | {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-indigo-600">Payout: ₹{booking.totalPrice}</p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {booking.status === 'PENDING' && (
                <>
                  <button onClick={() => updateStatus(booking._id, 'CONFIRMED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                    <CheckCircle className="w-4 h-4"/> Accept
                  </button>
                  <button onClick={() => updateStatus(booking._id, 'CANCELLED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-bold text-sm">
                    <XCircle className="w-4 h-4"/> Decline
                  </button>
                </>
              )}
              {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS') && (
                <Link to={`/bookings/${booking._id}`} className="flex-1 md:flex-none bg-indigo-600 text-white text-center px-4 py-2 rounded-lg font-bold text-sm">
                  Open Care Hub
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
