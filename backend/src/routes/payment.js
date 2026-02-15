import express from 'express';
import { createPreference, webhook } from '../controllers/payment.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create-preference', authenticateToken, createPreference);
router.post('/webhook', webhook);

export default router;
