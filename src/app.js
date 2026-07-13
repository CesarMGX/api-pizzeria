import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importar rutas
import pizzaRoutes from './routes/pizzaRoutes.js';
import catalogRoutes from './routes/catalogRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authRoutes from './routes/authRoutes.js';
import promoRoutes from './routes/promoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { protect } from './middlewares/authMiddleware.js';


// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta base de prueba
app.get('/', (req, res) => {
  res.send('API de Planet Pizza activa y corriendo...');
});
// Rutas de la API

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/pizzas', protect, pizzaRoutes);
app.use('/api/catalog', protect, catalogRoutes);
app.use('/api/orders', protect, orderRoutes);
app.use('/api/promos', protect, promoRoutes);
app.use('/api/users', protect, userRoutes);
app.use('/api/upload', protect, uploadRoutes);
app.use('/api/payments', protect, paymentRoutes);

// Middleware para rutas no encontradas (404)
app.use((req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

export default app;
