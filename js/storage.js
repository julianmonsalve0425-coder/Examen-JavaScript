const CLAVE = 'tecnostock_carrito';

export function saveCart(cart) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(cart));
  } catch (error) {
    console.warn('No se pudo guardar el carrito', error);
  }
}

export function loadCart() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return [];

    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => item && Number.isInteger(item.productId) && item.productId >= 1 && Number.isInteger(item.quantity) && item.quantity >= 1)
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));
  } catch (error) {
    return [];
  }
}
