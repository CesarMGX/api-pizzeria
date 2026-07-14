import express from 'express';
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  clearAllOrders,
  getOrderComprobante,
} from '../controllers/orderController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getOrders)
  .post(createOrder);

router.route('/clear')
  .post(protect, clearAllOrders);

router.route('/:id')
  .get(getOrderById)
  .put(protect, updateOrder)
  .delete(protect, deleteOrder);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

router.route('/:id/comprobante')
  .get(getOrderComprobante);

export default router;
