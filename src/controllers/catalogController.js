import Size from '../models/Size.js';
import Ingredient from '../models/Ingredient.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Size:
 *       type: object
 *       required:
 *         - nombre
 *         - medida
 *         - precio
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID autogenerado del tamaño (UUID)
 *           example: 2b694b8e-fa2d-45db-b27b-e1c48cc40001
 *         nombre:
 *           type: string
 *           description: Nombre único del tamaño (ej. Individual, Mediana, Familiar)
 *           example: Grande
 *         medida:
 *           type: string
 *           description: Medida o diámetro (ej. 25cm, 30cm, 35cm)
 *           example: 16" - 12 rebanadas
 *         precio:
 *           type: number
 *           format: double
 *           description: Precio del tamaño
 *           example: 199
 *     Ingredient:
 *       type: object
 *       required:
 *         - nombre
 *         - precio
 *         - categoria
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID autogenerado del ingrediente (UUID)
 *           example: 3b894c2e-fb2d-45db-b27b-e1c48cc40002
 *         nombre:
 *           type: string
 *           description: Nombre único del ingrediente
 *           example: Pepperoni
 *         precio:
 *           type: number
 *           format: double
 *           description: Precio extra del ingrediente
 *           example: 15
 *         categoria:
 *           type: string
 *           enum: [masa, salsa, queso, extra]
 *           description: Categoría del ingrediente
 *           example: extra
 */

// ==========================================
// CONTROLADORES DE TAMAÑOS (SIZES)
// ==========================================

/**
 * @swagger
 * /api/catalog/sizes:
 *   get:
 *     summary: Obtener todos los tamaños de pizzas
 *     tags: [Catálogo - Tamaños]
 *     responses:
 *       200:
 *         description: Lista de tamaños registrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Size'
 *       500:
 *         description: Error en el servidor
 */
export const getSizes = async (req, res) => {
  try {
    const sizes = await Size.findAll();
    res.json(sizes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los tamaños', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/sizes:
 *   post:
 *     summary: Crear un nuevo tamaño de pizza
 *     tags: [Catálogo - Tamaños]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - medida
 *               - precio
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Mediana
 *               medida:
 *                 type: string
 *                 example: 12" - 8 rebanadas
 *               precio:
 *                 type: number
 *                 example: 149
 *     responses:
 *       201:
 *         description: Tamaño creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Size'
 *       400:
 *         description: Datos incorrectos o duplicados
 *       401:
 *         description: No autorizado
 */
export const createSize = async (req, res) => {
  try {
    const { nombre, medida, precio } = req.body;
    const sizeExiste = await Size.findOne({ where: { nombre } });
    if (sizeExiste) {
      return res.status(400).json({ message: 'Ya existe este tamaño' });
    }
    const size = await Size.create({ nombre, medida, precio });
    res.status(201).json(size);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el tamaño', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/sizes/{id}:
 *   put:
 *     summary: Actualizar un tamaño de pizza existente
 *     tags: [Catálogo - Tamaños]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tamaño
 *         example: 2b694b8e-fa2d-45db-b27b-e1c48cc40001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Mediana Premium
 *               medida:
 *                 type: string
 *                 example: 12" - 8 rebanadas
 *               precio:
 *                 type: number
 *                 example: 159
 *     responses:
 *       200:
 *         description: Tamaño actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Size'
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tamaño no encontrado
 */
export const updateSize = async (req, res) => {
  try {
    const size = await Size.findByPk(req.params.id);
    if (size) {
      size.nombre = req.body.nombre || size.nombre;
      size.medida = req.body.medida || size.medida;
      size.precio = req.body.precio !== undefined ? req.body.precio : size.precio;

      const sizeActualizado = await size.save();
      res.json(sizeActualizado);
    } else {
      res.status(404).json({ message: 'Tamaño no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el tamaño', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/sizes/{id}:
 *   delete:
 *     summary: Eliminar un tamaño de pizza por ID
 *     tags: [Catálogo - Tamaños]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del tamaño
 *         example: 2b694b8e-fa2d-45db-b27b-e1c48cc40001
 *     responses:
 *       200:
 *         description: Tamaño eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Tamaño no encontrado
 *       500:
 *         description: Error en el servidor
 */
export const deleteSize = async (req, res) => {
  try {
    const deletedCount = await Size.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Tamaño eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Tamaño no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el tamaño', error: error.message });
  }
};

// ==========================================
// CONTROLADORES DE INGREDIENTES (INGREDIENTS)
// ==========================================

/**
 * @swagger
 * /api/catalog/ingredients:
 *   get:
 *     summary: Obtener todos los ingredientes de pizzas
 *     tags: [Catálogo - Ingredientes]
 *     responses:
 *       200:
 *         description: Lista de ingredientes registrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ingredient'
 *       500:
 *         description: Error en el servidor
 */
export const getIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.findAll();
    res.json(ingredients);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los ingredientes', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/ingredients:
 *   post:
 *     summary: Crear un nuevo ingrediente
 *     tags: [Catálogo - Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precio
 *               - categoria
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Jamón
 *               precio:
 *                 type: number
 *                 example: 12
 *               categoria:
 *                 type: string
 *                 enum: [masa, salsa, queso, extra]
 *                 example: extra
 *     responses:
 *       201:
 *         description: Ingrediente creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Datos incorrectos o duplicados
 *       401:
 *         description: No autorizado
 */
export const createIngredient = async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;
    const ingredienteExiste = await Ingredient.findOne({ where: { nombre } });
    if (ingredienteExiste) {
      return res.status(400).json({ message: 'Ya existe este ingrediente' });
    }
    const ingredient = await Ingredient.create({ nombre, precio, categoria });
    res.status(201).json(ingredient);
  } catch (error) {
    res.status(400).json({ message: 'Error al crear el ingrediente', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/ingredients/{id}:
 *   put:
 *     summary: Actualizar un ingrediente existente
 *     tags: [Catálogo - Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del ingrediente
 *         example: 3b894c2e-fb2d-45db-b27b-e1c48cc40002
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Jamón de Pavo
 *               precio:
 *                 type: number
 *                 example: 14
 *               categoria:
 *                 type: string
 *                 enum: [masa, salsa, queso, extra]
 *                 example: extra
 *     responses:
 *       200:
 *         description: Ingrediente actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Ingrediente no encontrado
 */
export const updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findByPk(req.params.id);
    if (ingredient) {
      ingredient.nombre = req.body.nombre || ingredient.nombre;
      ingredient.precio = req.body.precio !== undefined ? req.body.precio : ingredient.precio;
      ingredient.categoria = req.body.categoria || ingredient.categoria;

      const ingredienteActualizado = await ingredient.save();
      res.json(ingredienteActualizado);
    } else {
      res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el ingrediente', error: error.message });
  }
};

/**
 * @swagger
 * /api/catalog/ingredients/{id}:
 *   delete:
 *     summary: Eliminar un ingrediente por ID
 *     tags: [Catálogo - Ingredientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del ingrediente
 *         example: 3b894c2e-fb2d-45db-b27b-e1c48cc40002
 *     responses:
 *       200:
 *         description: Ingrediente eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Ingrediente no encontrado
 *       500:
 *         description: Error en el servidor
 */
export const deleteIngredient = async (req, res) => {
  try {
    const deletedCount = await Ingredient.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Ingrediente eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el ingrediente', error: error.message });
  }
};
