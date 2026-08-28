/* eslint-disable no-undef */
/**
 * ============================================
 * ADMIN PRODUCTOS PAGE
 * ============================================
 * Gestión CRUD de productos con tabla responsiva,
 * selección múltiple y ventana de confirmación compacta.
 */

import React, { useEffect, useState, useMemo, useCallback, memo, useRef } from 'react';
import { Container, Card, Table, Button, Modal, Form, Alert, Badge, Row, Col, Dropdown, ButtonGroup, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getImageUrl } from '../../utils/helpers';
import { exportarProductosAPDF, exportarProductosAExcel } from '../../utils/exportUtils';

// Componente memoizado para imágenes de productos
const ProductImage = memo(({ imagen, nombre }) => {
  const [imgSrc, setImgSrc] = useState(() => getImageUrl(imagen));
  const hasError = useRef(false);

  useEffect(() => {
    hasError.current = false;
    setImgSrc(getImageUrl(imagen));
  }, [imagen]);

  const handleImageError = useCallback(() => {
    if (!hasError.current) {
      hasError.current = true;
      setImgSrc('/producto-default.jpg');
    }
  }, []);

  return (
    <img
      src={imgSrc}
      alt={nombre}
      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
      className="rounded"
      onError={handleImageError}
    />
  );
});

ProductImage.displayName = 'ProductImage';

const AdminProductosPage = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [imagenArchivo, setImagenArchivo] = useState(null);
  const [previewImagen, setPreviewImagen] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [tipoExportacion, setTipoExportacion] = useState('pdf');
  
  // Estados para filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroSubcategoria, setFiltroSubcategoria] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 25;
  
  // Estado para selección de productos
  const [seleccionados, setSeleccionados] = useState(new Set());

  // Estado para modal de confirmación en pantalla (en reemplazo de alerts/confirms)
  const [modalConfirmacion, setModalConfirmacion] = useState({
    show: false,
    titulo: '',
    mensaje: '',
    tipo: 'danger',
    icono: 'trash3-fill',
    textoConfirmar: 'Confirmar',
    textoCancelar: 'Cancelar',
    onConfirm: null,
    onCancel: null
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    stock: '',
    categoriaId: '',
    subcategoriaId: '',
    activo: true
  });
  
  const fileInputRef = useRef(null);
  
  // Productos filtrados
  const productosFiltrados = useMemo(() => {
    return productos.filter(prod => {
      // Filtro de búsqueda
      const coincideBusqueda = busqueda === '' || 
        prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        prod.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
      // Filtro de categoría
      const coincideCategoria = filtroCategoria === '' || prod.categoriaId === Number.parseInt(filtroCategoria);
      
      // Filtro de subcategoría
      const coincideSubcategoria = filtroSubcategoria === '' || prod.subcategoriaId === Number.parseInt(filtroSubcategoria);
      
      // Filtro de precio
      const min = precioMin === '' ? 0 : Number.parseFloat(precioMin);
      const max = precioMax === '' ? Infinity : Number.parseFloat(precioMax);
      const coincidePrecio = prod.precio >= min && prod.precio <= max;
      
      return coincideBusqueda && coincideCategoria && coincideSubcategoria && coincidePrecio;
    }).sort((a, b) => a.id - b.id);
  }, [productos, busqueda, filtroCategoria, filtroSubcategoria, precioMin, precioMax]);

  // Cálculo de paginación
  const totalPaginas = Math.ceil(productosFiltrados.length / ITEMS_POR_PAGINA);
  const indiceInicio = (paginaActual - 1) * ITEMS_POR_PAGINA;
  const indiceFin = indiceInicio + ITEMS_POR_PAGINA;
  const productosPaginados = useMemo(() => {
    return productosFiltrados.slice(indiceInicio, indiceFin);
  }, [productosFiltrados, indiceInicio, indiceFin]);

  // Limpiar mensaje automáticamente
  useEffect(() => {
    if (mensaje.texto) {
      const timer = setTimeout(() => {
        setMensaje({ tipo: '', texto: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  // Resetear a página 1 cuando cambien los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroCategoria, filtroSubcategoria, precioMin, precioMax]);

  useEffect(() => {
    if (totalPaginas > 0 && paginaActual > totalPaginas) {
      setPaginaActual(totalPaginas);
    }
  }, [paginaActual, totalPaginas]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodResponse, catResponse, subcatResponse] = await Promise.all([
        api.get('/admin/productos?limite=1000'),
        api.get('/admin/categorias'),
        api.get('/admin/subcategorias')
      ]);
      
      const productos = prodResponse.data?.data?.productos || prodResponse.data?.productos || prodResponse.data?.data || [];
      const categorias = catResponse.data?.data?.categorias || catResponse.data?.categorias || catResponse.data?.data || [];
      const subcategorias = subcatResponse.data?.data?.subcategorias || subcatResponse.data?.subcategorias || subcatResponse.data?.data || [];
      
      // Pequeño delay para suavizar la renderización
      setTimeout(() => {
        setProductos(Array.isArray(productos) ? productos : []);
        setCategorias(Array.isArray(categorias) ? categorias : []);
        setSubcategorias(Array.isArray(subcategorias) ? subcategorias : []);
        setLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setMensaje({ tipo: 'danger', texto: 'Error al cargar los datos' });
      setProductos([]);
      setCategorias([]);
      setSubcategorias([]);
      setLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleShowModal = (producto = null) => {
    if (producto) {
      setEditando(producto);
      setFormData({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        precio: producto.precio,
        stock: producto.stock,
        categoriaId: producto.categoriaId || '',
        subcategoriaId: producto.subcategoriaId || '',
        activo: producto.activo
      });
      setImagenArchivo(null);
      setPreviewImagen(producto.imagen ? getImageUrl(producto.imagen) : '');
    } else {
      setEditando(null);
      setFormData({
        nombre: '',
        descripcion: '',
        precio: '',
        stock: '',
        categoriaId: '',
        subcategoriaId: '',
        activo: true
      });
      setImagenArchivo(null);
      setPreviewImagen('');
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      stock: '',
      categoriaId: '',
      subcategoriaId: '',
      activo: true
    });
    setImagenArchivo(null);
    setPreviewImagen('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = value;
    
    // Convertir a número para los campos de ID
    if ((name === 'categoriaId' || name === 'subcategoriaId') && value !== '') {
      finalValue = Number.parseInt(value, 10);
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : finalValue
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImagenArchivo(file);

    if (file) {
      setPreviewImagen(URL.createObjectURL(file));
    } else if (editando?.imagen) {
      setPreviewImagen(getImageUrl(editando.imagen));
    } else {
      setPreviewImagen('');
    }
  };

  const handleQuitarImagen = (e) => {
    e.stopPropagation();
    setImagenArchivo(null);
    setPreviewImagen('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre);
      formDataToSend.append('descripcion', formData.descripcion || '');
      formDataToSend.append('precio', String(Number.parseFloat(formData.precio)));
      formDataToSend.append('stock', String(Number.parseInt(formData.stock, 10)));
      formDataToSend.append('categoriaId', String(formData.categoriaId));
      if (formData.subcategoriaId) {
        formDataToSend.append('subcategoriaId', String(formData.subcategoriaId));
      }
      formDataToSend.append('activo', String(formData.activo));

      if (imagenArchivo) {
        formDataToSend.append('imagen', imagenArchivo);
      }

      if (editando) {
        await api.put(`/admin/productos/${editando.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMensaje({ tipo: 'success', texto: 'Producto actualizado exitosamente' });
      } else {
        await api.post('/admin/productos', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setMensaje({ tipo: 'success', texto: 'Producto creado exitosamente' });
      }

      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      setMensaje({ 
        tipo: 'danger', 
        texto: error.response?.data?.message || 'Error al guardar el producto' 
      });
    }
  };

  // Manejo de selección
  const todosPaginaSeleccionados = useMemo(() => {
    return productosPaginados.length > 0 && productosPaginados.every(p => seleccionados.has(p.id));
  }, [productosPaginados, seleccionados]);

  const handleToggleSeleccionarTodos = () => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (todosPaginaSeleccionados) {
        productosPaginados.forEach(p => nuevo.delete(p.id));
      } else {
        productosPaginados.forEach(p => nuevo.add(p.id));
      }
      return nuevo;
    });
  };

  const toggleSeleccionarProducto = (id) => {
    setSeleccionados(prev => {
      const nuevo = new Set(prev);
      if (nuevo.has(id)) {
        nuevo.delete(id);
      } else {
        nuevo.add(id);
      }
      return nuevo;
    });
  };

  // Confirmación en pantalla para eliminar producto individual (DELETE)
  const solicitarEliminar = (producto) => {
    setModalConfirmacion({
      show: true,
      titulo: '¿Eliminar producto?',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/productos/${producto.id}`);
          
          // Eliminar de inmediato del estado local
          setProductos(prev => prev.filter(p => p.id !== producto.id));
          setSeleccionados(prev => {
            const nuevo = new Set(prev);
            nuevo.delete(producto.id);
            return nuevo;
          });
          
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Producto "${producto.nombre}" eliminado exitosamente` 
          });
          
          await loadData();
        } catch (error) {
          console.error('Error al eliminar producto:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || error.response?.data?.error || 'Error al eliminar el producto' 
          });
        }
      }
    });
  };

  // Confirmación en pantalla para cambiar estado individual (UPDATE / TOGGLE)
  const solicitarCambioEstado = (producto) => {
    const nuevoEstado = !producto.activo;
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? '¿Activar producto?' : '¿Desactivar producto?',
      mensaje: `¿Deseas cambiar el estado de "${producto.nombre}" a "${nuevoEstado ? 'Activo' : 'Inactivo'}"?`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/productos/${producto.id}/toggle`);
          const nuevoEstadoRes = res.data?.data?.producto?.activo ?? nuevoEstado;
          
          setProductos(prevProductos => 
            prevProductos.map(p => 
              p.id === producto.id ? { ...p, activo: nuevoEstadoRes } : p
            )
          );
          
          setMensaje({ 
            tipo: 'success', 
            texto: res.data?.message || `Producto "${producto.nombre}" ${nuevoEstadoRes ? 'activado' : 'desactivado'} exitosamente` 
          });
        } catch (error) {
          console.error('Error al cambiar estado:', error);
          setMensaje({ 
            tipo: 'danger', 
            texto: error.response?.data?.message || 'Error al cambiar el estado del producto' 
          });
        }
      }
    });
  };

  // Confirmación en pantalla para eliminación masiva (DELETE)
  const solicitarEliminacionMasiva = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    
    setModalConfirmacion({
      show: true,
      titulo: `¿Eliminar ${count} producto${count !== 1 ? 's' : ''}?`,
      mensaje: `Se eliminarán permanentemente los ${count} productos seleccionados de la base de datos. ¿Deseas continuar?`,
      tipo: 'danger',
      icono: 'trash3-fill',
      textoConfirmar: 'Borrar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const ids = Array.from(seleccionados);
          const idsSet = new Set(ids);
          
          // Eliminar de inmediato del estado local
          setProductos(prev => prev.filter(p => !idsSet.has(p.id)));
          setSeleccionados(new Set());
          
          const resultados = await Promise.allSettled(ids.map(id => api.delete(`/admin/productos/${id}`)));
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} producto${exitosos !== 1 ? 's eliminados' : ' eliminado'} exitosamente` 
          });
          
          await loadData();
        } catch (error) {
          console.error('Error en eliminación masiva:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al eliminar los productos seleccionados' });
        }
      }
    });
  };

  // Confirmación en pantalla para cambio de estado masivo (UPDATE / TOGGLE)
  const solicitarCambioEstadoMasivo = () => {
    const count = seleccionados.size;
    if (count === 0) return;
    
    const productosSeleccionados = productos.filter(p => seleccionados.has(p.id));
    const todosActivos = productosSeleccionados.every(p => p.activo);
    const nuevoEstado = !todosActivos;
    
    setModalConfirmacion({
      show: true,
      titulo: nuevoEstado ? `¿Activar ${count} producto${count !== 1 ? 's' : ''}?` : `¿Desactivar ${count} producto${count !== 1 ? 's' : ''}?`,
      mensaje: `Se cambiará el estado de los ${count} productos seleccionados a "${nuevoEstado ? 'Activo' : 'Inactivo'}".`,
      tipo: nuevoEstado ? 'success' : 'warning',
      icono: nuevoEstado ? 'check-circle-fill' : 'x-circle-fill',
      textoConfirmar: nuevoEstado ? 'Activar' : 'Desactivar',
      textoCancelar: 'Cancelar',
      onConfirm: async () => {
        try {
          const productosParaCambiar = productosSeleccionados.filter(p => p.activo !== nuevoEstado);
          const resultados = await Promise.allSettled(
            productosParaCambiar.map(prod => api.patch(`/admin/productos/${prod.id}/toggle`))
          );
          
          const exitosos = resultados.filter(r => r.status === 'fulfilled').length;
          
          setMensaje({ 
            tipo: exitosos > 0 ? 'success' : 'danger', 
            texto: `${exitosos} de ${productosParaCambiar.length || count} producto${count !== 1 ? 's actualizados' : ' actualizado'} a ${nuevoEstado ? 'Activo' : 'Inactivo'}` 
          });
          setSeleccionados(new Set());
          loadData();
        } catch (error) {
          console.error('Error al actualizar estado masivo:', error);
          setMensaje({ tipo: 'danger', texto: 'Error al cambiar estado de los productos' });
        }
      }
    });
  };

  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(precio);
  };

  // Subcategorías para el formulario (basadas en categoría seleccionada en formData)
  const subcategoriasFiltradas = useMemo(() => {
    return subcategorias.filter(sub => sub.categoriaId === Number.parseInt(formData.categoriaId));
  }, [subcategorias, formData.categoriaId]);

  if (loading) {
    return <LoadingSpinner message="Cargando productos..." />;
  }

  return (
    <Container className="py-4">
      {/* Header Toolbar */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1 fw-bold text-navy">
            <i className="bi bi-box-seam me-2 text-gold"></i>{' '}
            Gestión de Productos
          </h1>
          <p className="text-muted mb-0">
            Total: {productosFiltrados.length} de {productos.length} producto{productos.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Dropdown as={ButtonGroup}>
            <Button
              variant="primary"
              onClick={async () => {
                setTipoExportacion('pdf');
                exportarProductosAPDF(productosFiltrados);
              }}
            >
              <i className={`bi bi-file-earmark-${tipoExportacion === 'pdf' ? 'pdf' : 'excel'} me-1`}></i>
              Exportar a {tipoExportacion === 'pdf' ? 'PDF' : 'Excel'}
            </Button>
            <Dropdown.Toggle split variant="primary" />
            <Dropdown.Menu>
              <Dropdown.Item 
                onClick={() => {
                  setTipoExportacion('pdf');
                  exportarProductosAPDF(productosFiltrados);
                }}
              >
                <i className="bi bi-file-earmark-pdf me-2"></i>{' '}
                Exportar a PDF
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={async () => {
                  setTipoExportacion('excel');
                  await exportarProductosAExcel(productosFiltrados);
                }}
              >
                <i className="bi bi-file-earmark-excel me-2"></i>
                {' '}Exportar a Excel
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button variant="outline-secondary" onClick={() => navigate('/admin/dashboard')}>
            <i className="bi bi-arrow-left me-1"></i>{' '}
            Volver
          </Button>
          <Button variant="primary" onClick={() => handleShowModal()}>
            <i className="bi bi-plus-circle me-1"></i>{' '}
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Notificación flotante inferior izquierda (se mueve con el usuario) */}
      {mensaje.texto && (
        <div className="toast-floating-container-bottom-left">
          <Alert 
            variant={mensaje.tipo} 
            dismissible 
            onClose={() => setMensaje({ tipo: '', texto: '' })}
            className={`toast-floating-alert alert-${mensaje.tipo} mb-0`}
          >
            <i className={`bi bi-${
              mensaje.tipo === 'success' ? 'check-circle-fill text-success' :
              mensaje.tipo === 'danger' ? 'exclamation-octagon-fill text-danger' :
              mensaje.tipo === 'warning' ? 'exclamation-triangle-fill text-warning' :
              'info-circle-fill text-info'
            } fs-5 flex-shrink-0`} />
            <div className="flex-grow-1 fw-medium text-start">
              {mensaje.texto}
            </div>
          </Alert>
        </div>
      )}

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <h5 className="mb-3">
            <i className="bi bi-funnel me-2"></i>{' '}
            Filtros
          </h5>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small mb-1">Buscar</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Nombre o descripción..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small mb-1">Categoría</Form.Label>
                <Form.Select
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setFiltroSubcategoria('');
                  }}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.filter(c => c.activo).map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small mb-1">Subcategoría</Form.Label>
                <Form.Select
                  value={filtroSubcategoria}
                  onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  disabled={!filtroCategoria}
                >
                  <option value="">Todas las subcategorías</option>
                  {filtroCategoria && subcategorias
                    .filter(s => s.categoriaId === Number.parseInt(filtroCategoria, 10) && s.activo)
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="small mb-1">Rango de Precio</Form.Label>
                <Row className="g-2">
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Mínimo"
                      value={precioMin}
                      onChange={(e) => setPrecioMin(e.target.value)}
                      min="0"
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Control
                      type="number"
                      placeholder="Máximo"
                      value={precioMax}
                      onChange={(e) => setPrecioMax(e.target.value)}
                      min="0"
                    />
                  </Col>
                </Row>
              </Form.Group>
            </Col>
            <Col md={12}>
              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={() => {
                  setBusqueda('');
                  setFiltroCategoria('');
                  setFiltroSubcategoria('');
                  setPrecioMin('');
                  setPrecioMax('');
                  setPaginaActual(1);
                }}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>{' '}
                Limpiar filtros
              </button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Barra de Selección y Acciones Masivas */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 p-2 px-3 bg-white rounded-3 shadow-sm border admin-selection-bar">
        <div className="d-flex align-items-center gap-2">
          <Button
            variant={todosPaginaSeleccionados ? 'primary' : 'outline-primary'}
            size="sm"
            className="d-inline-flex align-items-center gap-1 fw-semibold"
            onClick={handleToggleSeleccionarTodos}
            title={todosPaginaSeleccionados ? 'Deseleccionar todos los de esta página' : 'Seleccionar todos los de esta página'}
          >
            <i className={`bi bi-${todosPaginaSeleccionados ? 'check-square-fill' : 'square'}`}></i>
            <span>{todosPaginaSeleccionados ? 'Deseleccionar página' : `Seleccionar todo (${productosPaginados.length})`}</span>
          </Button>
          {seleccionados.size > 0 && (
            <Badge bg="danger" className="p-2 d-flex align-items-center gap-1 fs-7">
              <i className="bi bi-check-circle-fill"></i> {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        {seleccionados.size > 0 && (
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Button
              variant="outline-warning"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarCambioEstadoMasivo}
              title="Activar o desactivar los productos seleccionados"
            >
              <i className="bi bi-arrow-repeat"></i>
              <span>Activar / Desactivar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="d-inline-flex align-items-center gap-1 fw-semibold"
              onClick={solicitarEliminacionMasiva}
              title="Eliminar los productos seleccionados"
            >
              <i className="bi bi-trash-fill"></i>
              <span>Eliminar ({seleccionados.size})</span>
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => setSeleccionados(new Set())}
              title="Limpiar selección"
            >
              <i className="bi bi-x-lg me-1"></i> Deseleccionar
            </Button>
          </div>
        )}
      </div>

      <Card className="shadow-sm border-0 admin-card-table">
        <Card.Body className="p-0">
          <Table responsive hover className="admin-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th className="d-none d-sm-table-cell" style={{ width: '65px' }}>Imagen</th>
                <th>Nombre</th>
                <th className="d-none d-lg-table-cell" style={{ width: '160px' }}>Categoría</th>
                <th className="d-none d-sm-table-cell" style={{ width: '115px' }}>Precio</th>
                <th className="d-none d-md-table-cell" style={{ width: '80px' }}>Stock</th>
                <th className="d-none d-md-table-cell" style={{ width: '95px' }}>Estado</th>
                <th className="text-center" style={{ width: '130px', minWidth: '100px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    No hay productos registrados
                  </td>
                </tr>
              ) : (
                productosPaginados.map((prod) => {
                  let stockBadgeBg = 'danger';
                  if (prod.stock > 10) {
                    stockBadgeBg = 'success';
                  } else if (prod.stock > 0) {
                    stockBadgeBg = 'warning';
                  }

                  const estaSeleccionado = seleccionados.has(prod.id);

                  return (
                    <tr 
                      key={prod.id}
                      onClick={() => toggleSeleccionarProducto(prod.id)}
                      className={`fila-producto ${estaSeleccionado ? 'fila-producto-seleccionada' : ''}`}
                      title="Haz clic para seleccionar/deseleccionar este producto"
                    >
                      <td className="align-middle fw-bold">
                        <div className="d-flex align-items-center gap-2">
                          <i 
                            className={`bi bi-${estaSeleccionado ? 'check-circle-fill text-danger' : 'circle text-muted'} fs-6 d-inline-block`}
                            style={{ cursor: 'pointer' }}
                          />
                          <span>{prod.id}</span>
                        </div>
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">
                        <ProductImage imagen={prod.imagen} nombre={prod.nombre} />
                      </td>
                      <td className="align-middle fw-bold">
                        <div>{prod.nombre}</div>
                        <small className="d-lg-none text-muted d-block">
                          {prod.categoria?.nombre || 'Sin categoría'}
                        </small>
                      </td>
                      <td className="align-middle d-none d-lg-table-cell">
                        <Badge bg="info">{prod.categoria?.nombre || 'N/A'}</Badge>
                        {prod.subcategoria && (
                          <><br /><small className="text-muted">{prod.subcategoria.nombre}</small></>
                        )}
                      </td>
                      <td className="align-middle d-none d-sm-table-cell">{formatearPrecio(prod.precio)}</td>
                      <td className="align-middle d-none d-md-table-cell">
                        <Badge bg={stockBadgeBg}>
                          {prod.stock}
                        </Badge>
                      </td>
                      <td className="align-middle d-none d-md-table-cell">
                        <Badge bg={prod.activo ? 'success' : 'secondary'}>
                          {prod.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="align-middle text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="action-btn-group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShowModal(prod);
                            }}
                            title="Editar producto"
                          >
                            <i className="bi bi-pencil" />
                            <span className="btn-text">Editar</span>
                          </Button>
                          <Button
                            variant={prod.activo ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarCambioEstado(prod);
                            }}
                            title={prod.activo ? 'Desactivar producto' : 'Activar producto'}
                          >
                            <i className={`bi bi-${prod.activo ? 'x-circle' : 'check-circle'}`} />
                            <span className="btn-text">{prod.activo ? 'Desactivar' : 'Activar'}</span>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="btn-action-table"
                            onClick={(e) => {
                              e.stopPropagation();
                              solicitarEliminar(prod);
                            }}
                            title="Eliminar producto"
                          >
                            <i className="bi bi-trash" />
                            <span className="btn-text">Eliminar</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </Card.Body>
        <Card.Footer className="text-muted">
          <div className="d-flex justify-content-between align-items-center">
            <small>
              <i className="bi bi-file-text me-1"></i>{' '}
              Mostrando <strong>{productosFiltrados.length === 0 ? '0-0' : `${indiceInicio + 1}-${Math.min(indiceFin, productosFiltrados.length)}`}</strong> de <strong>{productosFiltrados.length}</strong> producto{productosFiltrados.length !== 1 ? 's' : ''}
            </small>
            
            {/* Controles de paginación */}
            <div className="d-flex gap-2 align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={paginaActual === 1}
                onClick={() => setPaginaActual(prev => Math.max(1, prev - 1))}
              >
                <i className="bi bi-arrow-left" />
              </Button>
              
              <span className="text-nowrap">
                Página <strong>{paginaActual}</strong> de <strong>{totalPaginas || 1}</strong>
              </span>
              
              <Button
                variant="outline-secondary"
                size="sm"
                disabled={paginaActual >= totalPaginas}
                onClick={() => setPaginaActual(prev => prev + 1)}
              >
                <i className="bi bi-arrow-right" />
              </Button>
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal para crear/editar producto (Diseño Minimalista) */}
      <Modal 
        show={showModal} 
        onHide={handleCloseModal} 
        centered 
        dialogClassName="modal-producto-form"
        backdrop="static"
      >
        <div className="product-minimal-header">
          <div>
            <h6 className="fw-bold mb-0 text-navy fs-6">
              {editando ? 'Editar Producto' : 'Nuevo Producto'}
            </h6>
            <small className="text-muted" style={{ fontSize: '0.8rem' }}>
              {editando ? `ID #${editando.id} — ${editando.nombre}` : 'Ingresa los datos para registrar el producto'}
            </small>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={handleCloseModal}
            aria-label="Cerrar"
          />
        </div>

        <Form onSubmit={handleSubmit}>
          <Modal.Body className="p-3 p-sm-4">
            {/* Cabecera del formulario: Avatar de Imagen + Nombre del Producto */}
            <div className="d-flex gap-3 align-items-center mb-3">
              <div className="d-flex flex-column align-items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="d-none"
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                  onChange={handleImagenChange}
                />
                <div 
                  className={`product-minimal-avatar-box ${previewImagen ? 'has-img' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  title="Haz clic para seleccionar o cambiar imagen"
                >
                  {previewImagen ? (
                    <>
                      <img
                        src={previewImagen}
                        alt="Vista previa"
                        onError={(e) => {
                          e.target.src = '/producto-default.jpg';
                        }}
                      />
                      <div className="product-minimal-avatar-overlay">
                        <i className="bi bi-camera-fill fs-6 mb-1" />
                        <span>Cambiar</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-camera text-secondary fs-4 d-block mb-0" />
                      <span style={{ fontSize: '0.65rem' }} className="fw-semibold text-secondary">FOTO</span>
                    </div>
                  )}
                </div>

                {previewImagen ? (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-danger text-decoration-none mt-1 d-flex align-items-center gap-1"
                    style={{ fontSize: '0.72rem' }}
                    onClick={handleQuitarImagen}
                    title="Quitar imagen seleccionada"
                  >
                    <i className="bi bi-x-circle" /> Quitar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-link btn-sm p-0 text-primary text-decoration-none mt-1"
                    style={{ fontSize: '0.72rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Subir foto
                  </button>
                )}
              </div>

              <div className="flex-grow-1">
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Nombre del Producto <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Ej: Camiseta Oversize, Zapatillas..."
                    className="product-minimal-input"
                  />
                </Form.Group>
              </div>
            </div>

            {/* Categoría y Subcategoría */}
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Categoría <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="categoriaId"
                    value={formData.categoriaId}
                    onChange={(e) => {
                      handleChange(e);
                      setFormData(prev => ({ ...prev, subcategoriaId: '' }));
                    }}
                    required
                    className="product-minimal-input"
                  >
                    <option value="">Selecciona categoría...</option>
                    {categorias.filter(c => c.activo).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Subcategoría {!editando && <span className="text-danger">*</span>}
                  </Form.Label>
                  <Form.Select
                    name="subcategoriaId"
                    value={formData.subcategoriaId}
                    onChange={handleChange}
                    disabled={!formData.categoriaId || subcategoriasFiltradas.length === 0}
                    required={!editando}
                    className="product-minimal-input"
                  >
                    <option value="">
                      {!formData.categoriaId 
                        ? 'Elige categoría primero' 
                        : subcategoriasFiltradas.length === 0 
                          ? 'Sin subcategorías' 
                          : 'Selecciona subcategoría...'}
                    </option>
                    {subcategoriasFiltradas
                      .filter(s => s.activo)
                      .map((sub) => (
                        <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                      ))
                    }
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Precio y Stock */}
            <Row className="g-3 mb-3">
              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Precio ($) <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light border-end-0 text-muted" style={{ borderRadius: '8px 0 0 8px', fontSize: '0.9rem' }}>
                      $
                    </InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="precio"
                      value={formData.precio}
                      onChange={handleChange}
                      required
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className="product-minimal-input border-start-0"
                      style={{ borderRadius: '0 8px 8px 0' }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>

              <Col sm={6}>
                <Form.Group>
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Stock Disponible <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="0"
                    className="product-minimal-input"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Descripción */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary mb-1">
                Descripción
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles sobre características o materiales (opcional)..."
                className="product-minimal-input"
              />
            </Form.Group>

            {/* Estado Activo */}
            <div className="pt-1">
              <Form.Check
                type="switch"
                id="minimal-switch-activo"
                label="Producto activo (visible en catálogo para clientes)"
                checked={formData.activo}
                onChange={handleChange}
                name="activo"
                className="small text-secondary fw-medium"
              />
            </div>
          </Modal.Body>

          <div className="product-minimal-footer">
            <button 
              type="button"
              onClick={handleCloseModal}
              className="btn-minimal-cancel"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="btn-minimal-submit"
            >
              <i className={`bi bi-${editando ? 'check2' : 'plus-lg'}`} />
              {editando ? 'Actualizar Producto' : 'Guardar Producto'}
            </button>
          </div>
        </Form>
      </Modal>

      {/* Modal de Confirmación Compacto con estilo Dashboard */}
      <Modal 
        show={modalConfirmacion.show} 
        onHide={() => setModalConfirmacion(prev => ({ ...prev, show: false }))} 
        centered
        backdrop="static"
        dialogClassName="modal-confirmacion-compacto"
      >
        <Modal.Body className="text-center p-3 p-sm-4">
          <div 
            className={`confirm-icon-wrapper mb-3 mx-auto bg-${modalConfirmacion.tipo === 'danger' ? 'danger-subtle' : modalConfirmacion.tipo === 'warning' ? 'warning-subtle' : 'success-subtle'} text-${modalConfirmacion.tipo}`}
          >
            <i className={`bi bi-${modalConfirmacion.icono || 'exclamation-circle-fill'} confirm-icon`} />
          </div>
          
          <h5 className="fw-bold text-navy mb-2 fs-5">
            {modalConfirmacion.titulo}
          </h5>
          
          <p className="text-muted small mb-3 mb-sm-4 px-1" style={{ maxWidth: '300px', margin: '0 auto' }}>
            {modalConfirmacion.mensaje}
          </p>

          <div className="d-flex gap-2 justify-content-center w-100 mt-2">
            <Button 
              variant="outline-secondary" 
              className="px-3 py-2 fw-semibold flex-fill"
              onClick={() => {
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (modalConfirmacion.onCancel) modalConfirmacion.onCancel();
              }}
            >
              {modalConfirmacion.textoCancelar || 'Cancelar'}
            </Button>
            <Button 
              variant={modalConfirmacion.tipo || 'primary'} 
              className="px-3 py-2 fw-semibold flex-fill shadow-sm"
              onClick={async () => {
                const action = modalConfirmacion.onConfirm;
                setModalConfirmacion(prev => ({ ...prev, show: false }));
                if (action) await action();
              }}
            >
              {modalConfirmacion.textoConfirmar || 'Confirmar'}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Estilos locales para selección de productos y modal compacto */}
      <style>{`
        .modal-confirmacion-compacto {
          width: auto !important;
          max-width: min(92vw, 360px) !important;
          margin: 1.5rem auto !important;
        }
        .modal-confirmacion-compacto .modal-content {
          border: none !important;
          border-radius: 1.25rem !important;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25) !important;
          overflow: hidden !important;
          background: #ffffff !important;
          width: auto !important;
        }
        .modal-confirmacion-compacto .modal-body {
          padding: 1.5rem !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
        }
        .modal-producto-form {
          max-width: min(92vw, 560px) !important;
          margin: 1.5rem auto !important;
        }
        .modal-producto-form .modal-content {
          border: none !important;
          border-radius: 1rem !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2) !important;
          overflow: hidden !important;
        }
        .confirm-icon-wrapper {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .confirm-icon-wrapper .confirm-icon {
          font-size: 1.75rem;
          line-height: 1;
        }
        .bg-danger-subtle {
          background-color: rgba(220, 53, 69, 0.12) !important;
        }
        .bg-warning-subtle {
          background-color: rgba(255, 193, 7, 0.18) !important;
        }
        .bg-success-subtle {
          background-color: rgba(25, 135, 84, 0.12) !important;
        }
        .fila-producto {
          cursor: pointer;
          transition: background-color 0.15s ease, box-shadow 0.15s ease;
          user-select: none;
        }
        .fila-producto:hover {
          background-color: rgba(245, 194, 113, 0.08) !important;
        }
        .fila-producto-seleccionada {
          background-color: rgba(220, 53, 69, 0.08) !important;
          box-shadow: inset 4px 0 0 #dc3545, inset -4px 0 0 #dc3545 !important;
        }
        .fila-producto-seleccionada td {
          border-top: 2px solid #dc3545 !important;
          border-bottom: 2px solid #dc3545 !important;
        }
        .fila-producto-seleccionada td:first-child {
          border-left: 2px solid #dc3545 !important;
        }
        .fila-producto-seleccionada td:last-child {
          border-right: 2px solid #dc3545 !important;
        }
        .admin-selection-bar {
          border-left: 4px solid var(--bs-gold, #f5c271) !important;
        }
        .action-btn-group {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          flex-wrap: nowrap;
        }
        @media (max-width: 768px) {
          .action-btn-group {
            gap: 0.25rem;
          }
          .action-btn-group .btn-action-table {
            padding: 0.35rem 0.5rem !important;
            font-size: 0.85rem !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default AdminProductosPage;
