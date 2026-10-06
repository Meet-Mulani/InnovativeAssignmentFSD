import express from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  updateCareTask,
} from '../controllers/bookingController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorizeRoles('OWNER'), createBooking);
router.get('/', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/tasks/:taskId', authorizeRoles('SITTER'), updateCareTask);

export default router;