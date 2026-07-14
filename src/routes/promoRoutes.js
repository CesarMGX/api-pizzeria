import express from 'express';
import {
  getPromos,
  getPromoById,
  createPromo,
  updatePromo,
  deletePromo,
} from '../controllers/promoController.js';

const router = express.Router();

router.route('/')
  .get(getPromos)
  .post(createPromo);

router.route('/:id')
  .get(getPromoById)
  .put(updatePromo)
  .delete(deletePromo);

export default router;
