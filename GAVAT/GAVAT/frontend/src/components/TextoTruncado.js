import React from 'react';
import { truncarTexto } from '../utils/helpers';

/**
 * Componente TextoTruncado
 * Muestra texto truncado con '...' si excede un límite de caracteres,
 * y coloca el texto completo en el atributo `title` para que el usuario
 * pueda visualizarlo completo al pasar el cursor encima.
 *
 * @param {string|number} texto - Texto a truncar
 * @param {number} limite - Número máximo de caracteres antes de cortar con '...' (default: 30)
 * @param {string} fallback - Valor si el texto está vacío (default: '-')
 * @param {React.ElementType} as - Elemento HTML o componente a renderizar ('span', 'div', etc.)
 * @param {string|number} maxWidth - Ancho máximo opcional (ej: '200px')
 * @param {boolean} conTooltip - Si debe incluir el tooltip nativo (title) con el texto completo
 * @param {string} className - Clases CSS adicionales
 */
export default function TextoTruncado({
  texto,
  children,
  limite = 30,
  fallback = '-',
  as: Component = 'span',
  maxWidth,
  conTooltip = true,
  className = '',
  style = {},
  ...props
}) {
  const contenido = texto !== undefined && texto !== null ? texto : children;

  if (contenido === null || contenido === undefined || contenido === '') {
    return (
      <Component className={`texto-truncado-vacio ${className}`} style={style} {...props}>
        {fallback}
      </Component>
    );
  }

  const str = String(contenido).trim();
  const esLargo = str.length > limite;
  const textoCortado = truncarTexto(str, limite, fallback);

  return (
    <Component
      className={`cell-truncate ${className}`}
      title={conTooltip && esLargo ? str : undefined}
      style={{
        maxWidth: maxWidth || undefined,
        ...style,
      }}
      {...props}
    >
      {textoCortado}
    </Component>
  );
}
