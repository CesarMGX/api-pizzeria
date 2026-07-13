import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import Pizza from './Pizza.js';

const Promo = sequelize.define('Promo', {
  id: {
    type: DataTypes.STRING(100),
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  precio: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  imagen: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: '',
  },
  badge: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: '',
  },
  pizzaBaseId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    references: {
      model: Pizza,
      key: 'id',
    },
  },
});

// Relaciones
Promo.belongsTo(Pizza, { foreignKey: 'pizzaBaseId', as: 'pizzaBase' });
Pizza.hasMany(Promo, { foreignKey: 'pizzaBaseId', as: 'promos' });

export default Promo;
