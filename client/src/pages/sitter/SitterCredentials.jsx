import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Upload, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SitterCredentials = () => {
  const [formData, setFormData] = useState({ certType: 'CPPS', certificateId: '', issueDate: '', documentUrl: '' });
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentUrl) return alert('Please provide a certificate link');
    setUploading(true);
    try {
      await axiosClient.post('/sitters/certificates', formData);
      alert('Certificate uploaded and verified successfully!');
      setFormData({ certType: 'CPPS', certificateId: '', issueDate: '', documentUrl: '' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload certificate');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-6">
        <Link to="/sitter/dashboard" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </Link>
        <h1 className="text-2xl font-black text-gray-900">Upload Certifications</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Certification Body</label>
          <select value={formData.certType} onChange={e => setFormData({...formData, certType: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm">
            <option value="CPPS">Certified Professional Pet Sitter (CPPS)</option>
            <option value="Cat & Dog First Aid">Cat & Dog First Aid</option>
            <option value="IPPC">IPPC (Indian Pet Care)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Certificate ID</label>
          <input required type="text" value={formData.certificateId} onChange={e => setFormData({...formData, certificateId: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Issue Date</label>
          <input required type="date" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Certificate Link</label>
          <input 
            type="url" 
            required 
            placeholder="https://example.com/certificate.pdf"
            value={formData.documentUrl} 
            onChange={e => setFormData({...formData, documentUrl: e.target.value})} 
            className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" 
          />
        </div>
        
        <button type="submit" disabled={uploading} className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-4">
          {uploading ? 'Adding...' : 'Add Certificate'}
        </button>
      </form>
    </div>
  );
};
