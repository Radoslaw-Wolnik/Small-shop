import express from 'express';
import { authenticateJWT } from '../middleware/auth.middleware';
import {
  createAddress,
  updateAddress,
  deleteAddress,
  getUserAddresses,
  getAddressById,
  setDefaultAddress
} from '../controllers/address.controller';

const router = express.Router();

// All routes require authentication
router.use(authenticateJWT);

router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.get('/', getUserAddresses);
router.get('/:id', getAddressById);
router.put('/:id/default', setDefaultAddress);

export default router;