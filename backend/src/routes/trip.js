import express from 'express';
import { createTrip, getTrips, updateTripStatus } from '../controllers/trip.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', createTrip);
router.get('/', getTrips);
router.patch('/:id', updateTripStatus);

export default router;
