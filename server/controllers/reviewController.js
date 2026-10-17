import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { SitterProfile } from '../models/SitterProfile.js';

// POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { bookingId, targetUserId, overallRating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'COMPLETED') { // not required as we have frontend validation
      return res.status(400).json({ success: false, message: 'Reviews only allowed for completed stays' });
    }

    const review = await Review.create({
      bookingId,
      reviewerId: req.user._id,
      targetUserId,
      comment,
      overallRating: Number(overallRating)
    });


    booking.isReviewedByOwner = true; // this is for frontend to know if the review is already given
    await booking.save();

    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/
    const sitterProfile = await SitterProfile.findOne({ userId: targetUserId });
    if (sitterProfile) {
      const stats = await Review.aggregate([
        { $match: { targetUserId: sitterProfile.userId, isSuppressed: false } }, // extra feature to ignore abusive comments 
        { $group: { _id: '$targetUserId', avgRating: { $avg: '$overallRating' }, count: { $sum: 1 } } }
      ]);

      if (stats.length > 0) {
        sitterProfile.averageRating = stats[0].avgRating;
        sitterProfile.reviewsCount = stats[0].count;
        await sitterProfile.save();
      }
    }

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};