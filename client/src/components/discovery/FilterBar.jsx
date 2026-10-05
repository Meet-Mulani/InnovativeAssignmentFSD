import React from 'react';
import { SlidersHorizontal, MapPin, CheckCircle, ShieldCheck } from 'lucide-react';

const CERT_OPTIONS = [
  'Cat & Dog First Aid',
  'CPPS',
  'IPPC',
];

export const FilterBar = ({ filters, setFilters, onDetectLocation, isLocating }) => {
  const handleCertToggle = (cert) => {
    const active = filters.certifications.includes(cert);
    const updated = active
      ? filters.certifications.filter((c) => c !== cert)
      : [...filters.certifications, cert];
    setFilters({ ...filters, certifications: updated });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Discovery Filters</h2>
        </div>
        <button
          type="button"
          onClick={onDetectLocation}
          disabled={isLocating}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50"
        >
          <MapPin className="w-4 h-4 text-indigo-600" />
          {isLocating ? 'Detecting Coordinates...' : 'Use Current Location'}
        </button>
      </div>

      <div>
        <div className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2">
          <span>Search Radius</span>
          <span className="text-indigo-600 font-semibold">{filters.radius} km</span>
        </div>
        <input
          type="range"
          min="1"
          max="50"
          value={filters.radius}
          onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>1 km</span>
          <span>25 km</span>
          <span>50 km</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Minimum Rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
          className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        >
          <option value="0">All Ratings</option>
          <option value="3.5">3.5+ Stars</option>
          <option value="4.0">4.0+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">Accredited Certifications</label>
        <div className="flex flex-wrap gap-1.5">
          {CERT_OPTIONS.map((cert) => {
            const isSelected = filters.certifications.includes(cert);
            return (
              <button
                key={cert}
                type="button"
                onClick={() => handleCertToggle(cert)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {isSelected && <CheckCircle className="w-3 h-3" />}
                {cert}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};