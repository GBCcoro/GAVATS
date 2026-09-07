const fs = require('node:fs');
const path = require('node:path');
const { getDefaultProductSvg, getSvgForSubcategory } = require('./productImageSvgs');

const defaultSvg = getDefaultProductSvg();

// Rutas donde debe existir el default
const targetDirs = [
  path.join(__dirname, '../../frontend/public'),
  path.join(__dirname, '../../frontend/build'),
  path.join(__dirname, '../uploads')
];

for (const dir of targetDirs) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Guardar como producto-default.svg
  fs.writeFileSync(path.join(dir, 'producto-default.svg'), defaultSvg, 'utf8');

  // Guardar como producto-default.jpg (como SVG válido con encabezado XML para compatibilidad en navegadores y tags img)
  fs.writeFileSync(path.join(dir, 'producto-default.jpg'), defaultSvg, 'utf8');
  fs.writeFileSync(path.join(dir, 'producto-default.png'), defaultSvg, 'utf8');

  if (dir.includes('uploads')) {
    fs.writeFileSync(path.join(dir, 'default.jpg'), defaultSvg, 'utf8');
    fs.writeFileSync(path.join(dir, 'default.png'), defaultSvg, 'utf8');
    fs.writeFileSync(path.join(dir, 'default.svg'), defaultSvg, 'utf8');
  }
}

console.log('✅ Archivos de imagen por defecto generados en frontend/public, frontend/build y backend/uploads');
