/**
 * SVGs arquitectónicos de alta calidad para productos GAVAT
 * Categorías: Ventanas, Puertas, Divisiones, Cerramientos, Estructuras
 */

const getSvgHeader = (title, subtitle) => `
<svg width="800" height="600" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b1329" />
      <stop offset="50%" stop-color="#14213d" />
      <stop offset="100%" stop-color="#1a2e56" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fce7a1" />
      <stop offset="50%" stop-color="#e5b85c" />
      <stop offset="100%" stop-color="#b88628" />
    </linearGradient>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(186, 230, 253, 0.45)" />
      <stop offset="40%" stop-color="rgba(125, 211, 252, 0.15)" />
      <stop offset="100%" stop-color="rgba(56, 189, 248, 0.3)" />
    </linearGradient>
    <linearGradient id="alumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#64748b" />
      <stop offset="50%" stop-color="#94a3b8" />
      <stop offset="100%" stop-color="#475569" />
    </linearGradient>
    <linearGradient id="darkAlumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="50%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>
  
  <!-- Fondo con textura moderna -->
  <rect width="800" height="600" fill="url(#bgGrad)" />
  <circle cx="700" cy="100" r="250" fill="#38bdf8" opacity="0.06" filter="url(#glow)" />
  <circle cx="100" cy="500" r="280" fill="#e5b85c" opacity="0.05" filter="url(#glow)" />
  
  <!-- Grid sutil de fondo -->
  <g opacity="0.04" stroke="#ffffff" stroke-width="1">
    <path d="M0 100 H800 M0 200 H800 M0 300 H800 M0 400 H800 M0 500 H800" />
    <path d="M100 0 V600 M200 0 V600 M300 0 V600 M400 0 V600 M500 0 V600 M600 0 V600 M700 0 V600" />
  </g>
`;

const getSvgFooter = (title, subtitle) => `
  <!-- Overlay Branding Inferior -->
  <rect x="0" y="520" width="800" height="80" fill="rgba(10, 18, 36, 0.85)" />
  <line x1="0" y1="520" x2="800" y2="520" stroke="url(#goldGrad)" stroke-width="2" opacity="0.8" />
  
  <!-- GAVAT Badge -->
  <rect x="40" y="538" width="85" height="28" rx="6" fill="url(#goldGrad)" />
  <text x="82.5" y="557" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#0b1329" text-anchor="middle" letter-spacing="2">GAVAT</text>
  
  <!-- Titulo y Subtitulo -->
  <text x="145" y="551" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="#f8fafc">${title}</text>
  <text x="145" y="569" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94a3b8">${subtitle}</text>
  
  <!-- Sello Calidad Garantizada -->
  <g transform="translate(710, 552)">
    <circle cx="0" cy="0" r="18" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" />
    <path d="M-6 -1 L-2 4 L7 -5" stroke="url(#goldGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
  </g>
</svg>
`;

// 1. Ventana Corrediza
const getVentanaCorredizaSvg = () => `
${getSvgHeader('VENTANA CORREDIZA', 'Aluminio Arquitectónico y Vidrio Templado')}
  <!-- Ilustración Ventana Corrediza -->
  <g transform="translate(180, 80)" filter="url(#shadow)">
    <!-- Marco Exterior Aluminio -->
    <rect x="0" y="0" width="440" height="380" rx="10" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="8" />
    
    <!-- Guías y rieles superiores/inferiores -->
    <rect x="12" y="12" width="416" height="12" fill="#475569" />
    <rect x="12" y="356" width="416" height="12" fill="#475569" />
    
    <!-- Hoja Fija Izquierda -->
    <rect x="20" y="30" width="205" height="320" rx="4" fill="url(#alumGrad)" />
    <rect x="32" y="42" width="181" height="296" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    <!-- Brillo del vidrio -->
    <path d="M40 50 L140 50 L60 330 L40 330 Z" fill="rgba(255,255,255,0.18)" />
    
    <!-- Hoja Móvil Derecha (Corrediza superpuesta) -->
    <g transform="translate(210, 24)" filter="url(#shadow)">
      <rect x="0" y="0" width="210" height="332" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="6" />
      <rect x="14" y="14" width="182" height="304" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
      <!-- Brillo reflejo -->
      <path d="M30 20 L120 20 L50 310 L30 310 Z" fill="rgba(255,255,255,0.22)" />
      <!-- Pestillo / Manija de embutir -->
      <rect x="180" y="140" width="12" height="50" rx="4" fill="url(#goldGrad)" />
      <circle cx="186" cy="165" r="3" fill="#1e293b" />
      <!-- Flechas indicadoras de deslizamiento -->
      <path d="M120 165 L70 165 M80 155 L70 165 L80 175" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>
    </g>
  </g>
${getSvgFooter('VENTANA CORREDIZA EN ALUMINIO', 'Perfilería pesada • Cierre hermético • Alta durabilidad')}
`;

// 2. Ventana Abatible / Proyectante
const getVentanaAbatibleSvg = () => `
${getSvgHeader('VENTANA ABATIBLE / PROYECTANTE', 'Sistema Batiente con Vidrio de Seguridad')}
  <!-- Ilustración Ventana Abatible -->
  <g transform="translate(190, 80)" filter="url(#shadow)">
    <!-- Marco Exterior -->
    <rect x="0" y="0" width="420" height="380" rx="8" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="8" />
    
    <!-- Hoja Abatible en Perspectiva -->
    <g>
      <!-- Panel de Vidrio con marco -->
      <polygon points="30,30 390,30 360,350 60,350" fill="url(#alumGrad)" />
      <polygon points="45,45 375,45 348,335 72,335" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
      <!-- Reflejo diagonal -->
      <polygon points="80,50 160,50 110,330 75,330" fill="rgba(255,255,255,0.2)" />
      
      <!-- Brazos de proyección de acero inoxidable laterales -->
      <line x1="20" y1="200" x2="60" y2="280" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
      <line x1="400" y1="200" x2="360" y2="280" stroke="#e2e8f0" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Manija de accionamiento abatible -->
      <g transform="translate(200, 310)">
        <rect x="-20" y="-8" width="40" height="16" rx="4" fill="url(#goldGrad)" />
        <rect x="-6" y="8" width="12" height="25" rx="3" fill="url(#goldGrad)" />
      </g>
    </g>
  </g>
${getSvgFooter('VENTANA ABATIBLE / PROYECTANTE', 'Apertura controlada • Ventilación óptima • Aislamiento acústico')}
`;

// 3. Ventana Fija / Panorámica
const getVentanaFijaSvg = () => `
${getSvgHeader('VENTANA FIJA PANORÁMICA', 'Gran Formato y Máxima Entrada de Luz')}
  <g transform="translate(170, 75)" filter="url(#shadow)">
    <!-- Marco perimetral ultra delgado -->
    <rect x="0" y="0" width="460" height="390" rx="6" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="8" />
    
    <!-- Gran Panel de Vidrio Templado -->
    <rect x="16" y="16" width="428" height="358" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="3" />
    
    <!-- Reflejos arquitectónicos -->
    <path d="M40 30 L220 30 L90 360 L40 360 Z" fill="rgba(255,255,255,0.2)" />
    <path d="M260 30 L340 30 L200 360 L160 360 Z" fill="rgba(255,255,255,0.1)" />
    
    <!-- Vista paisajística minimalista a través del vidrio -->
    <g opacity="0.4">
      <path d="M30 280 Q 150 200, 260 250 T 430 220 L 430 360 L 30 360 Z" fill="#1e3a8a" opacity="0.3" />
      <path d="M30 310 Q 180 260, 310 290 T 430 270 L 430 360 L 30 360 Z" fill="#0284c7" opacity="0.3" />
    </g>
  </g>
${getSvgFooter('VENTANA FIJA PANORÁMICA', 'Vidrio templado incoloro/laminado • Iluminación natural')}
`;

// 4. Puerta en Vidrio Templado (Templado / Herrajes)
const getPuertaVidrioTempladoSvg = () => `
${getSvgHeader('PUERTA EN VIDRIO TEMPLADO', 'Diseño Sin Marco con Herrajes en Acero Inoxidable')}
  <g transform="translate(230, 60)" filter="url(#shadow)">
    <!-- Vano / Marco Superior -->
    <rect x="-30" y="0" width="400" height="18" fill="url(#darkAlumGrad)" />
    
    <!-- Hoja de Vidrio Templado 10mm -->
    <rect x="0" y="20" width="340" height="420" rx="4" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="3" />
    
    <!-- Brillo Reflejo Glass -->
    <path d="M20 30 L160 30 L50 430 L20 430 Z" fill="rgba(255,255,255,0.25)" />
    
    <!-- Herraje Superior (Pivote / Patch Fitting) -->
    <rect x="260" y="20" width="65" height="30" rx="3" fill="url(#alumGrad)" stroke="#cbd5e1" stroke-width="1.5" />
    
    <!-- Herraje Inferior (Freno Hidráulico de Piso) -->
    <rect x="260" y="410" width="65" height="30" rx="3" fill="url(#alumGrad)" stroke="#cbd5e1" stroke-width="1.5" />
    <rect x="250" y="438" width="85" height="10" fill="#0f172a" />
    
    <!-- Manillón / Jaladera de Acero Tubular Inox (Dorado / Plata) -->
    <g transform="translate(45, 140)">
      <rect x="0" y="0" width="16" height="180" rx="8" fill="url(#goldGrad)" filter="url(#shadow)" />
      <circle cx="8" cy="20" r="10" fill="#cbd5e1" />
      <circle cx="8" cy="160" r="10" fill="#cbd5e1" />
    </g>
    
    <!-- Cerradura de parche inferior -->
    <rect x="35" y="380" width="36" height="40" rx="4" fill="url(#alumGrad)" />
    <circle cx="53" cy="400" r="4" fill="#0f172a" />
  </g>
${getSvgFooter('PUERTA EN VIDRIO TEMPLADO', 'Espesor 10mm/12mm • Herrajes en acero inoxidable 304')}
`;

// 5. Puerta Batiente en Aluminio
const getPuertaBatienteSvg = () => `
${getSvgHeader('PUERTA BATIENTE EN ALUMINIO', 'Perfilería Robusta con Cerradura de Seguridad')}
  <g transform="translate(220, 60)" filter="url(#shadow)">
    <!-- Marco Exterior -->
    <rect x="0" y="0" width="360" height="430" rx="6" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="10" />
    
    <!-- Hoja Batiente -->
    <rect x="18" y="16" width="324" height="400" rx="4" fill="url(#alumGrad)" />
    
    <!-- Panel de Vidrio Central -->
    <rect x="40" y="35" width="280" height="360" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    
    <!-- Reflejos -->
    <path d="M55 45 L170 45 L80 385 L55 385 Z" fill="rgba(255,255,255,0.22)" />
    
    <!-- Bisagras de alta resistencia -->
    <rect x="330" y="60" width="12" height="35" rx="3" fill="url(#goldGrad)" />
    <rect x="330" y="200" width="12" height="35" rx="3" fill="url(#goldGrad)" />
    <rect x="330" y="340" width="12" height="35" rx="3" fill="url(#goldGrad)" />
    
    <!-- Cerradura con manija de palanca -->
    <g transform="translate(50, 210)">
      <rect x="0" y="-25" width="26" height="70" rx="4" fill="url(#goldGrad)" />
      <rect x="-35" y="-6" width="40" height="12" rx="3" fill="url(#goldGrad)" />
      <circle cx="13" cy="22" r="3.5" fill="#0f172a" />
    </g>
  </g>
${getSvgFooter('PUERTA BATIENTE EN ALUMINIO', 'Cerradura de alta seguridad • Sellos acústicos • Estilo moderno')}
`;

// 6. Puerta Corrediza (Puertas)
const getPuertaCorredizaSvg = () => `
${getSvgHeader('PUERTA CORREDIZA EN VIDRIO Y ALUMINIO', 'Sistema Deslizante de Alto Tráfico')}
  <g transform="translate(160, 65)" filter="url(#shadow)">
    <!-- Riel Superior Colgante -->
    <rect x="0" y="0" width="480" height="24" rx="4" fill="url(#darkAlumGrad)" stroke="url(#goldGrad)" stroke-width="2" />
    
    <!-- Hoja Fija Fondo -->
    <rect x="240" y="30" width="220" height="400" rx="4" fill="url(#alumGrad)" />
    <rect x="252" y="42" width="196" height="376" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    
    <!-- Hoja Corrediza Frontal -->
    <g transform="translate(20, 26)" filter="url(#shadow)">
      <rect x="0" y="0" width="240" height="408" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="6" />
      <rect x="14" y="14" width="212" height="380" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
      <path d="M30 25 L130 25 L50 380 L30 380 Z" fill="rgba(255,255,255,0.22)" />
      
      <!-- Manijón elegante de piso a techo -->
      <rect x="200" y="100" width="12" height="200" rx="4" fill="url(#goldGrad)" />
      
      <!-- Carro de rodamiento superior con rodamientos -->
      <circle cx="40" cy="-12" r="10" fill="#94a3b8" stroke="#fce7a1" stroke-width="2" />
      <circle cx="200" cy="-12" r="10" fill="#94a3b8" stroke="#fce7a1" stroke-width="2" />
    </g>
  </g>
${getSvgFooter('PUERTA CORREDIZA DE GRAN FORMATO', 'Rodamientos silenciosos • Apertura suave • Espacios amplios')}
`;

// 7. División de Baño
const getDivisionBanoSvg = () => `
${getSvgHeader('DIVISIÓN DE BAÑO EN VIDRIO TEMPLADO', 'Cabinas y Batientes con Accesorios en Acero')}
  <g transform="translate(180, 65)" filter="url(#shadow)">
    <!-- Fondo pared azulejos sutil -->
    <rect x="0" y="0" width="440" height="420" rx="8" fill="#1e293b" opacity="0.6" />
    <g opacity="0.1" stroke="#cbd5e1" stroke-width="1">
      <path d="M0 70 H440 M0 140 H440 M0 210 H440 M0 280 H440 M0 350 H440" />
      <path d="M88 0 V420 M176 0 V420 M264 0 V420 M352 0 V420" />
    </g>
    
    <!-- Barra estabilizadora superior de acero -->
    <rect x="10" y="20" width="420" height="12" rx="4" fill="url(#alumGrad)" stroke="#f1f5f9" stroke-width="1" />
    
    <!-- Panel Fijo Izquierdo -->
    <rect x="20" y="32" width="190" height="370" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
    <path d="M35 45 L130 45 L55 390 L35 390 Z" fill="rgba(255,255,255,0.2)" />
    <!-- Botón / Conector a barra -->
    <rect x="105" y="16" width="20" height="20" rx="3" fill="url(#goldGrad)" />
    
    <!-- Puerta Corrediza / Batiente Derecha -->
    <g transform="translate(220, 28)" filter="url(#shadow)">
      <rect x="0" y="0" width="200" height="378" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2.5" />
      <path d="M20 20 L110 20 L40 360 L20 360 Z" fill="rgba(255,255,255,0.25)" />
      
      <!-- Manija toallero o pomo de baño -->
      <circle cx="35" cy="180" r="14" fill="url(#goldGrad)" />
      <circle cx="35" cy="180" r="6" fill="#0f172a" />
      
      <!-- Sello magnético de silicona inferior / lateral -->
      <rect x="194" y="0" width="6" height="378" fill="#38bdf8" opacity="0.6" />
      <rect x="0" y="372" width="200" height="6" fill="#38bdf8" opacity="0.6" />
    </g>
  </g>
${getSvgFooter('DIVISIÓN DE BAÑO EN VIDRIO TEMPLADO', 'Vidrio 8mm/10mm • Anticalcáreo • Accesorios en acero')}
`;

// 8. División de Oficinas
const getDivisionOficinasSvg = () => `
${getSvgHeader('DIVISIÓN DE OFICINAS Y MODULARES', 'Mamparas Acústicas en Vidrio y Perfilería Negra')}
  <g transform="translate(150, 70)" filter="url(#shadow)">
    <!-- Estructura modular completa -->
    <rect x="0" y="0" width="500" height="400" rx="6" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="8" />
    
    <!-- Módulos de Vidrio con Cuadrícula Industrial / Office -->
    <!-- Módulo 1 -->
    <rect x="16" y="16" width="140" height="368" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    <!-- Módulo 2 (Puerta) -->
    <rect x="172" y="16" width="156" height="368" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    <rect x="185" y="180" width="10" height="60" rx="3" fill="url(#goldGrad)" />
    <!-- Módulo 3 -->
    <rect x="344" y="16" width="140" height="368" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="2" />
    
    <!-- Franja de Vinilo Esmerilado / Sandblasting Central (Privacidad) -->
    <rect x="16" y="150" width="468" height="90" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-dasharray="6,4" />
    <text x="250" y="202" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="700" fill="rgba(255,255,255,0.6)" text-anchor="middle" letter-spacing="4">PRIVACY GLASS</text>
  </g>
${getSvgFooter('DIVISIÓN MODULAR PARA OFICINAS', 'Aislamiento sonoro • Diseño ejecutivo • Vidrio laminado')}
`;

// 9. División de Interiores
const getDivisionInterioresSvg = () => `
${getSvgHeader('DIVISIÓN DE INTERIORES', 'Paneles Corredizos y Ambientes Modernos')}
  <g transform="translate(160, 70)" filter="url(#shadow)">
    <!-- Riel Superior Tipo Granero / Loft -->
    <rect x="0" y="0" width="480" height="16" rx="3" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="2" />
    
    <!-- 3 Paneles deslizantes telescópicos -->
    <!-- Panel 1 -->
    <g transform="translate(20, 20)">
      <rect x="0" y="0" width="140" height="380" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="4" />
      <rect x="10" y="10" width="120" height="360" fill="url(#glassGrad)" />
      <!-- Cuadrícula japonesa / loft -->
      <line x1="10" y1="130" x2="130" y2="130" stroke="url(#alumGrad)" stroke-width="3" />
      <line x1="10" y1="250" x2="130" y2="250" stroke="url(#alumGrad)" stroke-width="3" />
    </g>
    <!-- Panel 2 -->
    <g transform="translate(170, 20)">
      <rect x="0" y="0" width="140" height="380" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="4" />
      <rect x="10" y="10" width="120" height="360" fill="url(#glassGrad)" />
      <line x1="10" y1="130" x2="130" y2="130" stroke="url(#alumGrad)" stroke-width="3" />
      <line x1="10" y1="250" x2="130" y2="250" stroke="url(#alumGrad)" stroke-width="3" />
      <rect x="15" y="170" width="8" height="45" rx="3" fill="url(#goldGrad)" />
    </g>
    <!-- Panel 3 -->
    <g transform="translate(320, 20)">
      <rect x="0" y="0" width="140" height="380" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="4" />
      <rect x="10" y="10" width="120" height="360" fill="url(#glassGrad)" />
      <line x1="10" y1="130" x2="130" y2="130" stroke="url(#alumGrad)" stroke-width="3" />
      <line x1="10" y1="250" x2="130" y2="250" stroke="url(#alumGrad)" stroke-width="3" />
    </g>
  </g>
${getSvgFooter('DIVISIÓN DE ESPACIOS INTERIORES', 'Separación flexible de ambientes • Máxima luminosidad')}
`;

// 10. Cerramientos de Balcones
const getCerramientoBalconesSvg = () => `
${getSvgHeader('CERRAMIENTO DE BALCONES', 'Cortinas de Cristal Plegables y Barandas en Vidrio')}
  <g transform="translate(150, 65)" filter="url(#shadow)">
    <!-- Vista panorámica exterior de fondo -->
    <rect x="20" y="20" width="460" height="380" rx="8" fill="#0f172a" />
    <path d="M20 260 L120 220 L220 250 L320 200 L420 240 L480 210 L480 400 L20 400 Z" fill="#0369a1" opacity="0.3" />
    
    <!-- Pasamanos / Pasamano Superior de Aluminio -->
    <rect x="0" y="10" width="500" height="22" rx="4" fill="url(#alumGrad)" stroke="#f1f5f9" stroke-width="1.5" />
    
    <!-- Sistema de Cortina de Cristal en Paneles Plegables -->
    <g transform="translate(10, 32)">
      <!-- Panel 1 -->
      <rect x="10" y="0" width="105" height="350" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      <!-- Panel 2 -->
      <rect x="130" y="0" width="105" height="350" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      <!-- Panel 3 -->
      <rect x="250" y="0" width="105" height="350" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      <!-- Panel 4 -->
      <rect x="370" y="0" width="105" height="350" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      
      <!-- Reflejos cruzados continuos -->
      <path d="M20 10 L460 10 L400 330 L20 330 Z" fill="rgba(255,255,255,0.12)" />
    </g>
    
    <!-- Zócalo Inferior / Punteras de anclaje pesado -->
    <rect x="0" y="380" width="500" height="26" rx="4" fill="url(#darkAlumGrad)" stroke="url(#goldGrad)" stroke-width="2" />
  </g>
${getSvgFooter('CERRAMIENTO PANORÁMICO DE BALCÓN', 'Sin perfiles verticales • Visión despejada • Hermeticidad')}
`;

// 11. Cerramientos de Terrazas
const getCerramientoTerrazasSvg = () => `
${getSvgHeader('CERRAMIENTOS DE TERRAZAS', 'Pérgolas y Cerramientos de Alto Rendimiento')}
  <g transform="translate(150, 60)" filter="url(#shadow)">
    <!-- Vigas de Techo / Pérgola -->
    <polygon points="20,40 480,20 480,50 20,70" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="3" />
    <polygon points="20,70 480,50 480,90 20,110" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    
    <!-- Columnas Estructurales de Aluminio Reforzado -->
    <rect x="20" y="70" width="30" height="340" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="3" />
    <rect x="450" y="50" width="30" height="360" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="3" />
    
    <!-- Sistema de Puertas Corredizas de Terraza -->
    <g transform="translate(60, 100)">
      <rect x="0" y="0" width="180" height="300" rx="3" fill="url(#alumGrad)" />
      <rect x="10" y="10" width="160" height="280" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
      
      <rect x="190" y="0" width="180" height="300" rx="3" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="4" />
      <rect x="200" y="10" width="160" height="280" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
      <rect x="345" y="130" width="8" height="50" rx="3" fill="url(#goldGrad)" />
    </g>
  </g>
${getSvgFooter('CERRAMIENTO INTEGRAL DE TERRAZAS', 'Protección contra lluvia y viento • Máximo confort')}
`;

// 12. Cerramientos de Locales / Vitrinas Comerciales
const getCerramientoLocalesSvg = () => `
${getSvgHeader('CERRAMIENTOS COMERCIALES Y VITRINAS', 'Fachadas de Alta Resistencia para Negocios')}
  <g transform="translate(150, 65)" filter="url(#shadow)">
    <!-- Fachada Comercial / Pórtico -->
    <rect x="0" y="0" width="500" height="400" rx="6" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="8" />
    
    <!-- Letrero comercial superior -->
    <rect x="16" y="16" width="468" height="50" rx="4" fill="#0b1329" stroke="url(#goldGrad)" stroke-width="2" />
    <text x="250" y="47" font-family="'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="900" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="4">COMERCIAL STOREFRONT</text>
    
    <!-- Vitrina Izquierda -->
    <rect x="16" y="80" width="220" height="300" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
    <path d="M30 90 L160 90 L60 360 L30 360 Z" fill="rgba(255,255,255,0.2)" />
    
    <!-- Puerta Doble Batiente Comercial Derecha -->
    <g transform="translate(248, 80)">
      <rect x="0" y="0" width="112" height="300" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      <rect x="118" y="0" width="112" height="300" rx="2" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
      
      <!-- Manillones verticales de acero inoxidable -->
      <rect x="90" y="90" width="10" height="120" rx="4" fill="url(#goldGrad)" />
      <rect x="130" y="90" width="10" height="120" rx="4" fill="url(#goldGrad)" />
    </g>
  </g>
${getSvgFooter('VITRINAS Y FACHADAS COMERCIALES', 'Vidrio de seguridad antirrobo • Máxima exhibición')}
`;

// 13. Estructuras en Aluminio
const getEstructuraAluminioSvg = () => `
${getSvgHeader('ESTRUCTURAS EN ALUMINIO', 'Perfilería Estructural e Ingeniería Liviana')}
  <g transform="translate(160, 65)" filter="url(#shadow)">
    <!-- Celosía / Estructura Tridimensional de Perfiles -->
    <rect x="0" y="0" width="480" height="400" rx="6" fill="#0f172a" stroke="url(#goldGrad)" stroke-width="3" />
    
    <!-- Red de perfiles tubulares de aluminio -->
    <g stroke="url(#alumGrad)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <line x1="40" y1="40" x2="440" y2="40" />
      <line x1="40" y1="200" x2="440" y2="200" />
      <line x1="40" y1="360" x2="440" y2="360" />
      <line x1="40" y1="40" x2="40" y2="360" />
      <line x1="240" y1="40" x2="240" y2="360" />
      <line x1="440" y1="40" x2="440" y2="360" />
      
      <!-- Diagonales de arriostramiento -->
      <line x1="40" y1="40" x2="240" y2="200" stroke-width="8" />
      <line x1="240" y1="40" x2="440" y2="200" stroke-width="8" />
      <line x1="40" y1="200" x2="240" y2="360" stroke-width="8" />
      <line x1="240" y1="200" x2="440" y2="360" stroke-width="8" />
    </g>
    
    <!-- Placas de anclaje con pernos dorados -->
    <g fill="url(#goldGrad)">
      <circle cx="40" cy="40" r="12" />
      <circle cx="240" cy="40" r="12" />
      <circle cx="440" cy="40" r="12" />
      <circle cx="40" cy="200" r="12" />
      <circle cx="240" cy="200" r="12" />
      <circle cx="440" cy="200" r="12" />
      <circle cx="40" cy="360" r="12" />
      <circle cx="240" cy="360" r="12" />
      <circle cx="440" cy="360" r="12" />
    </g>
  </g>
${getSvgFooter('ESTRUCTURAS EN ALUMINIO ARQUITECTÓNICO', 'Aleación 6063 T5 • Resistencia a la corrosión')}
`;

// 14. Estructuras en Vidrio
const getEstructuraVidrioSvg = () => `
${getSvgHeader('ESTRUCTURAS EN VIDRIO TEMPLADO Y LAMINADO', 'Fachadas Flotantes y Sistema Spider / Arañas')}
  <g transform="translate(160, 65)" filter="url(#shadow)">
    <!-- Muro Cortina de Paneles de Vidrio -->
    <!-- 4 Grandes Paneles con Junta Abierta -->
    <rect x="20" y="20" width="210" height="175" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <rect x="250" y="20" width="210" height="175" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <rect x="20" y="215" width="210" height="175" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    <rect x="250" y="215" width="210" height="175" rx="3" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.6)" stroke-width="2" />
    
    <!-- Reflejos luminosos -->
    <path d="M40 30 L180 30 L60 180 L40 180 Z" fill="rgba(255,255,255,0.25)" />
    <path d="M270 225 L410 225 L290 380 L270 380 Z" fill="rgba(255,255,255,0.25)" />
    
    <!-- Herraje Tipo Araña (Spider Fitting) Central en Acero Inoxidable -->
    <g transform="translate(240, 205)" filter="url(#shadow)">
      <!-- Centro de la araña -->
      <circle cx="0" cy="0" r="18" fill="url(#goldGrad)" stroke="#cbd5e1" stroke-width="3" />
      
      <!-- 4 Brazos articulados -->
      <line x1="0" y1="0" x2="-60" y2="-50" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
      <line x1="0" y1="0" x2="60" y2="-50" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
      <line x1="0" y1="0" x2="-60" y2="50" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
      <line x1="0" y1="0" x2="60" y2="50" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round" />
      
      <!-- Rótulas fijadas al vidrio -->
      <circle cx="-60" cy="-50" r="14" fill="url(#goldGrad)" />
      <circle cx="60" cy="-50" r="14" fill="url(#goldGrad)" />
      <circle cx="-60" cy="50" r="14" fill="url(#goldGrad)" />
      <circle cx="60" cy="50" r="14" fill="url(#goldGrad)" />
    </g>
  </g>
${getSvgFooter('SISTEMAS ESTRUCTURALES EN VIDRIO', 'Fijación puntual Spider • Vidrio laminado templado')}
`;

// 15. Estructuras Mixtas (Aluminio + Vidrio)
const getEstructuraMixtaSvg = () => `
${getSvgHeader('ESTRUCTURAS MIXTAS ALUMINIO Y VIDRIO', 'Marquesinas, Cubiertas y Fachadas Integradas')}
  <g transform="translate(150, 60)" filter="url(#shadow)">
    <!-- Marquesina Inclinada de Cristal con Tirantes de Acero -->
    <!-- Tirantes superiores tensores -->
    <line x1="80" y1="20" x2="160" y2="150" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round" />
    <line x1="420" y1="20" x2="340" y2="150" stroke="url(#goldGrad)" stroke-width="5" stroke-linecap="round" />
    <circle cx="80" cy="20" r="8" fill="url(#goldGrad)" />
    <circle cx="420" cy="20" r="8" fill="url(#goldGrad)" />
    
    <!-- Cubierta Voladiza de Vidrio Inclinada -->
    <polygon points="60,180 440,180 480,270 20,270" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.7)" stroke-width="3" />
    <polygon points="100,190 220,190 200,260 70,260" fill="rgba(255,255,255,0.25)" />
    
    <!-- Fachada Base con Marcos de Aluminio -->
    <g transform="translate(40, 270)">
      <rect x="0" y="0" width="420" height="140" rx="4" fill="url(#darkAlumGrad)" stroke="url(#alumGrad)" stroke-width="6" />
      <rect x="15" y="15" width="180" height="110" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
      <rect x="225" y="15" width="180" height="110" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    </g>
  </g>
${getSvgFooter('ESTRUCTURAS MIXTAS VIDRIO-ALUMINIO', 'Marquesinas suspendidas • Fachadas flotantes integrales')}
`;

// 16. Imagen por Defecto (GAVAT Default Product)
const getDefaultProductSvg = () => `
${getSvgHeader('GAVAT VIDRIO Y ALUMINIO', 'Productos y Servicios Arquitectónicos de Alta Calidad')}
  <g transform="translate(200, 80)" filter="url(#shadow)">
    <!-- Marco Hexagonal / Arquitectónico -->
    <polygon points="200,20 370,120 370,300 200,390 30,300 30,120" fill="url(#darkAlumGrad)" stroke="url(#goldGrad)" stroke-width="6" />
    <polygon points="200,45 345,130 345,285 200,365 55,285 55,130" fill="url(#glassGrad)" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    
    <!-- Reflejos -->
    <path d="M120 70 L260 70 L140 330 L80 330 Z" fill="rgba(255,255,255,0.2)" />
    
    <!-- Logo e Icono Central -->
    <g transform="translate(200, 200)">
      <circle cx="0" cy="0" r="60" fill="url(#bgGrad)" stroke="url(#goldGrad)" stroke-width="3" filter="url(#glow)" />
      
      <!-- Icono Ventana / Estructura -->
      <rect x="-30" y="-30" width="60" height="60" rx="4" fill="none" stroke="url(#goldGrad)" stroke-width="3" />
      <line x1="0" y1="-30" x2="0" y2="30" stroke="url(#goldGrad)" stroke-width="2" />
      <line x1="-30" y1="0" x2="30" y2="0" stroke="url(#goldGrad)" stroke-width="2" />
      
      <text x="0" y="5" font-family="'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1">GAVAT</text>
    </g>
    
    <!-- Texto Inferior -->
    <text x="200" y="325" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="url(#goldGrad)" text-anchor="middle" letter-spacing="2">VIDRIO &amp; ALUMINIO</text>
  </g>
${getSvgFooter('CALIDAD Y DISEÑO ARQUITECTÓNICO', 'Garantía certificada • Cotización personalizada')}
`;

const subcategoryMap = {
  // Ventanas
  'Corredizas': getVentanaCorredizaSvg,
  'Abatibles': getVentanaAbatibleSvg,
  'Fijas': getVentanaFijaSvg,
  
  // Puertas
  'Vidrio templado': getPuertaVidrioTempladoSvg,
  'Batientes': getPuertaBatienteSvg,
  
  // Divisiones
  'Banos': getDivisionBanoSvg,
  'Baños': getDivisionBanoSvg,
  'Oficinas': getDivisionOficinasSvg,
  'Interiores': getDivisionInterioresSvg,
  
  // Cerramientos
  'Balcones': getCerramientoBalconesSvg,
  'Terrazas': getCerramientoTerrazasSvg,
  'Locales': getCerramientoLocalesSvg,
  
  // Estructuras
  'Aluminio': getEstructuraAluminioSvg,
  'Vidrio': getEstructuraVidrioSvg,
  'Mixtas': getEstructuraMixtaSvg,
};

function getSvgForSubcategory(subcategoriaNombre, categoriaNombre) {
  if (subcategoriaNombre === 'Corredizas') {
    if (categoriaNombre === 'Puertas') {
      return getPuertaCorredizaSvg();
    }
    return getVentanaCorredizaSvg();
  }

  const getter = subcategoryMap[subcategoriaNombre];
  if (getter) {
    return getter();
  }
  return getDefaultProductSvg();
}

module.exports = {
  getVentanaCorredizaSvg,
  getVentanaAbatibleSvg,
  getVentanaFijaSvg,
  getPuertaVidrioTempladoSvg,
  getPuertaBatienteSvg,
  getPuertaCorredizaSvg,
  getDivisionBanoSvg,
  getDivisionOficinasSvg,
  getDivisionInterioresSvg,
  getCerramientoBalconesSvg,
  getCerramientoTerrazasSvg,
  getCerramientoLocalesSvg,
  getEstructuraAluminioSvg,
  getEstructuraVidrioSvg,
  getEstructuraMixtaSvg,
  getDefaultProductSvg,
  getSvgForSubcategory
};
