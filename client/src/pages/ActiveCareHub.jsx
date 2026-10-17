import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // for parameters fetch from url
import io from 'socket.io-client'; // for realtime updates
import axiosClient from '../api/axiosClient'; // for api calls
import { ReviewModal } from '../components/care/ReviewModal';
import { PhoneCall, HeartPulse, CheckCircle2, Circle, Clock, Utensils, Pill, Footprints, Moon, Power } from 'lucide-react'; // icons

let socket;

export const ActiveCareHub = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showDossierModal, setShowDossierModal] = useState(false);

  useEffect(() => {

    const fetchUserAndBooking = async () => {
      try {
        const userRes = await axiosClient.get('/auth/me');
        setCurrentUser(userRes.data.user); //user role

        const bookRes = await axiosClient.get(`/bookings/${id}`);
        setBooking(bookRes.data.data); // all details about booking
      } catch (err) {
        console.error("Failed to initialize active care hub.");
      }
    };
    fetchUserAndBooking();


    socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.emit('join_booking', id); //join by booking id we got from Params


    socket.on('careTaskUpdated', ({ taskId, updatedTask }) => { // on means listening
      setBooking((prevBooking) => { //prevBooking just represents the exact state of current booking
        if (!prevBooking) return prevBooking; // if data is not loaded
        const newBooking = { ...prevBooking }; // create new booking object with same values
        for (let log of newBooking.dailyLogs) {
          const taskIndex = log.tasks.findIndex(t => t._id === taskId); // find task by id
          if (taskIndex !== -1) {
            log.tasks[taskIndex] = updatedTask; // update task
            break; // break the loop
          }
        }
        return newBooking;
      });
    });

    return () => {
      socket.emit('leave_booking', id);
      socket.disconnect();
    };
  }, [id]); // re runs the code if id is changes

  const handleMarkComplete = async (taskId, details = {}) => {
    try {
      await axiosClient.patch(`/bookings/${id}/tasks/${taskId}`, { details }); // patch means updating
    } catch (err) {
      alert("Failed to update task.");
    }
  };

  const handleEndService = async () => {
    try {
      await axiosClient.patch(`/bookings/${id}/status`, { status: 'COMPLETED' });
      const refreshRes = await axiosClient.get(`/bookings/${id}`); // we re fetch to reload the page to show "leave a review" button
      setBooking(refreshRes.data.data);
    } catch (err) {
      alert("Failed to complete booking.");
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh booking to hide review form
    axiosClient.get(`/bookings/${id}`).then(res => setBooking(res.data.data));
  };

  if (!booking || !currentUser) return <div className="p-20 text-center font-bold text-gray-400">Loading Care Hub...</div>;

  const isSitter = currentUser.role === 'SITTER';
  const todayLog = booking.dailyLogs[activeDayIndex] || { tasks: [] };//grabs the list of task

  const getTasksByCategory = (category) => todayLog.tasks.filter(t => t.category === category);
  const completedCount = todayLog.tasks.filter(t => t.isCompleted).length;
  const progressPercent = todayLog.tasks.length > 0 ? Math.round((completedCount / todayLog.tasks.length) * 100) : 0; //for progress bar

  const renderTaskIcon = (cat) => {
    if (cat === 'FOOD') return <Utensils className="w-4 h-4 text-orange-500" />;
    if (cat === 'MEDICATION') return <Pill className="w-4 h-4 text-rose-500" />;
    if (cat === 'WALK') return <Footprints className="w-4 h-4 text-emerald-500" />;
    return <Moon className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Booking #{booking._id.substring(booking._id.length - 6).toUpperCase()}</h1>
          <p className="text-sm text-gray-500 font-medium">Status: <span className="text-indigo-600 font-bold">{booking.status.replace('_', ' ')}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Pet Dossier */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm text-center">
            <div className="w-24 h-24 bg-indigo-100 rounded-full mx-auto mb-4 border-4 border-indigo-50 flex items-center justify-center text-3xl font-black text-indigo-300">
              {booking.petId.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{booking.petId.name}</h2>
            <p className="text-sm text-gray-500 mb-6">{booking.petId.breed}</p>
            <button
              onClick={() => setShowDossierModal(true)}
              className="w-full py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl mb-3 hover:bg-gray-800 transition"
            >
              View Pet Dossier
            </button>
            <a href={`tel:${isSitter ? booking.ownerId.phone : booking.sitterId.phone}`} className="flex items-center justify-center gap-2 w-full py-2.5 bg-rose-50 text-rose-700 text-sm font-bold rounded-xl hover:bg-rose-100 transition">
              <PhoneCall className="w-4 h-4" /> Call {isSitter ? 'Owner' : 'Sitter'}
            </a>

            {booking.specialInstructions && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl text-left">
                <h4 className="font-bold text-amber-900 text-sm mb-1">Care Notes</h4>
                <p className="text-sm text-amber-800 break-words">{booking.specialInstructions}</p>
              </div>
            )}
          </div>

          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-sm bg-rose-50/30">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <HeartPulse className="w-5 h-5 text-rose-600" /> Emergency Contact
            </h3>
            <p className="text-sm text-gray-800 font-medium">{booking.petId.medicalCard?.emergencyVet?.clinicName || 'Not specified'}</p>
            <p className="text-xs text-gray-500 mt-1">{booking.petId.medicalCard?.emergencyVet?.phone || 'No phone provided'}</p>
          </div>
        </div>

        {/* Right Column: Daily Command Hub */}
        <div className="lg:col-span-2">

          {booking.status === 'COMPLETED' && !isSitter && !booking.isReviewedByOwner && (
            <ReviewModal
              booking={booking}
              currentUser={currentUser}
              onReviewSubmitted={handleReviewSubmitted}
            />
          )}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">

            {/* Day Selector Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
              <div className="flex gap-2">
                {booking.dailyLogs.map((log, idx) => (
                  <button
                    key={log._id}
                    onClick={() => setActiveDayIndex(idx)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${activeDayIndex === idx ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    Day {idx + 1}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500 mb-1">Daily Progress</div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
            </div>

            {/*Tasks*/}
            {['FOOD', 'MEDICATION', 'WALK', 'SLEEP'].map((category) => {
              const tasks = getTasksByCategory(category);
              if (tasks.length === 0) return null;

              return (
                <div key={category} className="mb-8 last:mb-0">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    {renderTaskIcon(category)} {category} PROTOCOL
                  </h3>

                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task._id} className={`p-4 rounded-xl border flex items-start justify-between transition ${task.isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-300 shadow-sm'}`}>
                        <div className="flex items-start gap-3">
                          {isSitter && !task.isCompleted ? (
                            <button onClick={() => handleMarkComplete(task._id)} className="mt-0.5 text-gray-300 hover:text-emerald-500 transition">
                              <Circle className="w-5 h-5" />
                            </button>
                          ) : (
                            <div className={`mt-0.5 ${task.isCompleted ? 'text-emerald-500' : 'text-gray-300'}`}>
                              {task.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                            </div>
                          )}
                          <div>
                            <p className={`text-sm font-bold ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{task.taskName}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Scheduled: {task.targetTime}
                            </p>

                            {/* Not using this logic for now */}
                            {task.isCompleted && task.completedAt && (
                              <div className="mt-2 text-[11px] font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md inline-block">
                                Logged at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {task.details?.walkDurationMinutes ? ` • Walked ${task.details.walkDurationMinutes} min` : ''}
                                {task.details?.bathroomStats?.pee ? ` • Pee: Yes` : ''}
                                {task.details?.bathroomStats?.poop ? ` • Poop: Yes` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {/* End Service  (Owner Only) */}
            {!isSitter && (booking.status === 'IN_PROGRESS' || booking.status === 'CONFIRMED') && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <button
                  onClick={handleEndService}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex justify-center items-center gap-2"
                >
                  <Power className="w-5 h-5" /> Mark Booking as Completed
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dossier */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">{booking.petId.name}'s Full Dossier</h2>
              <button onClick={() => setShowDossierModal(false)} className="text-gray-500 hover:text-gray-900 font-bold bg-gray-100 px-3 py-1 rounded-full text-sm">Close</button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div><span className="font-bold text-gray-700">Breed:</span> {booking.petId.breed || 'N/A'}</div>
                <div><span className="font-bold text-gray-700">Age:</span> {booking.petId.age || 'N/A'} yrs</div>
                <div><span className="font-bold text-gray-700">Weight:</span> {booking.petId.weightKg || 'N/A'} kg</div>
                <div><span className="font-bold text-gray-700">Microchip:</span> {booking.petId.microchipId || 'N/A'}</div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2"><Utensils className="w-4 h-4" /> Diet Protocol</h3>
                <div className="bg-indigo-50 p-4 rounded-xl text-sm space-y-2 border border-indigo-100">
                  <p><span className="font-bold">Food Brand:</span> {booking.petId.dietCard?.foodSpecifications || 'N/A'}</p>
                  <p><span className="font-bold">Portion Size:</span> {booking.petId.dietCard?.portionSize || 'N/A'}</p>
                  <p><span className="font-bold text-rose-600">Restrictions:</span> <span className="text-rose-700">{booking.petId.dietCard?.allergies?.length ? booking.petId.dietCard.allergies.join(', ') : 'N/A'}</span></p>
                  <p><span className="font-bold">Treat Limits:</span> {booking.petId.dietCard?.treatLimits || 'N/A'}</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-bold text-rose-900 mb-3 flex items-center gap-2"><Pill className="w-4 h-4" /> Medical Protocol</h3>
                <div className="bg-rose-50 p-4 rounded-xl text-sm space-y-2 border border-rose-100">
                  <p><span className="font-bold">Behavioural Trigger:</span> {booking.petId.medicalCard?.behavioralTriggers?.length ? booking.petId.medicalCard.behavioralTriggers.join(', ') : 'N/A'}</p>
                  <p><span className="font-bold">Chronic Conditions:</span> {booking.petId.medicalCard?.chronicConditions?.length ? booking.petId.medicalCard.chronicConditions.join(', ') : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};