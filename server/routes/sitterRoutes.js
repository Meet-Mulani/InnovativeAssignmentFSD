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

const router = express.Router();

// Public
router.get('/', getNearbySitters);

// Sitter management  
router.get('/profile/me', protect, authorizeRoles('SITTER'), getMySitterProfile);
router.put('/profile', protect, authorizeRoles('SITTER'), updateSitterProfile);
router.get('/availability/me', protect, authorizeRoles('SITTER'), getMyAvailability);
router.put('/availability', protect, authorizeRoles('SITTER'), updateMyAvailability);

//not using certificates feature for now
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
router.get('/:id', getSitterById); //: is used for dynamic params

export default router;