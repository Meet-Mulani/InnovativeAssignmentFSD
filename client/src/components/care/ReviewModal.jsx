import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { Star, Loader2, Send } from 'lucide-react'; //pre made icons

export const ReviewModal = ({ booking, currentUser, onReviewSubmitted }) => { //passing of booking details, currentuser and function
  const [loading, setLoading] = useState(false); //loading=false
  const [error, setError] = useState(null); //Error=null

  const targetUserId = booking.sitterId._id;
  const reviewType = 'OWNER_TO_SITTER';

  const [formData, setFormData] = useState({             //initialize formdata
    overallRating: 5,
    comment: 'No written feedback provided.',
    metrics: {}
  });

  //useState helps in re render the component whenever change is detected

  const handleSubmit = async (e) => { //async as request takes time
    e.preventDefault(); // prevents re fresh behaviour of page
    setLoading(true);
    try {
      await axiosClient.post('/reviews', {  //endpoint and sends the following data
        bookingId: booking._id,
        targetUserId,
        reviewType,
        ...formData
      });
      onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarSelector = ({ label, value, onChange }) => ( //re usable UI component
    <div className="flex items-center justify-between py-2"> {/*left-right and vertically center alignment*/}
      <span className="text-sm font-bold text-gray-700">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star} //requirement when rendering list
            type="button"
            onClick={() => onChange(star)} //onChnage sends the no. of star sent
            className={`transition ${star <= value ? 'text-amber-500' : 'text-gray-300'}`} //to highlight rating
          >
            <Star className={`w-6 h-6 ${star <= value ? 'fill-current' : ''}`} />    {/*Renders the stars and uses parent color to fill the empty space with border color*/}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
      <h2 className="text-xl font-black text-gray-900 mb-2">Leave a Review</h2>
      <p className="text-sm text-gray-500 mb-6">
        How did the sitter perform during this booking?
      </p>

      <form onSubmit={handleSubmit} className="space-y-6"> {/*Line 20*/}
        <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100"> {/*background - border - rounded corner - space vertically - border with light gray color */}
          <StarSelector
            label="Overall Rating"
            value={formData.overallRating}
            onChange={val => setFormData({ ...formData, overallRating: val })}
          />
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <button
          type="submit"
          disabled={loading} // make the button unclickable when loading is true
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Review</>}
        </button>
      </form>
    </div>
  );
};
