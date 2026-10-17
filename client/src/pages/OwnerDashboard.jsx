import React, { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { Loader2, Calendar, Clock, PawPrint } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await axiosClient.get('/bookings');
      const data = res.data.data || [];
      const sorted = [...data].sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
      setBookings(sorted);
    } catch (error) {
      console.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-gray-900">My Bookings</h1>
        <Link to="/explore" className="text-sm font-bold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
          Find a Sitter
        </Link>
      </div>
      
      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border border-gray-200">
            You don't have any booking requests yet.
          </div>
        ) : bookings.map(booking => (
          <div key={booking._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold text-gray-900 text-lg">{booking.sitterId?.name}</span>
                <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${
                  booking.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' :
                  booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                Service: {booking.serviceType === 'WALKING' ? 'Dog Walking' : 'Day Sitting'}
              </p>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <PawPrint className="w-4 h-4 text-indigo-400" /> For: {booking.petId?.name} ({booking.petId?.breed})
              </p>
              <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
              </p>
              <p className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
                Total Price: ₹{booking.totalPrice}
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              {(booking.status === 'CONFIRMED' || booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') && (
                <Link to={`/bookings/${booking._id}`} className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white text-center px-4 py-2 rounded-lg font-bold text-sm transition">
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
