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
 *               - correo
 *               - contrasena
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Adán de Jesús
 *               apellido:
 *                 type: string
 *                 example: Morales
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: adandejesus200420@gmail.com
 *               contrasena:
 *                 type: string
 *                 description: Contraseña de acceso
 *                 example: pizzaplaneta123921_xdd
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
 *                     correo:
 *                       type: string
 *                     rol:
 *                       type: string
 *       400:
 *         description: El correo ya está registrado o faltan datos
 */
export const register = async (req, res, next) => {
  const { nombre, apellido, correo, contrasena, email, password, rol, telefono, recibePromos } = req.body;

  const finalEmail = correo || email;
  const finalPassword = contrasena || password;
  const finalNombre = nombre || 'Usuario';

  if (!finalEmail || !finalPassword) {
    res.status(400);
    return next(new Error('Por favor, proporciona un correo y una contraseña'));
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
        correo: user.email,
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
 *               - correo
 *               - contrasena
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: adandejesus200420@gmail.com
 *               contrasena:
 *                 type: string
 *                 description: Contraseña de acceso
 *                 example: pizzaplaneta123921_xdd
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
  const { correo, contrasena, email, password } = req.body;

  const finalEmail = correo || email;
  const finalPassword = contrasena || password;

  if (!finalEmail || !finalPassword) {
    res.status(400);
    return next(new Error('Por favor, proporciona un correo y una contraseña'));
  }

  try {
    const user = await User.findOne({ where: { email: finalEmail } });

    if (user && (await user.validarContrasena(finalPassword))) {
      // Generar Token JWT
      const token = jwt.sign(
        { id: user.id, correo: user.email, nombre: user.nombre, rol: user.rol },
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
