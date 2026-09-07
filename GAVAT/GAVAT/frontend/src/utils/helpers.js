/**
 * ============================================
 * UTILIDADES - FORMATOS
 * ============================================
 * Funciones auxiliares para formatear datos
 */

/**
 * Formatear precio en pesos colombianos
 */
export const formatCurrency = (value) => {
  const numero = Number.parseFloat(value);
  if (Number.isNaN(numero)) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numero);
};

/**
 * Formatear fecha
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Formatear fecha y hora
 */
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Obtener URL completa de la imagen
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath || imagePath === 'default.jpg' || imagePath === '/default.jpg') {
    return '/producto-default.jpg';
  }

  if (typeof imagePath !== 'string') {
    return '/producto-default.jpg';
  }

  // Filtrar Data URIs dummy o inválidos (como el base64 de la palabra 'default.jpg')
  if (imagePath.startsWith('data:')) {
    if (imagePath.includes('ZGVmYXVsdC5qcGc=') || (imagePath.length < 80 && !imagePath.includes('<svg'))) {
      return '/producto-default.jpg';
    }
    return imagePath;
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/assests/') || imagePath.startsWith('/assets/') || imagePath.startsWith('/producto-default')) {
    return imagePath;
  }

  let normalizedPath = `/uploads/${imagePath}`;
  if (imagePath.startsWith('/uploads/')) {
    normalizedPath = imagePath;
  } else if (imagePath.startsWith('uploads/')) {
    normalizedPath = `/${imagePath}`;
  }

  const apiUrl = process.env.REACT_APP_API_URL?.replace(/\/$/, '') || '';
  const backendOrigin = apiUrl ? apiUrl.replace(/\/api$/, '') : '';

  return backendOrigin ? `${backendOrigin}${normalizedPath}` : normalizedPath;
};

/**
 * Validar email
 */
export const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;

  const emailParts = email.split('@');
  if (emailParts.length !== 2) return false;

  const [localPart, domainPart] = emailParts;
  const domainLabels = domainPart.split('.');
  return Boolean(
    localPart &&
    domainPart &&
    domainLabels.length > 1 &&
    domainLabels.every((label) => label.length > 0)
  );
};

/**
 * Validar teléfono colombiano (exactamente 10 dígitos numéricos)
 */
export const isValidPhone = (phone) => {
  if (!phone) return true;
  const digits = String(phone).replace(/\D/g, '');
  return digits.length === 10;
};

/**
 * Obtener badge de estado de pedido
 */
export const getEstadoBadge = (estado) => {
  const badges = {
    pendiente: 'warning',
    enviado: 'info',
    entregado: 'success',
    cancelado: 'danger',
  };
  return badges[estado] || 'secondary';
};

/**
 * Obtener texto de estado de pedido
 */
export const getEstadoTexto = (estado) => {
  const textos = {
    pendiente: 'Pendiente',
    enviado: 'Enviado',
    entregado: 'Entregado',
    cancelado: 'Cancelado',
  };
  return textos[estado] || estado;
};
