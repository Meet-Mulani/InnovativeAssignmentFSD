import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Star, MapPin, Award } from 'lucide-react';

export const SitterCard = ({ sitter }) => {
  const verifiedCerts = (sitter.certifications || []).filter(
    (c) => c.verificationStatus === 'APPROVED'
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-gray-900 text-base">{sitter.user?.name}</h3>
                {sitter.isVerified && (
                  <span title="Identity & Credentials Verified by PawsOut">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {sitter.serviceAddress?.street
                  ? `${sitter.serviceAddress.street}, ${sitter.serviceAddress.city}`
                  : sitter.serviceAddress?.city || 'Local Area'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            {sitter.distanceKm} km away
          </span>
        </div>

        <div className="flex items-center gap-3 mt-4 text-xs">
          <div className="flex items-center text-amber-500 font-semibold gap-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{(sitter.averageRating || 0).toFixed(1)}</span>
          </div>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{sitter.completedStays || 0} stays completed</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500">{sitter.reviewsCount || 0} reviews</span>
        </div>

        {sitter.bio && (
          <p className="mt-3 text-xs text-gray-600 line-clamp-2 leading-relaxed">
            {sitter.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-1">
          {verifiedCerts.slice(0, 3).map((cert) => (
            <span
              key={cert._id || cert.certType}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
            >
              <Award className="w-3 h-3 text-emerald-600" />
              {cert.certType}
            </span>
          ))}
          {verifiedCerts.length > 3 && (
            <span className="text-[10px] text-gray-500 self-center">
              +{verifiedCerts.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-400 block">Day Sitting</span>
          <span className="text-base font-bold text-gray-900">
            ₹{sitter.rates?.daySitting || 500}
            <span className="text-xs font-normal text-gray-500"> /day</span>
          </span>
        </div>

        <Link
          to={`/sitters/${sitter._id}`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition shadow-sm"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};