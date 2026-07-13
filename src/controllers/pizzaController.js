import Pizza from '../models/Pizza.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Pizza:
 *       type: object
 *       required:
 *         - nombre
 *         - precioBase
 *       properties:
 *         id:
 *           type: string
 *           description: ID autogenerado de la pizza (basado en el nombre)
 *           example: pepperoni-a1b
 *         nombre:
 *           type: string
 *           description: Nombre único de la pizza
 *           example: Pepperoni
 *         descripcion:
 *           type: string
 *           description: Descripción de los ingredientes
 *           example: Salsa de tomate, mozzarella y abundante pepperoni.
 *         imagen:
 *           type: string
 *           description: URL de la imagen
 *           example: https://res.cloudinary.com/z7fsosjt/image/upload/v1783576546/test-folder/g2padj0wwklxjvktd0fv.jpg
 *         precioBase:
 *           type: number
 *           format: double
 *           description: Precio base de la pizza
 *           example: 120
 *         defaultMasa:
 *           type: string
 *           description: Tipo de masa por defecto (ej. Tradicional)
 *           example: Tradicional
 *         defaultSalsa:
 *           type: string
 *           description: Salsa por defecto (ej. Salsa de Tomate)
 *           example: Salsa de Tomate
 *         defaultQueso:
 *           type: string
 *           description: Queso por defecto (ej. Mozzarella)
 *           example: Mozzarella
 *         defaultExtras:
 *           type: array
 *           items:
 *             type: string
 *           description: Ingredientes extras por defecto en formato JSON
 *           example: ["Pepperoni"]
 */

/**
 * @swagger
 * /api/pizzas:
 *   get:
 *     summary: Obtener todas las pizzas
 *     tags: [Pizzas]
 *     responses:
 *       200:
 *         description: Lista de todas las pizzas registradas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Pizza'
 *       500:
 *         description: Error en el servidor
 */
export const getPizzas = async (req, res) => {
  try {
    const pizzas = await Pizza.findAll();
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las pizzas', error: error.message });
  }
};

/**
 * @swagger
 * /api/pizzas/{id}:
 *   get:
 *     summary: Obtener una pizza por su ID
 *     tags: [Pizzas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pizza
 *         example: pepperoni-a1b
 *     responses:
 *       200:
 *         description: Datos de la pizza solicitada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       404:
 *         description: Pizza no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const getPizzaById = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);
    if (pizza) {
      res.json(pizza);
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la pizza', error: error.message });
  }
};

/**
 * @swagger
 * /api/pizzas:
 *   post:
 *     summary: Crear una nueva pizza
 *     tags: [Pizzas]
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
 *               - precioBase
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Hawaiana
 *               descripcion:
 *                 type: string
 *                 example: Pizza con jamón, piña y queso mozzarella.
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen ya subida
 *                 example: https://res.cloudinary.com/z7fsosjt/image/upload/v1783576546/test-folder/g2padj0wwklxjvktd0fv.jpg
 *               precioBase:
 *                 type: number
 *                 example: 130
 *               defaultMasa:
 *                 type: string
 *                 example: Tradicional
 *               defaultSalsa:
 *                 type: string
 *                 example: Salsa de Tomate
 *               defaultQueso:
 *                 type: string
 *                 example: Mozzarella
 *               defaultExtras:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Piña", "Jamón"]
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - precioBase
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Hawaiana
 *               descripcion:
 *                 type: string
 *                 example: Pizza con jamón, piña y queso mozzarella.
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Archivo de imagen de la pizza a subir a Cloudinary
 *               precioBase:
 *                 type: number
 *                 example: 130
 *               defaultMasa:
 *                 type: string
 *                 example: Tradicional
 *               defaultSalsa:
 *                 type: string
 *                 example: Salsa de Tomate
 *               defaultQueso:
 *                 type: string
 *                 example: Mozzarella
 *               defaultExtras:
 *                 type: string
 *                 description: Lista de extras por defecto en formato JSON String
 *                 example: '["Piña", "Jamón"]'
 *     responses:
 *       201:
 *         description: Pizza creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       400:
 *         description: Solicitud incorrecta o pizza duplicada
 *       401:
 *         description: No autorizado
 */
export const createPizza = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precioBase,
      defaultMasa,
      defaultSalsa,
      defaultQueso,
      defaultExtras,
    } = req.body;

    // Obtener la URL de la imagen si se subió por archivo, de lo contrario leer de body
    const imagen = req.file ? req.file.path : req.body.imagen || '';

    // Manejar defaultExtras si viene como string (por form-data)
    let extras = defaultExtras || [];
    if (typeof defaultExtras === 'string') {
      try {
        extras = JSON.parse(defaultExtras);
      } catch (err) {
        extras = [];
      }
    }

    const pizzaExiste = await Pizza.findOne({ where: { nombre } });
    if (pizzaExiste) {
      return res.status(400).json({ message: 'Ya existe una pizza con este nombre' });
    }

    // Generar un ID basado en el nombre (como en el frontend)
    const id = nombre.toLowerCase().replace(/\s+/g, '-') + '-' + Math.random().toString(36).substring(2, 5);

    const pizza = await Pizza.create({
      id,
      nombre,
      descripcion,
      imagen,
      precioBase,
      defaultMasa,
      defaultSalsa,
      defaultQueso,
      defaultExtras: extras,
    });

    res.status(201).json(pizza);
  } catch (error) {
    res.status(400).json({ message: 'Datos de pizza no válidos', error: error.message });
  }
};

/**
 * @swagger
 * /api/pizzas/{id}:
 *   put:
 *     summary: Actualizar una pizza existente
 *     tags: [Pizzas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pizza
 *         example: hawaiana-3bc
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Hawaiana Premium
 *               descripcion:
 *                 type: string
 *                 example: Con jamón de pechuga, piña fresca y extra queso mozzarella.
 *               imagen:
 *                 type: string
 *                 description: URL de la imagen a actualizar
 *                 example: https://res.cloudinary.com/z7fsosjt/image/upload/v1783576546/test-folder/g2padj0wwklxjvktd0fv.jpg
 *               precioBase:
 *                 type: number
 *                 example: 150
 *               defaultMasa:
 *                 type: string
 *                 example: Gruesa
 *               defaultSalsa:
 *                 type: string
 *                 example: BBQ
 *               defaultQueso:
 *                 type: string
 *                 example: Mezcla de 3 Quesos
 *               defaultExtras:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Piña", "Jamón", "Tocino"]
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Hawaiana Premium
 *               descripcion:
 *                 type: string
 *                 example: Con jamón de pechuga, piña fresca y extra queso mozzarella.
 *               imagen:
 *                 type: string
 *                 format: binary
 *                 description: Nuevo archivo de imagen a subir a Cloudinary
 *               precioBase:
 *                 type: number
 *                 example: 150
 *               defaultMasa:
 *                 type: string
 *                 example: Gruesa
 *               defaultSalsa:
 *                 type: string
 *                 example: BBQ
 *               defaultQueso:
 *                 type: string
 *                 example: Mezcla de 3 Quesos
 *               defaultExtras:
 *                 type: string
 *                 description: Nueva lista de extras en formato JSON String
 *                 example: '["Piña", "Jamón", "Tocino"]'
 *     responses:
 *       200:
 *         description: Pizza actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Pizza'
 *       400:
 *         description: Error al actualizar
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pizza no encontrada
 */
export const updatePizza = async (req, res) => {
  try {
    const pizza = await Pizza.findByPk(req.params.id);

    if (pizza) {
      pizza.nombre = req.body.nombre || pizza.nombre;
      pizza.descripcion = req.body.descripcion || pizza.descripcion;
      
      // Manejar la imagen si se subió por archivo o body
      if (req.file) {
        pizza.imagen = req.file.path;
      } else if (req.body.imagen !== undefined) {
        pizza.imagen = req.body.imagen;
      }

      pizza.precioBase = req.body.precioBase !== undefined ? req.body.precioBase : pizza.precioBase;
      pizza.defaultMasa = req.body.defaultMasa || pizza.defaultMasa;
      pizza.defaultSalsa = req.body.defaultSalsa || pizza.defaultSalsa;
      pizza.defaultQueso = req.body.defaultQueso || pizza.defaultQueso;

      if (req.body.defaultExtras !== undefined) {
        let extras = req.body.defaultExtras;
        if (typeof extras === 'string') {
          try {
            extras = JSON.parse(extras);
          } catch (err) {
            extras = pizza.defaultExtras;
          }
        }
        pizza.defaultExtras = extras;
      }

      const pizzaActualizada = await pizza.save();
      res.json(pizzaActualizada);
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar la pizza', error: error.message });
  }
};

/**
 * @swagger
 * /api/pizzas/{id}:
 *   delete:
 *     summary: Eliminar una pizza existente
 *     tags: [Pizzas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la pizza
 *     responses:
 *       200:
 *         description: Pizza eliminada exitosamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Pizza no encontrada
 *       500:
 *         description: Error en el servidor
 */
export const deletePizza = async (req, res) => {
  try {
    const deletedCount = await Pizza.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Pizza eliminada correctamente' });
    } else {
      res.status(404).json({ message: 'Pizza no encontrada' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la pizza', error: error.message });
  }
};
