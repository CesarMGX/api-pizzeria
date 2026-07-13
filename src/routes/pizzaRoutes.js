import express from 'express';
import {
  getPizzas,
  getPizzaById,
  createPizza,
  updatePizza,
  deletePizza,
} from '../controllers/pizzaController.js';
import { parser } from '../config/cloudinary.js';

const router = express.Router();

router.route('/')
  .get(getPizzas)
  .post(parser.single('imagen'), createPizza);

router.route('/:id')
  .get(getPizzaById)
  .put(parser.single('imagen'), updatePizza)
  .delete(deletePizza);

export default router;
