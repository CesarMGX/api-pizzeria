import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  correo: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  contrasena: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.contrasena = await bcrypt.hash(user.contrasena, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('contrasena')) {
        user.contrasena = await bcrypt.hash(user.contrasena, 10);
      }
    },
  }
});

User.prototype.validarContrasena = async function (contrasena) {
  return await bcrypt.compare(contrasena, this.contrasena);
};

export default User;
