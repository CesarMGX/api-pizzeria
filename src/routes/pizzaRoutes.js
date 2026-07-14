import express from 'express';
import {
  getPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} from '../controllers/pizzaController.js';
import { parser } from '../config/cloudinary.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getPizzas)
  .post(protect, parser.single('imagen'), createPizza);

router.route('/:id')
  .get(getPizzaById)
  .put(protect, parser.single('imagen'), updatePizza)
  .delete(protect, deletePizza);

export default router;
