/* ia.js — Renders fotorrealistas con IA usando la API abierta de Pollinations
   (https://gen.pollinations.ai). Se llama directo desde el navegador con la clave
   del usuario; la foto se envía al servicio solo cuando el usuario toca "Generar". */

export const URL_API = "https://gen.pollinations.ai";
export const URL_CLAVES = "https://enter.pollinations.ai/keys";
const CLAVE_LOCAL = "decorafoto-ia-clave";
const MODELO_LOCAL = "decorafoto-ia-modelo";

// Lista de respaldo si no se puede consultar el catálogo en línea.
export const MODELOS_RESPALDO = [
  { id: "black-forest-labs/flux.2-klein-4b", nombre: "FLUX.2 Klein", precio: 0.005 },
  { id: "black-forest-labs/flux.1-kontext-pro", nombre: "FLUX.1 Kontext Pro", precio: 0.03 },
  { id: "openai/gpt-image-1-mini", nombre: "GPT Image 1 mini", precio: null },
  { id: "microsoft/mai-image-2.5-flash", nombre: "MAI Image 2.5 Flash", precio: null },
];
export const MODELO_DEFECTO = MODELOS_RESPALDO[0].id;

export function claveGuardada() { try { return localStorage.getItem(CLAVE_LOCAL) || ""; } catch { return ""; } }
export function guardarClave(clave) { try { localStorage.setItem(CLAVE_LOCAL, clave.trim()); } catch { /* sin almacenamiento */ } }
export function modeloGuardado() { try { return localStorage.getItem(MODELO_LOCAL) || MODELO_DEFECTO; } catch { return MODELO_DEFECTO; } }
export function guardarModelo(id) { try { localStorage.setItem(MODELO_LOCAL, id); } catch { /* sin almacenamiento */ } }

// Modelos del catálogo que aceptan una foto de entrada y se pagan con pollen gratuito (no "paid_only").
export async function listarModelos() {
  const r = await fetch(`${URL_API}/image/models`);
  if (!r.ok) throw new Error("catálogo no disponible");
  const lista = await r.json();
  const modelos = lista
    .filter((m) => m.category === "image" && (m.input_modalities || []).includes("image") && !m.paid_only && !String(m.name).startsWith("community/") && (!m.health || m.health.status !== "down"))
    .map((m) => ({
      id: m.name, nombre: m.title || m.name, salud: m.health && m.health.status,
      // Solo los modelos de tarifa plana tienen un precio claro por imagen; los demás cobran por tokens.
      precio: m.flat_rate && m.pricing && m.pricing.completionImageTokens ? Number(m.pricing.completionImageTokens) : null,
    }));
  if (!modelos.length) throw new Error("catálogo vacío");
  const orden = (id) => { const i = MODELOS_RESPALDO.findIndex((r) => r.id === id); return i < 0 ? 99 : i; };
  modelos.sort((a, b) => orden(a.id) - orden(b.id) || (a.precio ?? 1) - (b.precio ?? 1));
  return modelos;
}

export async function consultarSaldo(clave) {
  const r = await fetch(`${URL_API}/account/balance`, { headers: { Authorization: `Bearer ${clave}` } });
  if (r.status === 401) throw new Error("Clave inválida.");
  if (!r.ok) throw new Error(`No se pudo consultar el saldo (${r.status}).`);
  const j = await r.json();
  const b = j.balance;
  if (typeof b === "number") return { total: b };
  if (b && typeof b === "object") return { total: b.total ?? 0, gratis: b.tier, pagado: b.paid };
  if (j.accountBalance) return { total: j.accountBalance.total, gratis: j.accountBalance.tier, pagado: j.accountBalance.paid };
  return { total: 0 };
}

// Texto en inglés (los modelos responden mejor) que describe el rediseño pedido.
export function armarPrompt({ estilo, fuente, extra, tipoEspacio }) {
  const espacio = tipoEspacio || "space";
  const base = fuente === "diseno"
    ? `This is a photo of a ${espacio} that was roughly edited: some walls and floors were recolored and flat illustrations of furniture, plants and decor were pasted on it. Turn it into a photorealistic photograph in ${estilo.nombreIngles} style (${estilo.ia}). Keep the exact same room geometry, camera angle, windows and doors. Keep the chosen colors, materials and the position of every added object, but render them as real objects with correct perspective, lighting and shadows.`
    : `Interior/exterior design photo edit. Redesign this ${espacio} in ${estilo.nombreIngles} style: ${estilo.ia}. Keep the exact same room geometry, walls, windows, doors, camera angle and perspective. Change wall paint, floor material, furniture, textiles, lighting and decoration to match the style.`;
  const cierre = " Photorealistic, natural lighting, high quality, no text, no watermark.";
  const ex = (extra || "").trim();
  return base + (ex ? ` Additional instructions: ${ex}.` : "") + cierre;
}

/* Prompt para el flujo principal: el usuario describe en texto los cambios que quiere.
   instrucciones: ya en inglés (ver traducirInstrucciones) o en español si no se pudo traducir. */
export function armarPromptCambios({ instrucciones, estilo, tipoEspacio, mantenerMuebles }) {
  const espacio = tipoEspacio || "space";
  const partes = [`Photo edit of a ${espacio}. Apply exactly these changes: ${instrucciones.trim().replace(/\s+/g, " ")}.`];
  if (estilo) partes.push(`Overall style: ${estilo.nombreIngles} (${estilo.ia}).`);
  partes.push("Keep the same room geometry, camera angle, perspective, windows and doors.");
  if (mantenerMuebles) partes.push("Keep all existing furniture and objects that are not mentioned.");
  partes.push("Photorealistic, natural lighting, high quality, no text, no watermark.");
  return partes.join(" ");
}

// Convierte las instrucciones en español a inglés conciso con el modelo de texto (costo ínfimo).
export async function traducirInstrucciones(clave, texto) {
  const cuerpo = {
    model: "openai",
    max_tokens: 200,
    messages: [
      { role: "system", content: "You turn a Spanish request for changes to a photo of a room, patio or facade into a concise English image-editing instruction list. Keep every requested change, color and material; do not add ideas. Output only the English text, no quotes." },
      { role: "user", content: texto },
    ],
  };
  const control = new AbortController();
  const t = setTimeout(() => control.abort(), 20000);
  try {
    const r = await fetch(`${URL_API}/v1/chat/completions`, {
      method: "POST", signal: control.signal,
      headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
      body: JSON.stringify(cuerpo),
    });
    if (!r.ok) throw new Error("traducción " + r.status);
    const j = await r.json();
    const salida = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return salida ? String(salida).trim() : texto;
  } finally { clearTimeout(t); }
}

function tamanoSalida(ancho, alto) {
  const f = Math.min(1, 1024 / Math.max(ancho, alto));
  const r16 = (v) => Math.max(256, Math.round(v * f / 16) * 16);
  return `${r16(ancho)}x${r16(alto)}`;
}

async function leerError(r) {
  let detalle = "";
  try { const j = await r.json(); detalle = (j.error && (j.error.message || j.error)) || j.message || JSON.stringify(j); } catch { try { detalle = await r.text(); } catch { /* nada */ } }
  detalle = String(detalle || "").slice(0, 200);
  if (r.status === 401) return "Clave inválida o vencida. Revisa la clave en Configuración.";
  if (r.status === 402) return "Sin pollen suficiente. Completa misiones o recarga en enter.pollinations.ai." + (detalle ? ` (${detalle})` : "");
  if (r.status === 429) return "Demasiadas solicitudes: espera unos segundos y vuelve a intentar.";
  return `Error ${r.status}${detalle ? ": " + detalle : ""}`;
}

/* Genera un render. blob: imagen JPEG/PNG de entrada. Devuelve un Blob con la imagen resultante. */
export async function generarRender({ clave, modelo, blob, prompt, ancho, alto, conTamano = true }) {
  if (!clave) throw new Error("Falta la clave de Pollinations.");
  const form = new FormData();
  form.append("prompt", prompt);
  form.append("model", modelo);
  form.append("image", blob, "foto.jpg");
  form.append("response_format", "b64_json");
  form.append("n", "1");
  if (conTamano && ancho && alto) form.append("size", tamanoSalida(ancho, alto));
  const r = await fetch(`${URL_API}/v1/images/edits`, { method: "POST", headers: { Authorization: `Bearer ${clave}` }, body: form });
  if (!r.ok) {
    // Algunos modelos no aceptan tamaño libre: reintentar sin "size".
    if (r.status === 400 && conTamano) return generarRender({ clave, modelo, blob, prompt, ancho, alto, conTamano: false });
    throw new Error(await leerError(r));
  }
  const j = await r.json();
  const dato = j && j.data && j.data[0];
  if (!dato) throw new Error("La respuesta no trae imagen.");
  if (dato.b64_json) {
    const bin = atob(dato.b64_json);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const tipo = bytes[0] === 0xff && bytes[1] === 0xd8 ? "image/jpeg" : "image/png";
    return new Blob([bytes], { type: tipo });
  }
  if (dato.url) {
    const ri = await fetch(dato.url);
    if (!ri.ok) throw new Error("No se pudo descargar el render.");
    return await ri.blob();
  }
  throw new Error("Formato de respuesta desconocido.");
}
