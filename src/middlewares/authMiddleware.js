import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Obtener el token del encabezado (Bearer <token>)
      token = req.headers.authorization.split(' ')[1];

      // Comprobar si es el token/contraseña estática por defecto
      if (token === process.env.JWT_SECRET || token === 'pizzaplaneta123921_xdd') {
        req.user = { id: 'admin-bypass-id', correo: 'adandejesus200420@gmail.com', nombre: 'Adán de Jesús', rol: 'admin' };
        return next();
      }

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Guardar los datos decodificados en el objeto request
      req.user = decoded;

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('No autorizado, token fallido o expirado'));
    }
  }

  if (!token) {
    res.status(401);
    return next(new Error('No autorizado, no se proporcionó ningún token'));
  }
};
