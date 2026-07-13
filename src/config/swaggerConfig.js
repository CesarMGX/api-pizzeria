import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Planeta Pizza API',
      version: '1.0.0',
      description: 'Documentación de la API de Planet Pizza',
    },
    servers: [
      {
        url: process.env.BACKEND_URL || 'https://api-pizzeria-production.up.railway.app',
        description: 'Servidor Configurado (BACKEND_URL)',
      },
      {
        url: 'https://api-pizzeria-production.up.railway.app',
        description: 'Servidor de Producción (Railway)',
      },
      {
        url: 'http://localhost:3001',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce el token JWT obtenido del login para acceder a los endpoints protegidos.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/app.js'], // Buscar anotaciones en rutas y controladores
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
