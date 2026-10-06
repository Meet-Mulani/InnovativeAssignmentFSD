import express from 'express';
import {
  createPet,
  getMyPets,
  getPetById,
  updatePetDossier
} from '../controllers/petController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect, authorizeRoles('OWNER'));

router.post('/', createPet);
router.get('/me', getMyPets);
router.get('/:id', getPetById);
router.put('/:id', updatePetDossier);

export default router;