import sequelize from './db.js';
import Size from '../models/Size.js';
import Ingredient from '../models/Ingredient.js';

const sizesData = [
  { nombre: 'Chica', medida: '8" - 4 rebanadas', precio: 99 },
  { nombre: 'Mediana', medida: '12" - 8 rebanadas', precio: 149 },
  { nombre: 'Grande', medida: '16" - 12 rebanadas', precio: 199 },
];

const ingredientsData = [
  // Masas
  { nombre: 'Tradicional', precio: 0, categoria: 'masa' },
  { nombre: 'Delgada', precio: 0, categoria: 'masa' },
  { nombre: 'Gruesa', precio: 10, categoria: 'masa' },
  { nombre: 'Orilla Rellena de Queso', precio: 25, categoria: 'masa' },

  // Salsas
  { nombre: 'Salsa de Tomate', precio: 0, categoria: 'salsa' },
  { nombre: 'BBQ', precio: 10, categoria: 'salsa' },
  { nombre: 'Alfredo', precio: 15, categoria: 'salsa' },
  { nombre: 'Pesto', precio: 15, categoria: 'salsa' },

  // Quesos
  { nombre: 'Mozzarella', precio: 0, categoria: 'queso' },
  { nombre: 'Cheddar', precio: 10, categoria: 'queso' },
  { nombre: 'Parmesano', precio: 10, categoria: 'queso' },
  { nombre: 'Mezcla de 3 Quesos', precio: 20, categoria: 'queso' },

  // Ingredientes Adicionales (Extras)
  { nombre: 'Pepperoni', precio: 15, categoria: 'extra' },
  { nombre: 'Jamón', precio: 12, categoria: 'extra' },
  { nombre: 'Salchicha Italiana', precio: 15, categoria: 'extra' },
  { nombre: 'Pollo', precio: 15, categoria: 'extra' },
  { nombre: 'Tocino', precio: 18, categoria: 'extra' },
  { nombre: 'Champiñones', precio: 10, categoria: 'extra' },
  { nombre: 'Pimientos', precio: 8, categoria: 'extra' },
  { nombre: 'Cebolla', precio: 8, categoria: 'extra' },
  { nombre: 'Aceitunas Negras', precio: 10, categoria: 'extra' },
  { nombre: 'Piña', precio: 10, categoria: 'extra' },
  { nombre: 'Tomate', precio: 8, categoria: 'extra' },
  { nombre: 'Jalapeños', precio: 8, categoria: 'extra' },
];

const seedDatabase = async () => {
  try {
    // Conectar base de datos
    await sequelize.authenticate();
    console.log('Conexión establecida para la inserción de datos iniciales.');

    // Opcional: Sincronizar tablas
    // await sequelize.sync();

    // Insertar Tamaños
    for (const size of sizesData) {
      const [record, created] = await Size.findOrCreate({
        where: { nombre: size.nombre },
        defaults: size,
      });
      if (created) {
        console.log(`Tamaño creado: ${size.nombre}`);
      } else {
        // Actualizar precio y medida si ya existe
        record.precio = size.precio;
        record.medida = size.medida;
        await record.save();
        console.log(`Tamaño actualizado: ${size.nombre}`);
      }
    }

    // Insertar Ingredientes
    for (const ing of ingredientsData) {
      const [record, created] = await Ingredient.findOrCreate({
        where: { nombre: ing.nombre },
        defaults: ing,
      });
      if (created) {
        console.log(`Ingrediente creado: ${ing.nombre} (${ing.categoria})`);
      } else {
        // Actualizar precio y categoría si ya existe
        record.precio = ing.precio;
        record.categoria = ing.categoria;
        await record.save();
        console.log(`Ingrediente actualizado: ${ing.nombre}`);
      }
    }

    console.log('¡Siembre/Carga de datos completada exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();
