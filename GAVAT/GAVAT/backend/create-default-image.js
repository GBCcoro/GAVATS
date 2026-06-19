const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
const defaultImagePath = path.join(uploadsDir, 'default.jpg');

// SVG placeholder
const svg = '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dominant-baseline="middle">Sin imagen</text></svg>';

// Escribir el archivo
fs.writeFileSync(defaultImagePath, svg);
console.log('✅ Archivo default.jpg creado en uploads/');
