/**
 * ============================================
 * MODAL DE CONFIRMACIÓN COMPACTO (GAVAT)
 * ============================================
 * Componente reutilizable para diálogos de confirmación
 * (eliminar, cambiar estado, acciones críticas o con confirmación de contraseña).
 * Usado en todas las páginas administrativas y perfil para eliminar duplicidad.
 */

import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export const MODAL_BG_POR_TIPO = Object.freeze({
  danger: 'danger-subtle',
  warning: 'warning-subtle',
  primary: 'primary-subtle',
  info: 'primary-subtle',
  success: 'success-subtle',
});

export const getBgModalConfirmacion = (tipo) => MODAL_BG_POR_TIPO[tipo] || 'primary-subtle';

const ModalConfirmacion = ({
  modal,
  onClose,
  onCerrar,
  passwordAdmin: passwordAdminProp,
  setPasswordAdmin: setPasswordAdminProp
}) => {
  const [internalPassword, setInternalPassword] = useState('');
  const passwordAdmin = passwordAdminProp !== undefined ? passwordAdminProp : internalPassword;
  const setPasswordAdmin = setPasswordAdminProp !== undefined ? setPasswordAdminProp : setInternalPassword;
  const cerrar = onClose || onCerrar || (() => {});

  if (!modal) return null;

  const bgClass = MODAL_BG_POR_TIPO[modal.tipo] || 'primary-subtle';

  const handleCancelar = () => {
    cerrar();
    setPasswordAdmin('');
    if (modal.onCancel) modal.onCancel();
  };

  const handleConfirmar = async () => {
    const action = modal.onConfirm;
    const pwd = passwordAdmin;
    cerrar();
    setPasswordAdmin('');
    if (action) {
      await action(pwd);
    }
  };

  return (
    <Modal 
      show={Boolean(modal.show)} 
      onHide={handleCancelar} 
      centered
      backdrop="static"
      dialogClassName="modal-confirmacion-compacto"
    >
      <Modal.Body className="text-center p-3 p-sm-4">
        <div 
          className={`confirm-icon-wrapper mb-3 mx-auto bg-${bgClass} text-${modal.tipo || 'primary'}`}
        >
          <span className={`bi bi-${modal.icono || 'trash3-fill'} confirm-icon`} aria-hidden="true" />
        </div>
        
        <h5 className="fw-bold text-navy mb-2 fs-5">
          {modal.titulo}
        </h5>
        
        <p className="text-muted small mb-3 mb-sm-4 px-1" style={{ maxWidth: '340px', margin: '0 auto' }}>
          {modal.mensaje}
        </p>

        {modal.requierePassword && (
          <div className="mb-3 text-start px-2" style={{ maxWidth: '340px', margin: '0 auto' }}>
            <label htmlFor="input-password-admin" className="small fw-semibold text-navy mb-1">
              Contraseña actual de Administrador
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <span className="bi bi-lock text-muted" aria-hidden="true" />
              </span>
              <input
                id="input-password-admin"
                type="password"
                className="form-control border-start-0"
                placeholder="Ingresa tu contraseña"
                value={passwordAdmin}
                onChange={(e) => setPasswordAdmin(e.target.value)}
                autoComplete="current-password"
              />
            </div>
          </div>
        )}

        <div className="d-flex gap-2 justify-content-center w-100 mt-2">
          <Button 
            type="button"
            variant="outline-secondary" 
            className="px-3 py-2 fw-semibold flex-fill"
            onClick={handleCancelar}
          >
            {modal.textoCancelar || 'Cancelar'}
          </Button>
          <Button 
            type="button"
            variant={modal.tipo || 'primary'} 
            className="px-3 py-2 fw-semibold flex-fill shadow-sm"
            disabled={Boolean(modal.requierePassword && !passwordAdmin)}
            onClick={handleConfirmar}
          >
            {modal.textoConfirmar || 'Confirmar'}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const ModalConfirmacionCompacto = ModalConfirmacion;
export default ModalConfirmacion;
