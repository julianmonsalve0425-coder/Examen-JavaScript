export const MIN_DESCUENTO = 300000;
const PORCENTAJE_DESCUENTO = 0.1;

export function formatCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor);
}

export function escapeHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function ok(cart) {
  return { ok: true, cart };
}

function fail(message) {
  return { ok: false, message };
}

function buscarProducto(catalog, id) {
  return catalog.find((p) => p.id === id);
}
//validar cantidad de productos en el carrito, si no es válida retorna un mensaje de error
function validarCantidad(product, quantity) {
  if (!product) return 'El producto no existe en el catálogo.';
  if (!Number.isInteger(quantity)) return 'La cantidad debe ser un número entero.';
  if (quantity < 1) return 'La cantidad mínima es 1. Usa el botón quitar para eliminar el producto.';
  if (!product.active) return `"${product.name}" no está disponible.`;
  if (product.stock === 0) return `"${product.name}" está agotado.`;
  if (quantity > product.stock) return `Solo hay ${product.stock} unidades disponibles de "${product.name}".`;
  return null;
}

export function addItem(cart, catalog, productId, quantity = 1) {
  const product = buscarProducto(catalog, productId);
  const line = cart.find((l) => l.productId === productId);
  const newQuantity = (line ? line.quantity : 0) + quantity;

  const error = validarCantidad(product, newQuantity);
  if (error) return fail(error);

  if (line) {
    return ok(cart.map((l) => (l.productId === productId ? { ...l, quantity: newQuantity } : l)));
  }
  return ok([...cart, { productId, quantity: newQuantity }]);
}

export function updateQuantity(cart, catalog, productId, quantity) {
  if (!cart.some((l) => l.productId === productId)) {
    return fail('Ese producto no está en el carrito.');
  }

  const error = validarCantidad(buscarProducto(catalog, productId), quantity);
  if (error) return fail(error);

  return ok(cart.map((l) => (l.productId === productId ? { ...l, quantity } : l)));
}

export function removeItem(cart, productId) {
  return ok(cart.filter((l) => l.productId !== productId));
}

export function clearCart() {
  return ok([]);
}

export function getLines(cart, catalog) {
  return cart
    .map((item) => {
      const product = buscarProducto(catalog, item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity
      };
    })
    .filter((line) => line !== null);
}

export function calculateTotals(cart, catalog) {
  const subtotal = getLines(cart, catalog).reduce((suma, line) => suma + line.lineTotal, 0);
  const discount = subtotal >= MIN_DESCUENTO ? Math.round(subtotal * PORCENTAJE_DESCUENTO) : 0;
  return { subtotal, discount, total: subtotal - discount };
}

export function countUnits(cart) {
  return cart.reduce((suma, item) => suma + item.quantity, 0);
}

// Al recargar se descartan o ajustan los ítems que ya no sirven con el catálogo actual
export function syncCartWithCatalog(savedCart, catalog) {
  const result = [];

  for (const item of savedCart) {
    const product = buscarProducto(catalog, item.productId);
    if (!product || !product.active || product.stock < 1) continue;
    if (result.some((l) => l.productId === item.productId)) continue;
    result.push({ productId: product.id, quantity: Math.min(item.quantity, product.stock) });
  }

  const changed = JSON.stringify(result) !== JSON.stringify(savedCart);
  return { cart: result, changed };
}

function generarIdPedido() {
  const tiempo = Date.now().toString(36);
  const azar = Math.floor(Math.random() * 1296).toString(36).padStart(2, '0');
  return `ORD-${tiempo}${azar}`.toUpperCase();
}

export function confirmOrder(cart, catalog) {
  if (cart.length === 0) {
    return { ok: false, message: 'El carrito está vacío. Agrega productos antes de confirmar.' };
  }

  for (const item of cart) {
    const error = validarCantidad(buscarProducto(catalog, item.productId), item.quantity);
    if (error) return { ok: false, message: `No se pudo confirmar el pedido: ${error}` };
  }

  const order = {
    id: generarIdPedido(),
    lines: getLines(cart, catalog),
    ...calculateTotals(cart, catalog)
  };
  return { ok: true, order };
}
