import jwt from 'jsonwebtoken';

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
 *               - password
 *             properties:
 *               password:
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
 *         description: Solicitud incorrecta (falta contraseña)
 *       401:
 *         description: Contraseña incorrecta
 */
export const login = async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    return next(new Error('Por favor, proporciona una contraseña'));
  }

  // La contraseña configurada por el usuario
  const PASSWORD_CORRECTA = 'pizzaplaneta123921_xdd';

  if (password === PASSWORD_CORRECTA) {
    // Generar Token JWT
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Autenticación exitosa',
      token,
    });
  } else {
    res.status(401);
    return next(new Error('Contraseña incorrecta'));
  }
};
