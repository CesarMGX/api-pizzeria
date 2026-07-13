import sequelize from './db.js';
import Size from '../models/Size.js';
import Ingredient from '../models/Ingredient.js';
import Pizza from '../models/Pizza.js';
import Promo from '../models/Promo.js';
import User from '../models/User.js';

const sizesData = [
  { nombre: 'Personal', medida: '25 cm', precio: 90.00 },
  { nombre: 'Mediana', medida: '30 cm', precio: 150.00 },
  { nombre: 'Familiar', medida: '35 cm', precio: 200.00 },
];

const ingredientsData = [
  // Masas
  { nombre: 'Masa Tradicional', precio: 0.00, categoria: 'masa' },
  { nombre: 'Masa Delgada', precio: 10.00, categoria: 'masa' },
  { nombre: 'Masa Orilla de Queso', precio: 35.00, categoria: 'masa' },

  // Salsas
  { nombre: 'Salsa de Tomate', precio: 0.00, categoria: 'salsa' },
  { nombre: 'Salsa BBQ', precio: 10.00, categoria: 'salsa' },

  // Quesos
  { nombre: 'Mozzarella', precio: 15.00, categoria: 'queso' },
  { nombre: 'Doble Queso', precio: 25.00, categoria: 'queso' },

  // Ingredientes Adicionales (Extras)
  { nombre: 'Pepperoni', precio: 20.00, categoria: 'extra' },
  { nombre: 'Piña', precio: 15.00, categoria: 'extra' },
  { nombre: 'Jamón', precio: 20.00, categoria: 'extra' },
  { nombre: 'Champiñones', precio: 18.00, categoria: 'extra' },
  { nombre: 'Cebolla', precio: 10.00, categoria: 'extra' },
];

const pizzasData = [
  {
    id: 'pizza-pepperoni',
    nombre: 'Pizza de Pepperoni',
    descripcion: 'La clásica e infalible, repleta de pepperoni crujiente y queso fundido.',
    imagen: '/images/pepperoni.jpg',
    precioBase: 120.00,
    defaultMasa: 'Masa Tradicional',
    defaultSalsa: 'Salsa de Tomate',
    defaultQueso: 'Mozzarella',
    defaultExtras: ['Pepperoni']
  },
  {
    id: 'pizza-hawaiana',
    nombre: 'Pizza Hawaiana',
    descripcion: 'Para los amantes del contraste: jamón jugoso y piña dulce.',
    imagen: '/images/hawaiana.jpg',
    precioBase: 130.00,
    defaultMasa: 'Masa Tradicional',
    defaultSalsa: 'Salsa de Tomate',
    defaultQueso: 'Mozzarella',
    defaultExtras: ['Piña', 'Jamón']
  },
  {
    id: 'pizza-vegetariana',
    nombre: 'Pizza Vegetariana',
    descripcion: 'Fresca y ligera, cargada de champiñones frescos y cebolla.',
    imagen: '/images/vegetariana.jpg',
    precioBase: 110.00,
    defaultMasa: 'Masa Delgada',
    defaultSalsa: 'Salsa de Tomate',
    defaultQueso: 'Mozzarella',
    defaultExtras: ['Champiñones', 'Cebolla']
  },
  {
    id: 'pizza-bbq',
    nombre: 'Pizza BBQ',
    descripcion: 'Todo el sabor del BBQ con una base ahumada y doble queso.',
    imagen: '/images/bbq.jpg',
    precioBase: 140.00,
    defaultMasa: 'Masa Tradicional',
    defaultSalsa: 'Salsa BBQ',
    defaultQueso: 'Doble Queso',
    defaultExtras: []
  }
];

const promosData = [
  {
    id: 'combo-pareja',
    nombre: 'Combo Pareja',
    descripcion: '1 Pizza Mediana de Pepperoni + 2 Refrescos. ¡Ideal para compartir!',
    precio: 199.00,
    imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
    badge: 'Popular',
    pizzaBaseId: 'pizza-pepperoni'
  },
  {
    id: 'mega-familiar',
    nombre: 'Mega Familiar',
    descripcion: '1 Pizza Grande Hawaiana + 1 Adicional con 50% de descuento. ¡Gran sabor familiar!',
    precio: 329.00,
    imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
    badge: 'Más Vendido',
    pizzaBaseId: 'pizza-hawaiana'
  }
];

const seedDatabase = async () => {
  try {
    // Conectar base de datos e inicializar tablas antes
    await sequelize.authenticate();
    console.log('Conexión establecida. Sincronizando tablas...');
    await sequelize.sync();

    // 1. Insertar Usuario por defecto
    const defaultUser = {
      correo: 'admin@planetpizza.com',
      contrasena: 'pizzaplaneta123921_xdd'
    };
    const [userRecord, userCreated] = await User.findOrCreate({
      where: { correo: defaultUser.correo },
      defaults: defaultUser,
    });
    if (userCreated) {
      console.log(`Usuario por defecto creado: ${defaultUser.correo}`);
    } else {
      console.log(`El usuario ya existe: ${defaultUser.correo}`);
    }

    // 2. Insertar Tamaños
    for (const size of sizesData) {
      const [record, created] = await Size.findOrCreate({
        where: { nombre: size.nombre },
        defaults: size,
      });
      if (created) {
        console.log(`Tamaño creado: ${size.nombre}`);
      } else {
        record.precio = size.precio;
        record.medida = size.medida;
        await record.save();
        console.log(`Tamaño actualizado: ${size.nombre}`);
      }
    }

    // 3. Insertar Ingredientes
    for (const ing of ingredientsData) {
      const [record, created] = await Ingredient.findOrCreate({
        where: { nombre: ing.nombre },
        defaults: ing,
      });
      if (created) {
        console.log(`Ingrediente creado: ${ing.nombre} (${ing.categoria})`);
      } else {
        record.precio = ing.precio;
        record.categoria = ing.categoria;
        await record.save();
        console.log(`Ingrediente actualizado: ${ing.nombre}`);
      }
    }

    // 4. Insertar Pizzas
    for (const pizza of pizzasData) {
      const [record, created] = await Pizza.findOrCreate({
        where: { id: pizza.id },
        defaults: pizza,
      });
      if (created) {
        console.log(`Pizza creada: ${pizza.nombre}`);
      } else {
        record.nombre = pizza.nombre;
        record.descripcion = pizza.descripcion;
        record.imagen = pizza.imagen;
        record.precioBase = pizza.precioBase;
        record.defaultMasa = pizza.defaultMasa;
        record.defaultSalsa = pizza.defaultSalsa;
        record.defaultQueso = pizza.defaultQueso;
        record.defaultExtras = pizza.defaultExtras;
        await record.save();
        console.log(`Pizza actualizada: ${pizza.nombre}`);
      }
    }

    // 5. Insertar Promociones
    for (const promo of promosData) {
      const [record, created] = await Promo.findOrCreate({
        where: { id: promo.id },
        defaults: promo,
      });
      if (created) {
        console.log(`Promoción creada: ${promo.nombre}`);
      } else {
        record.nombre = promo.nombre;
        record.descripcion = promo.descripcion;
        record.precio = promo.precio;
        record.imagen = promo.imagen;
        record.badge = promo.badge;
        record.pizzaBaseId = promo.pizzaBaseId;
        await record.save();
        console.log(`Promoción actualizada: ${promo.nombre}`);
      }
    }

    console.log('¡Siembre/Carga de datos completada exitosamente con usuarios y promociones!');
    process.exit(0);
  } catch (error) {
    console.error('Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDatabase();
