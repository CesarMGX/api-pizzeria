import User from '../models/User.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - correo
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único autogenerado (UUID)
 *           example: d3b07384-d113-4c9f-855f-863a48e77a28
 *         correo:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario
 *           example: admin@planetpizza.com
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Obtener todos los usuarios (excluyendo contraseñas)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios registrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error en el servidor
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'correo', 'createdAt', 'updatedAt']
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener un usuario por su ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *         example: d3b07384-d113-4c9f-855f-863a48e77a28
 *     responses:
 *       200:
 *         description: Datos del usuario solicitado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'correo', 'createdAt', 'updatedAt']
    });
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
  }
};

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: empleado@planetpizza.com
 *               contrasena:
 *                 type: string
 *                 example: empleado123
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: El correo ya está registrado o faltan datos
 *       401:
 *         description: No autorizado
 */
export const createUser = async (req, res, next) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    res.status(400);
    return next(new Error('Por favor, proporciona un correo y una contraseña'));
  }

  try {
    const usuarioExiste = await User.findOne({ where: { correo } });
    if (usuarioExiste) {
      res.status(400);
      return next(new Error('Este correo ya se encuentra registrado'));
    }

    const user = await User.create({ correo, contrasena });
    res.status(201).json({
      id: user.id,
      correo: user.correo,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    res.status(400);
    return next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Actualizar un usuario existente (correo y/o contraseña)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a actualizar
 *         example: d3b07384-d113-4c9f-855f-863a48e77a28
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 example: empleado_nuevo@planetpizza.com
 *               contrasena:
 *                 type: string
 *                 description: Nueva contraseña de acceso si se desea cambiar
 *                 example: nuevacontrasena123
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos o error al actualizar
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('Usuario no encontrado'));
    }

    if (req.body.correo && req.body.correo !== user.correo) {
      const usuarioExiste = await User.findOne({ where: { correo: req.body.correo } });
      if (usuarioExiste) {
        res.status(400);
        return next(new Error('Este correo ya está registrado por otro usuario'));
      }
      user.correo = req.body.correo;
    }

    if (req.body.contrasena) {
      user.contrasena = req.body.contrasena; // El hook de User la encriptará
    }

    const usuarioActualizado = await user.save();
    res.json({
      id: usuarioActualizado.id,
      correo: usuarioActualizado.correo,
      createdAt: usuarioActualizado.createdAt,
      updatedAt: usuarioActualizado.updatedAt
    });
  } catch (error) {
    res.status(400);
    return next(error);
  }
};

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Eliminar un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario a eliminar
 *         example: d3b07384-d113-4c9f-855f-863a48e77a28
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error en el servidor
 */
export const deleteUser = async (req, res) => {
  try {
    const deletedCount = await User.destroy({ where: { id: req.params.id } });
    if (deletedCount > 0) {
      res.json({ message: 'Usuario eliminado correctamente' });
    } else {
      res.status(404).json({ message: 'Usuario no encontrado' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
  }
};
