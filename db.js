/* db.js — Guarda los proyectos (foto + capas) en IndexedDB, dentro del teléfono. */

const NOMBRE = "decorafoto";
const VERSION = 1;
let conexion = null;

function abrir() {
  if (conexion) return Promise.resolve(conexion);
  return new Promise((resolver, rechazar) => {
    const pedido = indexedDB.open(NOMBRE, VERSION);
    pedido.onupgradeneeded = () => {
      const bd = pedido.result;
      if (!bd.objectStoreNames.contains("proyectos")) bd.createObjectStore("proyectos", { keyPath: "id" });
    };
    pedido.onsuccess = () => { conexion = pedido.result; resolver(conexion); };
    pedido.onerror = () => rechazar(pedido.error);
  });
}

function pedir(modo, accion) {
  return abrir().then((bd) => new Promise((resolver, rechazar) => {
    const tx = bd.transaction("proyectos", modo);
    const pedido = accion(tx.objectStore("proyectos"));
    pedido.onsuccess = () => resolver(pedido.result);
    pedido.onerror = () => rechazar(pedido.error);
  }));
}

export function guardarProyecto(proyecto) {
  return pedir("readwrite", (s) => s.put(proyecto));
}

export function obtenerProyecto(id) {
  return pedir("readonly", (s) => s.get(id));
}

export function eliminarProyecto(id) {
  return pedir("readwrite", (s) => s.delete(id));
}

// Lista liviana (sin máscaras ni foto) ordenada del más reciente al más antiguo.
export async function listarProyectos() {
  const todos = await pedir("readonly", (s) => s.getAll());
  return todos
    .map((p) => ({ id: p.id, nombre: p.nombre, fecha: p.fecha, miniatura: p.miniatura }))
    .sort((a, b) => b.fecha - a.fecha);
}
