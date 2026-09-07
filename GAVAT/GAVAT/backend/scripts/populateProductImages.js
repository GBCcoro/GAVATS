const { Producto, Categoria, Subcategoria } = require('../models');
const { getSvgForSubcategory } = require('./productImageSvgs');

/**
 * Determina si la imagen actual es inválida, nula o un placeholder por defecto.
 */
function isDefaultOrInvalidImage(rawImagen) {
  if (!rawImagen) {
    return true;
  }
  if (Buffer.isBuffer(rawImagen)) {
    const text = rawImagen.toString('utf8').trim();
    return text === 'default.jpg' || rawImagen.length <= 100;
  }
  if (typeof rawImagen === 'string') {
    return rawImagen === 'default.jpg' || rawImagen === 'data:image/jpeg;base64,ZGVmYXVsdC5qcGc=';
  }
  return false;
}

/**
 * Actualiza la imagen del producto con un SVG según su subcategoría si requiere actualización.
 */
async function updateProductImageIfNeeded(producto) {
  const rawImagen = producto.getDataValue('imagen');
  const catNombre = producto.categoria?.nombre || '';
  const subcatNombre = producto.subcategoria?.nombre || '';

  if (!isDefaultOrInvalidImage(rawImagen)) {
    console.log(`ℹ️ [${producto.id}] "${producto.nombre}" ya cuenta con imagen válida.`);
    return false;
  }

  const svgContent = getSvgForSubcategory(subcatNombre, catNombre);
  const svgBuffer = Buffer.from(svgContent, 'utf8');

  await producto.update({
    imagen: svgBuffer,
    mimeType: 'image/svg+xml'
  });

  console.log(`✅ [${producto.id}] "${producto.nombre}" (${catNombre} > ${subcatNombre}) actualizado con imagen SVG.`);
  return true;
}

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
      const updated = await updateProductImageIfNeeded(producto);
      if (updated) {
        actualizados++;
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
