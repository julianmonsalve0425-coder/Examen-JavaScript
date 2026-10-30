const URL_PRODUCTOS = './data/products.json';

function productoValido(p) {
  return p
    && Number.isInteger(p.id) && p.id >= 1
    && typeof p.name === 'string'
    && typeof p.category === 'string'
    && typeof p.price === 'number' && p.price >= 0
    && Number.isInteger(p.stock) && p.stock >= 0
    && typeof p.active === 'boolean';
}

export async function getProducts() {
  let response;
  try {
    response = await fetch(URL_PRODUCTOS);
  } catch (error) {
    throw new Error('No se pudo cargar el catálogo. Revisa tu conexión o abre el proyecto con un servidor local.');
  }

  if (!response.ok) {
    throw new Error(`No se pudo cargar el catálogo (error ${response.status}).`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('El archivo del catálogo tiene un formato inválido.');
  }

  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Los datos del catálogo no son válidos.');
  }

  const ids = new Set();
  for (const p of data) {
    if (!p || !Number.isInteger(p.id) || p.id < 1) {
      throw new Error('El catálogo tiene un producto con id inválido (debe ser un entero mayor o igual a 1).');
    }
    if (ids.has(p.id)) {
      throw new Error(`El catálogo tiene productos con id repetido: ${p.id}.`);
    }
    ids.add(p.id);
  }

  if (!data.every(productoValido)) {
    throw new Error('Los datos del catálogo no son válidos.');
  }

  return data;
}
