import { getProducts } from './api.js';
import { saveCart, loadCart } from './storage.js';
import {
  addItem, updateQuantity, removeItem, clearCart, getLines, calculateTotals,
  countUnits, syncCartWithCatalog, confirmOrder, formatCOP, escapeHtml
} from './cart.js';
import './components/product-card.js';
import './components/product-list.js';
import './components/shopping-cart.js';

const $ = (id) => document.getElementById(id);

const productList = document.querySelector('product-list');
const shoppingCart = document.querySelector('shopping-cart');

let catalog = [];
let cart = [];
let messageTimer;

function showMessage(text, type = 'info') {
  const box = $('message');
  box.textContent = text;
  box.className = `message message-${type}`;
  box.hidden = false;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => { box.hidden = true; }, 4000);
}

function setLoading(loading) {
  $('loading').hidden = !loading;
}

function showError(text) {
  $('error-text').textContent = text;
  $('error-box').hidden = false;
}

function fillCategories() {
  const categories = [...new Set(catalog.map((p) => p.category))];
  $('category').innerHTML = '<option value="">Todas las categorías</option>'
    + categories.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join('');
}

function getVisibleProducts() {
  const text = $('search').value.trim().toLowerCase();
  const category = $('category').value;
  const onlyAvailable = $('only-available').checked;
  const sort = $('sort').value;

  const list = catalog.filter((p) => {
    const matchText = !text
      || p.name.toLowerCase().includes(text)
      || (p.description || '').toLowerCase().includes(text);
    const matchCategory = !category || p.category === category;
    const matchAvailable = !onlyAvailable || (p.stock > 0 && p.active);
    return matchText && matchCategory && matchAvailable;
  });

  if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);

  return list;
}

function renderProducts() {
  const list = getVisibleProducts();
  productList.products = list;
  $('results-count').textContent = `${list.length} de ${catalog.length} productos`;
}

function renderCart() {
  shoppingCart.state = {
    lines: getLines(cart, catalog),
    ...calculateTotals(cart, catalog)
  };
  $('cart-count').textContent = countUnits(cart);
}

// Si la operación es válida se guarda el nuevo carrito; si no, queda el anterior
function applyResult(result) {
  if (!result.ok) {
    showMessage(result.message, 'error');
    return false;
  }
  cart = result.cart;
  saveCart(cart);
  renderCart();
  return true;
}

function restoreCart() {
  const saved = loadCart();
  const { cart: valid, changed } = syncCartWithCatalog(saved, catalog);
  cart = valid;
  if (changed) {
    saveCart(cart);
    showMessage('Se ajustó tu carrito porque algunos productos cambiaron.', 'info');
  }
}

function showOrder(order) {
  const lines = order.lines
    .map((l) => `<li>${escapeHtml(l.name)} x${l.quantity} <span>${formatCOP(l.lineTotal)}</span></li>`)
    .join('');

  $('order-content').innerHTML = `
    <p>Código del pedido: <strong>${order.id}</strong></p>
    <ul class="order-lines">${lines}</ul>
    <p class="order-row"><span>Subtotal</span><span>${formatCOP(order.subtotal)}</span></p>
    <p class="order-row"><span>Descuento</span><span>-${formatCOP(order.discount)}</span></p>
    <p class="order-row order-total"><span>Total</span><span>${formatCOP(order.total)}</span></p>
  `;
  $('order-modal').showModal();
}

function handleCheckout() {
  const result = confirmOrder(cart, catalog);
  if (!result.ok) {
    showMessage(result.message, 'error');
    return;
  }
  applyResult(clearCart());
  showOrder(result.order);
}

async function init() {
  $('error-box').hidden = true;
  setLoading(true);

  try {
    catalog = await getProducts();
  } catch (error) {
    setLoading(false);
    showError(error.message);
    return;
  }

  setLoading(false);
  fillCategories();
  restoreCart();
  renderProducts();
  renderCart();
}

$('search').addEventListener('input', renderProducts);
$('category').addEventListener('change', renderProducts);
$('only-available').addEventListener('change', renderProducts);
$('sort').addEventListener('change', renderProducts);

$('clear-filters').addEventListener('click', () => {
  $('search').value = '';
  $('category').value = '';
  $('only-available').checked = false;
  $('sort').value = '';
  renderProducts();
});

$('retry-btn').addEventListener('click', init);
$('close-modal').addEventListener('click', () => $('order-modal').close());

document.addEventListener('add-to-cart', (e) => {
  const added = applyResult(addItem(cart, catalog, e.detail.productId));
  if (added) showMessage('Producto agregado al carrito.', 'ok');
});

document.addEventListener('update-qty', (e) => {
  applyResult(updateQuantity(cart, catalog, e.detail.productId, e.detail.quantity));
});

document.addEventListener('remove-item', (e) => {
  applyResult(removeItem(cart, e.detail.productId));
});

document.addEventListener('clear-cart', () => {
  applyResult(clearCart());
});

document.addEventListener('checkout', handleCheckout);

init();
