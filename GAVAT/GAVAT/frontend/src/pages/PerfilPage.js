/**
 * ============================================
 * PÁGINA DE PERFIL DEL USUARIO
 * ============================================
 * Muestra la información del usuario autenticado
 * Adaptada a cada tipo de rol: Cliente, Auxiliar, Administrador
 */

import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const PerfilPage = () => {
  const { user, isAdmin, isAuxiliar, isCliente, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    telefono: user?.telefono || '',
    direccion: user?.direccion || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile(formData);
      setSuccess('Perfil actualizado exitosamente');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const getRolBadgeColor = () => {
    if (isAdmin) return 'danger';
    if (isAuxiliar) return 'warning';
    return 'info';
  };

  const getRolLabel = () => {
    if (isAdmin) return 'Administrador';
    if (isAuxiliar) return 'Auxiliar';
    return 'Cliente';
  };

  const getProfileIcon = () => {
    if (isAdmin) return '👨‍💼';
    if (isAuxiliar) return '👤';
    return '👨‍💻';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Container className="perfil-page py-5">
      <Row className="mb-4">
        <Col xs={12} md={8} className="mx-auto">
          {/* Encabezado con avatar */}
          <div className="perfil-header mb-4">
            <div className="perfil-avatar">
              <span className="avatar-icon">{getProfileIcon()}</span>
            </div>
            <div className="perfil-header-info">
              <h1 className="perfil-nombre">{user?.nombre || 'Usuario'}</h1>
              <span className={`badge bg-${getRolBadgeColor()} perfil-rol`}>
                {getRolLabel()}
              </span>
            </div>
          </div>

          {/* Alertas */}
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {/* Tarjeta de información */}
          <Card className="perfil-card shadow-sm">
            <Card.Body className="p-4">
              <div className="perfil-info">
                
                {/* Sección Email */}
                <div className="perfil-item">
                  <div className="perfil-item-icon">
                    <i className="bi bi-envelope" aria-hidden="true" />
                  </div>
                  <div className="perfil-item-content">
                    <span className="perfil-item-label">Correo Electrónico</span>
                    <p className="perfil-item-value">{user?.email}</p>
                  </div>
                </div>

                {/* Sección Nombre */}
                {!isEditing ? (
                  <div className="perfil-item">
                    <div className="perfil-item-icon">
                      <i className="bi bi-person" aria-hidden="true" />
                    </div>
                    <div className="perfil-item-content">
                      <span className="perfil-item-label">Nombre Completo</span>
                      <p className="perfil-item-value">{user?.nombre || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="perfil-item">
                    <div className="perfil-item-icon">
                      <i className="bi bi-person" aria-hidden="true" />
                    </div>
                    <div className="perfil-item-content w-100">
                      <Form.Label className="perfil-item-label" htmlFor="perfil-nombre">
                        Nombre Completo
                      </Form.Label>
                      <Form.Control
                        id="perfil-nombre"
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu nombre"
                      />
                    </div>
                  </div>
                )}

                {/* Sección Teléfono */}
                {!isEditing ? (
                  <div className="perfil-item">
                    <div className="perfil-item-icon">
                      <i className="bi bi-telephone" aria-hidden="true" />
                    </div>
                    <div className="perfil-item-content">
                      <span className="perfil-item-label">Teléfono</span>
                      <p className="perfil-item-value">{user?.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="perfil-item">
                    <div className="perfil-item-icon">
                      <i className="bi bi-telephone" aria-hidden="true" />
                    </div>
                    <div className="perfil-item-content w-100">
                      <Form.Label className="perfil-item-label" htmlFor="perfil-telefono">
                        Teléfono
                      </Form.Label>
                      <Form.Control
                        id="perfil-telefono"
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        placeholder="Ingresa tu teléfono"
                      />
                    </div>
                  </div>
                )}

                {/* Sección Dirección - Solo para Clientes */}
                {isCliente && (!isEditing ? (
                      <div className="perfil-item">
                        <div className="perfil-item-icon">
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                        </div>
                        <div className="perfil-item-content">
                            <span className="perfil-item-label">Dirección de Envío</span>
                          <p className="perfil-item-value">{user?.direccion || 'No especificada'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="perfil-item">
                        <div className="perfil-item-icon">
                          <i className="bi bi-geo-alt" aria-hidden="true" />
                        </div>
                        <div className="perfil-item-content w-100">
                            <Form.Label className="perfil-item-label" htmlFor="perfil-direccion">
                              Dirección de Envío
                            </Form.Label>
                          <Form.Control
                              id="perfil-direccion"
                            as="textarea"
                            rows={2}
                            name="direccion"
                            value={formData.direccion}
                            onChange={handleInputChange}
                            placeholder="Ingresa tu dirección"
                          />
                        </div>
                      </div>
                    ))}

                {/* Sección Rol */}
                <div className="perfil-item">
                  <div className="perfil-item-icon">
                    <i className="bi bi-shield" aria-hidden="true" />
                  </div>
                  <div className="perfil-item-content">
                    <span className="perfil-item-label">Rol</span>
                    <p className="perfil-item-value">
                      <span className={`badge bg-${getRolBadgeColor()}`}>
                        {getRolLabel()}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Sección Fecha de Registro */}
                <div className="perfil-item">
                  <div className="perfil-item-icon">
                    <i className="bi bi-calendar" aria-hidden="true" />
                  </div>
                  <div className="perfil-item-content">
                    <span className="perfil-item-label">Miembro desde</span>
                    <p className="perfil-item-value">{formatDate(user?.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="perfil-actions mt-4">
                {!isEditing ? (
                  <Button 
                    variant="primary" 
                    size="lg"
                    className="w-100 perfil-btn-edit"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="bi bi-pencil me-2" aria-hidden="true" />{' '}
                    Editar Perfil
                  </Button>
                ) : (
                  <div className="d-grid gap-2 d-md-flex">
                      <Button 
                        variant="success" 
                        size="lg"
                        className="flex-grow-1"
                        onClick={handleSave}
                        disabled={loading}
                      >
                        <i className="bi bi-check me-2" aria-hidden="true" />{' '}
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="lg"
                        className="flex-grow-1"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            nombre: user?.nombre || '',
                            telefono: user?.telefono || '',
                            direccion: user?.direccion || '',
                          });
                        }}
                        disabled={loading}
                      >
                        <i className="bi bi-x me-2" aria-hidden="true" />{' '}
                        Cancelar
                      </Button>
                    </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Información adicional por rol */}
          {isAdmin && (
            <Card className="perfil-card-info mt-4 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="bi bi-lock-fill me-2" aria-hidden="true" />{' '}
                  Permisos de Administrador
                </h5>
                <ul className="perfil-permissions">
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Acceso total al panel de administración
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Gestión de usuarios, categorías y productos
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Generación de facturas y reportes
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Moderación de comentarios
                  </li>
                </ul>
              </Card.Body>
            </Card>
          )}

          {isAuxiliar && (
            <Card className="perfil-card-info mt-4 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="bi bi-info-circle-fill me-2" aria-hidden="true" />{' '}
                  Permisos de Auxiliar
                </h5>
                <ul className="perfil-permissions">
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Acceso limitado al panel de administración
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Gestión de categorías, subcategorías y productos
                  </li>
                  <li>
                    <i className="bi bi-check-circle-fill me-2 text-success" aria-hidden="true" />{' '}
                    Visualización de pedidos y facturas
                  </li>
                </ul>
              </Card.Body>
            </Card>
          )}

          {isCliente && (
            <Card className="perfil-card-info mt-4 shadow-sm">
              <Card.Body>
                <h5 className="mb-3">
                  <i className="bi bi-bag-check-fill me-2" aria-hidden="true" />{' '}
                  Mi Actividad
                </h5>
                <ul className="perfil-permissions">
                  <li>
                    <i className="bi bi-cart-check me-2" aria-hidden="true" />{' '}
                    Compra productos en nuestro catálogo
                  </li>
                  <li>
                    <i className="bi bi-box-seam me-2" aria-hidden="true" />{' '}
                    Visualiza tus pedidos en "Mis Pedidos"
                  </li>
                  <li>
                    <i className="bi bi-chat-left-dots me-2" aria-hidden="true" />{' '}
                    Deja comentarios en los productos
                  </li>
                </ul>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      <style>{`
        .perfil-page {
          min-height: calc(100vh - 200px);
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
        .perfil-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          margin-bottom: 2rem;
          animation: perfil-slide-in 0.5s ease-out;
        }
        .perfil-avatar {
          width: 120px;
          height: 120px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
          flex-shrink: 0;
        }
        .avatar-icon {
          font-size: 4rem;
          line-height: 1;
        }
        .perfil-header-info {
          flex: 1;
        }
        .perfil-nombre {
          font-size: 2rem;
          font-weight: 700;
          color: #192847;
          margin: 0 0 0.5rem;
        }
        .perfil-rol {
          display: inline-block;
          padding: 0.5rem 1rem !important;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 25px;
        }
        .perfil-card {
          border: none;
          border-radius: 12px;
          overflow: hidden;
          background: white;
          animation: perfil-slide-up 0.6s ease-out;
        }
        .perfil-card:hover {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
          transition: box-shadow 0.3s ease;
        }
        .perfil-info {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .perfil-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          border-radius: 10px;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }
        .perfil-item:hover {
          background: #e9ecef;
          transform: translateX(5px);
        }
        .perfil-item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          color: white;
          font-size: 1.2rem;
          flex-shrink: 0;
        }
        .perfil-item-content {
          flex: 1;
        }
        .perfil-item-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.3rem;
        }
        .perfil-item-value {
          font-size: 1.1rem;
          color: #192847;
          font-weight: 500;
          margin: 0;
          word-break: break-word;
        }
        .perfil-item .form-control {
          border: 2px solid #667eea;
          border-radius: 8px;
          padding: 0.6rem 0.8rem;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .perfil-item .form-control:focus {
          border-color: #764ba2;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.15);
        }
        .perfil-actions {
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }
        .perfil-btn-edit {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          border-radius: 8px;
          padding: 0.8rem 1.5rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .perfil-btn-edit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }
        .perfil-btn-edit:active {
          transform: translateY(0);
        }
        .perfil-actions .btn-success,
        .perfil-actions .btn-secondary {
          border: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .perfil-actions .btn-success {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
        }
        .perfil-actions .btn-success:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(17, 153, 142, 0.3);
        }
        .perfil-actions .btn-secondary {
          background: #6c757d;
        }
        .perfil-actions .btn-secondary:hover {
          background: #5a6268;
          transform: translateY(-2px);
        }
        .perfil-card-info {
          border: none;
          border-left: 4px solid #667eea;
          border-radius: 8px;
          background: white;
          animation: perfil-slide-up 0.7s ease-out;
        }
        .perfil-card-info h5 {
          color: #192847;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .perfil-permissions {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .perfil-permissions li {
          padding: 0.7rem 0;
          color: #495057;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .perfil-permissions li:not(:last-child) {
          border-bottom: 1px solid #e9ecef;
        }
        .perfil-permissions .bi {
          flex-shrink: 0;
        }
        @keyframes perfil-slide-in {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes perfil-slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .perfil-header {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          .perfil-avatar {
            width: 100px;
            height: 100px;
          }
          .avatar-icon {
            font-size: 3rem;
          }
          .perfil-nombre {
            font-size: 1.5rem;
          }
          .perfil-item {
            gap: 0.7rem;
            padding: 0.8rem;
          }
          .perfil-item-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }
          .perfil-actions .d-md-flex {
            flex-direction: column;
          }
        }
        .perfil-page .alert {
          border-radius: 8px;
          border: none;
          margin-bottom: 1.5rem;
        }
        .perfil-page .alert-danger {
          background: #f8d7da;
          color: #721c24;
        }
        .perfil-page .alert-success {
          background: #d4edda;
          color: #155724;
        }
      `}</style>
    </Container>
  );
};

export default PerfilPage;
