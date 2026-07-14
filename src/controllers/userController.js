import User from '../models/User.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - nombre
 *         - email
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: ID único autogenerado (UUID)
 *           example: d3b07384-d113-4c9f-855f-863a48e77a28
 *         nombre:
 *           type: string
 *           example: Adán de Jesús
 *         apellido:
 *           type: string
 *           example: Morales
 *         email:
 *           type: string
 *           format: email
 *           description: Correo electrónico único del usuario
 *           example: adandejesus200420@gmail.com
 *         rol:
 *           type: string
 *           example: admin
 *         telefono:
 *           type: string
 *           example: "2712917011"
 *         recibePromos:
 *           type: boolean
 *           example: true
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
      attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'telefono', 'recibePromos', 'createdAt', 'updatedAt']
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
      attributes: ['id', 'nombre', 'apellido', 'email', 'rol', 'telefono', 'recibePromos', 'createdAt', 'updatedAt']
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
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Adán de Jesús
 *               apellido:
 *                 type: string
 *                 example: Morales
 *               email:
 *                 type: string
 *                 format: email
 *                 example: adandejesus200420@gmail.com
 *               password:
 *                 type: string
 *                 example: a1b2c3d4e5f6
 *               rol:
 *                 type: string
 *                 example: admin
 *               telefono:
 *                 type: string
 *                 example: "2712917011"
 *               recibePromos:
 *                 type: boolean
 *                 example: true
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
  const { nombre, apellido, email, password, rol, telefono, recibePromos } = req.body;

  // Soporte de fallback de compatibilidad
  const finalEmail = email || req.body.correo;
  const finalPassword = password || req.body.contrasena;
  const finalNombre = nombre || 'Usuario';

  if (!finalEmail || !finalPassword) {
    res.status(400);
    return next(new Error('Por favor, proporciona un email y una contraseña'));
  }

  try {
    const usuarioExiste = await User.findOne({ where: { email: finalEmail } });
    if (usuarioExiste) {
      res.status(400);
      return next(new Error('Este correo ya se encuentra registrado'));
    }

    const user = await User.create({
      nombre: finalNombre,
      apellido: apellido || '',
      email: finalEmail,
      password: finalPassword,
      rol: rol || 'cliente',
      telefono: telefono || '',
      recibePromos: recibePromos !== undefined ? recibePromos : false
    });

    res.status(201).json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono,
      recibePromos: user.recibePromos,
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
 *     summary: Actualizar un usuario existente
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
 *               nombre:
 *                 type: string
 *                 example: Adán de Jesús Modificado
 *               apellido:
 *                 type: string
 *                 example: Morales
 *               email:
 *                 type: string
 *                 format: email
 *                 example: adandejesus_nuevo@gmail.com
 *               password:
 *                 type: string
 *                 description: Nueva contraseña de acceso si se desea cambiar
 *                 example: nuevacontrasena123
 *               rol:
 *                 type: string
 *                 example: empleado
 *               telefono:
 *                 type: string
 *                 example: "2712917012"
 *               recibePromos:
 *                 type: boolean
 *                 example: false
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

    const newEmail = req.body.email || req.body.correo;
    if (newEmail && newEmail !== user.email) {
      const usuarioExiste = await User.findOne({ where: { email: newEmail } });
      if (usuarioExiste) {
        res.status(400);
        return next(new Error('Este correo ya está registrado por otro usuario'));
      }
      user.email = newEmail;
    }

    user.nombre = req.body.nombre || user.nombre;
    user.apellido = req.body.apellido !== undefined ? req.body.apellido : user.apellido;
    user.rol = req.body.rol || user.rol;
    user.telefono = req.body.telefono !== undefined ? req.body.telefono : user.telefono;
    user.recibePromos = req.body.recibePromos !== undefined ? req.body.recibePromos : user.recibePromos;

    const newPassword = req.body.password || req.body.contrasena;
    if (newPassword) {
      user.password = newPassword; // Hook hashes it
    }

    const usuarioActualizado = await user.save();
    res.json({
      id: usuarioActualizado.id,
      nombre: usuarioActualizado.nombre,
      apellido: usuarioActualizado.apellido,
      email: usuarioActualizado.email,
      rol: usuarioActualizado.rol,
      telefono: usuarioActualizado.telefono,
      recibePromos: usuarioActualizado.recibePromos,
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
