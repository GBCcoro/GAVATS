/**
 * Script para forzar la sincronización de la base de datos (DROP + CREATE)
 * Uso: desde la carpeta `backend`: node scripts/forceSync.js
 * ADVERTENCIA: Esto BORRARÁ todos los datos en las tablas y las recreará.
 */

require('dotenv').config();

const { sequelize, syncDatabase } = require('../config/database');
const { initAssociations } = require('../models');
const { runSeeders } = require('../seeders/adminSeeder');

(async () => {
  try {
    console.log('⚠️ Forzando sincronización de la base de datos (DROP + CREATE)...');

    // Inicializar asociaciones para que Sequelize cree las FKs correctamente
    initAssociations();

    // force = true -> DROP TABLES y CREATE TABLES según modelos
    const ok = await syncDatabase(true, false);

    if (!ok) {
      console.error('❌ syncDatabase devolvió false');
      process.exit(1);
    }

    console.log('✅ Tablas recreadas correctamente.');

    // Ejecutar seeders (crea admin por defecto)
    if (typeof runSeeders === 'function') {
      await runSeeders();
      console.log('✅ Seeders ejecutados correctamente.');
    }

    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error forzando sincronización:', err);
    process.exit(1);
  }
})();
