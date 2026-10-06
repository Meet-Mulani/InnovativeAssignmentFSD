import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SitterAvailability = () => {
  const [availability, setAvailability] = useState({ maxConcurrentPets: 1, blockedDates: [] });
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAvail = async () => {
      try {
        const res = await axiosClient.get('/sitters/availability/me');
        if (res.data.data) {
          setAvailability(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAvail();
  }, []);

  const addBlockedDate = () => {
    if (!newBlockedDate) return;
    setAvailability(prev => ({
      ...prev,
      blockedDates: [...prev.blockedDates, newBlockedDate]
    }));
    setNewBlockedDate('');
  };

  const removeBlockedDate = (index) => {
    setAvailability(prev => {
      const newDates = [...prev.blockedDates];
      newDates.splice(index, 1);
      return { ...prev, blockedDates: newDates };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let payload = { ...availability };
      if (newBlockedDate) {
        payload.blockedDates = [...payload.blockedDates, newBlockedDate];
        setAvailability(payload);
        setNewBlockedDate('');
      }
      
      await axiosClient.put('/sitters/availability', payload);
      alert('Availability updated successfully');
    } catch (err) {
      alert('Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/sitter/dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Manage Availability</h1>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Max Concurrent Pets</label>
          <input 
            type="number" 
            min="1" 
            max="10" 
            value={availability.maxConcurrentPets || 1} 
            onChange={e => setAvailability({...availability, maxConcurrentPets: parseInt(e.target.value)})}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl"
          />
        </div>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Blackout Dates</label>
          <div className="flex gap-2 mb-3">
            <input 
              type="date" 
              value={newBlockedDate}
              onChange={e => setNewBlockedDate(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl"
            />
            <button onClick={addBlockedDate} className="bg-indigo-100 text-indigo-700 font-bold px-4 rounded-xl">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(availability.blockedDates || []).map((d, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm font-mono flex items-center gap-2">
                {new Date(d).toISOString().split('T')[0]}
                <button onClick={() => removeBlockedDate(i)} className="text-red-500 font-bold">&times;</button>
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl flex justify-center items-center gap-2"
        >
          <Save className="w-4 h-4"/> {saving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>
    </div>
  );
};
