import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';// reload page 
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Calendar, Info, Loader2, ArrowRight } from 'lucide-react';

export const BookingCheckout = () => { //component
  const { id: sitterId } = useParams(); //get params from url and renames
  const navigate = useNavigate(); //for redirection
  const { user } = useContext(AuthContext);

  const [sitter, setSitter] = useState(null); //for sitter data
  const [pets, setPets] = useState([]); // for pets data

  const [loading, setLoading] = useState(true);// fetching the setSitter and setPets
  const [submitting, setSubmitting] = useState(false); // prevents multiple re booking
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    petIds: [],
    startDate: '',
    endDate: '',
    serviceType: 'DAY_SITTING',
    specialInstructions: '',
    customTasks: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sitterRes, petsRes] = await Promise.all([ // two requests at the same time and waits for both of them to finish
          axiosClient.get(`/sitters/${sitterId}`),
          axiosClient.get('/pets/me')
        ]);
        setSitter(sitterRes.data.data);
        setPets(petsRes.data.data);
        if (petsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, petIds: [petsRes.data.data[0]._id] }));
        }
      } catch (err) {
        setError('Failed to load booking details.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sitterId]);

  // Price Calculation
  const calculateTotal = () => {
    if (!sitter || !formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end < start) return 0;

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const rate = formData.serviceType === 'WALKING' ? sitter.rates?.walking : sitter.rates?.daySitting;
    // Multiply by number of pets
    const numPets = formData.petIds.length > 0 ? formData.petIds.length : 1;
    return days * (rate || 500) * numPets;
  };

  const handlePetToggle = (petId) => {
    setFormData(prev => {   // Do not need to define prev(formData) as it is directly asscoaited with Usestate
      const isSelected = prev.petIds.includes(petId);
      if (isSelected) {
        return { ...prev, petIds: prev.petIds.filter(id => id !== petId) };
      } else {
        return { ...prev, petIds: [...prev.petIds, petId] };
      }
    });
  };

  const getTaskHour = (task) => {
    if (task.hour !== undefined && task.hour !== '') return task.hour;
    const timeStr = task.time || task.targetTime || '';
    if (timeStr) {
      const clean = timeStr.replace(/\s*(AM|PM|am|pm)$/i, '').trim();
      const parts = clean.split(':');
      if (parts[0]) return parts[0].padStart(2, '0');
    }
    return '08';
  };

  const getTaskMinute = (task) => {
    if (task.minute !== undefined && task.minute !== '') return task.minute;
    const timeStr = task.time || task.targetTime || '';
    if (timeStr) {
      const clean = timeStr.replace(/\s*(AM|PM|am|pm)$/i, '').trim();
      const parts = clean.split(':');
      if (parts[1]) return parts[1].padStart(2, '0');
    }
    return '00';
  };

  const getTaskPeriod = (task) => {
    if (task.period) return task.period;
    const timeStr = task.time || task.targetTime || '';
    if (/PM/i.test(timeStr)) return 'PM';
    return 'AM';
  };

  const handleTimeChange = (index, field, value) => {
    const newTasks = [...formData.customTasks];
    const task = { ...newTasks[index] };

    if (field === 'period') {
      task.period = value;
    } else if (field === 'hour') {
      if (value === '') {
        task.hour = '';
      } else {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          const prevNum = parseInt(getTaskHour(task), 10);
          if (Math.abs(num - prevNum) === 1 || value.length >= 2) {
            const clamped = Math.min(12, Math.max(1, num));
            task.hour = String(clamped).padStart(2, '0');
          } else {
            task.hour = value;
          }
        }
      }
    } else if (field === 'minute') {
      if (value === '') {
        task.minute = '';
      } else {
        const num = parseInt(value, 10);
        if (!isNaN(num)) {
          const prevNum = parseInt(getTaskMinute(task), 10);
          if (Math.abs(num - prevNum) === 1 || value.length >= 2) {
            const clamped = Math.min(59, Math.max(0, num));
            task.minute = String(clamped).padStart(2, '0');
          } else {
            task.minute = value;
          }
        }
      }
    }

    const h = task.hour !== undefined ? task.hour : getTaskHour(task);
    const m = task.minute !== undefined ? task.minute : getTaskMinute(task);
    task.time = `${h}:${m}`;
    newTasks[index] = task;
    setFormData({ ...formData, customTasks: newTasks });
  };

  const handleTimeBlur = (index, field) => {
    const newTasks = [...formData.customTasks];
    const task = { ...newTasks[index] };

    if (field === 'hour') {
      let num = parseInt(task.hour, 10);
      if (isNaN(num) || num < 1) num = 8;
      if (num > 12) num = 12;
      task.hour = String(num).padStart(2, '0');
    } else if (field === 'minute') {
      let num = parseInt(task.minute, 10);
      if (isNaN(num) || num < 0) num = 0;
      if (num > 59) num = 59;
      task.minute = String(num).padStart(2, '0');
    }

    const h = task.hour || '08';
    const m = task.minute !== undefined && task.minute !== '' ? task.minute : '00';
    task.time = `${h}:${m}`;
    newTasks[index] = task;
    setFormData({ ...formData, customTasks: newTasks });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const formattedTasks = formData.customTasks.map(task => {
        const hour = (getTaskHour(task) || '08').padStart(2, '0');
        const minute = (getTaskMinute(task) || '00').padStart(2, '0');
        const period = getTaskPeriod(task);
        const targetTime = `${hour}:${minute} ${period}`;
        return {
          category: task.category,
          taskName: task.taskName,
          targetTime,
        };
      });

      const res = await axiosClient.post('/bookings', {
        sitterId: sitter.userId._id,
        ...formData,
        customTasks: formattedTasks
      });
      // Redirect to my bookings
      navigate('/my-bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit booking request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  if (error || !sitter) return <div className="text-center py-20 text-red-600">{error}</div>; //failing databse request

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Request Booking</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Form Section */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-5">

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Which pet needs care?</label>
              {pets.length === 0 ? (
                <div className="p-3 bg-amber-50 text-amber-700 rounded-lg text-sm border border-amber-200">
                  You don't have any pets registered. <a href="/my-pets" className="font-bold underline">Add a pet first.</a>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pets.map(pet => (
                    <label key={pet._id} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${formData.petIds.includes(pet._id) ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-300'}`}>
                      <input
                        type="checkbox"
                        checked={formData.petIds.includes(pet._id)}
                        onChange={() => handlePetToggle(pet._id)}
                        className="w-4 h-4 text-indigo-600 rounded"
                      />
                      <span className="font-medium text-gray-900 text-sm">{pet.name} <span className="text-gray-500 text-xs">({pet.species})</span></span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Kind of Service</label>
              <select
                value={formData.serviceType}
                onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600 font-medium"
              >
                <option value="DAY_SITTING">Day Sitting (In-Home Care)</option>
                <option value="WALKING">Dog Walking</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Special Instructions / Care Notes</label>
              <textarea
                rows="3"
                placeholder="E.g. House rules, lockbox code, extra walk info..."
                value={formData.specialInstructions}
                onChange={e => setFormData({ ...formData, specialInstructions: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-600"
              ></textarea>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-bold text-gray-700">Daily Care Routine (Custom Schedule)</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, customTasks: [...formData.customTasks, { category: 'FOOD', taskName: '', hour: '08', minute: '00', period: 'AM' }] })}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg"
                >
                  + Add Task
                </button>
              </div>
              <div className="space-y-3"> {/* for child item*/}
                {formData.customTasks.map((task, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                    <select
                      value={task.category}
                      onChange={(e) => {
                        const newTasks = [...formData.customTasks];
                        newTasks[index].category = e.target.value;
                        setFormData({ ...formData, customTasks: newTasks });
                      }}
                      className="w-full sm:w-36 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm shrink-0"
                    >
                      <option value="FOOD">Food Protocol</option>
                      <option value="SLEEP">Sleep Protocol</option>
                      <option value="WALK">Walk Protocol</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Task Name (e.g. Morning Walk)"
                      value={task.taskName}
                      required
                      onChange={(e) => {
                        const newTasks = [...formData.customTasks];
                        newTasks[index].taskName = e.target.value;
                        setFormData({ ...formData, customTasks: newTasks });
                      }}
                      className="flex-1 min-w-[120px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2 items-center shrink-0">
                      {/* Unified Time Component [ 08 ^v : 00 ^v | AM v ] */}
                      <div className="flex items-center h-[38px] bg-gray-50 border border-gray-300 rounded-lg px-2.5 focus-within:ring-2 focus-within:ring-indigo-600 focus-within:border-transparent shrink-0">
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={getTaskHour(task)}
                          onChange={(e) => handleTimeChange(index, 'hour', e.target.value)}
                          onBlur={() => handleTimeBlur(index, 'hour')}
                          className="w-11 text-center bg-transparent text-sm font-semibold text-gray-800 focus:outline-none time-spin-input"
                        />
                        <span className="text-gray-500 font-bold select-none px-0.5">:</span>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          value={getTaskMinute(task)}
                          onChange={(e) => handleTimeChange(index, 'minute', e.target.value)}
                          onBlur={() => handleTimeBlur(index, 'minute')}
                          className="w-11 text-center bg-transparent text-sm font-semibold text-gray-800 focus:outline-none time-spin-input"
                        />
                        <div className="h-4 w-[1px] bg-gray-300 mx-1.5 self-center"></div>
                        <select
                          value={getTaskPeriod(task)}
                          onChange={(e) => handleTimeChange(index, 'period', e.target.value)}
                          className="bg-transparent text-sm font-bold text-gray-800 focus:outline-none cursor-pointer pr-1"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const newTasks = formData.customTasks.filter((_, i) => i !== index);
                          setFormData({ ...formData, customTasks: newTasks });
                        }}
                        className="h-[38px] w-[38px] flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-sm transition shrink-0"
                        title="Remove Task"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {formData.customTasks.length === 0 && (
                  <p className="text-xs text-gray-500 italic">No custom tasks added. The sitter will follow standard protocol.</p>
                )}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={submitting || pets.length === 0}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Processing...' : 'Confirm & Send Request'} <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600" /> Booking Summary
            </h3>

            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                {sitter.userId?.name?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{sitter.userId?.name}</p>
                <p className="text-xs text-gray-500">Verified Sitter</p>
              </div>
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-600">
                <span>{formData.serviceType === 'WALKING' ? 'Dog Walking Rate' : 'Daily Boarding Rate'}</span>
                <span>₹{formData.serviceType === 'WALKING' ? sitter.rates?.walking : sitter.rates?.daySitting}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Days</span>
                <span>{formData.startDate && formData.endDate ? Math.max(1, Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) + 1) : 0}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pets Selected</span>
                <span>{formData.petIds.length}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-indigo-600">₹{calculateTotal()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
