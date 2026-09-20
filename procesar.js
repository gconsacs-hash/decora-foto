/* procesar.js — Motor de imagen de DecoraFoto.
   Funciones puras (sin DOM) que trabajan sobre arreglos RGBA (Uint8ClampedArray)
   y máscaras (Uint8Array con valores 0-255). Se prueban en Node: tests/pruebas.mjs */

// ---------- Colores ----------

export function luminancia(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function hexARgb(hex) {
  let h = String(hex).replace("#", "").trim();
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [128, 128, 128];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbAHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return "#" + c(r) + c(g) + c(b);
}

export function rgbAHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h;
  if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (mx === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h * 60, s, l];
}

export function hslARgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r, g, b;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

// Fija la luminancia de un color conservando su tono (modo de fusión "color" del W3C).
export function fijarLum(r, g, b, l) {
  if (l <= 0) return [0, 0, 0];
  if (l >= 255) return [255, 255, 255];
  const d = l - luminancia(r, g, b);
  r += d; g += d; b += d;
  const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
  if (mn < 0) {
    const f = l / (l - mn);
    r = l + (r - l) * f; g = l + (g - l) * f; b = l + (b - l) * f;
  }
  if (mx > 255) {
    const f = (255 - l) / (mx - l);
    r = l + (r - l) * f; g = l + (g - l) * f; b = l + (b - l) * f;
  }
  return [r, g, b];
}

// ---------- Selección de superficies (varita mágica) ----------

// Distancia entre dos píxeles: pesa poco la luminancia (una pared tiene sombras)
// y mucho el color (dos superficies distintas suelen diferir en tono).
function distanciaColor(r1, g1, b1, r2, g2, b2) {
  const y1 = luminancia(r1, g1, b1), y2 = luminancia(r2, g2, b2);
  return 0.6 * Math.abs(y1 - y2) + 1.3 * (Math.abs((b1 - y1) - (b2 - y2)) + Math.abs((r1 - y1) - (r2 - y2)));
}

/* Devuelve la máscara (0/255) de la zona conectada al punto (x0,y0) con color parecido.
   tolerancia: 0-100. Acepta también píxeles algo más lejanos del color inicial si
   son casi iguales a su vecino (así sigue degradados de luz sobre una misma pared). */
export function rellenoVarita(datos, ancho, alto, x0, y0, tolerancia) {
  const n = ancho * alto;
  const mascara = new Uint8Array(n);
  x0 = Math.round(x0); y0 = Math.round(y0);
  if (x0 < 0 || y0 < 0 || x0 >= ancho || y0 >= alto) return mascara;

  // Color inicial: promedio 3x3 para no depender de un píxel con ruido.
  let sr = 0, sg = 0, sb = 0, cnt = 0;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const x = x0 + dx, y = y0 + dy;
    if (x < 0 || y < 0 || x >= ancho || y >= alto) continue;
    const k = (y * ancho + x) * 4;
    sr += datos[k]; sg += datos[k + 1]; sb += datos[k + 2]; cnt++;
  }
  sr /= cnt; sg /= cnt; sb /= cnt;

  const tol = tolerancia * 2;
  const tolLejana = tol * 1.6;
  const tolVecino = Math.max(3, tol * 0.12);
  const pila = new Int32Array(n);
  let tope = 0;
  const inicio = y0 * ancho + x0;
  pila[tope++] = inicio;
  mascara[inicio] = 255;

  while (tope) {
    const i = pila[--tope];
    const x = i % ancho;
    const y = (i - x) / ancho;
    const k = i * 4;
    const r = datos[k], g = datos[k + 1], b = datos[k + 2];
    if (x > 0) probar(i - 1, r, g, b);
    if (x < ancho - 1) probar(i + 1, r, g, b);
    if (y > 0) probar(i - ancho, r, g, b);
    if (y < alto - 1) probar(i + ancho, r, g, b);
  }
  return mascara;

  function probar(j, vr, vg, vb) {
    if (mascara[j]) return;
    const k = j * 4;
    const r = datos[k], g = datos[k + 1], b = datos[k + 2];
    const dSemilla = distanciaColor(r, g, b, sr, sg, sb);
    let acepta = dSemilla <= tol;
    if (!acepta && dSemilla <= tolLejana) acepta = distanciaColor(r, g, b, vr, vg, vb) <= tolVecino;
    if (acepta) { mascara[j] = 255; pila[tope++] = j; }
  }
}

// Suaviza los bordes de una máscara (desenfoque de caja separable). Devuelve una nueva.
export function suavizarMascara(m, ancho, alto, radio = 1) {
  if (radio <= 0) return m.slice();
  const tmp = new Float32Array(ancho * alto);
  const salida = new Uint8Array(ancho * alto);
  const div = radio * 2 + 1;
  for (let y = 0; y < alto; y++) {
    const fila = y * ancho;
    let suma = 0;
    for (let x = -radio; x <= radio; x++) suma += m[fila + Math.min(ancho - 1, Math.max(0, x))];
    for (let x = 0; x < ancho; x++) {
      tmp[fila + x] = suma / div;
      const sale = fila + Math.max(0, x - radio);
      const entra = fila + Math.min(ancho - 1, x + radio + 1);
      suma += m[entra] - m[sale];
    }
  }
  for (let x = 0; x < ancho; x++) {
    let suma = 0;
    for (let y = -radio; y <= radio; y++) suma += tmp[Math.min(alto - 1, Math.max(0, y)) * ancho + x];
    for (let y = 0; y < alto; y++) {
      salida[y * ancho + x] = Math.round(suma / div);
      const sale = Math.max(0, y - radio) * ancho + x;
      const entra = Math.min(alto - 1, y + radio + 1) * ancho + x;
      suma += tmp[entra] - tmp[sale];
    }
  }
  return salida;
}

export function unirMascara(a, b) {
  const s = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) s[i] = a[i] > b[i] ? a[i] : b[i];
  return s;
}

export function restarMascara(a, b) {
  const s = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) s[i] = a[i] > b[i] ? a[i] - b[i] : 0;
  return s;
}

export function contarMascara(m) {
  let c = 0;
  for (let i = 0; i < m.length; i++) if (m[i] > 127) c++;
  return c;
}

// Pinta (agregar=true) o borra un círculo con borde suave, modificando la máscara en el lugar.
export function pintarCirculo(m, ancho, alto, cx, cy, radio, agregar) {
  const x0 = Math.max(0, Math.floor(cx - radio)), x1 = Math.min(ancho - 1, Math.ceil(cx + radio));
  const y0 = Math.max(0, Math.floor(cy - radio)), y1 = Math.min(alto - 1, Math.ceil(cy + radio));
  const duro = radio * 0.8;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d > radio) continue;
    const v = d <= duro ? 255 : Math.round(255 * (radio - d) / (radio - duro));
    const i = y * ancho + x;
    if (agregar) { if (v > m[i]) m[i] = v; }
    else { const r = 255 - v; if (r < m[i]) m[i] = r; }
  }
}

// Índices de los píxeles del borde de la máscara (para dibujar el contorno de la selección).
export function contornoMascara(m, ancho, alto, umbral = 127) {
  const borde = [];
  for (let y = 0; y < alto; y++) for (let x = 0; x < ancho; x++) {
    const i = y * ancho + x;
    if (m[i] <= umbral) continue;
    if (x === 0 || y === 0 || x === ancho - 1 || y === alto - 1 ||
        m[i - 1] <= umbral || m[i + 1] <= umbral || m[i - ancho] <= umbral || m[i + ancho] <= umbral) borde.push(i);
  }
  return borde;
}

// Reduce una máscara a otro tamaño (muestreo por vecino más cercano), para vistas previas.
export function reducirMascara(m, ancho, alto, ancho2, alto2) {
  const s = new Uint8Array(ancho2 * alto2);
  for (let y = 0; y < alto2; y++) {
    const sy = Math.min(alto - 1, Math.floor((y + 0.5) * alto / alto2));
    for (let x = 0; x < ancho2; x++) {
      const sx = Math.min(ancho - 1, Math.floor((x + 0.5) * ancho / ancho2));
      s[y * ancho2 + x] = m[sy * ancho + sx];
    }
  }
  return s;
}

// ---------- Materiales (texturas procedimentales) ----------

function hash(n) {
  n = (n ^ 61) ^ (n >>> 16);
  n = n + (n << 3);
  n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d);
  n ^= n >>> 15;
  return (n >>> 0) / 4294967295;
}

/* Cada material devuelve un factor de brillo (≈0.7-1.2) para el píxel (x,y).
   "e" es la escala en píxeles (alto de una tabla, de un ladrillo, etc.). */
export const MATERIALES = {
  liso: { nombre: "Liso", emoji: "⬜", factor: null },
  madera: {
    nombre: "Madera", emoji: "🪵",
    factor(x, y, e) {
      const fila = Math.floor(y / e), fy = y - fila * e;
      const largo = e * 8, desf = hash(fila) * largo;
      const px = x + desf, col = Math.floor(px / largo), fx = px - col * largo;
      let f = 0.94 + 0.12 * hash(fila * 131 + col);
      f *= 1 + 0.05 * Math.sin(x * 0.15 + fila * 3 + Math.sin(fy * 0.6 + col) * 1.5);
      if (fy < 1.2) f *= 0.72;
      if (fx < 1.2) f *= 0.78;
      return f;
    },
  },
  ladrillo: {
    nombre: "Ladrillo", emoji: "🧱",
    factor(x, y, e) {
      const h = e * 0.9, w = h * 2.3;
      const fila = Math.floor(y / h), fy = y - fila * h;
      const px = x + (fila % 2) * w / 2, col = Math.floor(px / w), fx = px - col * w;
      const junta = Math.max(1.2, h * 0.08);
      if (fy < junta || fx < junta) return 1.18;
      return 0.88 + 0.22 * hash(fila * 977 + col);
    },
  },
  ceramica: {
    nombre: "Cerámica", emoji: "◼️",
    factor(x, y, e) {
      const t = e * 2, fx = x % t, fy = y % t;
      if (fx < 1.5 || fy < 1.5) return 0.8;
      return 0.99 + 0.04 * hash(Math.floor(x / t) * 31 + Math.floor(y / t)) + 0.04 * (fx / t);
    },
  },
  concreto: {
    nombre: "Concreto", emoji: "🪨",
    factor(x, y, e) {
      const b = Math.max(2, Math.round(e / 8));
      const gx = Math.floor(x / b), gy = Math.floor(y / b);
      const grano = 0.95 + 0.1 * hash(gx * 7919 + gy * 104729);
      const mancha = 0.06 * (hash(Math.floor(x / (b * 6)) * 13 + Math.floor(y / (b * 6)) * 17) - 0.5);
      return grano + mancha;
    },
  },
};

// ---------- Pintar una superficie ----------

/* Aplica una capa de pintura sobre pix (RGBA, modificado en el lugar).
   capa: { mascara, color:[r,g,b], intensidad (0-1), material, escala (px), contraste }
   Conserva sombras y luces de la foto: la zona toma el brillo medio del color
   elegido y cada píxel mantiene su diferencia respecto a la media. */
export function aplicarPintura(pix, ancho, alto, capa) {
  const m = capa.mascara;
  const n = ancho * alto;
  let suma = 0, peso = 0;
  for (let i = 0; i < n; i++) {
    const w = m[i];
    if (!w) continue;
    const k = i * 4;
    suma += w * luminancia(pix[k], pix[k + 1], pix[k + 2]);
    peso += w;
  }
  if (!peso) return;
  const lumMedia = suma / peso;
  const [tr, tg, tb] = capa.color;
  const lumT = luminancia(tr, tg, tb);
  const contraste = capa.contraste ?? 1;
  const intensidad = capa.intensidad ?? 1;
  const mat = MATERIALES[capa.material];
  const tex = mat && mat.factor ? mat.factor : null;
  const escala = capa.escala || Math.max(8, ancho / 40);

  for (let i = 0; i < n; i++) {
    const w = m[i];
    if (!w) continue;
    const k = i * 4;
    const y = luminancia(pix[k], pix[k + 1], pix[k + 2]);
    let l = lumT + (y - lumMedia) * contraste;
    if (tex) {
      const x = i % ancho;
      l *= tex(x, (i - x) / ancho, escala);
    }
    const [r, g, b] = fijarLum(tr, tg, tb, l);
    const a = (w / 255) * intensidad;
    pix[k] += (r - pix[k]) * a;
    pix[k + 1] += (g - pix[k + 1]) * a;
    pix[k + 2] += (b - pix[k + 2]) * a;
  }
}

// Ajuste global de luz: brillo (-100..100) y calidez (-100..100).
export function ajustarLuz(pix, brillo, calidez) {
  if (!brillo && !calidez) return;
  const dr = brillo + calidez * 0.5, dg = brillo + calidez * 0.1, db = brillo - calidez * 0.5;
  for (let k = 0; k < pix.length; k += 4) {
    pix[k] += dr; pix[k + 1] += dg; pix[k + 2] += db;
  }
}

// ---------- Análisis de la foto ----------

/* Devuelve: lumMedia (0-255), nivelLuz, calidez (-1..1), dominantes [{hex, rgb, fraccion, gris}]. */
export function analizarFoto(pix, ancho, alto) {
  const total = ancho * alto;
  const paso = Math.max(1, Math.round(Math.sqrt(total / 40000)));
  const N = 6; // divisiones por canal
  const cuentas = new Uint32Array(N * N * N);
  const sumas = new Float64Array(N * N * N * 3);
  let sumaLum = 0, sumaCalidez = 0, muestras = 0;
  for (let y = 0; y < alto; y += paso) for (let x = 0; x < ancho; x += paso) {
    const k = (y * ancho + x) * 4;
    const r = pix[k], g = pix[k + 1], b = pix[k + 2];
    sumaLum += luminancia(r, g, b);
    sumaCalidez += (r - b);
    muestras++;
    const bin = (Math.floor(r * N / 256) * N + Math.floor(g * N / 256)) * N + Math.floor(b * N / 256);
    cuentas[bin]++;
    sumas[bin * 3] += r; sumas[bin * 3 + 1] += g; sumas[bin * 3 + 2] += b;
  }
  const lumMedia = sumaLum / muestras;
  const calidez = Math.max(-1, Math.min(1, sumaCalidez / muestras / 90));
  const orden = [];
  for (let i = 0; i < cuentas.length; i++) if (cuentas[i]) orden.push(i);
  orden.sort((a, b) => cuentas[b] - cuentas[a]);
  const dominantes = orden.slice(0, 6).map((bin) => {
    const c = cuentas[bin];
    const rgb = [sumas[bin * 3] / c, sumas[bin * 3 + 1] / c, sumas[bin * 3 + 2] / c];
    const [, s] = rgbAHsl(rgb[0], rgb[1], rgb[2]);
    return { hex: rgbAHex(...rgb), rgb, fraccion: c / muestras, gris: s < 0.12 };
  });
  const nivelLuz = lumMedia < 95 ? "oscura" : lumMedia > 165 ? "luminosa" : "media";
  return { lumMedia, nivelLuz, calidez, dominantes };
}

// Combinaciones de color a partir de un color base (para sugerencias).
export function armonias(hex) {
  const [r, g, b] = hexARgb(hex);
  const [h, s0] = rgbAHsl(r, g, b);
  const s = Math.max(0.3, Math.min(0.75, s0 || 0.45));
  const c = (hh, ss, ll) => rgbAHex(...hslARgb(hh, ss, ll));
  return {
    complementario: [c(h + 180, s, 0.45), c(h + 180, s * 0.7, 0.62), c(h + 180, s * 0.5, 0.8)],
    analogos: [c(h - 30, s, 0.5), c(h, s, 0.5), c(h + 30, s, 0.5)],
    triada: [c(h + 120, s, 0.48), c(h + 240, s, 0.48)],
    suaves: [c(h, s * 0.5, 0.86), c(h + 180, s * 0.5, 0.86), c(h + 30, s * 0.4, 0.9)],
    neutros: [c(h, 0.08, 0.95), c(h, 0.06, 0.78), c(h + 180, 0.05, 0.5), c(h, 0.05, 0.22)],
  };
}
