import React from 'react';

/**
 * Componente SvgIcon
 * Carga y renderiza íconos vectoriales SVG desde /assests/icons/
 * usando CSS mask para heredar automáticamente el color del botón/texto (currentColor).
 */
const SvgIcon = ({ name, className = '', size = 15, style = {} }) => {
  const iconPath = `/assests/icons/${name}.svg`;

  return (
    <span
      className={`btn-icon-svg ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        WebkitMaskImage: `url('${iconPath}')`,
        maskImage: `url('${iconPath}')`,
        ...style
      }}
      aria-hidden="true"
    />
  );
};

export default SvgIcon;
