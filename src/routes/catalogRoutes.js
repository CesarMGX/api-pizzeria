import express from 'express';
import {
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from '../controllers/catalogController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas para Tamaños (Sizes)
router.route('/sizes')
  .get(getSizes)
  .post(protect, createSize);

router.route('/sizes/:id')
  .put(protect, updateSize)
  .delete(protect, deleteSize);

// Rutas para Ingredientes
router.route('/ingredients')
  .get(getIngredients)
  .post(protect, createIngredient);

router.route('/ingredients/:id')
  .put(protect, updateIngredient)
  .delete(protect, deleteIngredient);

export default router;
