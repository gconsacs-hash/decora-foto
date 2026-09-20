/* app.js — Interfaz y estado de DecoraFoto. */

import * as P from "./procesar.js";
import { ESTILOS, estiloPorClave, consejosSegunFoto } from "./estilos.js";
import { ELEMENTOS, CATEGORIAS, urlElemento, proporcionElemento } from "./elementos.js";
import * as db from "./db.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const MAX_LADO = 1400;
const MAX_HISTORIAL = 30;

// ---------- Estado ----------
const estado = {
  original: null, ancho: 0, alto: 0,
  capas: [], seleccion: null,
  estilo: "nordico",
  pestana: "pintar", modoPintar: "varita+", tolerancia: 25, tamPincel: 40,
  luz: { brillo: 0, calidez: 0 },
  historial: [], futuro: [],
  vista: { escala: 1, tx: 0, ty: 0 },
  comparar: false, divisor: 0.5, mostrarOriginal: false,
  proyectoId: null, nombreProyecto: "",
  analisis: null, colorIdea: null,
  categoriaElementos: "sugeridos",
  recientes: [],
  cacheBase: null, // píxeles con pintura aplicada (antes de luz)
};
let contadorId = 1;
const nuevoId = () => "c" + (contadorId++) + "_" + Date.now().toString(36);

// ---------- Elementos del DOM ----------
const pantallaInicio = $("#inicio"), pantallaEditor = $("#editor");
const escenario = $("#escenario"), vista = $("#vista");
const lienzoBase = $("#lienzo-base"), lienzoEl = $("#lienzo-elementos");
const ctxBase = lienzoBase.getContext("2d"), ctxEl = lienzoEl.getContext("2d");
const ayudaToque = $("#ayuda-toque");
const divisor = $("#divisor");

// ---------- Utilidades de interfaz ----------
let temporizadorAviso;
function avisar(texto, ms = 2600) {
  const a = $("#aviso");
  a.textContent = texto; a.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { a.hidden = true; }, ms);
}
function cargando(activo) { $("#cargando").hidden = !activo; }
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
function ayuda(texto) { ayudaToque.textContent = texto || ""; }

function actualizarBotonesHistorial() {
  $("#btn-deshacer").disabled = !estado.historial.length;
  $("#btn-rehacer").disabled = !estado.futuro.length;
}
function instantanea() {
  return { capas: estado.capas.map((c) => ({ ...c })), luz: { ...estado.luz }, seleccion: estado.seleccion };
}
function guardarHistorial() {
  estado.historial.push(instantanea());
  if (estado.historial.length > MAX_HISTORIAL) estado.historial.shift();
  estado.futuro = [];
  actualizarBotonesHistorial();
}
function restaurar(s) {
  estado.capas = s.capas.map((c) => ({ ...c }));
  estado.luz = { ...s.luz };
  estado.seleccion = s.seleccion;
  marcarSucio(); renderizar(); refrescarPanel();
}
function deshacer() {
  if (!estado.historial.length) return;
  estado.futuro.push(instantanea());
  restaurar(estado.historial.pop());
  actualizarBotonesHistorial();
}
function rehacer() {
  if (!estado.futuro.length) return;
  estado.historial.push(instantanea());
  restaurar(estado.futuro.pop());
  actualizarBotonesHistorial();
}

// ---------- Carga de fotos ----------
async function cargarArchivo(archivo) {
  if (!archivo) return;
  cargando(true);
  await esperar(30);
  try {
    let bitmap;
    try { bitmap = await createImageBitmap(archivo, { imageOrientation: "from-image" }); }
    catch { bitmap = await cargarConImg(archivo); }
    const f = Math.min(1, MAX_LADO / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * f)), h = Math.max(1, Math.round(bitmap.height * f));
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    c.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    if (bitmap.close) bitmap.close();
    iniciarProyecto(c.getContext("2d").getImageData(0, 0, w, h));
  } catch (e) {
    console.error(e);
    avisar("No se pudo abrir la imagen.");
  } finally {
    cargando(false);
  }
}
function cargarConImg(archivo) {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolver(img); };
    img.onerror = () => { URL.revokeObjectURL(url); rechazar(new Error("imagen inválida")); };
    img.src = url;
  });
}

function iniciarProyecto(imageData, datos = null) {
  estado.original = imageData;
  estado.ancho = imageData.width; estado.alto = imageData.height;
  estado.capas = datos ? datos.capas : [];
  estado.seleccion = null;
  estado.luz = datos ? { ...datos.luz } : { brillo: 0, calidez: 0 };
  estado.estilo = datos ? datos.estilo : estado.estilo;
  estado.proyectoId = datos ? datos.id : null;
  estado.nombreProyecto = datos ? datos.nombre : "";
  estado.historial = []; estado.futuro = [];
  estado.comparar = false; estado.mostrarOriginal = false;
  estado.analisis = null; estado.colorIdea = null;
  estado.cacheBase = null;
  cachePequena = null;
  estado.vista = { escala: 1, tx: 0, ty: 0 };
  lienzoBase.width = lienzoEl.width = estado.ancho;
  lienzoBase.height = lienzoEl.height = estado.alto;
  $("#brillo").value = estado.luz.brillo; $("#calidez").value = estado.luz.calidez;
  $("#brillo").nextElementSibling.value = estado.luz.brillo;
  $("#calidez").nextElementSibling.value = estado.luz.calidez;
  divisor.hidden = true; $("#btn-comparar").classList.remove("activa");
  pantallaInicio.hidden = true; pantallaEditor.hidden = false;
  actualizarBotonesHistorial();
  cambiarPestana("pintar");
  aplicarVista();
  ajustarVista();
  renderizar();
  refrescarPanel();
  if (!datos) ayuda("Toca una pared o el piso para pintarlo");
}

// ---------- Vista (zoom) ----------
function ajustarVista() {
  if (!estado.ancho) return;
  const r = escenario.getBoundingClientRect();
  const f = Math.min(r.width / estado.ancho, r.height / estado.alto);
  vista.style.width = Math.floor(estado.ancho * f) + "px";
  vista.style.height = Math.floor(estado.alto * f) + "px";
}
function aplicarVista() {
  const v = estado.vista;
  vista.style.transform = `translate(${v.tx}px, ${v.ty}px) scale(${v.escala})`;
  $("#btn-zoom").hidden = v.escala === 1;
}
function reiniciarZoom() { estado.vista = { escala: 1, tx: 0, ty: 0 }; aplicarVista(); }
window.addEventListener("resize", () => { ajustarVista(); });
if ("ResizeObserver" in window) new ResizeObserver(() => ajustarVista()).observe(escenario);

// ---------- Render ----------
function marcarSucio() { estado.cacheBase = null; }

function capaRender(capa, ancho) {
  return {
    mascara: capa.mascara, color: P.hexARgb(capa.color), intensidad: capa.intensidad,
    material: capa.material, escala: Math.max(4, ancho * capa.escala / 1000), contraste: 1,
  };
}

// Devuelve los píxeles finales (foto + pintura + luz) para el tamaño completo.
function pixelesFinales() {
  if (!estado.cacheBase) {
    const pix = new Uint8ClampedArray(estado.original.data);
    for (const c of estado.capas) if (c.tipo === "pintura") P.aplicarPintura(pix, estado.ancho, estado.alto, capaRender(c, estado.ancho));
    estado.cacheBase = pix;
  }
  const salida = new Uint8ClampedArray(estado.cacheBase);
  P.ajustarLuz(salida, estado.luz.brillo, estado.luz.calidez);
  return salida;
}

function renderizarBase() {
  const { ancho, alto } = estado;
  if (estado.mostrarOriginal) { ctxBase.putImageData(estado.original, 0, 0); return; }
  const pix = pixelesFinales();
  if (estado.comparar) {
    const corte = Math.round(estado.divisor * ancho);
    const org = estado.original.data;
    for (let y = 0; y < alto; y++) {
      const ini = y * ancho * 4;
      pix.set(org.subarray(ini, ini + corte * 4), ini);
    }
    for (let y = 0; y < alto; y++) { const k = (y * ancho + corte) * 4; pix[k] = 255; pix[k + 1] = 255; pix[k + 2] = 255; }
  }
  ctxBase.putImageData(new ImageData(pix, ancho, alto), 0, 0);
}

const cacheImg = new Map();
function obtenerImagen(e) {
  const clave = e.clave + "|" + (e.color || "");
  let ent = cacheImg.get(clave);
  if (!ent) {
    const img = new Image();
    ent = { img, lista: false };
    img.onload = () => { ent.lista = true; programarRender(); };
    img.src = urlElemento(e.clave, e.color);
    cacheImg.set(clave, ent);
  }
  return ent.lista ? ent.img : null;
}

function dibujarElemento(ctx, e, f = 1) {
  const img = obtenerImagen(e);
  if (!img) return;
  const w = e.ancho * f, h = w * e.ratio;
  ctx.save();
  ctx.translate(e.x * f, e.y * f);
  ctx.rotate(e.rot);
  if (e.flip) ctx.scale(-1, 1);
  if (e.sombra) { ctx.shadowColor = "rgba(0,0,0,.4)"; ctx.shadowBlur = w * 0.08; ctx.shadowOffsetY = w * 0.03; }
  ctx.drawImage(img, -w / 2, -h / 2, w, h);
  ctx.restore();
}

function renderizarElementos() {
  const { ancho, alto } = estado;
  ctxEl.clearRect(0, 0, ancho, alto);
  if (estado.mostrarOriginal) return;
  ctxEl.save();
  if (estado.comparar) { ctxEl.beginPath(); ctxEl.rect(estado.divisor * ancho, 0, ancho, alto); ctxEl.clip(); }
  for (const c of estado.capas) if (c.tipo === "elemento") dibujarElemento(ctxEl, c);
  ctxEl.restore();

  const sel = capaSeleccionada();
  if (!sel) return;
  const grosor = Math.max(1.5, ancho / 500);
  if (sel.tipo === "elemento" && estado.pestana === "decorar") {
    const w = sel.ancho, h = w * sel.ratio;
    ctxEl.save();
    ctxEl.translate(sel.x, sel.y); ctxEl.rotate(sel.rot);
    ctxEl.strokeStyle = "#4f9cf9"; ctxEl.lineWidth = grosor; ctxEl.setLineDash([grosor * 4, grosor * 3]);
    ctxEl.strokeRect(-w / 2, -h / 2, w, h);
    ctxEl.restore();
  } else if (sel.tipo === "pintura" && estado.pestana === "pintar") {
    if (sel._contornoDe !== sel.mascara) {
      const c = document.createElement("canvas"); c.width = ancho; c.height = alto;
      const cctx = c.getContext("2d");
      const img = cctx.createImageData(ancho, alto);
      const d = img.data;
      for (const i of P.contornoMascara(sel.mascara, ancho, alto)) { const k = i * 4; d[k] = 255; d[k + 1] = 255; d[k + 2] = 255; d[k + 3] = 230; }
      cctx.putImageData(img, 0, 0);
      sel._contornoLienzo = c; sel._contornoDe = sel.mascara;
    }
    ctxEl.drawImage(sel._contornoLienzo, 0, 0);
  }
}

let renderPendiente = false;
function programarRender() {
  if (renderPendiente) return;
  renderPendiente = true;
  requestAnimationFrame(() => { renderPendiente = false; renderizar(); });
}
function renderizar() {
  if (!estado.original) return;
  renderizarBase();
  renderizarElementos();
}

// Dibuja la composición completa (sin marcas de selección) en un contexto, a escala f.
function pintarCompleto(ctx, f = 1) {
  const pix = pixelesFinales();
  const c = document.createElement("canvas"); c.width = estado.ancho; c.height = estado.alto;
  c.getContext("2d").putImageData(new ImageData(pix, estado.ancho, estado.alto), 0, 0);
  ctx.drawImage(c, 0, 0, estado.ancho * f, estado.alto * f);
  for (const e of estado.capas) if (e.tipo === "elemento") dibujarElemento(ctx, e, f);
}

// ---------- Capas ----------
function capaSeleccionada() { return estado.capas.find((c) => c.id === estado.seleccion) || null; }
const capasPintura = () => estado.capas.filter((c) => c.tipo === "pintura");
const TIPOS = [["pared", "Pared"], ["piso", "Piso"], ["techo", "Techo"], ["mueble", "Mueble"], ["otro", "Otro"]];

function colorInicial(categoria) {
  const s = estiloPorClave(estado.estilo);
  if (categoria === "piso") return s.pisos[0].color;
  if (categoria === "techo") return "#f7f6f2";
  if (categoria === "mueble" || categoria === "otro") return s.acentos[0];
  return s.paredes[0];
}
function nuevaCapaPintura(categoria = "pared") {
  const n = capasPintura().filter((c) => c.categoria === categoria).length + 1;
  const capa = {
    id: nuevoId(), tipo: "pintura", categoria, nombre: TIPOS.find((t) => t[0] === categoria)[1] + " " + n,
    mascara: new Uint8Array(estado.ancho * estado.alto), color: colorInicial(categoria),
    material: categoria === "piso" ? estiloPorClave(estado.estilo).pisos[0].material : "liso", escala: 35, intensidad: 1,
  };
  estado.capas.push(capa);
  estado.seleccion = capa.id;
  return capa;
}

async function aplicarVarita(x, y, quitar) {
  let capa = capaSeleccionada();
  if (!capa || capa.tipo !== "pintura") {
    if (quitar) { avisar("Primero elige una superficie."); return; }
    capa = nuevaCapaPintura("pared");
  }
  cargando(true); await esperar(20);
  try {
    const region = P.rellenoVarita(estado.original.data, estado.ancho, estado.alto, x, y, estado.tolerancia);
    const cant = P.contarMascara(region);
    const suave = P.suavizarMascara(region, estado.ancho, estado.alto, 1);
    guardarHistorial();
    capa.mascara = quitar ? P.restarMascara(capa.mascara, suave) : P.unirMascara(capa.mascara, suave);
    marcarSucio(); renderizar(); refrescarPanel();
    const total = estado.ancho * estado.alto;
    if (cant < total * 0.002) ayuda("Zona muy pequeña: sube la tolerancia o usa el pincel");
    else if (cant > total * 0.85) ayuda("Se seleccionó casi toda la foto: baja la tolerancia y deshaz (↶)");
    else if (!quitar) ayuda("Toca otra zona de la misma superficie para ampliar, o «+ Nueva» para otra");
    else ayuda("");
  } finally { cargando(false); }
}

function eliminarCapa(id) {
  guardarHistorial();
  estado.capas = estado.capas.filter((c) => c.id !== id);
  if (estado.seleccion === id) estado.seleccion = null;
  marcarSucio(); renderizar(); refrescarPanel();
}

// ---------- Elementos ----------
function agregarElemento(clave) {
  const def = ELEMENTOS[clave];
  guardarHistorial();
  const e = {
    id: nuevoId(), tipo: "elemento", clave, x: estado.ancho / 2, y: estado.alto * 0.6,
    ancho: estado.ancho * def.anchoRel, ratio: proporcionElemento(clave), rot: 0, flip: false, color: null, sombra: true,
  };
  estado.capas.push(e);
  estado.seleccion = e.id;
  renderizar(); refrescarPanel();
  ayuda("Arrastra para mover · pellizca para agrandar o girar");
}

function accionElemento(accion) {
  const e = capaSeleccionada();
  if (!e || e.tipo !== "elemento") return;
  guardarHistorial();
  const i = estado.capas.indexOf(e);
  switch (accion) {
    case "menor": e.ancho = Math.max(estado.ancho * 0.03, e.ancho / 1.15); break;
    case "mayor": e.ancho = Math.min(estado.ancho * 1.5, e.ancho * 1.15); break;
    case "rotar-izq": e.rot -= Math.PI / 24; break;
    case "rotar-der": e.rot += Math.PI / 24; break;
    case "voltear": e.flip = !e.flip; break;
    case "sombra": e.sombra = !e.sombra; break;
    case "adelante": if (i < estado.capas.length - 1) { estado.capas.splice(i, 1); estado.capas.splice(i + 1, 0, e); } break;
    case "atras": {
      const primerElemento = estado.capas.findIndex((c) => c.tipo === "elemento");
      if (i > primerElemento) { estado.capas.splice(i, 1); estado.capas.splice(i - 1, 0, e); }
      break;
    }
    case "duplicar": {
      const copia = { ...e, id: nuevoId(), x: e.x + e.ancho * 0.3, y: e.y + e.ancho * 0.15 };
      estado.capas.push(copia); estado.seleccion = copia.id; break;
    }
    case "eliminar": estado.capas = estado.capas.filter((c) => c.id !== e.id); estado.seleccion = null; break;
  }
  renderizar(); refrescarPanel();
}

function elementoEn(x, y) {
  for (let i = estado.capas.length - 1; i >= 0; i--) {
    const e = estado.capas[i];
    if (e.tipo !== "elemento") continue;
    const dx = x - e.x, dy = y - e.y;
    const cos = Math.cos(-e.rot), sin = Math.sin(-e.rot);
    const lx = dx * cos - dy * sin, ly = dx * sin + dy * cos;
    const w = e.ancho, h = w * e.ratio;
    if (Math.abs(lx) <= w / 2 + 4 && Math.abs(ly) <= h / 2 + 4) return e;
  }
  return null;
}

// ---------- Gestos sobre el lienzo ----------
const punteros = new Map();
let gesto = null;
let ultimoToque = 0;

function coordsImagen(ev) {
  const r = lienzoEl.getBoundingClientRect();
  return { x: (ev.clientX - r.left) * estado.ancho / r.width, y: (ev.clientY - r.top) * estado.alto / r.height, f: r.width / estado.ancho };
}
function centroYDistancia() {
  const [a, b] = [...punteros.values()];
  return { mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, d: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x) };
}

lienzoEl.addEventListener("pointerdown", (ev) => {
  ev.preventDefault();
  try { lienzoEl.setPointerCapture(ev.pointerId); } catch { /* puntero sintético */ }
  punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  const p = coordsImagen(ev);

  if (punteros.size === 2) {
    if (gesto && gesto.tipo === "pincel") terminarPincel();
    const sel = capaSeleccionada();
    const c = centroYDistancia();
    if (estado.pestana === "decorar" && sel && sel.tipo === "elemento") {
      gesto = { tipo: "pellizco-elemento", e: sel, ini: c, ancho0: sel.ancho, rot0: sel.rot, x0: sel.x, y0: sel.y, f: p.f, historial: false };
    } else {
      const r = vista.getBoundingClientRect();
      gesto = { tipo: "pellizco-vista", ini: c, v0: { ...estado.vista }, rect: r };
    }
    return;
  }
  if (punteros.size > 2) return;

  if (estado.pestana === "decorar") {
    const e = elementoEn(p.x, p.y);
    if (e) {
      estado.seleccion = e.id;
      gesto = { tipo: "mover", e, dx: p.x - e.x, dy: p.y - e.y, historial: false, x0: ev.clientX, y0: ev.clientY };
      renderizar(); refrescarPanel();
    } else {
      gesto = { tipo: "tocar", x0: ev.clientX, y0: ev.clientY, v0: { ...estado.vista } };
    }
  } else if (estado.pestana === "pintar" && estado.modoPintar.startsWith("pincel")) {
    let capa = capaSeleccionada();
    if (!capa || capa.tipo !== "pintura") capa = nuevaCapaPintura("pared");
    guardarHistorial();
    capa.mascara = capa.mascara.slice();
    gesto = { tipo: "pincel", capa, agregar: estado.modoPintar === "pincel+", ux: p.x, uy: p.y };
    P.pintarCirculo(capa.mascara, estado.ancho, estado.alto, p.x, p.y, radioPincel(), gesto.agregar);
    marcarSucio(); programarRender();
  } else {
    gesto = { tipo: "tocar", x0: ev.clientX, y0: ev.clientY, v0: { ...estado.vista } };
  }
});

function radioPincel() { return estado.tamPincel * estado.ancho / 1000; }

lienzoEl.addEventListener("pointermove", (ev) => {
  if (!punteros.has(ev.pointerId)) return;
  punteros.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  if (!gesto) return;
  const p = coordsImagen(ev);

  if (gesto.tipo === "pellizco-vista" && punteros.size === 2) {
    const c = centroYDistancia();
    const v0 = gesto.v0, r = gesto.rect;
    let s = Math.min(6, Math.max(1, v0.escala * c.d / gesto.ini.d));
    const px = (gesto.ini.mx - r.left) / v0.escala, py = (gesto.ini.my - r.top) / v0.escala;
    const tx = c.mx - (r.left - v0.tx) - px * s, ty = c.my - (r.top - v0.ty) - py * s;
    estado.vista = s === 1 ? { escala: 1, tx: 0, ty: 0 } : { escala: s, tx, ty };
    aplicarVista();
  } else if (gesto.tipo === "pellizco-elemento" && punteros.size === 2) {
    const c = centroYDistancia(), e = gesto.e;
    if (!gesto.historial) { guardarHistorial(); gesto.historial = true; }
    e.ancho = Math.min(estado.ancho * 1.5, Math.max(estado.ancho * 0.03, gesto.ancho0 * c.d / gesto.ini.d));
    e.rot = gesto.rot0 + (c.ang - gesto.ini.ang);
    e.x = gesto.x0 + (c.mx - gesto.ini.mx) / gesto.f;
    e.y = gesto.y0 + (c.my - gesto.ini.my) / gesto.f;
    programarRender();
  } else if (gesto.tipo === "mover") {
    if (!gesto.historial) {
      if (Math.hypot(ev.clientX - gesto.x0, ev.clientY - gesto.y0) < 4) return;
      guardarHistorial(); gesto.historial = true;
    }
    gesto.e.x = p.x - gesto.dx; gesto.e.y = p.y - gesto.dy;
    programarRender();
  } else if (gesto.tipo === "pincel") {
    const pasos = Math.max(1, Math.ceil(Math.hypot(p.x - gesto.ux, p.y - gesto.uy) / (radioPincel() * 0.4)));
    for (let i = 1; i <= pasos; i++) {
      const t = i / pasos;
      P.pintarCirculo(gesto.capa.mascara, estado.ancho, estado.alto, gesto.ux + (p.x - gesto.ux) * t, gesto.uy + (p.y - gesto.uy) * t, radioPincel(), gesto.agregar);
    }
    gesto.ux = p.x; gesto.uy = p.y;
    marcarSucio(); programarRender();
  } else if (gesto.tipo === "tocar" && estado.vista.escala > 1) {
    const dx = ev.clientX - gesto.x0, dy = ev.clientY - gesto.y0;
    if (Math.hypot(dx, dy) > 6) gesto.arrastre = true;
    if (gesto.arrastre) { estado.vista.tx = gesto.v0.tx + dx; estado.vista.ty = gesto.v0.ty + dy; aplicarVista(); }
  }
});

function terminarPincel() {
  if (!gesto || gesto.tipo !== "pincel") return;
  gesto = null;
  marcarSucio(); renderizar(); refrescarPanel();
}

function soltar(ev) {
  if (!punteros.has(ev.pointerId)) return;
  punteros.delete(ev.pointerId);
  const p = coordsImagen(ev);
  if (!gesto) return;
  if (gesto.tipo === "pincel") { terminarPincel(); return; }
  if (gesto.tipo === "pellizco-vista" || gesto.tipo === "pellizco-elemento") {
    if (punteros.size === 0) { gesto = null; renderizar(); }
    return;
  }
  if (gesto.tipo === "mover") { gesto = null; renderizar(); refrescarPanel(); return; }
  if (gesto.tipo === "tocar") {
    const movio = Math.hypot(ev.clientX - gesto.x0, ev.clientY - gesto.y0) > 8;
    gesto = null;
    if (movio) return;
    const ahora = Date.now();
    if (ahora - ultimoToque < 300) { ultimoToque = 0; reiniciarZoom(); return; }
    ultimoToque = ahora;
    if (estado.pestana === "pintar") {
      if (estado.modoPintar === "varita+") aplicarVarita(p.x, p.y, false);
      else if (estado.modoPintar === "varita-") aplicarVarita(p.x, p.y, true);
    } else if (estado.pestana === "decorar") {
      estado.seleccion = null; renderizar(); refrescarPanel();
    }
  }
}
lienzoEl.addEventListener("pointerup", soltar);
lienzoEl.addEventListener("pointercancel", soltar);

// ---------- Panel: pestañas ----------
function cambiarPestana(nombre) {
  estado.pestana = nombre;
  $$(".pestanas button").forEach((b) => b.classList.toggle("activa", b.dataset.tab === nombre));
  $$("#panel section").forEach((s) => { s.hidden = s.dataset.panel !== nombre; });
  if (nombre === "ideas") renderizarIdeas();
  if (nombre === "estilos") renderizarEstilos();
  if (nombre === "decorar") { renderizarCategorias(); renderizarRejillaElementos(); }
  const sel = capaSeleccionada();
  if (nombre === "decorar" && sel && sel.tipo === "pintura") estado.seleccion = null;
  if (nombre === "pintar" && sel && sel.tipo === "elemento") estado.seleccion = null;
  const textos = {
    pintar: "Toca una pared o el piso para pintarlo",
    decorar: "Elige un elemento abajo; luego arrástralo o pellizca para ajustarlo",
    estilos: "Elige un estilo y genera alternativas de color",
    ideas: "", luz: "", guardar: "",
  };
  ayuda(textos[nombre]);
  renderizar(); refrescarPanel();
}
$$(".pestanas button").forEach((b) => b.addEventListener("click", () => cambiarPestana(b.dataset.tab)));

function refrescarPanel() {
  if (estado.pestana === "pintar") renderizarPanelPintar();
  if (estado.pestana === "decorar") renderizarHerramientasElemento();
}

// ---------- Panel: pintar ----------
function chipColor(hex, activo, alClic, titulo) {
  const b = document.createElement("button");
  b.className = "chip" + (activo ? " activa" : "");
  b.style.background = hex; b.title = titulo || hex;
  b.addEventListener("click", () => alClic(hex));
  return b;
}

function renderizarPanelPintar() {
  const lista = $("#lista-capas");
  lista.innerHTML = "";
  const nueva = document.createElement("button");
  nueva.className = "chip nueva"; nueva.textContent = "+ Nueva superficie";
  nueva.addEventListener("click", () => {
    guardarHistorial();
    const c = nuevaCapaPintura("pared");
    renderizar(); refrescarPanel();
    ayuda(`«${c.nombre}» lista: toca la superficie en la foto`);
  });
  lista.appendChild(nueva);
  for (const c of capasPintura()) {
    const b = document.createElement("button");
    b.className = "chip" + (c.id === estado.seleccion ? " activa" : "");
    b.innerHTML = `<i class="punto" style="background:${c.color}"></i>${c.nombre}`;
    b.addEventListener("click", () => { estado.seleccion = c.id; renderizar(); refrescarPanel(); });
    lista.appendChild(b);
  }

  const esPincel = estado.modoPintar.startsWith("pincel");
  $("#fila-tolerancia").hidden = esPincel;
  $("#fila-pincel").hidden = !esPincel;
  $$("#modo-pintar button").forEach((b) => b.classList.toggle("activa", b.dataset.modo === estado.modoPintar));

  const capa = capaSeleccionada();
  const props = $("#propiedades-capa");
  if (!capa || capa.tipo !== "pintura") { props.hidden = true; return; }
  props.hidden = false;

  const tipos = $("#tipo-capa"); tipos.innerHTML = "";
  for (const [clave, nombre] of TIPOS) {
    const b = document.createElement("button");
    b.className = "chip" + (capa.categoria === clave ? " activa" : ""); b.textContent = nombre;
    b.addEventListener("click", () => {
      guardarHistorial();
      capa.categoria = clave;
      const n = capasPintura().filter((c) => c.categoria === clave && c !== capa).length + 1;
      capa.nombre = nombre + " " + n;
      refrescarPanel();
    });
    tipos.appendChild(b);
  }

  const estilo = estiloPorClave(estado.estilo);
  const colores = [];
  const agregar = (h) => { if (!colores.includes(h.toLowerCase())) colores.push(h.toLowerCase()); };
  if (capa.categoria === "piso") estilo.pisos.forEach((p) => agregar(p.color));
  if (capa.categoria === "techo") ["#ffffff", "#f7f6f2", "#efeae0"].forEach(agregar);
  if (capa.categoria === "mueble" || capa.categoria === "otro") estilo.acentos.forEach(agregar);
  estilo.paredes.forEach(agregar); estilo.acentos.forEach(agregar); estilo.pisos.forEach((p) => agregar(p.color));
  estado.recientes.forEach(agregar);
  const cont = $("#colores-capa"); cont.innerHTML = "";
  for (const h of colores) cont.appendChild(chipColor(h, capa.color.toLowerCase() === h, (hex) => cambiarColorCapa(capa, hex)));
  $("#color-personalizado").value = capa.color;

  const mats = $("#materiales"); mats.innerHTML = "";
  for (const [clave, m] of Object.entries(P.MATERIALES)) {
    const b = document.createElement("button");
    b.className = "chip" + (capa.material === clave ? " activa" : ""); b.textContent = `${m.emoji} ${m.nombre}`;
    b.addEventListener("click", () => { guardarHistorial(); capa.material = clave; marcarSucio(); renderizar(); refrescarPanel(); });
    mats.appendChild(b);
  }
  $("#fila-escala").hidden = capa.material === "liso";
  $("#escala-textura").value = capa.escala; $("#escala-textura").nextElementSibling.value = capa.escala;
  $("#intensidad").value = Math.round(capa.intensidad * 100); $("#intensidad").nextElementSibling.value = Math.round(capa.intensidad * 100);
}

function cambiarColorCapa(capa, hex, conHistorial = true) {
  if (conHistorial) guardarHistorial();
  capa.color = hex;
  recordarColor(hex);
  marcarSucio(); renderizar(); refrescarPanel();
}
function recordarColor(hex) {
  hex = hex.toLowerCase();
  estado.recientes = [hex, ...estado.recientes.filter((h) => h !== hex)].slice(0, 6);
}

$$("#modo-pintar button").forEach((b) => b.addEventListener("click", () => {
  estado.modoPintar = b.dataset.modo;
  const textos = { "varita+": "Toca la superficie que quieres pintar", "varita-": "Toca la zona que quieres quitar de la selección", "pincel+": "Pinta con el dedo sobre la superficie", "pincel-": "Borra con el dedo las zonas sobrantes" };
  ayuda(textos[estado.modoPintar]);
  refrescarPanel();
}));
$("#tolerancia").addEventListener("input", (ev) => { estado.tolerancia = +ev.target.value; ev.target.nextElementSibling.value = ev.target.value; });
$("#tam-pincel").addEventListener("input", (ev) => { estado.tamPincel = +ev.target.value; ev.target.nextElementSibling.value = ev.target.value; });
$("#color-personalizado").addEventListener("input", (ev) => {
  const capa = capaSeleccionada(); if (!capa || capa.tipo !== "pintura") return;
  capa.color = ev.target.value; marcarSucio(); programarRender();
});
$("#color-personalizado").addEventListener("change", (ev) => {
  const capa = capaSeleccionada(); if (!capa || capa.tipo !== "pintura") return;
  guardarHistorial(); cambiarColorCapa(capa, ev.target.value, false);
});
$("#intensidad").addEventListener("input", (ev) => {
  const capa = capaSeleccionada(); if (!capa) return;
  capa.intensidad = +ev.target.value / 100; ev.target.nextElementSibling.value = ev.target.value; marcarSucio(); programarRender();
});
$("#escala-textura").addEventListener("input", (ev) => {
  const capa = capaSeleccionada(); if (!capa) return;
  capa.escala = +ev.target.value; ev.target.nextElementSibling.value = ev.target.value; marcarSucio(); programarRender();
});
["intensidad", "escala-textura"].forEach((id) => $("#" + id).addEventListener("change", () => guardarHistorial()));
$("#btn-eliminar-capa").addEventListener("click", () => { const c = capaSeleccionada(); if (c) eliminarCapa(c.id); });

// ---------- Panel: decorar ----------
function renderizarCategorias() {
  const cont = $("#categorias"); cont.innerHTML = "";
  for (const c of CATEGORIAS) {
    const b = document.createElement("button");
    b.className = "chip" + (estado.categoriaElementos === c.clave ? " activa" : ""); b.textContent = c.nombre;
    b.addEventListener("click", () => { estado.categoriaElementos = c.clave; renderizarCategorias(); renderizarRejillaElementos(); });
    cont.appendChild(b);
  }
}
function renderizarRejillaElementos() {
  const cont = $("#rejilla-elementos"); cont.innerHTML = "";
  const cat = estado.categoriaElementos;
  const claves = cat === "sugeridos" ? estiloPorClave(estado.estilo).elementos : Object.keys(ELEMENTOS).filter((k) => ELEMENTOS[k].categoria === cat);
  for (const k of claves) {
    const def = ELEMENTOS[k];
    const b = document.createElement("button");
    b.innerHTML = `<img src="${urlElemento(k)}" alt=""><span>${def.nombre}</span>`;
    b.addEventListener("click", () => agregarElemento(k));
    cont.appendChild(b);
  }
}
function renderizarHerramientasElemento() {
  const e = capaSeleccionada();
  const h = $("#herramientas-elemento");
  if (!e || e.tipo !== "elemento") { h.hidden = true; return; }
  h.hidden = false;
  const estilo = estiloPorClave(estado.estilo);
  const def = ELEMENTOS[e.clave];
  const colores = [def.colores[0], ...estilo.acentos, ...estilo.paredes.slice(0, 3), ...estado.recientes].map((c) => c.toLowerCase()).filter((c, i, a) => a.indexOf(c) === i);
  const cont = $("#colores-elemento"); cont.innerHTML = "";
  const actual = (e.color || def.colores[0]).toLowerCase();
  for (const c of colores) cont.appendChild(chipColor(c, actual === c, (hex) => { guardarHistorial(); e.color = hex; recordarColor(hex); renderizar(); refrescarPanel(); }));
  $("#color-elemento").value = actual;
  $$("#herramientas-elemento [data-accion]").forEach((b) => { if (b.dataset.accion === "sombra") b.classList.toggle("activa", !!e.sombra); });
}
$$("#herramientas-elemento [data-accion]").forEach((b) => b.addEventListener("click", () => accionElemento(b.dataset.accion)));
$("#color-elemento").addEventListener("input", (ev) => { const e = capaSeleccionada(); if (e && e.tipo === "elemento") { e.color = ev.target.value; programarRender(); } });
$("#color-elemento").addEventListener("change", (ev) => { const e = capaSeleccionada(); if (e && e.tipo === "elemento") { guardarHistorial(); e.color = ev.target.value; recordarColor(e.color); refrescarPanel(); } });

// ---------- Panel: estilos ----------
function renderizarEstilos() {
  const cont = $("#tarjetas-estilos"); cont.innerHTML = "";
  for (const s of ESTILOS) {
    const b = document.createElement("button");
    b.className = "tarjeta-estilo" + (s.clave === estado.estilo ? " activa" : "");
    b.innerHTML = `<b>${s.emoji} ${s.nombre}</b><div class="paleta">${[...s.paredes.slice(0, 4), ...s.acentos.slice(0, 2)].map((c) => `<i style="background:${c}"></i>`).join("")}</div>`;
    b.addEventListener("click", () => { estado.estilo = s.clave; renderizarEstilos(); });
    cont.appendChild(b);
  }
  const s = estiloPorClave(estado.estilo);
  $("#detalle-estilo").innerHTML = `<b style="color:var(--texto)">${s.emoji} ${s.nombre}</b> — ${s.descripcion}<ul>${s.consejos.map((c) => `<li>${c}</li>`).join("")}</ul>`;
}

let cachePequena = null;
function imagenPequena() {
  if (cachePequena) return cachePequena;
  const f = Math.min(1, 380 / estado.ancho);
  const w = Math.max(1, Math.round(estado.ancho * f)), h = Math.max(1, Math.round(estado.alto * f));
  const c1 = document.createElement("canvas"); c1.width = estado.ancho; c1.height = estado.alto;
  c1.getContext("2d").putImageData(estado.original, 0, 0);
  const c2 = document.createElement("canvas"); c2.width = w; c2.height = h;
  c2.getContext("2d").drawImage(c1, 0, 0, w, h);
  cachePequena = { pix: c2.getContext("2d").getImageData(0, 0, w, h).data, ancho: w, alto: h, f, mascaras: new WeakMap() };
  return cachePequena;
}
function mascaraPequena(m) {
  const p = imagenPequena();
  let r = p.mascaras.get(m);
  if (!r) { r = P.reducirMascara(m, estado.ancho, estado.alto, p.ancho, p.alto); p.mascaras.set(m, r); }
  return r;
}

function varianteCapa(estilo, capa, i, idx) {
  const rot = (arr) => arr[(i + idx) % arr.length];
  switch (capa.categoria) {
    case "piso": { const p = rot(estilo.pisos); return { color: p.color, material: p.material }; }
    case "techo": return { color: rot(["#ffffff", "#f7f6f2", "#efeae0"]), material: "liso" };
    case "mueble": case "otro": return { color: rot(estilo.acentos), material: "liso" };
    default: return { color: rot(estilo.paredes), material: rot(estilo.texturasPared || ["liso"]) };
  }
}

async function generarAlternativas() {
  const pint = capasPintura().filter((c) => P.contarMascara(c.mascara) > 0);
  if (!pint.length) { avisar("Primero pinta al menos una superficie (pestaña Pintar)."); cambiarPestana("pintar"); return; }
  const estilo = estiloPorClave(estado.estilo);
  cargando(true); await esperar(20);
  const p = imagenPequena();
  const rejilla = $("#rejilla-alternativas"); rejilla.innerHTML = "";
  $("#titulo-alternativas").textContent = `${estilo.emoji} ${estilo.nombre}: alternativas`;
  const n = 6;
  for (let i = 0; i < n; i++) {
    const combos = pint.map((c, idx) => ({ capa: c, ...varianteCapa(estilo, c, i, idx) }));
    const pix = new Uint8ClampedArray(p.pix);
    for (const cb of combos) {
      P.aplicarPintura(pix, p.ancho, p.alto, { mascara: mascaraPequena(cb.capa.mascara), color: P.hexARgb(cb.color), intensidad: cb.capa.intensidad, material: cb.material, escala: Math.max(3, p.ancho * cb.capa.escala / 1000), contraste: 1 });
    }
    P.ajustarLuz(pix, estado.luz.brillo, estado.luz.calidez);
    const lienzo = document.createElement("canvas"); lienzo.width = p.ancho; lienzo.height = p.alto;
    const ctx = lienzo.getContext("2d");
    ctx.putImageData(new ImageData(pix, p.ancho, p.alto), 0, 0);
    for (const e of estado.capas) if (e.tipo === "elemento") dibujarElemento(ctx, e, p.f);
    const b = document.createElement("button");
    b.appendChild(lienzo);
    const paleta = document.createElement("div"); paleta.className = "paleta";
    paleta.innerHTML = combos.map((cb) => `<i style="background:${cb.color}" title="${cb.capa.nombre}"></i>`).join("");
    b.appendChild(paleta);
    b.addEventListener("click", () => {
      guardarHistorial();
      for (const cb of combos) { cb.capa.color = cb.color; cb.capa.material = cb.material; }
      marcarSucio(); renderizar(); refrescarPanel();
      $("#dlg-alternativas").close();
      avisar("Alternativa aplicada. Ajusta cada superficie en «Pintar».");
    });
    rejilla.appendChild(b);
    await esperar(0);
  }
  cargando(false);
  $("#dlg-alternativas").showModal();
}
$("#btn-alternativas").addEventListener("click", generarAlternativas);
$("#btn-aplicar-estilo").addEventListener("click", () => {
  const pint = capasPintura();
  const estilo = estiloPorClave(estado.estilo);
  if (!pint.length) { avisar("Primero pinta al menos una superficie."); cambiarPestana("pintar"); return; }
  guardarHistorial();
  pint.forEach((c, idx) => { const v = varianteCapa(estilo, c, 0, idx); c.color = v.color; c.material = v.material; });
  marcarSucio(); renderizar(); refrescarPanel();
  avisar(`Estilo ${estilo.nombre} aplicado`);
});

// ---------- Panel: ideas ----------
function renderizarIdeas() {
  if (!estado.analisis) estado.analisis = P.analizarFoto(estado.original.data, estado.ancho, estado.alto);
  const a = estado.analisis;
  const estilo = estiloPorClave(estado.estilo);
  if (!estado.colorIdea) { const d = a.dominantes.find((x) => !x.gris) || a.dominantes[0]; estado.colorIdea = d ? d.hex : "#888888"; }
  const arm = P.armonias(estado.colorIdea);
  const niveles = { oscura: "Oscura", media: "Media", luminosa: "Luminosa" };
  const cont = $("#contenido-ideas");
  cont.innerHTML = `
    <div class="bloque-idea">
      <h4>Luz de la foto: ${niveles[a.nivelLuz]} · ${a.calidez > 0.15 ? "tonos cálidos" : a.calidez < -0.15 ? "tonos fríos" : "tonos neutros"}</h4>
      <div class="medidor"><i style="left:${Math.round(a.lumMedia / 255 * 100)}%"></i></div>
      <ul>${consejosSegunFoto(a).map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>
    <div class="bloque-idea">
      <h4>Colores presentes en tu foto</h4>
      <div class="grupo-colores"><span>Toca uno para ver combinaciones</span>${a.dominantes.map((d) => `<button class="muestra${d.hex === estado.colorIdea ? " activa" : ""}" data-base="${d.hex}" style="background:${d.hex}" title="${Math.round(d.fraccion * 100)} %"></button>`).join("")}</div>
      ${[["Complementarios", arm.complementario], ["Análogos", arm.analogos], ["Tríada", arm.triada], ["Suaves", arm.suaves], ["Neutros", arm.neutros]].map(([n, cs]) =>
        `<div class="grupo-colores"><span>${n}</span>${cs.map((c) => `<button class="muestra" data-aplicar="${c}" style="background:${c}" title="${c}"></button>`).join("")}</div>`).join("")}
      <p class="ayuda">Toca un color para aplicarlo a la superficie seleccionada.</p>
    </div>
    <div class="bloque-idea">
      <h4>${estilo.emoji} Consejos del estilo ${estilo.nombre}</h4>
      <ul>${estilo.consejos.map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>`;
  $$("[data-base]", cont).forEach((b) => b.addEventListener("click", () => { estado.colorIdea = b.dataset.base; renderizarIdeas(); }));
  $$("[data-aplicar]", cont).forEach((b) => b.addEventListener("click", () => {
    let capa = capaSeleccionada();
    if (!capa || capa.tipo !== "pintura") capa = capasPintura()[capasPintura().length - 1];
    if (!capa) { avisar("Primero pinta una superficie para aplicarle el color."); return; }
    cambiarColorCapa(capa, b.dataset.aplicar);
    avisar(`Color aplicado a ${capa.nombre}`);
  }));
}

// ---------- Panel: luz ----------
$("#brillo").addEventListener("input", (ev) => { estado.luz.brillo = +ev.target.value; ev.target.nextElementSibling.value = ev.target.value; programarRender(); });
$("#calidez").addEventListener("input", (ev) => { estado.luz.calidez = +ev.target.value; ev.target.nextElementSibling.value = ev.target.value; programarRender(); });
$("#btn-luz-reset").addEventListener("click", () => {
  estado.luz = { brillo: 0, calidez: 0 };
  $("#brillo").value = 0; $("#calidez").value = 0;
  $("#brillo").nextElementSibling.value = 0; $("#calidez").nextElementSibling.value = 0;
  renderizar();
});

// ---------- Panel: guardar ----------
function nombreArchivo(ext) {
  const f = new Date(), p = (n) => String(n).padStart(2, "0");
  const base = (estado.nombreProyecto || "decorafoto").replace(/[^\w\-áéíóúñ ]/gi, "").trim().replace(/\s+/g, "-") || "decorafoto";
  return `${base}-${f.getFullYear()}${p(f.getMonth() + 1)}${p(f.getDate())}-${p(f.getHours())}${p(f.getMinutes())}.${ext}`;
}
function exportarBlob(tipo = "image/jpeg", calidad = 0.92, f = 1) {
  return new Promise((resolver) => {
    const c = document.createElement("canvas");
    c.width = Math.round(estado.ancho * f); c.height = Math.round(estado.alto * f);
    pintarCompleto(c.getContext("2d"), f);
    c.toBlob(resolver, tipo, calidad);
  });
}
$("#btn-descargar").addEventListener("click", async () => {
  const blob = await exportarBlob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = nombreArchivo("jpg");
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  avisar("Imagen guardada en Descargas");
});
$("#btn-compartir").addEventListener("click", async () => {
  const blob = await exportarBlob();
  const archivo = new File([blob], nombreArchivo("jpg"), { type: "image/jpeg" });
  if (navigator.canShare && navigator.canShare({ files: [archivo] })) {
    try { await navigator.share({ files: [archivo], title: "DecoraFoto" }); } catch { /* cancelado */ }
  } else {
    avisar("Tu navegador no permite compartir: se descargará la imagen.");
    $("#btn-descargar").click();
  }
});
$("#btn-comparar").addEventListener("click", () => {
  estado.comparar = !estado.comparar;
  divisor.hidden = !estado.comparar;
  $("#btn-comparar").classList.toggle("activa", estado.comparar);
  ayuda(estado.comparar ? "Mueve el control para comparar: izquierda original, derecha decorado" : "");
  renderizar();
});
divisor.addEventListener("input", () => { estado.divisor = +divisor.value / 100; programarRender(); });
$("#btn-nueva-foto").addEventListener("click", () => {
  if (estado.capas.length && !confirm("¿Dejar esta foto? Si no guardaste el proyecto se perderán los cambios.")) return;
  irAlInicio();
});
function irAlInicio() {
  pantallaEditor.hidden = true; pantallaInicio.hidden = false;
  estado.original = null; estado.capas = [];
  listarProyectosEnInicio();
}

// Guardar proyecto
$("#btn-guardar-proyecto").addEventListener("click", () => {
  $("#nombre-proyecto").value = estado.nombreProyecto || "";
  $("#dlg-guardar").showModal();
  setTimeout(() => $("#nombre-proyecto").focus(), 50);
});
$("#btn-confirmar-guardar").addEventListener("click", async () => {
  const nombre = $("#nombre-proyecto").value.trim() || "Proyecto " + new Date().toLocaleDateString("es-CL");
  $("#dlg-guardar").close();
  cargando(true); await esperar(20);
  try {
    const foto = await new Promise((r) => {
      const c = document.createElement("canvas"); c.width = estado.ancho; c.height = estado.alto;
      c.getContext("2d").putImageData(estado.original, 0, 0); c.toBlob(r, "image/jpeg", 0.95);
    });
    const miniatura = await exportarBlob("image/jpeg", 0.8, Math.min(1, 320 / estado.ancho));
    const id = estado.proyectoId || "p" + Date.now().toString(36);
    const capas = estado.capas.map((c) => Object.fromEntries(Object.entries(c).filter(([k]) => !k.startsWith("_"))));
    await db.guardarProyecto({ id, nombre, fecha: Date.now(), ancho: estado.ancho, alto: estado.alto, foto, miniatura, capas, luz: { ...estado.luz }, estilo: estado.estilo });
    estado.proyectoId = id; estado.nombreProyecto = nombre;
    avisar(`Proyecto «${nombre}» guardado`);
  } catch (e) {
    console.error(e); avisar("No se pudo guardar el proyecto.");
  } finally { cargando(false); }
});

async function abrirProyecto(id) {
  cargando(true); await esperar(20);
  try {
    const p = await db.obtenerProyecto(id);
    if (!p) { avisar("El proyecto ya no existe."); return; }
    const bitmap = await createImageBitmap(p.foto);
    const c = document.createElement("canvas"); c.width = p.ancho; c.height = p.alto;
    c.getContext("2d").drawImage(bitmap, 0, 0, p.ancho, p.alto);
    $("#dlg-proyectos").close();
    iniciarProyecto(c.getContext("2d").getImageData(0, 0, p.ancho, p.alto), p);
  } catch (e) {
    console.error(e); avisar("No se pudo abrir el proyecto.");
  } finally { cargando(false); }
}

function tarjetaProyecto(p) {
  const d = document.createElement("div");
  d.className = "tarjeta-proyecto";
  const url = URL.createObjectURL(p.miniatura);
  d.innerHTML = `<img src="${url}" alt=""><div class="info"><b>${p.nombre}</b><small>${new Date(p.fecha).toLocaleDateString("es-CL")}</small></div><button class="borrar" title="Eliminar">🗑️</button>`;
  d.addEventListener("click", () => abrirProyecto(p.id));
  $(".borrar", d).addEventListener("click", async (ev) => {
    ev.stopPropagation();
    if (!confirm(`¿Eliminar «${p.nombre}»?`)) return;
    await db.eliminarProyecto(p.id);
    listarProyectosEnInicio(); listarProyectosEnDialogo();
  });
  return d;
}
async function listarProyectosEnInicio() {
  const lista = await db.listarProyectos().catch(() => []);
  $("#seccion-proyectos").hidden = !lista.length;
  const cont = $("#lista-proyectos"); cont.innerHTML = "";
  lista.forEach((p) => cont.appendChild(tarjetaProyecto(p)));
}
async function listarProyectosEnDialogo() {
  const lista = await db.listarProyectos().catch(() => []);
  const cont = $("#lista-proyectos-dialogo"); cont.innerHTML = "";
  if (!lista.length) cont.innerHTML = `<p class="ayuda">Aún no hay proyectos guardados.</p>`;
  lista.forEach((p) => cont.appendChild(tarjetaProyecto(p)));
}
$("#btn-proyectos").addEventListener("click", () => { listarProyectosEnDialogo(); $("#dlg-proyectos").showModal(); });

// ---------- Botones flotantes ----------
$("#btn-deshacer").addEventListener("click", deshacer);
$("#btn-rehacer").addEventListener("click", rehacer);
$("#btn-zoom").addEventListener("click", reiniciarZoom);
const btnAntes = $("#btn-antes");
const verOriginal = (v) => { if (estado.mostrarOriginal === v) return; estado.mostrarOriginal = v; renderizar(); };
btnAntes.addEventListener("pointerdown", (ev) => { ev.preventDefault(); btnAntes.setPointerCapture(ev.pointerId); verOriginal(true); });
["pointerup", "pointercancel", "pointerleave"].forEach((t) => btnAntes.addEventListener(t, () => verOriginal(false)));

// ---------- Diálogos y archivos ----------
$$("[data-cerrar]").forEach((b) => b.addEventListener("click", () => b.closest("dialog").close()));
$$("dialog").forEach((d) => d.addEventListener("click", (ev) => { if (ev.target === d) d.close(); }));
["foto-camara", "foto-galeria", "foto-camara-barra"].forEach((id) => {
  $("#" + id).addEventListener("change", (ev) => {
    const archivo = ev.target.files && ev.target.files[0];
    ev.target.value = "";
    if (!archivo) return;
    if (estado.original && estado.capas.length && !confirm("¿Abrir otra foto? Si no guardaste el proyecto se perderán los cambios.")) return;
    cargarArchivo(archivo);
  });
});
document.addEventListener("keydown", (ev) => {
  if (ev.target.tagName === "INPUT") return;
  if ((ev.ctrlKey || ev.metaKey) && ev.key === "z") { ev.preventDefault(); ev.shiftKey ? rehacer() : deshacer(); }
  if (ev.key === "Delete" || ev.key === "Backspace") { const e = capaSeleccionada(); if (e && e.tipo === "elemento") accionElemento("eliminar"); }
});

// ---------- Inicio ----------
listarProyectosEnInicio();
if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}
