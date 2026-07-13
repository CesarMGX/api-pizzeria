import Promo from '../models/Promo.js';
import Pizza from '../models/Pizza.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       required:
 *         - id
 *         - nombre
 *         - precio
 *         - pizzaBaseId
 *       properties:
 *         id:
 *           type: string
 *           description: ID único de la promoción (ej. combo-pareja)
 *           example: combo-pareja
 *         nombre:
 *           type: string
 *           description: Nombre único de la promoción
 *           example: Combo Pareja
 *         descripcion:
 *           type: string
 *           description: Descripción de la promoción
 *           example: 1 Pizza Mediana de Pepperoni + 2 Refrescos.
 *         precio:
 *           type: number
 *           format: double
 *           description: Precio de la promoción
 *           example: 199.0
 *         imagen:
 *           type: string
 *           description: URL de la imagen promocional
 *           example: https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80
 *         badge:
 *           type: string
 *           description: Etiqueta de la promoción (ej. Popular, Más Vendido)
 *           example: Popular
 *         pizzaBaseId:
 *           type: string
 *           description: ID de la pizza base asociada
 *           example: pizza-pepperoni
 */

/**
 * @swagger
 * /api/promos:
 *   get:
 *     summary: Obtener todas las promociones
 *     tags: [Promociones]
 *     responses:
 *       200:
 *         description: Lista de promociones registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promo'
 *       500:
 *         description: Error en el servidor
 */
export const getPromos = async (req, res) => {
  try {
    const promos = await Promo.findAll({
      include: [{ model: Pizza, as: 'pizzaBase' }]
    });
    res.json(promos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las promociones', error: error.message });
  }
};

/**
 * @swagger
 * /api/promos/{id}:
 *   get:
 *     summary: Obtener una promoción por su ID
 *     tags: [Promociones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *         example: combo-pareja
 *     responses:
 *       200:
 *         description: Datos de la promoción
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const getPromoById = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id, {
      include: [{ model: Pizza, as: 'pizzaBase' }]
    });
    if (promo) {
      res.json(promo);
    } else {
      res.status(404).json({ message: 'Promoción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la promoción', error: error.message });
  }
};

/**
 * @swagger
 * /api/promos:
 *   post:
 *     summary: Crear una nueva promoción
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - nombre
 *               - precio
 *               - pizzaBaseId
 *             properties:
 *               id:
 *                 type: string
 *                 example: mega-familiar
 *               nombre:
 *                 type: string
 *                 example: Mega Familiar
 *               descripcion:
 *                 type: string
 *                 example: 1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento.
 *               precio:
 *                 type: number
 *                 example: 329
 *               imagen:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80
 *               badge:
 *                 type: string
 *                 example: Más Vendido
 *               pizzaBaseId:
 *                 type: string
 *                 example: pizza-hawaiana
 *     responses:
 *       201:
 *         description: Promoción creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       400:
 *         description: Datos inválidos o promoción ya existente
 *       401:
 *         description: No autorizado
 */
export const createPromo = async (req, res) => {
  try {
    const { id, nombre, descripcion, precio, imagen, badge, pizzaBaseId } = req.body;

    const promoExiste = await Promo.findOne({ where: { nombre } });
    if (promoExiste) {
      return res.status(400).json({ message: 'Ya existe una promoción con este nombre' });
    }

    const pizza = await Pizza.findByPk(pizzaBaseId);
    if (!pizza) {
      return res.status(400).json({ message: 'La pizza base especificada no existe' });
    }

    const promo = await Promo.create({ id, nombre, descripcion, precio, imagen, badge, pizzaBaseId });
    res.status(201).json(promo);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear la promoción', error: error.message });
  }
};

/**
 * @swagger
 * /api/promos/{id}:
 *   put:
 *     summary: Actualizar una promoción existente
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *         example: combo-pareja
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Combo Pareja Premium
 *               descripcion:
 *                 type: string
 *                 example: 1 Pizza Mediana de Pepperoni + 2 Refrescos Grandes.
 *               precio:
 *                 type: number
 *                 example: 220
 *               imagen:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80
 *               badge:
 *                 type: string
 *                 example: Recomendado
 *               pizzaBaseId:
 *                 type: string
 *                 example: pizza-pepperoni
 *     responses:
 *       200:
 *         description: Promoción actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       400:
 *         description: Datos inválidos o error al actualizar
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Promoción no encontrada
 */
export const updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promoción no encontrada' });
    }

    if (req.body.pizzaBaseId) {
      const pizza = await Pizza.findByPk(req.body.pizzaBaseId);
      if (!pizza) {
        return res.status(400).json({ message: 'La pizza base especificada no existe' });
      }
    }

    promo.nombre = req.body.nombre || promo.nombre;
    promo.descripcion = req.body.descripcion || promo.descripcion;
    promo.precio = req.body.precio !== undefined ? req.body.precio : promo.precio;
    promo.imagen = req.body.imagen || promo.imagen;
    promo.badge = req.body.badge || promo.badge;
    promo.pizzaBaseId = req.body.pizzaBaseId || promo.pizzaBaseId;

    const promoActualizada = await promo.save();
    res.json(promoActualizada);
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la promoción', error: error.message });
  }
};

/**
 * @swagger
 * /api/promos/{id}:
 *   delete:
 *     summary: Eliminar una promoción por ID
 *     tags: [Promociones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la promoción
 *         example: combo-pareja
 *     responses:
 *       200:
 *         description: Promoción eliminada correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Promoción no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const deletePromo = async (req, res) => {
  try {
    const deletedCount = await Promo.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Promoción eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Promoción no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la promoción', error: error.message });
  }
};
