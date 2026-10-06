import React, { useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { FilterBar } from '../components/discovery/FilterBar';
import { SitterCard } from '../components/discovery/SitterCard';
import { ArrowUpDown, AlertCircle, Loader2 } from 'lucide-react';

export const Explore = () => {
  // Default fallback coordinates: Ahmedabad [lng: 72.5714, lat: 23.0225]
  const [coords, setCoords] = useState({ lng: 72.5714, lat: 23.0225 });
  const [isLocating, setIsLocating] = useState(false);
  const [sitters, setSitters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    radius: 15,
    minRating: 0,
    certifications: [],
    startDate: '',
    endDate: '',
    sortBy: 'distance',
  });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lng: position.coords.longitude,
          lat: position.coords.latitude,
        });
        setIsLocating(false);
      },
      (err) => {
        console.warn(`Geolocation error (${err.code}): ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const fetchSitters = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        lng: coords.lng,
        lat: coords.lat,
        radius: filters.radius,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
      };

      if (filters.certifications.length > 0) {
        params.certifications = filters.certifications.join(',');
      }
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axiosClient.get('/sitters', { params });
      setSitters(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to discover sitters in this area');
    } finally {
      setLoading(false);
    }
  }, [coords, filters]);

  useEffect(() => {
    fetchSitters();
  }, [fetchSitters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Find Trusted Pet Sitters
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing sitters calculated from coordinates [{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}]
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            value={filters.sortBy}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="distance">Sort by: Closest First</option>
            <option value="rating">Sort by: Highest Rating</option>
            <option value="price_asc">Sort by: Price (Low to High)</option>
            <option value="price_desc">Sort by: Price (High to Low)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <FilterBar
            filters={filters}
            setFilters={setFilters}
            onDetectLocation={detectLocation}
            isLocating={isLocating}
          />
        </div>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
              <p className="text-sm">Calculating proximity metrics...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          ) : sitters.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
              <h3 className="text-base font-bold text-gray-900">No sitters found</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                No active pet sitters match your criteria within {filters.radius} km. Try expanding your search radius or clearing specific filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sitters.map((sitter) => (
                <SitterCard key={sitter._id} sitter={sitter} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};