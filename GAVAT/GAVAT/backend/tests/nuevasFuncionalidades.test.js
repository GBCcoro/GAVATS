const request = require('supertest');
const app = require('../server');
const { Categoria, Subcategoria, Producto, Pedido, DetallePedido, Usuario } = require('../models');

describe('Pruebas de Nuevas Funcionalidades: Cancelados, Paginación y Eliminación en Cascada', () => {
  let adminToken = '';
  let testCategoria = null;
  let testSubcategoria = null;
  let testProducto = null;
  let testPedido = null;

  beforeAll(async () => {
    // Login como admin
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@gavat.com',
        password: 'admin123'
      });
    adminToken = loginRes.body?.data?.token || '';

    // Crear categoría, subcategoría y producto de prueba
    testCategoria = await Categoria.create({
      nombre: 'Cat_Test_Cascada_' + Date.now(),
      descripcion: 'Categoria de prueba para cascada',
      activo: true
    });

    testSubcategoria = await Subcategoria.create({
      nombre: 'Sub_Test_Cascada_' + Date.now(),
      descripcion: 'Subcategoria prueba',
      categoriaId: testCategoria.id,
      activo: true
    });

    testProducto = await Producto.create({
      nombre: 'Prod_Test_Cascada_' + Date.now(),
      descripcion: 'Producto prueba cascada',
      precio: 50000,
      stock: 10,
      categoriaId: testCategoria.id,
      subcategoriaId: testSubcategoria.id,
      activo: true
    });

    const usuarioId = loginRes.body?.data?.usuario?.id || 1;

    testPedido = await Pedido.create({
      usuarioId,
      direccionEnvio: 'Calle Test 123',
      telefono: '3001234567',
      total: 100000,
      metodoPago: 'efectivo',
      estado: 'pendiente'
    });

    await DetallePedido.create({
      pedidoId: testPedido.id,
      productoId: testProducto.id,
      cantidad: 2,
      precioUnitario: 50000,
      subtotal: 100000
    });
  });

  afterAll(async () => {
    // Limpieza
    try {
      if (testPedido) {
        await DetallePedido.destroy({ where: { pedidoId: testPedido.id } });
        await Pedido.destroy({ where: { id: testPedido.id }, force: true }).catch(() => {});
      }
      if (testProducto) {
        await DetallePedido.destroy({ where: { productoId: testProducto.id } });
        await Producto.destroy({ where: { id: testProducto.id } }).catch(() => {});
      }
      if (testSubcategoria) {
        await Subcategoria.destroy({ where: { id: testSubcategoria.id } }).catch(() => {});
      }
      if (testCategoria) {
        await Categoria.destroy({ where: { id: testCategoria.id } }).catch(() => {});
      }
    } catch (e) {
      console.warn('Error en limpieza afterAll:', e.message);
    }
  });

  test('1. Admin puede cancelar un pedido y luego reactivarlo descontando stock', async () => {
    // 1. Cancelar el pedido
    const cancelRes = await request(app)
      .put(`/api/admin/pedidos/${testPedido.id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'cancelado' });

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.data.pedido.estado).toBe('cancelado');

    // Verificar que el stock aumentó de 10 a 12
    await testProducto.reload();
    expect(testProducto.stock).toBe(12);

    // 2. Reactivar el pedido a 'pendiente'
    const reactivarRes = await request(app)
      .put(`/api/admin/pedidos/${testPedido.id}/estado`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ estado: 'pendiente' });

    expect(reactivarRes.status).toBe(200);
    expect(reactivarRes.body.data.pedido.estado).toBe('pendiente');

    // Verificar que el stock se descontó de nuevo a 10
    await testProducto.reload();
    expect(testProducto.stock).toBe(10);
  });

  test('2. Eliminar subcategoría sin parámetro eliminarProductos es rechazado indicando que tiene productos', async () => {
    const res = await request(app)
      .delete(`/api/admin/subcategorias/${testSubcategoria.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.tieneProductos).toBe(true);
  });

  test('3. Eliminar categoría sin parámetro eliminarHijos es rechazado indicando que tiene hijos', async () => {
    const res = await request(app)
      .delete(`/api/admin/categorias/${testCategoria.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.tieneHijos).toBe(true);
  });

  test('4. Eliminar categoría con eliminarHijos=true elimina productos, subcategorías y categoría', async () => {
    const res = await request(app)
      .delete(`/api/admin/categorias/${testCategoria.id}?eliminarHijos=true`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const catExiste = await Categoria.findByPk(testCategoria.id);
    const subcatExiste = await Subcategoria.findByPk(testSubcategoria.id);
    const prodExiste = await Producto.findByPk(testProducto.id);

    expect(catExiste).toBeNull();
    expect(subcatExiste).toBeNull();
    expect(prodExiste).toBeNull();
  });
});
