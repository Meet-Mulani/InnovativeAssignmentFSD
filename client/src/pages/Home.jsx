import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Search } from 'lucide-react';

export const Home = () => {
  return (
    <div className="bg-gray-50 min-h-[90vh]">
      {/* Hero Section */}
      <section className="bg-indigo-900 text-white py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
            Reliable, Certified Pet Care in Your Neighborhood
          </h1>
          <p className="text-lg md:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto">
            Discover top-rated pet sitters and dog walkers within your custom radius. Track real-time feeding, medication, and walk routines.
          </p>

          {/* Simplified Quick-Search Bar */}
          <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-2 max-w-2xl mx-auto">
            <div className="flex-1 flex items-center px-4 py-3 bg-gray-50 rounded-xl w-full">
              <MapPin className="text-indigo-400 w-5 h-5 mr-3" />
              <input 
                type="text" 
                placeholder="Where do you need a sitter?" 
                className="bg-transparent w-full outline-none text-gray-800 font-medium placeholder-gray-400"
                disabled
                value="Detecting automatically on next step..."
              />
            </div>
            <Link 
              to="/explore" 
              className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <Search className="w-5 h-5" />
              Search
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Certification Banner */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Accredited Sitters Recognized by Leading Animal Care Bodies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 font-semibold text-sm">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500"/> CPPS Certified</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500"/> First Aid Trained</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500"/> IPPC Certified</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500"/> Trusted Community</span>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-gray-900">How PawsOut Works</h2>
          <p className="text-gray-500 mt-2">Complete peace of mind for pet parents.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Set Radius & Criteria</h3>
            <p className="text-gray-500 text-sm">Use our geospatial engine to find sitters precisely within your preferred travel distance.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Review Sitter Profiles</h3>
            <p className="text-gray-500 text-sm">View real client reviews, certifications, and past experience before making a decision.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Hand Over Care</h3>
            <p className="text-gray-500 text-sm">Share your pet's digital medical card and follow updates via the live daily care tracker.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
