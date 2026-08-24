/**
 * Stock Kiosco v4
 * - Sin lupa en buscador
 * - Click en "Stock bajo" filtra
 * - Configuración de categorías predefinidas
 * - Productos de ejemplo de kiosco
 */

const STORAGE_KEY = "kiosco_stock_v3";
const CATS_KEY = "kiosco_categorias_v1";
const THEME_KEY = "kiosco_theme";
const MAX_IMG_SIZE = 400;

const CATEGORIAS_DEFAULT = [
  "Bebidas",
  "Golosinas",
  "Snacks",
  "Cigarrillos",
  "Lácteos",
  "Panadería",
  "Helados",
  "Limpieza",
  "Útiles",
  "Otros",
];

const PRODUCTOS_EJEMPLO = [
  { nombre: "Coca Cola 500ml", categoria: "Bebidas", precioCompra: 800, precioVenta: 1200, stock: 24, stockMinimo: 6 },
  { nombre: "Sprite 500ml", categoria: "Bebidas", precioCompra: 750, precioVenta: 1100, stock: 18, stockMinimo: 6 },
  { nombre: "Agua Villavicencio 500ml", categoria: "Bebidas", precioCompra: 400, precioVenta: 700, stock: 30, stockMinimo: 8 },
  { nombre: "Cerveza Quilmes 473ml", categoria: "Bebidas", precioCompra: 900, precioVenta: 1400, stock: 12, stockMinimo: 4 },
  { nombre: "Alfajor Havanna", categoria: "Golosinas", precioCompra: 600, precioVenta: 1000, stock: 20, stockMinimo: 5 },
  { nombre: "Chocolate Milka 55g", categoria: "Golosinas", precioCompra: 900, precioVenta: 1400, stock: 15, stockMinimo: 4 },
  { nombre: "Caramelos Sugus x5", categoria: "Golosinas", precioCompra: 200, precioVenta: 400, stock: 40, stockMinimo: 10 },
  { nombre: "Chicles Beldent", categoria: "Golosinas", precioCompra: 350, precioVenta: 600, stock: 25, stockMinimo: 8 },
  { nombre: "Papas Lays Clásicas", categoria: "Snacks", precioCompra: 1100, precioVenta: 1700, stock: 10, stockMinimo: 4 },
  { nombre: "Maní salado 100g", categoria: "Snacks", precioCompra: 500, precioVenta: 900, stock: 14, stockMinimo: 5 },
  { nombre: "Palitos salados", categoria: "Snacks", precioCompra: 400, precioVenta: 700, stock: 3, stockMinimo: 5 },
  { nombre: "Marlboro Box 20", categoria: "Cigarrillos", precioCompra: 2800, precioVenta: 3500, stock: 8, stockMinimo: 3 },
  { nombre: "Philip Morris 20", categoria: "Cigarrillos", precioCompra: 2500, precioVenta: 3200, stock: 2, stockMinimo: 3 },
  { nombre: "Yogur La Serenísima", categoria: "Lácteos", precioCompra: 500, precioVenta: 850, stock: 12, stockMinimo: 4 },
  { nombre: "Leche larga vida 1L", categoria: "Lácteos", precioCompra: 900, precioVenta: 1300, stock: 10, stockMinimo: 4 },
  { nombre: "Facturas x unitario", categoria: "Panadería", precioCompra: 300, precioVenta: 500, stock: 16, stockMinimo: 6 },
  { nombre: "Helado Frigor 1L", categoria: "Helados", precioCompra: 2500, precioVenta: 3800, stock: 6, stockMinimo: 2 },
  { nombre: "Servilletas x50", categoria: "Limpieza", precioCompra: 400, precioVenta: 700, stock: 8, stockMinimo: 3 },
  { nombre: "Fósforos", categoria: "Útiles", precioCompra: 150, precioVenta: 300, stock: 20, stockMinimo: 5 },
  { nombre: "Pilas AA x2", categoria: "Útiles", precioCompra: 800, precioVenta: 1300, stock: 1, stockMinimo: 3 },
];

let productos = [];
let categorias = [];
let productoEditandoId = null;
let fotoActualBase64 = null;
let stockAjusteId = null;
let stockAjusteValor = 0;
let confirmCallback = null;
let filtroStockBajo = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// =====================
// Persistencia
// =====================
function cargarProductos() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    productos = data ? JSON.parse(data) : [];
    productos = productos.map((p) => ({
      ...p,
      precioCompra: p.precioCompra ?? p.precio ?? 0,
      precioVenta: p.precioVenta ?? p.precio ?? 0,
      foto: p.foto || null,
    }));
  } catch {
    productos = [];
  }
}

function guardarProductos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(productos));
}

function cargarCategorias() {
  try {
    const data = localStorage.getItem(CATS_KEY);
    if (data) {
      categorias = JSON.parse(data);
    } else {
      categorias = [...CATEGORIAS_DEFAULT];
      guardarCategorias();
    }
  } catch {
    categorias = [...CATEGORIAS_DEFAULT];
  }
}

function guardarCategorias() {
  localStorage.setItem(CATS_KEY, JSON.stringify(categorias));
}

// =====================
// Tema
// =====================
function cargarTema() {
  const tema = localStorage.getItem(THEME_KEY) || "dark";
  document.documentElement.setAttribute("data-theme", tema === "light" ? "light" : "");
  $("#theme-icon").textContent = tema === "light" ? "🌙" : "☀️";
}

function toggleTema() {
  const actual = document.documentElement.getAttribute("data-theme");
  const nuevo = actual === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", nuevo === "light" ? "light" : "");
  localStorage.setItem(THEME_KEY, nuevo);
  $("#theme-icon").textContent = nuevo === "light" ? "🌙" : "☀️";
  mostrarToast(nuevo === "light" ? "Tema claro activado" : "Tema oscuro activado", "info");
}

// =====================
// Utilidades
// =====================
function generarId() {
  return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function formatearPrecio(valor) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor || 0);
}

function escapeHtml(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

function mostrarToast(mensaje, tipo = "success") {
  const container = $("#toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = mensaje;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 250);
  }, 2600);
}

function comprimirImagen(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      reject(new Error("Archivo no válido"));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_IMG_SIZE || height > MAX_IMG_SIZE) {
          if (width > height) {
            height = Math.round((height * MAX_IMG_SIZE) / width);
            width = MAX_IMG_SIZE;
          } else {
            width = Math.round((width * MAX_IMG_SIZE) / height);
            height = MAX_IMG_SIZE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}

function mostrarPreviewFoto(base64) {
  const img = $("#foto-img");
  const placeholder = $("#foto-placeholder");
  if (base64) {
    img.src = base64;
    img.classList.remove("hidden");
    placeholder.classList.add("hidden");
  } else {
    img.src = "";
    img.classList.add("hidden");
    placeholder.classList.remove("hidden");
  }
}

// =====================
// Confirmación
// =====================
function confirmar(titulo, mensaje) {
  return new Promise((resolve) => {
    $("#confirm-titulo").textContent = titulo;
    $("#confirm-mensaje").textContent = mensaje;
    $("#modal-confirm").classList.remove("hidden");
    confirmCallback = resolve;
    $("#btn-confirm-ok").onclick = () => { cerrarConfirm(); resolve(true); };
    $("#btn-confirm-cancel").onclick = () => { cerrarConfirm(); resolve(false); };
    $("#btn-cerrar-confirm").onclick = () => { cerrarConfirm(); resolve(false); };
  });
}

function cerrarConfirm() {
  $("#modal-confirm").classList.add("hidden");
  confirmCallback = null;
}

// =====================
// Categorías
// =====================
function renderSelectCategorias(selected = "") {
  const select = $("#categoria");
  select.innerHTML = `<option value="">Sin categoría</option>`;
  categorias.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    if (c === selected) opt.selected = true;
    select.appendChild(opt);
  });
}

function actualizarFiltroCategorias() {
  const actual = $("#filtro-categoria").value;
  const usadas = [...new Set([
    ...categorias,
    ...productos.map((p) => p.categoria).filter(Boolean),
  ])].sort();

  const select = $("#filtro-categoria");
  select.innerHTML = `<option value="">Todas las categorías</option>`;
  usadas.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    select.appendChild(opt);
  });
  if (usadas.includes(actual)) select.value = actual;
}

function renderListaCategoriasConfig() {
  const ul = $("#lista-categorias-config");
  if (categorias.length === 0) {
    ul.innerHTML = `<li style="justify-content:center;color:var(--text-muted);">No hay categorías. Agregá una.</li>`;
    return;
  }
  ul.innerHTML = categorias
    .map(
      (c, i) => `
      <li>
        <span>${escapeHtml(c)}</span>
        <button type="button" class="btn-icon danger" data-cat-index="${i}" title="Eliminar">🗑️</button>
      </li>`
    )
    .join("");
}

function agregarCategoria() {
  const input = $("#nueva-categoria");
  const nombre = input.value.trim();
  if (!nombre) {
    mostrarToast("Escribí un nombre de categoría", "error");
    return;
  }
  if (categorias.some((c) => c.toLowerCase() === nombre.toLowerCase())) {
    mostrarToast("Esa categoría ya existe", "error");
    return;
  }
  categorias.push(nombre);
  categorias.sort((a, b) => a.localeCompare(b, "es"));
  guardarCategorias();
  renderListaCategoriasConfig();
  actualizarFiltroCategorias();
  input.value = "";
  input.focus();
  mostrarToast(`Categoría "${nombre}" agregada`);
}

async function eliminarCategoria(index) {
  const nombre = categorias[index];
  if (!nombre) return;
  const enUso = productos.some((p) => p.categoria === nombre);
  const msg = enUso
    ? `La categoría "${nombre}" está en uso. ¿La eliminás igual? Los productos quedan sin categoría.`
    : `¿Eliminar la categoría "${nombre}"?`;
  const ok = await confirmar("Eliminar categoría", msg);
  if (!ok) return;

  if (enUso) {
    productos.forEach((p) => {
      if (p.categoria === nombre) p.categoria = "";
    });
    guardarProductos();
  }
  categorias.splice(index, 1);
  guardarCategorias();
  renderListaCategoriasConfig();
  actualizarFiltroCategorias();
  renderGrid();
  mostrarToast("Categoría eliminada");
}

// =====================
// Filtro stock bajo
// =====================
function toggleFiltroStockBajo() {
  filtroStockBajo = !filtroStockBajo;
  $("#stat-bajo-card").classList.toggle("active", filtroStockBajo);
  $("#filtro-activo").classList.toggle("hidden", !filtroStockBajo);
  renderGrid();
  if (filtroStockBajo) {
    mostrarToast("Filtrando productos con stock bajo", "info");
  }
}

function limpiarFiltroStockBajo() {
  filtroStockBajo = false;
  $("#stat-bajo-card").classList.remove("active");
  $("#filtro-activo").classList.add("hidden");
  renderGrid();
}

// =====================
// Productos de ejemplo
// =====================
function cargarEjemplos() {
  const nuevos = PRODUCTOS_EJEMPLO.map((p) => ({
    id: generarId(),
    ...p,
    foto: null,
    creado: new Date().toISOString(),
  }));

  const nombresExistentes = new Set(productos.map((p) => p.nombre.toLowerCase()));
  const aAgregar = nuevos.filter((p) => !nombresExistentes.has(p.nombre.toLowerCase()));

  if (aAgregar.length === 0) {
    mostrarToast("Los productos de ejemplo ya están cargados", "info");
    return;
  }

  aAgregar.forEach((p) => {
    if (p.categoria && !categorias.includes(p.categoria)) {
      categorias.push(p.categoria);
    }
  });
  categorias.sort((a, b) => a.localeCompare(b, "es"));
  guardarCategorias();

  productos = [...productos, ...aAgregar];
  guardarProductos();
  actualizarFiltroCategorias();
  renderGrid();
  mostrarToast(`${aAgregar.length} productos de ejemplo agregados`);
}

// =====================
// Render grid
// =====================
function filtrarYOrdenar() {
  const texto = $("#buscador").value.trim().toLowerCase();
  const cat = $("#filtro-categoria").value;
  const [campo, dir] = ($("#orden").value || "nombre-asc").split("-");

  let lista = productos.filter((p) => {
    const matchTexto =
      !texto ||
      p.nombre.toLowerCase().includes(texto) ||
      (p.categoria && p.categoria.toLowerCase().includes(texto));
    const matchCat = !cat || p.categoria === cat;
    const matchBajo = !filtroStockBajo || p.stock <= (p.stockMinimo ?? 5);
    return matchTexto && matchCat && matchBajo;
  });

  lista.sort((a, b) => {
    let va = a[campo] ?? "";
    let vb = b[campo] ?? "";
    if (typeof va === "string") {
      va = va.toLowerCase();
      vb = (vb + "").toLowerCase();
    }
    if (va < vb) return dir === "asc" ? -1 : 1;
    if (va > vb) return dir === "asc" ? 1 : -1;
    return 0;
  });

  return lista;
}

function renderGrid() {
  const lista = filtrarYOrdenar();
  const grid = $("#productos-grid");
  const empty = $("#empty-state");
  const noResults = $("#no-results");

  const totalStock = productos.reduce((a, p) => a + (p.stock || 0), 0);
  const costoTotal = productos.reduce((a, p) => a + (p.stock || 0) * (p.precioCompra || 0), 0);
  const ventaTotal = productos.reduce((a, p) => a + (p.stock || 0) * (p.precioVenta || 0), 0);
  const stockBajo = productos.filter((p) => p.stock <= (p.stockMinimo ?? 5)).length;

  $("#stat-productos").textContent = productos.length;
  $("#stat-stock").textContent = totalStock;
  $("#stat-costo").textContent = formatearPrecio(costoTotal);
  $("#stat-venta").textContent = formatearPrecio(ventaTotal);
  $("#stat-bajo").textContent = stockBajo;

  if (productos.length === 0) {
    grid.innerHTML = "";
    empty.classList.remove("hidden");
    noResults.classList.add("hidden");
    return;
  }

  empty.classList.add("hidden");

  if (lista.length === 0) {
    grid.innerHTML = "";
    noResults.classList.remove("hidden");
    return;
  }

  noResults.classList.add("hidden");

  grid.innerHTML = lista
    .map((p) => {
      const stockClass =
        p.stock === 0 ? "cero" : p.stock <= (p.stockMinimo ?? 5) ? "bajo" : "";
      const cardClass =
        p.stock === 0 ? "stock-cero-card" : p.stock <= (p.stockMinimo ?? 5) ? "stock-bajo-card" : "";

      const compra = p.precioCompra || 0;
      const venta = p.precioVenta || 0;
      const margen = compra > 0 ? Math.round(((venta - compra) / compra) * 100) : null;

      const imgHtml = p.foto
        ? `<img src="${p.foto}" alt="${escapeHtml(p.nombre)}" loading="lazy" />`
        : `<div class="card-img-placeholder">📦</div>`;

      return `
        <article class="producto-card ${cardClass}" data-id="${p.id}">
          <div class="card-img-wrap">
            ${imgHtml}
            <span class="card-stock-badge ${stockClass}">${p.stock}</span>
          </div>
          <div class="card-body">
            <div class="card-nombre">${escapeHtml(p.nombre)}</div>
            ${p.categoria ? `<div class="card-categoria">${escapeHtml(p.categoria)}</div>` : ""}
            <div class="card-precios">
              <div class="card-precio-row">
                <span class="card-precio-label">Compra</span>
                <span class="card-precio-valor">${formatearPrecio(compra)}</span>
              </div>
              <div class="card-precio-row">
                <span class="card-precio-label">Venta</span>
                <span class="card-precio-valor venta">${formatearPrecio(venta)}</span>
              </div>
              ${margen !== null ? `<div class="card-margen">Margen ${margen >= 0 ? "+" : ""}${margen}%</div>` : ""}
            </div>
            <div class="card-stock-controls">
              <button type="button" data-action="restar" title="Restar 1">−</button>
              <span class="card-stock-valor" data-action="ajustar" title="Ajuste rápido">${p.stock}</span>
              <button type="button" data-action="sumar" title="Sumar 1">+</button>
            </div>
            <div class="card-acciones">
              <button type="button" class="btn-icon" data-action="editar" title="Editar">✏️</button>
              <button type="button" class="btn-icon danger" data-action="eliminar" title="Eliminar">🗑️</button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

// =====================
// Modal Producto
// =====================
function abrirModal(producto = null) {
  productoEditandoId = producto ? producto.id : null;
  fotoActualBase64 = producto?.foto || null;

  $("#modal-titulo").textContent = producto ? "Editar producto" : "Nuevo producto";
  $("#producto-id").value = producto?.id || "";
  $("#nombre").value = producto?.nombre || "";
  $("#precio-compra").value = producto?.precioCompra ?? "";
  $("#precio-venta").value = producto?.precioVenta ?? "";
  $("#stock").value = producto?.stock ?? 0;
  $("#stock-minimo").value = producto?.stockMinimo ?? 5;
  $("#error-nombre").textContent = "";
  $("#nombre").classList.remove("error");
  $("#foto-input").value = "";
  $("#foto-camara").value = "";

  renderSelectCategorias(producto?.categoria || "");
  mostrarPreviewFoto(fotoActualBase64);

  $("#modal").classList.remove("hidden");
  setTimeout(() => $("#nombre").focus(), 50);
}

function cerrarModal() {
  $("#modal").classList.add("hidden");
  $("#form-producto").reset();
  productoEditandoId = null;
  fotoActualBase64 = null;
  mostrarPreviewFoto(null);
}

// =====================
// Modal Config
// =====================
function abrirConfig() {
  renderListaCategoriasConfig();
  $("#modal-config").classList.remove("hidden");
  setTimeout(() => $("#nueva-categoria").focus(), 50);
}

function cerrarConfig() {
  $("#modal-config").classList.add("hidden");
  actualizarFiltroCategorias();
}

// =====================
// Modal Stock
// =====================
function abrirModalStock(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  stockAjusteId = id;
  stockAjusteValor = p.stock;
  $("#stock-nombre").textContent = p.nombre;
  $("#stock-actual").textContent = stockAjusteValor;
  $("#stock-manual").value = stockAjusteValor;
  $("#modal-stock").classList.remove("hidden");
}

function cerrarModalStock() {
  $("#modal-stock").classList.add("hidden");
  stockAjusteId = null;
}

function aplicarDeltaStock(delta) {
  stockAjusteValor = Math.max(0, stockAjusteValor + delta);
  $("#stock-actual").textContent = stockAjusteValor;
  $("#stock-manual").value = stockAjusteValor;
}

function confirmarAjusteStock() {
  if (!stockAjusteId) return;
  const manual = parseInt($("#stock-manual").value, 10);
  const valor = Number.isFinite(manual) ? Math.max(0, manual) : stockAjusteValor;
  const p = productos.find((x) => x.id === stockAjusteId);
  if (p) {
    p.stock = valor;
    guardarProductos();
    renderGrid();
    mostrarToast(`Stock de "${p.nombre}" → ${valor}`);
  }
  cerrarModalStock();
}

// =====================
// CRUD
// =====================
function guardarProducto(e) {
  e.preventDefault();
  const nombre = $("#nombre").value.trim();

  if (!nombre) {
    $("#error-nombre").textContent = "El nombre es obligatorio";
    $("#nombre").classList.add("error");
    $("#nombre").focus();
    return;
  }

  $("#error-nombre").textContent = "";
  $("#nombre").classList.remove("error");

  const datos = {
    nombre,
    categoria: $("#categoria").value.trim(),
    precioCompra: parseFloat($("#precio-compra").value) || 0,
    precioVenta: parseFloat($("#precio-venta").value) || 0,
    stock: parseInt($("#stock").value, 10) || 0,
    stockMinimo: parseInt($("#stock-minimo").value, 10) || 0,
    foto: fotoActualBase64,
  };

  if (productoEditandoId) {
    const idx = productos.findIndex((p) => p.id === productoEditandoId);
    if (idx !== -1) {
      productos[idx] = { ...productos[idx], ...datos };
      mostrarToast("Producto actualizado");
    }
  } else {
    productos.push({
      id: generarId(),
      ...datos,
      creado: new Date().toISOString(),
    });
    mostrarToast("Producto agregado");
  }

  guardarProductos();
  actualizarFiltroCategorias();
  renderGrid();
  cerrarModal();
}

async function eliminarProducto(id) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  const ok = await confirmar(
    "Eliminar producto",
    `¿Seguro que querés eliminar "${p.nombre}"? Esta acción no se puede deshacer.`
  );
  if (!ok) return;
  productos = productos.filter((x) => x.id !== id);
  guardarProductos();
  actualizarFiltroCategorias();
  renderGrid();
  mostrarToast("Producto eliminado");
}

function cambiarStock(id, delta) {
  const p = productos.find((x) => x.id === id);
  if (!p) return;
  const anterior = p.stock;
  p.stock = Math.max(0, (p.stock || 0) + delta);
  if (p.stock === anterior) return;
  guardarProductos();
  renderGrid();
  requestAnimationFrame(() => {
    const el = document.querySelector(`.producto-card[data-id="${id}"] .card-stock-valor`);
    if (el) {
      el.classList.add("changed");
      setTimeout(() => el.classList.remove("changed"), 400);
    }
  });
}

// =====================
// Export CSV
// =====================
function exportarCSV() {
  if (productos.length === 0) {
    mostrarToast("No hay productos para exportar", "error");
    return;
  }
  const headers = ["Nombre", "Categoría", "Precio compra", "Precio venta", "Stock", "Stock mínimo"];
  const rows = productos.map((p) => [
    `"${(p.nombre || "").replace(/"/g, '""')}"`,
    `"${(p.categoria || "").replace(/"/g, '""')}"`,
    p.precioCompra || 0,
    p.precioVenta || 0,
    p.stock || 0,
    p.stockMinimo ?? 5,
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stock-kiosco-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast("CSV exportado");
}

// =====================
// Eventos
// =====================
function inicializarEventos() {
  $("#btn-nuevo").addEventListener("click", () => abrirModal());
  $("#btn-empty-nuevo")?.addEventListener("click", () => abrirModal());
  $("#btn-theme").addEventListener("click", toggleTema);
  $("#btn-export").addEventListener("click", exportarCSV);
  $("#btn-config").addEventListener("click", abrirConfig);

  $("#stat-bajo-card").addEventListener("click", toggleFiltroStockBajo);
  $("#btn-limpiar-filtro").addEventListener("click", limpiarFiltroStockBajo);

  $("#btn-cargar-ejemplos")?.addEventListener("click", cargarEjemplos);
  $("#btn-cargar-ejemplos-config")?.addEventListener("click", cargarEjemplos);

  $("#btn-add-categoria").addEventListener("click", agregarCategoria);
  $("#nueva-categoria").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      agregarCategoria();
    }
  });
  $("#lista-categorias-config").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat-index]");
    if (!btn) return;
    eliminarCategoria(parseInt(btn.dataset.catIndex, 10));
  });
  $("#btn-cerrar-config").addEventListener("click", cerrarConfig);
  $("#btn-cerrar-config-ok").addEventListener("click", cerrarConfig);
  $("#modal-config .modal-backdrop").addEventListener("click", cerrarConfig);

  async function manejarFoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      fotoActualBase64 = await comprimirImagen(file);
      mostrarPreviewFoto(fotoActualBase64);
      mostrarToast("Imagen cargada", "info");
    } catch {
      mostrarToast("No se pudo procesar la imagen", "error");
    }
  }
  $("#foto-input").addEventListener("change", manejarFoto);
  $("#foto-camara").addEventListener("change", manejarFoto);
  $("#btn-quitar-foto").addEventListener("click", () => {
    fotoActualBase64 = null;
    $("#foto-input").value = "";
    $("#foto-camara").value = "";
    mostrarPreviewFoto(null);
  });

  $("#btn-cerrar-modal").addEventListener("click", cerrarModal);
  $("#btn-cancelar").addEventListener("click", cerrarModal);
  $("#modal .modal-backdrop").addEventListener("click", cerrarModal);
  $("#form-producto").addEventListener("submit", guardarProducto);

  $("#modal-confirm .modal-backdrop").addEventListener("click", () => {
    cerrarConfirm();
    if (confirmCallback) confirmCallback(false);
  });

  $("#btn-cerrar-stock").addEventListener("click", cerrarModalStock);
  $("#btn-stock-cancel").addEventListener("click", cerrarModalStock);
  $("#modal-stock .modal-backdrop").addEventListener("click", cerrarModalStock);
  $("#btn-stock-ok").addEventListener("click", confirmarAjusteStock);
  $$(".btn-stock-big").forEach((btn) => {
    btn.addEventListener("click", () => aplicarDeltaStock(parseInt(btn.dataset.delta, 10)));
  });
  $("#stock-manual").addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10);
    if (Number.isFinite(v)) {
      stockAjusteValor = Math.max(0, v);
      $("#stock-actual").textContent = stockAjusteValor;
    }
  });

  $("#buscador").addEventListener("input", renderGrid);
  $("#filtro-categoria").addEventListener("change", renderGrid);
  $("#orden").addEventListener("change", renderGrid);

  $("#productos-grid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const card = btn.closest(".producto-card");
    const id = card?.dataset.id;
    if (!id) return;
    const action = btn.dataset.action;
    switch (action) {
      case "sumar": cambiarStock(id, 1); break;
      case "restar": cambiarStock(id, -1); break;
      case "ajustar": abrirModalStock(id); break;
      case "editar": {
        const p = productos.find((x) => x.id === id);
        if (p) abrirModal(p);
        break;
      }
      case "eliminar": eliminarProducto(id); break;
    }
  });

  document.addEventListener("keydown", (e) => {
    const tag = document.activeElement?.tagName;
    const escribiendo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

    if (e.key === "Escape") {
      if (!$("#modal").classList.contains("hidden")) cerrarModal();
      else if (!$("#modal-config").classList.contains("hidden")) cerrarConfig();
      else if (!$("#modal-confirm").classList.contains("hidden")) {
        cerrarConfirm();
        if (confirmCallback) confirmCallback(false);
      } else if (!$("#modal-stock").classList.contains("hidden")) cerrarModalStock();
      return;
    }

    if (escribiendo) return;

    if (e.key === "n" || e.key === "N") {
      e.preventDefault();
      abrirModal();
    } else if (e.key === "/") {
      e.preventDefault();
      $("#buscador").focus();
    } else if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      toggleTema();
    }
  });
}

function init() {
  cargarTema();
  cargarCategorias();
  cargarProductos();
  actualizarFiltroCategorias();
  renderGrid();
  inicializarEventos();
}

document.addEventListener("DOMContentLoaded", init);
