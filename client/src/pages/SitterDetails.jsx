import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { ShieldCheck, Star, Award, Check, MapPin, Calendar, Clock, Loader2 } from 'lucide-react';

export const SitterDetails = () => {
  const { id } = useParams();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSitter = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`/sitters/${id}`);
        setSitter(res.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not fetch sitter profile');
      } finally {
        setLoading(false);
      }
    };
    fetchSitter();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-900">Profile Error</h2>
        <p className="text-sm text-gray-500 mt-2">{error || 'Sitter profile not found.'}</p>
        <Link to="/explore" className="mt-4 inline-block text-xs font-semibold text-indigo-600 hover:underline">
          Back to Discovery
        </Link>
      </div>
    );
  }

  const approvedCerts = (sitter.certifications || []).filter(
    (c) => c.verificationStatus === 'APPROVED'
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Sitter Header Dossier */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl border-2 border-indigo-200">
            {sitter.userId?.avatarUrl ? (
              <img
                src={sitter.userId.avatarUrl}
                alt={sitter.userId?.name}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              sitter.userId?.name?.charAt(0) || 'S'
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900">{sitter.userId?.name}</h1>
              {sitter.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Verified Sitter
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              {sitter.serviceAddress?.street
                ? `${sitter.serviceAddress.street}, ${sitter.serviceAddress.city}`
                : sitter.serviceAddress?.city || 'City Location'}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center text-amber-500 font-bold gap-1">
                <Star className="w-4 h-4 fill-current" />
                <span>{(sitter.averageRating || 0).toFixed(1)}</span>
              </div>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600 font-medium">{sitter.reviewsCount || 0} reviews</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col items-end gap-3 w-full md:w-auto">
          <div className="text-right">
            <span className="text-xs text-gray-400 block">Daily Boarding Rate</span>
            <span className="text-2xl font-black text-gray-900">₹{sitter.rates?.daySitting || 500}</span>
          </div>
          <Link
            to={`/book/${sitter._id}`}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition text-center shadow-md shadow-indigo-100"
          >
            Request Booking
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          {/* Accredited Certifications */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Accredited Certifications
              </h2>
              <span className="text-xs text-gray-400">
                {approvedCerts.length} Verified Credentials
              </span>
            </div>

            {approvedCerts.length === 0 ? (
              <p className="text-xs text-gray-500">No approved certificates on record.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {approvedCerts.map((cert) => (
                  <div
                    key={cert._id}
                    className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-900">{cert.certType}</span>
                        <Check className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-1">ID: {cert.certificateId}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-3 block">
                      Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    </span>
                    <a
                      href={cert.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 block text-center w-full py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg hover:bg-emerald-200 transition"
                    >
                      View Certificate Link
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Sidebar Schedule & Rates */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Service Rates
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Day Pet Sitting</span>
                <span className="font-bold text-gray-900">₹{sitter.rates?.daySitting || 500} /day</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Dog Walking (45 min)</span>
                <span className="font-bold text-gray-900">₹{sitter.rates?.walking || 200} /session</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Max Concurrent Pets</span>
                <span className="font-bold text-gray-900">{sitter.maxConcurrentPets || 1} pets</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 text-base mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Blackout Dates
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Dates currently blocked or unavailable for new stays:
            </p>
            {(!sitter.blockedDates || sitter.blockedDates.length === 0) ? (
              <span className="text-xs text-emerald-600 font-medium">Open for all upcoming dates</span>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {sitter.blockedDates.map((date) => (
                  <span
                    key={date}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[10px] font-mono"
                  >
                    {new Date(date).toISOString().split('T')[0]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};