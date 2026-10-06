import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { Plus, Activity, FileText, AlertCircle, Loader2 } from 'lucide-react';

export const MyPets = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '', species: 'Dog', breed: '', age: '', weightKg: '', microchipId: ''
  });

  const fetchPets = async () => {
    try {
      const res = await axiosClient.get('/pets/me');
      setPets(res.data.data);
    } catch (error) {
      console.error('Failed to fetch pets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const handleCreatePet = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/pets', newPet);
      setIsModalOpen(false);
      setNewPet({ name: '', species: 'Dog', breed: '', age: '', weightKg: '', microchipId: '' });
      fetchPets();
    } catch (error) {
      alert('Failed to add pet');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">My Pets</h1>
          <p className="text-sm text-gray-500 mt-1">Manage digital care dossiers for your animals.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition"
        >
          <Plus className="w-4 h-4" /> Add New Pet
        </button>
      </div>

      {pets.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No Pets Registered</h3>
          <p className="text-sm text-gray-500 mt-2">Add your first pet to start building their medical and diet dossier.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <div key={pet._id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900">{pet.name}</h3>
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                    {pet.species}
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-xs text-gray-600"><span className="font-semibold">Breed:</span> {pet.breed}</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Age:</span> {pet.age} years</p>
                  <p className="text-xs text-gray-600"><span className="font-semibold">Weight:</span> {pet.weightKg} kg</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                <Link
                  to={`/my-pets/${pet._id}`}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition"
                >
                  <Activity className="w-3.5 h-3.5" /> Edit Dossier
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Pet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Register New Pet</h2>
            <form onSubmit={handleCreatePet} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                <input required type="text" value={newPet.name} onChange={(e) => setNewPet({...newPet, name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Species</label>
                  <select value={newPet.species} onChange={(e) => setNewPet({...newPet, species: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm bg-white">
                    <option value="Dog">Dog</option>
                    <option value="Cat">Cat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Breed</label>
                  <input required type="text" value={newPet.breed} onChange={(e) => setNewPet({...newPet, breed: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Age (Years)</label>
                  <input required type="number" value={newPet.age} onChange={(e) => setNewPet({...newPet, age: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Weight (kg)</label>
                  <input required type="number" step="0.1" value={newPet.weightKg} onChange={(e) => setNewPet({...newPet, weightKg: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl">Save Pet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};