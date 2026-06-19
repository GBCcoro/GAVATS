const { sequelize } = require('./config/database');
const Producto = require('./models/Producto');

async function updateProductImages() {
  try {
    // Imágenes que existen en uploads/
    const imagenes = [
      '1781559618385-imagen_2026-06-15_164015108.png',
      '1781559636552-imagen_2026-06-15_164035192.png',
      '1781559839574-imagen_2026-06-15_164358310.png',
      '1781559875617-imagen_2026-06-15_164434487.png'
    ];

    // Obtener los primeros 4 productos activos sin la imagen default
    const productos = await Producto.findAll({
      where: { activo: true },
      limit: 4,
      order: [['id', 'ASC']]
    });

    // Actualizar cada producto con una imagen
    for (let i = 0; i < productos.length; i++) {
      await productos[i].update({
        imagen: imagenes[i] || imagenes[0]
      });
      console.log(`✅ Producto ${productos[i].id} actualizado con imagen: ${imagenes[i]}`);
    }

    console.log('\n🎉 Todos los productos fueron actualizados con imágenes');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateProductImages();
