/**
 * ============================================
 * MODELO SUBCATEGORIA
 * ============================================
 * Define la estructura de la tabla 'subcategorias' en MySQL usando Sequelize ORM.
 * Cada subcategoría pertenece a UNA categoría padre (relación belongsTo).
 * Ejemplo: Categoría "Electrónica" → Subcategorías: "Laptops", "Teléfonos", "Tablets".
 * Si se desactiva una subcategoría, se desactivan EN CASCADA todos sus productos (hook afterUpdate).
 * No se puede crear una subcategoría en una categoría inactiva (hook beforeCreate).
 */

// Importa DataTypes de la librería 'sequelize' (paquete npm)
// Define los tipos de columnas: INTEGER, STRING, TEXT, BOOLEAN, etc.
const { DataTypes } = require('sequelize');

// Importa la instancia 'sequelize' (conexión activa a MySQL) desde config/database.js
const { sequelize } = require('../config/database');

/**
 * sequelize.define() crea el modelo que mapea a la tabla 'subcategorias'.
 * 'Subcategoria' → nombre interno del modelo en Sequelize
 */
const Subcategoria = sequelize.define('Subcategoria', {
  // ==========================================
  // COLUMNAS DE LA TABLA 'subcategorias'
  // ==========================================
  
  // Columna 'id' → Identificador único de cada subcategoría
  id: {
    type: DataTypes.INTEGER,           // Tipo INT en MySQL
    primaryKey: true,                  // Clave primaria (PK)
    autoIncrement: true,               // Auto-incrementa: 1, 2, 3...
    allowNull: false                   // No permite NULL
  },

  // Columna 'nombre' → Nombre visible de la subcategoría
  // Ejemplo: "Laptops", "Teléfonos", "Tablets"
  nombre: {
    type: DataTypes.STRING(100),       // VARCHAR(100) en MySQL → máximo 100 caracteres
    allowNull: false,                  // Obligatorio
    validate: {                        // Validaciones de Sequelize
      notEmpty: {                      // No permite cadena vacía ""
        msg: 'El nombre de la subcategoría no puede estar vacío'
      },
      len: {                           // Valida longitud
        args: [2, 100],                // Entre 2 y 100 caracteres
        msg: 'El nombre debe tener entre 2 y 100 caracteres'
      }
    }
  },

  // Columna 'descripcion' → Texto descriptivo de la subcategoría (opcional)
  descripcion: {
    type: DataTypes.TEXT,              // TEXT en MySQL → texto largo
    allowNull: true                   // Opcional: puede ser NULL
  },

  // Columna 'categoriaId' → Clave foránea (FK) que apunta a la tabla 'categorias'
  // Indica A QUÉ categoría padre pertenece esta subcategoría. Puede ser NULL si queda huérfana.
  categoriaId: {
    type: DataTypes.INTEGER,           // Tipo INT, coincide con categorias.id
    allowNull: true,                   // Permite NULL cuando la categoría padre es eliminada
    defaultValue: null,
    references: {                      // Define la FK en MySQL
      model: 'categorias',            // Tabla referenciada → tabla 'categorias'
      key: 'id'                       // Columna referenciada → categorias.id
    },
    onUpdate: 'CASCADE',              // Si cambia categorias.id → actualiza aquí
    onDelete: 'SET NULL'              // Si se elimina la categoría → queda huérfana (categoriaId = NULL)
  },

  // Columna 'activo' → Estado de la subcategoría (visible/oculta)
  // Si es false, todos los productos de esta subcategoría se ocultan del catálogo
  activo: {
    type: DataTypes.BOOLEAN,           // TINYINT(1) en MySQL → true (1) o false (0)
    allowNull: false,                  // Obligatorio
    defaultValue: true                 // Se crea activa por defecto
  },

  // Columna 'desactivadoPorPadre' → Indica si fue desactivada en cascada por su categoría padre
  desactivadoPorPadre: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }

}, {
  // ==========================================
  // OPCIONES DEL MODELO
  // ==========================================
  
  tableName: 'subcategorias',          // Nombre EXACTO de la tabla en MySQL
  timestamps: true,                    // Crea automáticamente createdAt y updatedAt
  
  // Índices → mejoran el rendimiento de las consultas SQL frecuentes
  indexes: [
    {
      // Índice simple en 'categoriaId' → acelera:
      // SELECT * FROM subcategorias WHERE categoriaId = ?
      fields: ['categoriaId']
    },
    {
      // Índice ÚNICO compuesto → el NOMBRE de la subcategoría debe ser único
      // DENTRO de la misma categoría, pero dos categorías diferentes pueden
      // tener subcategorías con el mismo nombre.
      unique: true,                    // UNIQUE → no permite combinaciones repetidas
      fields: ['nombre', 'categoriaId'],  // Columnas del índice compuesto
      name: 'nombre_categoria_unique'     // Nombre del índice en MySQL
    }
  ],
  
  // HOOKS → funciones automáticas del ciclo de vida
  hooks: {
    /**
     * beforeCreate → Se ejecuta ANTES de insertar una nueva subcategoría
     * Valida que la categoría padre exista y esté activa.
     */
    beforeCreate: async (subcategoria) => {
      if (!subcategoria.categoriaId) {
        throw new Error('Debe seleccionar una categoría para la subcategoría');
      }
      const Categoria = require('./Categoria');
      const categoria = await Categoria.findByPk(subcategoria.categoriaId);
      if (!categoria) {
        throw new Error('La categoría seleccionada no existe');
      }
      if (!categoria.activo) {
        throw new Error('No se puede crear una subcategoría en una categoría inactiva');
      }
    },

    /**
     * beforeUpdate → Se ejecuta ANTES de actualizar una subcategoría.
     * Valida que la categoría padre exista y que no se active una subcategoría
     * dentro de una categoría inactiva ni si es huérfana.
     */
    beforeUpdate: async (subcategoria) => {
      const Categoria = require('./Categoria');
      if (subcategoria.categoriaId) {
        const categoria = await Categoria.findByPk(subcategoria.categoriaId);
        if (!categoria) {
          throw new Error('La categoría seleccionada no existe');
        }
        if (!categoria.activo && subcategoria.activo) {
          throw new Error('No se puede activar una subcategoría en una categoría inactiva');
        }
        if (subcategoria.changed('categoriaId') && !categoria.activo) {
          throw new Error('No se puede mover la subcategoría a una categoría inactiva');
        }
      } else {
        // Subcategoría huérfana: PROHIBIDO ACTIVAR si no tiene categoría
        if (subcategoria.activo) {
          throw new Error('No se puede activar una subcategoría huérfana (sin categoría asignada). Asigne una categoría activa primero.');
        }
      }
    },

    /**
     * afterUpdate → Se ejecuta DESPUÉS de actualizar una subcategoría.
     * Implementa DESACTIVACIÓN Y REACTIVACIÓN EN CASCADA CON MEMORIA DE ESTADO:
     * - Al desactivar: desactiva los productos activos y los marca con desactivadoPorSubcategoria = true.
     * - Al activar: reactiva ÚNICAMENTE los productos que estuvieron activos antes de desactivar la subcategoría.
     */
    afterUpdate: async (subcategoria, options) => {
      if (subcategoria.changed('activo')) {
        const Producto = require('./Producto');
        const transaction = options.transaction;

        if (!subcategoria.activo) {
          console.log(`⚠️ Desactivando subcategoría en cascada: ${subcategoria.nombre}`);
          try {
            const productos = await Producto.findAll({
              where: { subcategoriaId: subcategoria.id },
              transaction
            });

            for (const producto of productos) {
              if (producto.activo) {
                await producto.update({
                  activo: false,
                  desactivadoPorSubcategoria: true
                }, { transaction, hooks: false });
                console.log(`  ↳ Producto desactivado por subcategoría: ${producto.nombre}`);
              }
            }
            console.log(`✅ Subcategoría y productos relacionados desactivados correctamente`);
          } catch (error) {
            console.error('❌ Error al desactivar productos relacionados:', error.message);
            throw error;
          }
        } else {
          console.log(`✅ Activando subcategoría en cascada: ${subcategoria.nombre}`);
          try {
            const Categoria = require('./Categoria');
            const categoria = await Categoria.findByPk(subcategoria.categoriaId, { transaction });

            if (categoria && categoria.activo) {
              const productosRestaurables = await Producto.findAll({
                where: {
                  subcategoriaId: subcategoria.id,
                  desactivadoPorSubcategoria: true
                },
                transaction
              });

              for (const producto of productosRestaurables) {
                // Solo se reactiva si su categoría padre tampoco lo tiene desactivado
                const puedeReactivar = !producto.desactivadoPorCategoria;
                await producto.update({
                  activo: puedeReactivar,
                  desactivadoPorSubcategoria: false
                }, { transaction, hooks: false });
                if (puedeReactivar) {
                  console.log(`  ↳ Producto reactivado por subcategoría: ${producto.nombre}`);
                }
              }
              console.log(`✅ Subcategoría y productos previamente activos reactivados correctamente`);
            }
          } catch (error) {
            console.error('❌ Error al reactivar productos de subcategoría:', error.message);
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
// Se llaman sobre UNA instancia: subcategoria.contarProductos()

/**
 * contarProductos() → Cuenta cuántos productos tiene esta subcategoría
 * Ejecuta: SELECT COUNT(*) FROM productos WHERE subcategoriaId = this.id
 * @returns {Promise<number>} Número de productos
 */
Subcategoria.prototype.contarProductos = async function() {
  const Producto = require('./Producto');   // Importa el modelo Producto
  return await Producto.count({
    where: { subcategoriaId: this.id }     // Filtra por esta subcategoría
  });
};

/**
 * obtenerCategoria() → Busca y retorna la categoría padre de esta subcategoría
 * Ejecuta: SELECT * FROM categorias WHERE id = this.categoriaId
 * @returns {Promise<Categoria>} Instancia del modelo Categoria
 */
Subcategoria.prototype.obtenerCategoria = async function() {
  const Categoria = require('./Categoria');
  return await Categoria.findByPk(this.categoriaId);  // findByPk = Find By Primary Key
};

// Exporta el modelo Subcategoria para usarlo en controladores, otros modelos y seeders
// Se importa como: const Subcategoria = require('./Subcategoria')
module.exports = Subcategoria;
