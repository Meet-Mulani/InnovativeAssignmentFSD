import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { FileText, Save, ArrowLeft, HeartPulse, Utensils, AlertTriangle } from 'lucide-react';

export const PetDossier = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await axiosClient.get(`/pets/${id}`);
        setPet(res.data.data);
      } catch (error) {
        alert('Could not load dossier');
      }
    };
    fetchPet();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axiosClient.put(`/pets/${id}`, {
        dietCard: pet.dietCard,
        medicalCard: pet.medicalCard,
      });
      navigate('/my-pets');
    } catch (error) {
      alert('Failed to save dossier');
    } finally {
      setIsSaving(false);
    }
  };

  const updateDiet = (field, value) => setPet({ ...pet, dietCard: { ...pet.dietCard, [field]: value } });
  const updateMed = (field, value) => setPet({ ...pet, medicalCard: { ...pet.medicalCard, [field]: value } });
  const updateVet = (field, value) => setPet({ ...pet, medicalCard: { ...pet.medicalCard, emergencyVet: { ...pet.medicalCard.emergencyVet, [field]: value } } });

  if (!pet) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/my-pets')} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{pet.name}'s Care Dossier</h1>
            <p className="text-sm text-gray-500">Configure instructions for sitters.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-sm transition"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Dossier'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diet Card Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <Utensils className="w-5 h-5 text-emerald-600" />
            Structured Diet Card
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Feeding Schedule (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. 08:00 AM, 07:00 PM"
                value={(pet.dietCard?.feedingSchedule || []).join(', ')}
                onChange={(e) => updateDiet('feedingSchedule', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Portion Size</label>
                <input
                  type="text"
                  placeholder="e.g. 1.5 cups"
                  value={pet.dietCard?.portionSize || ''}
                  onChange={(e) => updateDiet('portionSize', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Food Brand / Specs</label>
                <input
                  type="text"
                  placeholder="e.g. Purina Pro Plan (Dry)"
                  value={pet.dietCard?.foodSpecifications || ''}
                  onChange={(e) => updateDiet('foodSpecifications', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-red-600 mb-1">Allergies / Restrictions (Comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Chicken, Grain"
                value={(pet.dietCard?.allergies || []).join(', ')}
                onChange={(e) => updateDiet('allergies', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-red-200 bg-red-50 focus:border-red-500 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Treat Limits</label>
              <input
                type="text"
                placeholder="e.g. Max 2 dental sticks per day"
                value={pet.dietCard?.treatLimits || ''}
                onChange={(e) => updateDiet('treatLimits', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Medical Card Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
            <HeartPulse className="w-5 h-5 text-rose-600" />
            Structured Medical Card
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-rose-600 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Behavioral Triggers (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Thunderstorms, Leash Reactive to large dogs"
                value={(pet.medicalCard?.behavioralTriggers || []).join(', ')}
                onChange={(e) => updateMed('behavioralTriggers', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-rose-200 bg-rose-50 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Chronic Conditions</label>
              <input
                type="text"
                placeholder="e.g. Hip Dysplasia"
                value={(pet.medicalCard?.chronicConditions || []).join(', ')}
                onChange={(e) => updateMed('chronicConditions', e.target.value.split(',').map(s => s.trim()))}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
            
            <hr className="my-4 border-gray-100" />
            <h3 className="text-sm font-bold text-gray-900 mb-3">Emergency Veterinary Clinic</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Clinic Name</label>
                <input
                  type="text"
                  value={pet.medicalCard?.emergencyVet?.clinicName || ''}
                  onChange={(e) => updateVet('clinicName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={pet.medicalCard?.emergencyVet?.vetName || ''}
                  onChange={(e) => updateVet('vetName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Clinic Phone Number</label>
              <input
                type="text"
                value={pet.medicalCard?.emergencyVet?.phone || ''}
                onChange={(e) => updateVet('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};