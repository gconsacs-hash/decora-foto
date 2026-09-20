/* elementos.js — Muebles, plantas y accesorios como SVG planos.
   {c1} es el color principal (el usuario puede cambiarlo); {c2} y {c3} son secundarios.
   anchoRel: ancho inicial como fracción del ancho de la foto. */

const S = (w, h, cuerpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${cuerpo}</svg>`;

export const CATEGORIAS = [
  { clave: "sugeridos", nombre: "Sugeridos" },
  { clave: "plantas", nombre: "Plantas" },
  { clave: "cuadros", nombre: "Cuadros y espejos" },
  { clave: "luces", nombre: "Luces" },
  { clave: "muebles", nombre: "Muebles" },
  { clave: "textiles", nombre: "Textiles" },
  { clave: "accesorios", nombre: "Accesorios" },
  { clave: "exterior", nombre: "Exterior" },
];

export const ELEMENTOS = {
  planta_monstera: {
    nombre: "Planta grande", categoria: "plantas", anchoRel: 0.22, colores: ["#b5654a", "#3f9a5c", "#2f7a48"],
    svg: S(100, 130, `
      <g stroke="#2f6b43" stroke-width="2" fill="none"><path d="M50 95C50 80 40 70 30 55"/><path d="M50 95C52 75 62 65 72 50"/><path d="M50 95C48 80 46 60 50 42"/><path d="M50 95C55 85 70 78 80 72"/><path d="M50 95C45 88 30 82 20 78"/></g>
      <g fill="{c2}"><ellipse cx="28" cy="48" rx="16" ry="11" transform="rotate(-35 28 48)"/><ellipse cx="74" cy="44" rx="17" ry="12" transform="rotate(30 74 44)"/><ellipse cx="50" cy="34" rx="13" ry="17"/><ellipse cx="82" cy="70" rx="14" ry="9" transform="rotate(20 82 70)"/><ellipse cx="18" cy="76" rx="14" ry="9" transform="rotate(-15 18 76)"/></g>
      <g fill="{c3}"><ellipse cx="24" cy="46" rx="4" ry="2.5"/><ellipse cx="78" cy="42" rx="4" ry="2.5"/><ellipse cx="50" cy="30" rx="3" ry="5"/><ellipse cx="86" cy="70" rx="3.5" ry="2"/><ellipse cx="14" cy="76" rx="3.5" ry="2"/></g>
      <path d="M32 92H68L64 128H36Z" fill="{c1}"/><rect x="29" y="88" width="42" height="7" rx="2" fill="{c1}"/><path d="M36 128L34 100H41L42 128Z" fill="rgba(0,0,0,.18)"/>`),
  },
  planta_cactus: {
    nombre: "Cactus", categoria: "plantas", anchoRel: 0.12, colores: ["#d9a066", "#5fa463", "#3f7d45"],
    svg: S(80, 120, `
      <rect x="32" y="20" width="16" height="70" rx="8" fill="{c2}"/><rect x="14" y="40" width="12" height="30" rx="6" fill="{c2}"/><rect x="20" y="62" width="14" height="10" rx="5" fill="{c2}"/><rect x="54" y="30" width="12" height="34" rx="6" fill="{c2}"/><rect x="46" y="56" width="14" height="10" rx="5" fill="{c2}"/>
      <g stroke="{c3}" stroke-width="1.2" opacity=".7"><path d="M40 24v60M36 30v50M44 30v50"/></g>
      <path d="M22 88H58L54 118H26Z" fill="{c1}"/><rect x="19" y="84" width="42" height="7" rx="2" fill="{c1}"/><path d="M26 118L24 92H31L32 118Z" fill="rgba(0,0,0,.18)"/>`),
  },
  planta_colgante: {
    nombre: "Planta colgante", categoria: "plantas", anchoRel: 0.16, colores: ["#e8dcc5", "#4f9a5a", "#3b7a45"],
    svg: S(100, 150, `
      <circle cx="50" cy="4" r="3" fill="#555"/><g stroke="#c9b48c" stroke-width="1.5" fill="none"><path d="M50 6L30 44M50 6L70 44M50 6V44M50 20L36 44M50 20L64 44"/></g>
      <path d="M28 44H72L66 76H34Z" fill="{c1}"/><rect x="26" y="41" width="48" height="6" rx="2" fill="{c1}"/><path d="M34 76L32 50H39L40 76Z" fill="rgba(0,0,0,.15)"/>
      <g stroke="{c3}" stroke-width="2" fill="none"><path d="M36 42C30 70 22 90 26 120"/><path d="M50 42C52 80 46 100 50 140"/><path d="M64 42C72 70 78 100 72 128"/><path d="M42 42C30 60 26 80 20 96"/><path d="M58 42C70 60 76 76 82 90"/></g>
      <g fill="{c2}"><ellipse cx="30" cy="62" rx="5" ry="3"/><ellipse cx="24" cy="86" rx="5" ry="3"/><ellipse cx="28" cy="110" rx="5" ry="3"/><ellipse cx="26" cy="122" rx="4" ry="2.5"/><ellipse cx="52" cy="70" rx="5" ry="3"/><ellipse cx="46" cy="100" rx="5" ry="3"/><ellipse cx="50" cy="125" rx="5" ry="3"/><ellipse cx="50" cy="140" rx="4" ry="2.5"/><ellipse cx="70" cy="62" rx="5" ry="3"/><ellipse cx="76" cy="92" rx="5" ry="3"/><ellipse cx="74" cy="116" rx="5" ry="3"/><ellipse cx="72" cy="128" rx="4" ry="2.5"/><ellipse cx="24" cy="72" rx="4" ry="2.5"/><ellipse cx="20" cy="96" rx="4" ry="2.5"/><ellipse cx="76" cy="74" rx="4" ry="2.5"/><ellipse cx="82" cy="90" rx="4" ry="2.5"/></g>`),
  },
  cuadro_abstracto: {
    nombre: "Cuadro abstracto", categoria: "cuadros", anchoRel: 0.22, colores: ["#d9a066", "#2b2b2b", "#2f3e46"],
    svg: S(120, 90, `
      <rect x="0" y="0" width="120" height="90" fill="{c2}"/><rect x="5" y="5" width="110" height="80" fill="#f6f2ea"/>
      <circle cx="45" cy="40" r="22" fill="{c1}"/><path d="M60 80L95 22L112 80Z" fill="{c3}"/><rect x="14" y="60" width="50" height="10" fill="{c3}" opacity=".75"/><circle cx="92" cy="30" r="8" fill="#f6f2ea" opacity=".85"/>`),
  },
  cuadro_paisaje: {
    nombre: "Cuadro paisaje", categoria: "cuadros", anchoRel: 0.22, colores: ["#cfe4f2", "#8a6a4a", "#6b7d8a"],
    svg: S(120, 90, `
      <rect x="0" y="0" width="120" height="90" fill="{c2}"/><rect x="6" y="6" width="108" height="78" fill="{c1}"/>
      <circle cx="88" cy="30" r="10" fill="#f2c14e"/><path d="M6 84L36 40L56 66L74 48L114 84Z" fill="{c3}"/><path d="M6 84L36 40L50 60L30 84Z" fill="rgba(0,0,0,.18)"/><rect x="6" y="72" width="108" height="12" fill="#5b7d4a"/>`),
  },
  espejo_redondo: {
    nombre: "Espejo redondo", categoria: "cuadros", anchoRel: 0.16, colores: ["#c9a25a", "#d8dee4", "#ffffff"],
    svg: S(100, 100, `
      <circle cx="50" cy="50" r="49" fill="{c1}"/><circle cx="50" cy="50" r="43" fill="{c2}"/><path d="M20 60C24 36 40 22 62 18C40 30 30 44 28 70Z" fill="{c3}" opacity=".55"/><circle cx="50" cy="50" r="43" fill="url(#g)"/>
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient></defs>`),
  },
  espejo_arco: {
    nombre: "Espejo de arco", categoria: "cuadros", anchoRel: 0.15, colores: ["#2b2b2b", "#d8dee4", "#ffffff"],
    svg: S(80, 130, `
      <path d="M0 40A40 40 0 0 1 80 40V130H0Z" fill="{c1}"/><path d="M6 40A34 34 0 0 1 74 40V124H6Z" fill="{c2}"/><path d="M14 70C16 40 30 22 52 16C34 30 24 50 22 90Z" fill="{c3}" opacity=".5"/>`),
  },
  lampara_pie: {
    nombre: "Lámpara de pie", categoria: "luces", anchoRel: 0.12, colores: ["#e8dcc5", "#2b2b2b", "#ffe9a8"],
    svg: S(70, 200, `
      <ellipse cx="35" cy="70" rx="46" ry="34" fill="{c3}" opacity=".28"/>
      <path d="M12 12H58L66 70H4Z" fill="{c1}"/><path d="M12 12H30L26 70H4Z" fill="rgba(0,0,0,.12)"/>
      <rect x="33" y="70" width="4" height="118" fill="{c2}"/><ellipse cx="35" cy="190" rx="20" ry="6" fill="{c2}"/>`),
  },
  lampara_colgante: {
    nombre: "Lámpara colgante", categoria: "luces", anchoRel: 0.12, colores: ["#2b2b2b", "#ffe9a8", "#c9a25a"],
    svg: S(80, 130, `
      <rect x="39" y="0" width="2" height="50" fill="{c1}"/><ellipse cx="40" cy="110" rx="36" ry="20" fill="{c2}" opacity=".3"/>
      <path d="M40 50C18 50 6 70 6 90H74C74 70 62 50 40 50Z" fill="{c1}"/><path d="M6 90H74V95H6Z" fill="{c3}"/><circle cx="40" cy="100" r="7" fill="{c2}"/>`),
  },
  luces_guirnalda: {
    nombre: "Guirnalda de luces", categoria: "luces", anchoRel: 0.6, colores: ["#ffd66b", "#4a4a4a", "#fff3c4"],
    svg: S(240, 60, `
      <path d="M0 10C40 40 80 40 120 10C160 40 200 40 240 10" stroke="{c2}" stroke-width="1.5" fill="none"/>
      ${[20, 50, 80, 110, 140, 170, 200, 230].map((x, i) => { const y = 10 + 22 * Math.abs(Math.sin((x / 120) * Math.PI)); return `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + 8}" stroke="{c2}" stroke-width="1.5"/><circle cx="${x}" cy="${y + 16}" r="11" fill="{c3}" opacity=".35"/><circle cx="${x}" cy="${y + 15}" r="6" fill="{c1}"/>`; }).join("")}`),
  },
  sofa: {
    nombre: "Sofá", categoria: "muebles", anchoRel: 0.45, colores: ["#6b8e7b", "#2b2b2b", "#ffffff"],
    svg: S(200, 100, `
      <rect x="14" y="14" width="172" height="46" rx="10" fill="{c1}"/><rect x="14" y="14" width="172" height="46" rx="10" fill="rgba(0,0,0,.1)"/>
      <rect x="0" y="40" width="200" height="40" rx="12" fill="{c1}"/><rect x="0" y="40" width="22" height="40" rx="10" fill="rgba(0,0,0,.14)"/><rect x="178" y="40" width="22" height="40" rx="10" fill="rgba(0,0,0,.14)"/>
      <rect x="24" y="44" width="74" height="30" rx="7" fill="{c1}"/><rect x="102" y="44" width="74" height="30" rx="7" fill="{c1}"/><path d="M24 74H98V78H24ZM102 74H176V78H102Z" fill="rgba(0,0,0,.18)"/>
      <rect x="40" y="26" width="26" height="22" rx="4" fill="{c3}" opacity=".85"/>
      <rect x="18" y="80" width="8" height="14" fill="{c2}"/><rect x="174" y="80" width="8" height="14" fill="{c2}"/><rect x="0" y="94" width="200" height="6" fill="rgba(0,0,0,.2)" rx="3"/>`),
  },
  sillon: {
    nombre: "Sillón", categoria: "muebles", anchoRel: 0.25, colores: ["#c7b299", "#5a4632", "#ffffff"],
    svg: S(110, 110, `
      <rect x="18" y="10" width="74" height="60" rx="14" fill="{c1}"/><rect x="18" y="10" width="74" height="60" rx="14" fill="rgba(0,0,0,.1)"/>
      <rect x="0" y="48" width="110" height="42" rx="12" fill="{c1}"/><rect x="0" y="48" width="20" height="42" rx="10" fill="rgba(0,0,0,.14)"/><rect x="90" y="48" width="20" height="42" rx="10" fill="rgba(0,0,0,.14)"/>
      <rect x="24" y="54" width="62" height="28" rx="7" fill="{c1}"/><path d="M24 82H86V86H24Z" fill="rgba(0,0,0,.18)"/>
      <rect x="10" y="90" width="7" height="14" fill="{c2}"/><rect x="93" y="90" width="7" height="14" fill="{c2}"/>`),
  },
  mesa_centro: {
    nombre: "Mesa de centro", categoria: "muebles", anchoRel: 0.3, colores: ["#a97c50", "#2b2b2b", "#e9e7e2"],
    svg: S(140, 60, `
      <ellipse cx="70" cy="56" rx="66" ry="4" fill="rgba(0,0,0,.15)"/>
      <rect x="0" y="18" width="140" height="10" rx="3" fill="{c1}"/><rect x="0" y="24" width="140" height="4" fill="rgba(0,0,0,.2)"/>
      <path d="M12 28L6 54H10L16 28ZM128 28L134 54H130L124 28Z" fill="{c2}"/><path d="M30 28L26 54H30L34 28ZM110 28L114 54H110L106 28Z" fill="{c2}"/>
      <rect x="54" y="8" width="24" height="10" rx="2" fill="{c3}"/><rect x="58" y="4" width="16" height="4" rx="1" fill="#7c4b3a"/>`),
  },
  estanteria: {
    nombre: "Estantería", categoria: "muebles", anchoRel: 0.25, colores: ["#8a6a4a", "#2b2b2b", "#e9e7e2"],
    svg: S(100, 160, `
      <rect x="0" y="0" width="100" height="160" rx="3" fill="{c1}"/><rect x="6" y="6" width="88" height="148" fill="rgba(0,0,0,.28)"/>
      <g fill="{c1}"><rect x="6" y="40" width="88" height="5"/><rect x="6" y="80" width="88" height="5"/><rect x="6" y="120" width="88" height="5"/></g>
      <g><rect x="12" y="16" width="7" height="24" fill="#a4553a"/><rect x="20" y="20" width="6" height="20" fill="#1f4e79"/><rect x="27" y="14" width="8" height="26" fill="#e0b25c"/><rect x="36" y="22" width="6" height="18" fill="#6b8e7b"/><rect x="56" y="24" width="30" height="16" rx="2" fill="{c3}"/>
      <rect x="14" y="60" width="30" height="20" rx="2" fill="#c7b299"/><circle cx="70" cy="68" r="8" fill="#3f9a5c"/><rect x="66" y="74" width="8" height="6" fill="#b5654a"/>
      <rect x="12" y="98" width="8" height="22" fill="#2a9d8f"/><rect x="21" y="102" width="7" height="18" fill="#e76f51"/><rect x="29" y="96" width="6" height="24" fill="#264653"/><rect x="50" y="104" width="36" height="16" rx="2" fill="{c3}"/>
      <rect x="14" y="132" width="72" height="20" rx="2" fill="#5a4632"/></g>`),
  },
  repisa: {
    nombre: "Repisa flotante", categoria: "muebles", anchoRel: 0.25, colores: ["#a97c50", "#3f9a5c", "#2b2b2b"],
    svg: S(120, 50, `
      <rect x="0" y="38" width="120" height="7" rx="2" fill="{c1}"/><rect x="0" y="43" width="120" height="4" fill="rgba(0,0,0,.2)"/>
      <rect x="8" y="14" width="6" height="24" fill="#a4553a"/><rect x="15" y="18" width="5" height="20" fill="#1f4e79"/><rect x="21" y="12" width="7" height="26" fill="#e0b25c"/>
      <rect x="44" y="18" width="26" height="20" rx="2" fill="{c3}"/><rect x="47" y="21" width="20" height="14" fill="#f6f2ea"/><circle cx="57" cy="28" r="4" fill="#d9a066"/>
      <path d="M90 26H108L106 38H92Z" fill="#b5654a"/><g fill="{c2}"><ellipse cx="94" cy="20" rx="6" ry="4"/><ellipse cx="104" cy="18" rx="6" ry="4"/><ellipse cx="99" cy="12" rx="4" ry="6"/></g>`),
  },
  tv: {
    nombre: "Televisor", categoria: "accesorios", anchoRel: 0.35, colores: ["#1b1f26", "#2e4a6b", "#2b2b2b"],
    svg: S(160, 100, `
      <rect x="0" y="0" width="160" height="90" rx="3" fill="{c1}"/><rect x="4" y="4" width="152" height="82" fill="{c2}"/><rect x="4" y="4" width="152" height="82" fill="url(#p)"/>
      <rect x="66" y="90" width="28" height="4" fill="{c3}"/><rect x="50" y="94" width="60" height="4" rx="2" fill="{c3}"/>
      <defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient></defs>`),
  },
  alfombra: {
    nombre: "Alfombra", categoria: "textiles", anchoRel: 0.45, colores: ["#c7b299", "#f6f2ea", "#7c4b3a"],
    svg: S(200, 90, `
      <path d="M30 0H170L200 90H0Z" fill="{c1}"/><path d="M40 8H160L184 82H16Z" fill="none" stroke="{c2}" stroke-width="3"/>
      <path d="M62 24H138L152 66H48Z" fill="none" stroke="{c3}" stroke-width="2" opacity=".7"/><path d="M88 34H112L118 56H82Z" fill="{c2}" opacity=".6"/>
      <g stroke="{c2}" stroke-width="2"><path d="M0 90V86M8 90V86M16 90V86M24 90V86M32 90V86M40 90V86M48 90V86M56 90V86M64 90V86M72 90V86M80 90V86M88 90V86M96 90V86M104 90V86M112 90V86M120 90V86M128 90V86M136 90V86M144 90V86M152 90V86M160 90V86M168 90V86M176 90V86M184 90V86M192 90V86M200 90V86"/></g>`),
  },
  cortina: {
    nombre: "Cortina", categoria: "textiles", anchoRel: 0.2, colores: ["#e8dcc5", "#5a4632", "#000000"],
    svg: S(90, 200, `
      <rect x="0" y="0" width="90" height="5" rx="2" fill="{c2}"/><circle cx="2" cy="2.5" r="3" fill="{c2}"/><circle cx="88" cy="2.5" r="3" fill="{c2}"/>
      <path d="M6 5H84C86 60 88 120 78 200H4C-4 120 4 60 6 5Z" fill="{c1}"/>
      <g fill="{c3}" opacity=".1"><path d="M14 5C10 60 8 120 10 200H18C16 120 18 60 22 5Z"/><path d="M34 5C30 60 28 120 30 200H38C36 120 38 60 42 5Z"/><path d="M54 5C50 60 48 120 50 200H58C56 120 58 60 62 5Z"/><path d="M72 5C68 60 66 120 68 200H76C74 120 76 60 80 5Z"/></g>
      <path d="M4 110C30 100 60 100 84 110V122C60 112 30 112 4 122Z" fill="{c2}"/>`),
  },
  cojin: {
    nombre: "Cojín", categoria: "textiles", anchoRel: 0.1, colores: ["#e67e22", "#f6f2ea", "#000000"],
    svg: S(80, 80, `
      <path d="M4 4C30 10 50 10 76 4C70 30 70 50 76 76C50 70 30 70 4 76C10 50 10 30 4 4Z" fill="{c1}"/>
      <path d="M4 4C30 10 50 10 76 4C70 30 70 50 76 76C50 70 30 70 4 76C10 50 10 30 4 4Z" fill="url(#s)"/>
      <path d="M22 40H58M40 22V58" stroke="{c2}" stroke-width="3" opacity=".7"/>
      <defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="{c3}" stop-opacity=".22"/></linearGradient></defs>`),
  },
  reloj: {
    nombre: "Reloj de pared", categoria: "accesorios", anchoRel: 0.1, colores: ["#2b2b2b", "#f6f2ea", "#c0392b"],
    svg: S(80, 80, `
      <circle cx="40" cy="40" r="39" fill="{c1}"/><circle cx="40" cy="40" r="34" fill="{c2}"/>
      <g stroke="{c1}" stroke-width="2"><path d="M40 10V16M40 64V70M10 40H16M64 40H70"/></g>
      <path d="M40 40V20" stroke="{c1}" stroke-width="3" stroke-linecap="round"/><path d="M40 40L54 48" stroke="{c1}" stroke-width="3" stroke-linecap="round"/><path d="M40 40L30 26" stroke="{c3}" stroke-width="1.5" stroke-linecap="round"/><circle cx="40" cy="40" r="2.5" fill="{c3}"/>`),
  },
  jarron: {
    nombre: "Jarrón con ramas", categoria: "accesorios", anchoRel: 0.1, colores: ["#1f4e79", "#7c8a4a", "#5a4632"],
    svg: S(60, 110, `
      <g stroke="{c3}" stroke-width="1.5" fill="none"><path d="M30 60C28 40 22 26 12 10"/><path d="M30 60C32 40 40 24 50 8"/><path d="M30 60C30 44 30 30 31 14"/></g>
      <g fill="{c2}"><ellipse cx="14" cy="14" rx="4" ry="2.5" transform="rotate(-40 14 14)"/><ellipse cx="20" cy="26" rx="4" ry="2.5" transform="rotate(-40 20 26)"/><ellipse cx="46" cy="12" rx="4" ry="2.5" transform="rotate(40 46 12)"/><ellipse cx="42" cy="24" rx="4" ry="2.5" transform="rotate(40 42 24)"/><ellipse cx="31" cy="16" rx="2.5" ry="4"/><ellipse cx="25" cy="40" rx="4" ry="2.5" transform="rotate(-30 25 40)"/><ellipse cx="37" cy="38" rx="4" ry="2.5" transform="rotate(30 37 38)"/></g>
      <path d="M22 56H38L46 76C48 96 40 108 30 108C20 108 12 96 14 76Z" fill="{c1}"/><path d="M22 56H29L24 76C23 96 27 106 30 108C20 108 12 96 14 76Z" fill="rgba(0,0,0,.18)"/>`),
  },
  macetero: {
    nombre: "Macetero grande", categoria: "exterior", anchoRel: 0.25, colores: ["#4a4a4a", "#4f9a5a", "#2f7a48"],
    svg: S(90, 100, `
      <g fill="{c2}"><circle cx="24" cy="36" r="16"/><circle cx="46" cy="28" r="20"/><circle cx="68" cy="38" r="15"/><circle cx="34" cy="50" r="12"/><circle cx="58" cy="52" r="12"/></g>
      <g fill="{c3}"><circle cx="18" cy="42" r="6"/><circle cx="40" cy="34" r="7"/><circle cx="62" cy="46" r="6"/><circle cx="72" cy="30" r="5"/></g>
      <rect x="6" y="58" width="78" height="40" rx="3" fill="{c1}"/><rect x="6" y="58" width="12" height="40" fill="rgba(0,0,0,.2)"/><rect x="4" y="56" width="82" height="6" rx="2" fill="{c1}"/>`),
  },
  banca: {
    nombre: "Banca", categoria: "exterior", anchoRel: 0.35, colores: ["#a97c50", "#2b2b2b", "#000000"],
    svg: S(160, 90, `
      <g fill="{c1}"><rect x="0" y="10" width="160" height="8" rx="2"/><rect x="0" y="22" width="160" height="8" rx="2"/><rect x="0" y="34" width="160" height="8" rx="2"/><rect x="0" y="54" width="160" height="9" rx="2"/><rect x="0" y="65" width="160" height="9" rx="2"/></g>
      <g fill="{c2}"><rect x="14" y="6" width="5" height="48"/><rect x="141" y="6" width="5" height="48"/><rect x="10" y="74" width="6" height="14"/><rect x="144" y="74" width="6" height="14"/><rect x="8" y="50" width="12" height="4"/><rect x="140" y="50" width="12" height="4"/></g>
      <rect x="0" y="86" width="160" height="4" rx="2" fill="{c3}" opacity=".2"/>`),
  },
};

export const CLAVES_ELEMENTOS = Object.keys(ELEMENTOS);

// Devuelve el SVG del elemento con los colores reemplazados.
export function svgElemento(clave, colorPrincipal) {
  const e = ELEMENTOS[clave];
  if (!e) return "";
  const [d1, d2, d3] = e.colores;
  return e.svg
    .replace(/\{c1\}/g, colorPrincipal || d1)
    .replace(/\{c2\}/g, d2)
    .replace(/\{c3\}/g, d3);
}

export function urlElemento(clave, colorPrincipal) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgElemento(clave, colorPrincipal));
}

// Proporción alto/ancho del elemento (desde el viewBox).
export function proporcionElemento(clave) {
  const m = /viewBox="0 0 (\d+) (\d+)"/.exec(ELEMENTOS[clave].svg);
  return m ? Number(m[2]) / Number(m[1]) : 1;
}
