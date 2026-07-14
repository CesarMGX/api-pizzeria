import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario administrador/empleado/cliente
 *     tags: [Autenticación]
 *     security: []
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
 *                 description: Correo electrónico único
 *                 example: adandejesus200420@gmail.com
 *               password:
 *                 type: string
 *                 description: Contraseña de acceso
 *                 example: a1b2c3d4e5f6
 *               rol:
 *                 type: string
 *                 enum: [admin, cliente, empleado]
 *                 example: admin
 *               telefono:
 *                 type: string
 *                 example: 2712917011
 *               recibePromos:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     email:
 *                       type: string
 *                     rol:
 *                       type: string
 *       400:
 *         description: El correo ya está registrado o faltan datos
 */
export const register = async (req, res, next) => {
  const { nombre, apellido, email, password, rol, telefono, recibePromos } = req.body;

  // Soporte temporal de compatibilidad para request antiguos
  const finalEmail = email || req.body.correo;
  const finalPassword = password || req.body.contrasena;
  const finalNombre = nombre || 'Usuario';

  if (!finalEmail || !finalPassword) {
    res.status(400);
    return next(new Error('Por favor, proporciona un email/correo y una contraseña'));
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
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol
      },
    });
  } catch (error) {
    res.status(400);
    return next(error);
  }
};

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión para obtener un token JWT
 *     tags: [Autenticación]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: adandejesus200420@gmail.com
 *               password:
 *                 type: string
 *                 description: Contraseña de acceso
 *                 example: a1b2c3d4e5f6
 *     responses:
 *       200:
 *         description: Autenticación exitosa, retorna el token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       400:
 *         description: Solicitud incorrecta (falta correo o contraseña)
 *       401:
 *         description: Credenciales incorrectas
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Soporte temporal de compatibilidad para request antiguos
  const finalEmail = email || req.body.correo;
  const finalPassword = password || req.body.contrasena;

  if (!finalEmail || !finalPassword) {
    res.status(400);
    return next(new Error('Por favor, proporciona un correo y una contraseña'));
  }

  try {
    const user = await User.findOne({ where: { email: finalEmail } });

    if (user && (await user.validarContrasena(finalPassword))) {
      // Generar Token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Autenticación exitosa',
        token,
      });
    } else {
      res.status(401);
      return next(new Error('Credenciales incorrectas'));
    }
  } catch (error) {
    res.status(500);
    return next(error);
  }
};
