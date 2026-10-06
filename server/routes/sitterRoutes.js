import express from 'express';
import {
  getNearbySitters,
  getSitterById,
  getMySitterProfile,
  updateSitterProfile,
  getMyAvailability,
  updateMyAvailability,
  uploadCertificate,
  deleteCertificate,
} from '../controllers/sitterController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public Discovery Endpoints
router.get('/', getNearbySitters);

// Sitter Self Management (Protected)
router.get('/profile/me', protect, authorizeRoles('SITTER'), getMySitterProfile);
router.put('/profile', protect, authorizeRoles('SITTER'), updateSitterProfile);
router.get('/availability/me', protect, authorizeRoles('SITTER'), getMyAvailability);
router.put('/availability', protect, authorizeRoles('SITTER'), updateMyAvailability);

// Certificate Upload & Deletion (Protected)
router.post(
  '/certificates',
  protect,
  authorizeRoles('SITTER'),
  uploadCertificate
);
router.delete(
  '/certificates/:certId',
  protect,
  authorizeRoles('SITTER'),
  deleteCertificate
);

// Public Sitter Detail Dossier
router.get('/:id', getSitterById);

export default router;