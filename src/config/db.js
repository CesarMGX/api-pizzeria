import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
    }
  });
} else {
  const dbName = process.env.DB_NAME || 'pizza';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPassword = process.env.DB_PASSWORD || 'password';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = process.env.DB_PORT || 5432;

  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
    }
  });
}

// Función para conectar y sincronizar base de datos
export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL Conectado exitosamente.');
    
    // Sincronización automática de modelos (crea las tablas si no existen)
    await sequelize.sync();
    console.log('Tablas de PostgreSQL sincronizadas correctamente.');
  } catch (error) {
    console.error(`Error de conexión o sincronización a PostgreSQL: ${error.message}`);
    console.warn('Advertencia: El servidor continuará ejecutándose para permitir el acceso a la documentación (Swagger) sin una base de datos activa.');
  }
};

export default sequelize;
