const { Producto, Categoria, Subcategoria } = require('../models');
const { getSvgForSubcategory, getDefaultProductSvg } = require('./productImageSvgs');

async function populateProductImages() {
  try {
    console.log('🔄 Iniciando actualización de imágenes para todos los productos...');

    const productos = await Producto.findAll({
      include: [
        { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
        { model: Subcategoria, as: 'subcategoria', attributes: ['id', 'nombre'] }
      ]
    });

    console.log(`📦 Encontrados ${productos.length} productos en la base de datos.`);

    let actualizados = 0;
    for (const producto of productos) {
      const rawImagen = producto.getDataValue('imagen');
      const catNombre = producto.categoria ? producto.categoria.nombre : '';
      const subcatNombre = producto.subcategoria ? producto.subcategoria.nombre : '';

      let shouldUpdate = false;

      // Si no tiene imagen
      if (!rawImagen) {
        shouldUpdate = true;
      } else if (Buffer.isBuffer(rawImagen)) {
        const text = rawImagen.toString('utf8').trim();
        // Si contiene texto como "default.jpg" o longitud muy pequeña
        if (text === 'default.jpg' || rawImagen.length <= 100) {
          shouldUpdate = true;
        }
      } else if (typeof rawImagen === 'string') {
        if (rawImagen === 'default.jpg' || rawImagen === 'data:image/jpeg;base64,ZGVmYXVsdC5qcGc=') {
          shouldUpdate = true;
        }
      }

      // Si es un producto con imagen corrupta o default, asignarle SVG de su subcategoría
      if (shouldUpdate) {
        const svgContent = getSvgForSubcategory(subcatNombre, catNombre);
        const svgBuffer = Buffer.from(svgContent, 'utf8');

        await producto.update({
          imagen: svgBuffer,
          mimeType: 'image/svg+xml'
        });

        actualizados++;
        console.log(`✅ [${producto.id}] "${producto.nombre}" (${catNombre} > ${subcatNombre}) actualizado con imagen SVG.`);
      } else {
        console.log(`ℹ️ [${producto.id}] "${producto.nombre}" ya cuenta con imagen válida.`);
      }
    }

    console.log(`\n🎉 Actualización completada: ${actualizados} productos actualizados.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar imágenes:', error);
    process.exit(1);
  }
}

populateProductImages();
