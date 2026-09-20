/* estilos.js — Estilos de decoración: paletas para paredes, pisos y acentos,
   elementos sugeridos y consejos para sacar el máximo provecho del espacio. */

export const ESTILOS = [
  {
    clave: "nordico", nombre: "Nórdico", emoji: "🌿",
    descripcion: "Claro, sencillo y acogedor: blancos, maderas claras y toques verdes.",
    paredes: ["#f4f1ea", "#ffffff", "#e8e4dc", "#d9dfd8", "#c9d3cf", "#9fb3a8"],
    texturasPared: ["liso"],
    acentos: ["#6b8e7b", "#d9a066", "#2f3e46", "#c7b299"],
    pisos: [{ material: "madera", color: "#d8c4a0" }, { material: "madera", color: "#e6d6b8" }, { material: "ceramica", color: "#e9e7e2" }],
    elementos: ["planta_monstera", "alfombra", "lampara_pie", "cuadro_abstracto", "estanteria", "cojin"],
    consejos: [
      "Paredes blancas o beige cálido para reflejar la luz y agrandar el espacio.",
      "Madera clara en piso y muebles; textiles en tonos crudos y lana.",
      "Una sola pared en verde grisáceo aporta calma sin oscurecer.",
    ],
  },
  {
    clave: "minimalista", nombre: "Minimalista", emoji: "▫️",
    descripcion: "Pocos elementos, líneas limpias y una paleta neutra.",
    paredes: ["#ffffff", "#f5f5f5", "#e6e6e6", "#d5d5d5", "#bdbdbd", "#1f1f1f"],
    texturasPared: ["liso"],
    acentos: ["#111111", "#8c8c8c", "#c9c3b8", "#4a4a4a"],
    pisos: [{ material: "ceramica", color: "#ececec" }, { material: "concreto", color: "#c5c5c2" }, { material: "madera", color: "#e3d8c5" }],
    elementos: ["cuadro_abstracto", "planta_cactus", "lampara_pie", "mesa_centro", "sofa"],
    consejos: [
      "Menos es más: deja superficies libres y elige un solo objeto protagonista.",
      "Máximo tres colores en todo el espacio; el negro en detalles da carácter.",
      "Guarda a la vista solo lo que usas; el orden es parte del diseño.",
    ],
  },
  {
    clave: "moderno", nombre: "Moderno", emoji: "🏙️",
    descripcion: "Grises y azules profundos con acentos vivos y muebles de líneas rectas.",
    paredes: ["#e9ecef", "#cfd6dd", "#5b6770", "#2c3e50", "#ffffff", "#7f8c8d"],
    texturasPared: ["liso", "liso", "concreto"],
    acentos: ["#e67e22", "#16a085", "#f1c40f", "#2c3e50"],
    pisos: [{ material: "madera", color: "#8b6a4a" }, { material: "ceramica", color: "#bfc3c6" }, { material: "concreto", color: "#8e9497" }],
    elementos: ["sofa", "tv", "lampara_colgante", "mesa_centro", "cuadro_abstracto", "cojin"],
    consejos: [
      "Un muro de acento oscuro detrás del sofá o la TV enfoca la mirada.",
      "Repite el color de acento en tres puntos: cojín, cuadro y un objeto.",
      "Iluminación en capas: general, de lectura y decorativa.",
    ],
  },
  {
    clave: "industrial", nombre: "Industrial", emoji: "🏭",
    descripcion: "Ladrillo, concreto, metal negro y madera envejecida.",
    paredes: ["#a34a3a", "#8a8d91", "#5c5f63", "#b8b2a8", "#3d3f42", "#c98b6a"],
    texturasPared: ["ladrillo", "concreto", "liso", "liso", "liso", "ladrillo"],
    acentos: ["#c98b3d", "#2b2b2b", "#6d7b8a", "#8a5a3c"],
    pisos: [{ material: "concreto", color: "#9a9a97" }, { material: "madera", color: "#7a5a3c" }, { material: "concreto", color: "#6f6f6d" }],
    elementos: ["lampara_colgante", "estanteria", "reloj", "cuadro_abstracto", "sofa", "repisa"],
    consejos: [
      "Deja una pared de ladrillo o concreto a la vista; el resto en gris claro para equilibrar.",
      "Metal negro en lámparas y estantes; madera con veta marcada en mesas.",
      "Ampolletas de filamento a la vista dan calidez al conjunto.",
    ],
  },
  {
    clave: "boho", nombre: "Boho", emoji: "🪶",
    descripcion: "Tierra, terracota, fibras naturales y muchas plantas.",
    paredes: ["#f3e9d8", "#e8cfae", "#d9a066", "#c88a5a", "#b9a58a", "#f7f1e6"],
    texturasPared: ["liso"],
    acentos: ["#a4553a", "#5e7a5a", "#d5b169", "#7c4b3a"],
    pisos: [{ material: "madera", color: "#b98a5a" }, { material: "madera", color: "#c9a06c" }, { material: "ceramica", color: "#d6c3a5" }],
    elementos: ["planta_colgante", "alfombra", "espejo_redondo", "luces_guirnalda", "jarron", "cojin", "planta_monstera"],
    consejos: [
      "Mezcla texturas: yute, macramé, lino y cerámica sin esmaltar.",
      "Plantas a distintas alturas: colgantes, de piso y sobre repisas.",
      "Terracota o mostaza en un muro para un ambiente cálido y envolvente.",
    ],
  },
  {
    clave: "mediterraneo", nombre: "Mediterráneo", emoji: "🌊",
    descripcion: "Blanco cal, azules del mar, terracota y verde oliva.",
    paredes: ["#f6f0e4", "#ffffff", "#d9e8f0", "#2e5f8a", "#e9d8b8", "#a7c4d6"],
    texturasPared: ["liso"],
    acentos: ["#1f4e79", "#c96a3d", "#8aa84f", "#e0b25c"],
    pisos: [{ material: "ceramica", color: "#d8c7a8" }, { material: "ceramica", color: "#e6dccb" }, { material: "madera", color: "#c8a878" }],
    elementos: ["jarron", "espejo_arco", "cortina", "cuadro_paisaje", "planta_cactus", "macetero"],
    consejos: [
      "Blanco en paredes y un azul intenso en una puerta, ventana o muro pequeño.",
      "Cerámica en el piso y arcos en espejos o marcos refuerzan el estilo.",
      "Cortinas ligeras de lino para dejar entrar la luz.",
    ],
  },
  {
    clave: "rustico", nombre: "Rústico", emoji: "🪵",
    descripcion: "Maderas oscuras, piedra y tonos tierra cálidos.",
    paredes: ["#e8dcc5", "#cbb79a", "#a88b64", "#7a5a3c", "#f1e9d9", "#6b4e35"],
    texturasPared: ["liso", "liso", "ladrillo", "madera", "liso", "madera"],
    acentos: ["#4b3a2a", "#7c8a4a", "#b5451b", "#d9c39a"],
    pisos: [{ material: "madera", color: "#8a5f3c" }, { material: "madera", color: "#6e4a2e" }, { material: "ceramica", color: "#b79b77" }],
    elementos: ["estanteria", "cuadro_paisaje", "lampara_pie", "alfombra", "banca", "reloj"],
    consejos: [
      "Un muro de madera o ladrillo como fondo; el resto en tonos crema.",
      "Muebles macizos y pocos: una mesa grande vale más que varias pequeñas.",
      "Luz cálida (2700 K) para realzar las vetas de la madera.",
    ],
  },
  {
    clave: "tropical", nombre: "Tropical", emoji: "🌴",
    descripcion: "Verdes intensos, blanco fresco y detalles en coral y mostaza.",
    paredes: ["#ffffff", "#e6f2e6", "#2f7d5b", "#f2d16b", "#f6e7d2", "#1f5f4a"],
    texturasPared: ["liso"],
    acentos: ["#ff7f50", "#2a9d8f", "#e9c46a", "#264653"],
    pisos: [{ material: "ceramica", color: "#e8dfcc" }, { material: "madera", color: "#c99b6a" }, { material: "madera", color: "#e0c39a" }],
    elementos: ["planta_monstera", "planta_colgante", "alfombra", "luces_guirnalda", "cuadro_abstracto", "cojin"],
    consejos: [
      "Un muro verde profundo hace resaltar las plantas y los muebles claros.",
      "Fibras naturales (ratán, bambú) en lámparas y sillas.",
      "Coral o mostaza en cojines y cuadros como contrapunto.",
    ],
  },
  {
    clave: "clasico", nombre: "Clásico", emoji: "🏛️",
    descripcion: "Elegante y atemporal: cremas, dorados y maderas nobles.",
    paredes: ["#f2ead7", "#d9cbb0", "#b9a48a", "#7d8a97", "#dfe4e8", "#5d4a3a"],
    texturasPared: ["liso"],
    acentos: ["#7b1e2b", "#1f3a5f", "#b08d57", "#3a3a3a"],
    pisos: [{ material: "madera", color: "#7a4f2e" }, { material: "madera", color: "#9c6b45" }, { material: "ceramica", color: "#d5cbb8" }],
    elementos: ["espejo_arco", "cuadro_paisaje", "lampara_pie", "reloj", "sillon", "cortina"],
    consejos: [
      "Simetría: pares de lámparas, cuadros o sillones a cada lado de un eje.",
      "Molduras o un espejo grande con marco dorado dan altura y elegancia.",
      "Cortinas largas hasta el piso alargan visualmente los muros.",
    ],
  },
  {
    clave: "infantil", nombre: "Infantil", emoji: "🧸",
    descripcion: "Pasteles alegres y elementos lúdicos para una pieza de niños.",
    paredes: ["#fff7e0", "#ffe0e6", "#dff3ff", "#e5f6e0", "#f3e6ff", "#ffd8a8"],
    texturasPared: ["liso"],
    acentos: ["#ff6b6b", "#4dabf7", "#69db7c", "#ffd43b", "#b197fc"],
    pisos: [{ material: "madera", color: "#e6d2b3" }, { material: "ceramica", color: "#f0efe8" }, { material: "madera", color: "#d9bf98" }],
    elementos: ["estanteria", "luces_guirnalda", "alfombra", "reloj", "cuadro_paisaje", "cojin", "repisa"],
    consejos: [
      "Fondo pastel y colores vivos solo en accesorios fáciles de cambiar.",
      "Almacenamiento a la altura de los niños: repisas bajas y cajas.",
      "Una guirnalda de luces cálidas como luz nocturna suave.",
    ],
  },
  {
    clave: "vibrante", nombre: "Vibrante", emoji: "🎨",
    descripcion: "Colores intensos y contrastes atrevidos para espacios con personalidad.",
    paredes: ["#f4a261", "#e76f51", "#2a9d8f", "#264653", "#e9c46a", "#8e44ad"],
    texturasPared: ["liso"],
    acentos: ["#ffffff", "#111111", "#f1faee", "#f4a261"],
    pisos: [{ material: "madera", color: "#c9a06c" }, { material: "concreto", color: "#b0b0ad" }, { material: "ceramica", color: "#e5e5e5" }],
    elementos: ["cuadro_abstracto", "sofa", "planta_monstera", "lampara_colgante", "cojin", "alfombra"],
    consejos: [
      "Pinta un solo muro con el color fuerte y deja los demás neutros.",
      "Repite ese color en dos accesorios pequeños para que no quede aislado.",
      "Blanco en muebles grandes para que el color sea el protagonista.",
    ],
  },
  {
    clave: "exterior", nombre: "Exterior / patio", emoji: "🏡",
    descripcion: "Fachadas, terrazas y patios: tonos de fachada, verde y madera de exterior.",
    paredes: ["#ffffff", "#e8e2d3", "#cfc6b3", "#8d9c8c", "#4a5a6a", "#a8b5a0"],
    texturasPared: ["liso", "liso", "concreto", "liso", "liso", "ladrillo"],
    acentos: ["#2f4f4f", "#c0392b", "#6d8b3a", "#d9a066"],
    pisos: [{ material: "ceramica", color: "#c8bfae" }, { material: "concreto", color: "#a8a8a3" }, { material: "madera", color: "#a97c50" }],
    elementos: ["macetero", "banca", "luces_guirnalda", "planta_cactus", "planta_monstera"],
    consejos: [
      "Fachada clara y puerta o ventanas en un color de contraste.",
      "Maceteros grandes en pocos puntos lucen más que muchos pequeños.",
      "Luces de guirnalda o apliques bajos alargan el uso del patio de noche.",
    ],
  },
];

export function estiloPorClave(clave) {
  return ESTILOS.find((e) => e.clave === clave) || ESTILOS[0];
}

// Consejos según el análisis de la foto (ver procesar.analizarFoto).
export function consejosSegunFoto(a) {
  const c = [];
  if (a.nivelLuz === "oscura") {
    c.push("La foto se ve oscura: tonos claros y cálidos en paredes (blanco hueso, arena) rebotan la luz y agrandan el espacio.");
    c.push("Un espejo grande frente a la ventana o a la fuente de luz duplica la luminosidad.");
    c.push("Prefiere luz cálida indirecta (lámpara de pie, guirnalda) en vez de un solo foco central.");
  } else if (a.nivelLuz === "luminosa") {
    c.push("Espacio luminoso: puedes atreverte con un color intenso u oscuro en una pared sin perder amplitud.");
    c.push("En muros muy iluminados usa acabados mate para evitar reflejos.");
  } else {
    c.push("Iluminación equilibrada: un muro de acento en tono medio funciona bien sin oscurecer.");
    c.push("Regla 60-30-10: 60 % color base, 30 % secundario y 10 % de acento.");
  }
  if (a.calidez > 0.15) c.push("Dominan los tonos cálidos: equilibra con acentos fríos (verde, azul grisáceo) o refuerza con neutros crudos.");
  else if (a.calidez < -0.15) c.push("Dominan los tonos fríos: suma madera, mimbre o textiles ocre para dar calidez.");
  c.push("Pinta primero paredes y piso, después agrega muebles y plantas: así ves el conjunto.");
  c.push("Usa «Alternativas» en la pestaña Estilos para comparar 6 combinaciones en segundos.");
  return c;
}
