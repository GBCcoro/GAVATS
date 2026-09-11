/**
 * ============================================
 * MODELO CATEGORIA
 * ============================================
 * Define la estructura de la tabla 'categorias' en MySQL usando Sequelize ORM.
 * Almacena las categorías principales de productos del e-commerce.
 * Ejemplo de categorías: "Electrónica", "Ropa", "Alimentos".
 * Cada categoría puede tener múltiples subcategorías (relación 1:N definida en models/index.js).
 * Si se desactiva una categoría, se desactivan EN CASCADA sus subcategorías y productos (hook afterUpdate).
 */

// Importa DataTypes de la librería 'sequelize' (paquete npm)
// DataTypes proporciona los tipos de datos para definir columnas: INTEGER, STRING, TEXT, BOOLEAN, etc.
const { DataTypes } = require('sequelize');

// Importa la instancia 'sequelize' (conexión activa a MySQL) desde config/database.js
// Se creó con new Sequelize() usando las credenciales del archivo .env
const { sequelize } = require('../config/database');

/**
 * sequelize.define() crea un modelo Sequelize que mapea a una tabla MySQL.
 * 'Categoria' → nombre interno del modelo
 * Segundo argumento → definición de columnas
 * Tercer argumento → opciones (tableName, timestamps, hooks)
 */
const Categoria = sequelize.define('Categoria', {
  // ==========================================
  // COLUMNAS DE LA TABLA 'categorias'
  // ==========================================
  
  // Columna 'id' → Identificador único de cada categoría
  id: {
    type: DataTypes.INTEGER,           // Tipo INT en MySQL
    primaryKey: true,                  // Es la clave primaria (PK) de la tabla
    autoIncrement: true,               // Se incrementa automáticamente: 1, 2, 3...
    allowNull: false                   // No permite valores NULL
  },

  // Columna 'nombre' → Nombre visible de la categoría
  // Ejemplo: "Electrónica", "Ropa", "Alimentos"
  nombre: {
    type: DataTypes.STRING(100),       // VARCHAR(100) en MySQL → máximo 100 caracteres
    allowNull: false,                  // Obligatorio: toda categoría necesita un nombre
    unique: {                          // UNIQUE → no puede haber dos categorías con el mismo nombre
      msg: 'Ya existe una categoría con este nombre'   // Mensaje de error si se repite
    },
    validate: {                        // Validaciones de Sequelize (a nivel de aplicación)
      notEmpty: {                      // No permite cadena vacía ""
        msg: 'El nombre de la categoría no puede estar vacío'
      },
      len: {                           // Valida longitud mínima y máxima
        args: [2, 100],                // Entre 2 y 100 caracteres
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },

  // Columna 'descripcion' → Texto descriptivo de la categoría (opcional)
  descripcion: {
    type: DataTypes.TEXT,              // TEXT en MySQL → texto largo sin límite fijo
    allowNull: true                   // Opcional: puede ser NULL
  },

  // Columna 'activo' → Estado de la categoría (visible/oculta en el catálogo)
  // Si es false, la categoría NO aparece en el catálogo público
  // Además, el hook afterUpdate desactiva subcategorías y productos al cambiar a false
  activo: {
    type: DataTypes.BOOLEAN,           // TINYINT(1) en MySQL → true (1) o false (0)
    allowNull: false,                  // Obligatorio
    defaultValue: true                 // Por defecto se crea activa (visible)
  }

}, {
  // ==========================================
  // OPCIONES DEL MODELO
  // ==========================================
  
  tableName: 'categorias',            // Nombre EXACTO de la tabla en MySQL
  timestamps: true,                   // Sequelize crea automáticamente createdAt y updatedAt
  
  // HOOKS → funciones que Sequelize ejecuta automáticamente en ciertos momentos del ciclo de vida
  hooks: {
    /**
     * afterUpdate → Se ejecuta DESPUÉS de que una categoría se actualiza en la BD.
     * Implementa DESACTIVACIÓN Y REACTIVACIÓN EN CASCADA CON MEMORIA DE ESTADO:
     * - Al desactivar: desactiva las subcategorías y productos activos, marcándolos para recordar su estado original.
     * - Al activar: reactiva ÚNICAMENTE las subcategorías y productos que estuvieron activos al momento de desactivar.
     */
    afterUpdate: async (categoria, options) => {
      if (categoria.changed('activo')) {
        const Subcategoria = require('./Subcategoria');
        const Producto = require('./Producto');
        const transaction = options.transaction;

        if (!categoria.activo) {
          // ==========================================
          // CASO 1: DESACTIVAR CATEGORÍA
          // ==========================================
          console.log(`⚠️ Desactivando categoría en cascada: ${categoria.nombre}`);

          try {
            // 1. Subcategorías: solo marcar desactivadoPorPadre = true a las que estaban activas
            const subcategorias = await Subcategoria.findAll({
              where: { categoriaId: categoria.id },
              transaction
            });

            for (const subcategoria of subcategorias) {
              if (subcategoria.activo) {
                await subcategoria.update(
                  { activo: false, desactivadoPorPadre: true },
                  { transaction, hooks: false }
                );
                console.log(`  ↳ Subcategoría desactivada en cascada: ${subcategoria.nombre}`);
              }
            }

            // 2. Productos: solo marcar desactivadoPorCategoria = true a los que estaban activos
            const productos = await Producto.findAll({
              where: { categoriaId: categoria.id },
              transaction
            });

            for (const producto of productos) {
              if (producto.activo) {
                await producto.update(
                  { activo: false, desactivadoPorCategoria: true },
                  { transaction, hooks: false }
                );
                console.log(`  ↳ Producto desactivado en cascada por categoría: ${producto.nombre}`);
              }
            }

            console.log(`✅ Categoría y elementos relacionados desactivados correctamente`);
          } catch (error) {
            console.error('❌ Error al desactivar elementos relacionados:', error.message);
            throw error;
          }
        } else {
          // ==========================================
          // CASO 2: ACTIVAR CATEGORÍA
          // ==========================================
          console.log(`✅ Activando categoría en cascada: ${categoria.nombre}`);

          try {
            // 1. Reactivar subcategorías que estuvieron activas al momento de desactivar
            const subcategoriasRestaurables = await Subcategoria.findAll({
              where: {
                categoriaId: categoria.id,
                desactivadoPorPadre: true
              },
              transaction
            });

            const idsSubcategoriasActivas = new Set();

            for (const subcategoria of subcategoriasRestaurables) {
              await subcategoria.update(
                { activo: true, desactivadoPorPadre: false },
                { transaction, hooks: false }
              );
              idsSubcategoriasActivas.add(subcategoria.id);
              console.log(`  ↳ Subcategoría reactivada: ${subcategoria.nombre}`);
            }

            // Obtener también subcategorías que ya estaban activas
            const subcategoriasYaActivas = await Subcategoria.findAll({
              where: {
                categoriaId: categoria.id,
                activo: true
              },
              attributes: ['id'],
              transaction
            });
            subcategoriasYaActivas.forEach(s => idsSubcategoriasActivas.add(s.id));

            // 2. Reactivar productos que estuvieron activos al momento de desactivar la categoría,
            // siempre y cuando su subcategoría esté activa
            const productosRestaurables = await Producto.findAll({
              where: {
                categoriaId: categoria.id,
                desactivadoPorCategoria: true
              },
              transaction
            });

            for (const producto of productosRestaurables) {
              const subcategoriaEstaActiva = idsSubcategoriasActivas.has(producto.subcategoriaId);
              await producto.update(
                {
                  activo: subcategoriaEstaActiva,
                  desactivadoPorCategoria: false
                },
                { transaction, hooks: false }
              );
              if (subcategoriaEstaActiva) {
                console.log(`  ↳ Producto reactivado por categoría: ${producto.nombre}`);
              }
            }

            console.log(`✅ Categoría y elementos previamente activos reactivados correctamente`);
          } catch (error) {
            console.error('❌ Error al reactivar elementos relacionados:', error.message);
            throw error;
          }
        }
      }
    }
  }
});

// ==========================================
// MÉTODOS DE INSTANCIA
// ==========================================
// Se agregan a prototype → se llaman sobre UNA instancia: categoria.contarSubcategorias()

/**
 * contarSubcategorias() → Cuenta cuántas subcategorías tiene esta categoría
 * Ejecuta: SELECT COUNT(*) FROM subcategorias WHERE categoriaId = this.id
 * @returns {Promise<number>} Número de subcategorías
 */
Categoria.prototype.contarSubcategorias = async function() {
  const Subcategoria = require('./Subcategoria');   // Importa para hacer la consulta
  return await Subcategoria.count({
    where: { categoriaId: this.id }                // this.id = ID de esta categoría
  });
};

/**
 * contarProductos() → Cuenta cuántos productos tiene esta categoría
 * Ejecuta: SELECT COUNT(*) FROM productos WHERE categoriaId = this.id
 * @returns {Promise<number>} Número de productos
 */
Categoria.prototype.contarProductos = async function() {
  const Producto = require('./Producto');
  return await Producto.count({
    where: { categoriaId: this.id }
  });
};

// Exporta el modelo Categoria para usarlo en controladores, otros modelos y seeders
// Se importa como: const Categoria = require('./Categoria')
module.exports = Categoria;
