import Order from '../models/Order.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único de la orden
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         orderNumber:
 *           type: string
 *           description: Número de orden consecutivo formateado (ej. #0001)
 *           example: "#0001"
 *         items:
 *           type: array
 *           items:
 *             type: object
 *           description: Array conteniendo los items del carrito comprados
 *           example: [{"id": "pepperoni-a1b", "nombre": "Pepperoni", "cantidad": 1, "tamano": "Grande", "precioTotal": 199}]
 *         total:
 *           type: number
 *           format: double
 *           description: Monto total de la orden
 *           example: 199
 *         status:
 *           type: string
 *           enum: [Pendiente, Preparando, Listo, Entregado]
 *           description: Estado actual de la orden
 *           example: Pendiente
 *         paymentStatus:
 *           type: string
 *           description: Estado del pago
 *           example: approved
 *         paymentId:
 *           type: string
 *           description: ID del pago generado por la pasarela de pagos
 *           example: "2348574920"
 *         preferenceId:
 *           type: string
 *           description: ID de preferencia de MercadoPago si aplica
 *           example: "123456789-preference-id-abc"
 *         time:
 *           type: string
 *           description: Hora en la que se generó la orden (ej. 05:30 PM)
 *           example: "05:30 PM"
 *         timestamp:
 *           type: number
 *           description: Marca de tiempo en milisegundos
 *           example: 1783576546000
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Obtener todas las órdenes
 *     tags: [Órdenes]
 *     responses:
 *       200:
 *         description: Lista de todas las órdenes ordenadas por fecha descendente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       500:
 *         description: Error en el servidor
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      order: [['timestamp', 'DESC']],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las órdenes', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener una orden por su ID
 *     tags: [Órdenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la orden (UUID)
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Datos de la orden solicitada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la orden', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear una nueva orden
 *     tags: [Órdenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - total
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                 example: [{"id": "pepperoni-a1b", "nombre": "Pepperoni", "cantidad": 2, "precioUnitario": 199, "masa": "Tradicional", "salsa": "Salsa de Tomate", "queso": "Mozzarella", "extras": ["Champiñones"]}]
 *               total:
 *                 type: number
 *                 example: 398
 *               metodoPago:
 *                 type: string
 *                 enum: [Efectivo, MercadoPago]
 *                 example: Efectivo
 *               nombreCliente:
 *                 type: string
 *                 example: adán de Jesús
 *               emailCliente:
 *                 type: string
 *                 format: email
 *                 example: test_user@testuser.com
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos incorrectos o faltantes
 */
export const createOrder = async (req, res) => {
  try {
    const { items, total, metodoPago, nombreCliente, emailCliente } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'La orden debe contener al menos un producto' });
    }

    // Generación de número de orden consecutivo
    const count = await Order.count();
    const orderNumber = '#' + String(count + 1).padStart(4, '0');

    // Hora formateada
    const now = new Date();
    const options = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };
    const time = now.toLocaleTimeString('es-ES', options);

    const order = await Order.create({
      orderNumber,
      items,
      total,
      time,
      status: 'Pendiente',
      paymentStatus: 'pending',
      metodoPago: metodoPago || 'Efectivo',
      nombreCliente: nombreCliente || null,
      emailCliente: emailCliente || null,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la orden', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Actualizar el estado de una orden
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Preparando, Listo, Entregado]
 *                 example: Preparando
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Estado no válido o error de datos
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pendiente', 'Preparando', 'Listo', 'Entregado'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado de orden no válido' });
    }

    const order = await Order.findByPk(req.params.id);

    if (order) {
      order.status = status;
      const orderActualizada = await order.save();
      res.json(orderActualizada);
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el estado de la orden', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders/{id}:
 *   put:
 *     summary: Actualizar una orden por completo
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Pendiente, Preparando, Listo, Entregado]
 *                 example: Preparando
 *               paymentStatus:
 *                 type: string
 *                 example: approved
 *               metodoPago:
 *                 type: string
 *                 enum: [Efectivo, MercadoPago]
 *                 example: MercadoPago
 *               nombreCliente:
 *                 type: string
 *                 example: adán de Jesús
 *               emailCliente:
 *                 type: string
 *                 format: email
 *                 example: test_user@testuser.com
 *     responses:
 *       200:
 *         description: Orden actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 */
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    order.status = req.body.status || order.status;
    order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
    order.metodoPago = req.body.metodoPago || order.metodoPago;
    order.nombreCliente = req.body.nombreCliente || order.nombreCliente;
    order.emailCliente = req.body.emailCliente || order.emailCliente;
    
    if (req.body.total !== undefined) {
      order.total = req.body.total;
    }
    if (req.body.items) {
      order.items = req.body.items;
    }

    const orderActualizada = await order.save();
    res.json(orderActualizada);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la orden', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders/{id}/comprobante:
 *   get:
 *     summary: Obtener los datos formateados del comprobante/ticket de pago
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *         example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: Datos estructurados del comprobante para visualización
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fecha:
 *                   type: string
 *                   example: "Lunes, 13 de julio 2026, 15:44:25"
 *                 total:
 *                   type: number
 *                   example: 253.00
 *                 titulo:
 *                   type: string
 *                   example: "Pizza Pizza Vegetariana - Familiar (Extras: Champiñones, Cebolla)"
 *                 formaPago:
 *                   type: string
 *                   example: "Dinero en mi cuenta de MercadoPago"
 *                 transaccion:
 *                   type: string
 *                   example: "168656938630"
 *                 cliente:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Test Test"
 *                     email:
 *                       type: string
 *                       example: "test_user_7841552200297713870@testuser.com"
 *                 qrData:
 *                   type: string
 *                   example: "https://api-pizzeria-production.up.railway.app/api/orders/550e8400-e29b-41d4-a716-446655440000"
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const getOrderComprobante = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }

    // Formatear fecha
    const d = new Date(Number(order.timestamp) || Date.now());
    const formatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
    let fecha = d.toLocaleDateString('es-ES', formatOptions);
    fecha = fecha.charAt(0).toUpperCase() + fecha.slice(1);

    // Formatear título
    let titulo = '';
    if (order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      const pizzaNombre = firstItem.pizza?.nombre || firstItem.nombre || 'Personalizada';
      const sizeNombre = firstItem.size?.nombre || firstItem.tamano || 'Familiar';
      
      let extrasText = '';
      if (firstItem.extras && firstItem.extras.length > 0) {
        const names = firstItem.extras.map(e => typeof e === 'object' ? (e.nombre || e) : e);
        extrasText = ` (Extras: ${names.join(', ')})`;
      }
      
      titulo = `Pizza ${pizzaNombre} - ${sizeNombre}${extrasText}`;
      if (order.items.length > 1) {
        titulo += ` (+ ${order.items.length - 1} producto(s) más)`;
      }
    } else {
      titulo = 'Compra en Planet Pizza';
    }

    // Forma de Pago
    const formaPago = order.metodoPago === 'MercadoPago'
      ? 'Dinero en mi cuenta de MercadoPago'
      : 'Pago en Caja (Efectivo)';

    // Transacción
    const transaccion = order.paymentId || order.orderNumber;

    // Cliente
    const cliente = {
      nombre: order.nombreCliente || 'Test Test',
      email: order.emailCliente || 'test_user_7841552200297713870@testuser.com'
    };

    // QR Data
    const qrData = `https://api-pizzeria-production.up.railway.app/api/orders/${order.id}`;

    res.json({
      fecha,
      total: order.total,
      titulo,
      formaPago,
      transaccion,
      cliente,
      qrData
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al generar el comprobante', error: error.message });
  }
};

/**
 * @swagger

 * /api/orders/{id}:
 *   delete:
 *     summary: Cancelar y eliminar una orden por ID
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Orden no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const deleteOrder = async (req, res) => {
  try {
    const deletedCount = await Order.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Orden eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Orden no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la orden', error: error.message });
  }
};

/**
 * @swagger
 * /api/orders/clear:
 *   post:
 *     summary: Eliminar/limpiar todas las órdenes registradas
 *     tags: [Órdenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todas las órdenes fueron eliminadas
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
export const clearAllOrders = async (req, res) => {
  try {
    await Order.destroy({ where: {} });
    res.json({ message: 'Todas las órdenes fueron eliminadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al limpiar las órdenes', error: error.message });
  }
};
