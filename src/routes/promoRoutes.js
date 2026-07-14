import express from 'express';
import {
  getPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPromos)
  .post(protect, createPromo);

router.route('/:id')
  .get(getPromoById)
  .put(protect, updatePromo)
  .delete(protect, deletePromo);

export default router;
