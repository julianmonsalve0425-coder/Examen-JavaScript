# TecnoStock

Tienda de tecnología hecha con HTML, CSS y JavaScript puro para el examen. Tiene catálogo, filtros, carrito con descuento y confirmación de pedido simulada.

## Cómo abrirlo

No sirve abrir el `index.html` con doble clic, porque `fetch` y los módulos de JS necesitan un servidor. Opciones:

- Con Live Server en VS Code: clic derecho en `index.html` y "Open with Live Server".
- O desde la carpeta del proyecto: `python -m http.server 8000` y entrar a `http://localhost:8000`.

## Archivos

- `index.html`: la página con la cabecera, filtros, catálogo, carrito y el modal del pedido.
- `css/styles.css`: estilos y versión para pantallas pequeñas.
- `data/products.json`: los 14 productos del catálogo.
- `js/app.js`: junta todo, maneja los filtros y escucha los eventos de los componentes.
- `js/api.js`: carga el catálogo con fetch y valida los datos.
- `js/cart.js`: reglas del carrito, descuento del 10% desde $300.000 y confirmación del pedido.
- `js/storage.js`: guarda y lee el carrito en localStorage sin romperse si hay datos dañados.
- `js/components/`: los web components `product-card`, `product-list` y `shopping-cart`.
