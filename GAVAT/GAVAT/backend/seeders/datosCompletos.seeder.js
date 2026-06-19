/**
 * ============================================
 * SEEDER COMPLETO - GAVAT
 * ============================================
 */

const Usuario = require('../models/Usuario');
const Categoria = require('../models/Categoria');
const Subcategoria = require('../models/Subcategoria');
const Producto = require('../models/Producto');

const seedDatosCompletos = async () => {
  try {
    console.log('\nINICIANDO SEEDER GAVAT...\n');

    // ==========================================
    // 1. USUARIOS
    // ==========================================

    // ADMIN
    await Usuario.findOrCreate({
      where: { email: 'admin@gavat.com' },
      defaults: {
        nombre: 'Administrador',
        apellido: 'GAVAT',
        email: 'admin@gavat.com',
        telefono: '3001111111',
        password: 'admin123',
        rol: 'administrador',
        activo: true
      }
    });

    // AUXILIAR
    await Usuario.findOrCreate({
      where: { email: 'auxiliar@gavat.com' },
      defaults: {
        nombre: 'Auxiliar',
        apellido: 'GAVAT',
        email: 'auxiliar@gavat.com',
        telefono: '3002222222',
        password: 'aux123',
        rol: 'auxiliar',
        activo: true
      }
    });

    // CLIENTES
    for (let i = 1; i <= 5; i++) {
      await Usuario.findOrCreate({
        where: { email: `cliente${i}@gavat.com` },
        defaults: {
          nombre: `Cliente ${i}`,
          apellido: 'GAVAT',
          email: `cliente${i}@gavat.com`,
          telefono: `300000000${i}`,
          password: `cliente${i}`,
          rol: 'cliente',
          activo: true
        }
      });
    }

    console.log('✅ Usuarios creados\n');

    // ==========================================
    // 2. CATEGORIAS
    // ==========================================

    const categoriasData = [
      { nombre: 'Ventanas', descripcion: 'Instalacion de ventanas en aluminio y vidrio' },
      { nombre: 'Puertas', descripcion: 'Instalacion de puertas en vidrio y aluminio' },
      { nombre: 'Divisiones', descripcion: 'Divisiones para banos y oficinas' },
      { nombre: 'Cerramientos', descripcion: 'Cerramientos en vidrio para espacios' },
      { nombre: 'Estructuras', descripcion: 'Estructuras en aluminio y vidrio' }
    ];

    const categorias = [];

    for (const cat of categoriasData) {
      const [categoria] = await Categoria.findOrCreate({
        where: { nombre: cat.nombre },
        defaults: cat
      });
      categorias.push(categoria);
    }

    console.log('✅ Categorías creadas\n');

    // ==========================================
    // 3. SUBCATEGORIAS
    // ==================================

    const subcategoriasData = {
      'Ventanas': ['Corredizas', 'Abatibles', 'Fijas'],
      'Puertas': ['Vidrio templado', 'Corredizas', 'Batientes'],
      'Divisiones': ['Baños', 'Oficinas', 'Interiores'],
      'Cerramientos': ['Balcones', 'Terrazas', 'Locales'],
      'Estructuras': ['Aluminio', 'Vidrio', 'Mixtas']
    };

    const subcategorias = [];

    for (const categoria of categorias) {
      const subs = subcategoriasData[categoria.nombre];

      for (const nombreSub of subs) {
        const [sub] = await Subcategoria.findOrCreate({
          where: {
            nombre: nombreSub,
            categoriaId: categoria.id
          },
          defaults: {
            descripcion: `${nombreSub} en ${categoria.nombre}`,
            activo: true
          }
        });

        subcategorias.push(sub);
      }
    }

    console.log('✅ Subcategorías creadas\n');

    // ==========================================
    // 4. PRODUCTOS REALISTAS (SIN DUPLICADOS)
    // ==========================================

    console.log('CREANDO PRODUCTOS REALISTAS...\n');

    const serviciosPorSubcategoria = {
      'Corredizas': [
        'Ventana corrediza en aluminio 2 hojas',
        'Ventana corrediza en aluminio 3 hojas',
        'Ventana corrediza con vidrio templado',
        'Ventana corrediza para balcon',
        'Ventana corrediza con marco reforzado'
      ],
      'Abatibles': [
        'Ventana abatible en aluminio',
        'Ventana abatible con vidrio templado',
        'Ventana abatible tipo proyectante',
        'Ventana abatible con sistema de seguridad',
        'Ventana abatible para ventilacion'
      ],
      'Fijas': [
        'Ventana fija en vidrio templado',
        'Ventana fija panoramica',
        'Ventana fija con marco en aluminio',
        'Ventana fija decorativa',
        'Ventana fija para fachada'
      ],
      'Vidrio templado': [
        'Puerta en vidrio templado 10mm',
        'Puerta en vidrio templado con herrajes',
        'Puerta de acceso en vidrio templado',
        'Puerta en vidrio templado tipo oficina',
        'Puerta en vidrio templado con cerradura'
      ],
      'Batientes': [
        'Puerta batiente en aluminio',
        'Puerta batiente con vidrio templado',
        'Puerta batiente para interiores',
        'Puerta batiente con marco reforzado',
        'Puerta batiente de seguridad'
      ],
      'Banos': [
        'Division de bano en vidrio templado',
        'Division de bano tipo corrediza',
        'Division de bano con perfileria en aluminio',
        'Division de bano tipo cabina',
        'Division de bano con puerta abatible'
      ],
      'Oficinas': [
        'Division de oficina en vidrio',
        'Division modular para oficina',
        'Division de oficina con perfileria',
        'Division de oficina tipo panel',
        'Division de oficina acustica'
      ],
      'Interiores': [
        'Division de espacios interiores en vidrio',
        'Division decorativa en aluminio',
        'Division interior tipo panel',
        'Division interior con vidrio templado',
        'Division de ambientes modernos'
      ],
      'Balcones': [
        'Cerramiento de balcon en vidrio',
        'Cerramiento de balcon con aluminio',
        'Cerramiento panoramico de balcon',
        'Cerramiento de balcon corredizo',
        'Cerramiento de balcon tipo europeo'
      ],
      'Terrazas': [
        'Cerramiento de terraza en vidrio',
        'Cerramiento de terraza con estructura en aluminio',
        'Cerramiento de terraza tipo corredizo',
        'Cerramiento de terraza panoramico',
        'Cerramiento de terraza resistente a clima'
      ],
      'Locales': [
        'Cerramiento de local comercial en vidrio',
        'Fachada en vidrio para local',
        'Cerramiento de vitrina comercial',
        'Cerramiento de negocio con aluminio',
        'Cerramiento de local tipo moderno'
      ],
      'Aluminio': [
        'Estructura en aluminio para ventanales',
        'Estructura en aluminio para fachadas',
        'Estructura en aluminio reforzado',
        'Estructura base en aluminio para vidrio',
        'Estructura de soporte en aluminio'
      ],
      'Vidrio': [
        'Estructura en vidrio templado',
        'Instalacion de paneles de vidrio',
        'Montaje de vidrio estructural',
        'Estructura decorativa en vidrio',
        'Instalacion de vidrio de seguridad'
      ],
      'Mixtas': [
        'Estructura mixta aluminio y vidrio',
        'Montaje de fachada mixta',
        'Estructura combinada para interiores',
        'Sistema mixto para cerramientos',
        'Estructura moderna aluminio-vidrio'
      ]
    };

    for (const subcategoria of subcategorias) {
      const servicios = serviciosPorSubcategoria[subcategoria.nombre];
      if (!servicios) continue;

      for (let i = 0; i < servicios.length; i++) {
        const nombreServicio = servicios[i];

        await Producto.findOrCreate({
          where: {
            nombre: nombreServicio,
            subcategoriaId: subcategoria.id
          },
          defaults: {
            descripcion: `Servicio profesional de ${nombreServicio.toLowerCase()}`,
            precio: 250000 + (i * 70000),
            stock: 10,
            categoriaId: subcategoria.categoriaId,
            subcategoriaId: subcategoria.id,
            imagen: 'default.jpg',
            activo: true
          }
        });

        console.log(`   ✅ ${nombreServicio}`);
      }
    }

    console.log('\n✅ SEEDER GAVAT COMPLETADO\n');

  } catch (error) {
    console.error('Error en seeder:', error);
  }
};

module.exports = { seedDatosCompletos };
