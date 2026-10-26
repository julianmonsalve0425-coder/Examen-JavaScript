import { formatCOP, escapeHtml, MIN_DESCUENTO } from '../cart.js';

class ShoppingCart extends HTMLElement {
  connectedCallback() {
    this._state = this._state || { lines: [], subtotal: 0, discount: 0, total: 0 };
    this.addEventListener('click', (e) => this.onClick(e));
    this.render();
  }

  set state(value) {
    this._state = value;
    this.render();
  }

  emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  onClick(e) {
    const boton = e.target.closest('button[data-action]');
    if (!boton || boton.disabled) return;

    const action = boton.dataset.action;
    const productId = Number(boton.dataset.id);
    const line = this._state.lines.find((l) => l.productId === productId);

    if (action === 'plus') this.emit('update-qty', { productId, quantity: line.quantity + 1 });
    if (action === 'minus') this.emit('update-qty', { productId, quantity: line.quantity - 1 });
    if (action === 'remove') this.emit('remove-item', { productId });
    if (action === 'clear') this.emit('clear-cart');
    if (action === 'checkout') this.emit('checkout');
  }

  renderLine(line) {
    return `
      <li class="cart-line">
        <div class="cart-line-info">
          <strong>${escapeHtml(line.name)}</strong>
          <span>${formatCOP(line.price)} c/u</span>
        </div>
        <div class="qty">
          <button class="btn btn-small" data-action="minus" data-id="${line.productId}" aria-label="Restar una unidad">-</button>
          <span>${line.quantity}</span>
          <button class="btn btn-small" data-action="plus" data-id="${line.productId}" aria-label="Sumar una unidad">+</button>
        </div>
        <span class="cart-line-total">${formatCOP(line.lineTotal)}</span>
        <button class="btn btn-small btn-danger" data-action="remove" data-id="${line.productId}">Quitar</button>
      </li>
    `;
  }

  render() {
    const { lines, subtotal, discount, total } = this._state;
    const vacio = lines.length === 0;

    this.innerHTML = `
      <h2>Tu carrito</h2>
      ${vacio ? '<p class="empty">Aún no agregaste productos.</p>' : `<ul class="cart-lines">${lines.map((l) => this.renderLine(l)).join('')}</ul>`}
      <div class="cart-summary">
        <p><span>Subtotal</span><span>${formatCOP(subtotal)}</span></p>
        <p><span>Descuento (10%)</span><span>-${formatCOP(discount)}</span></p>
        <p class="cart-total"><span>Total</span><span>${formatCOP(total)}</span></p>
        <small>Compras desde ${formatCOP(MIN_DESCUENTO)} tienen 10% de descuento.</small>
      </div>
      <div class="cart-actions">
        <button class="btn" data-action="clear" ${vacio ? 'disabled' : ''}>Vaciar carrito</button>
        <button class="btn btn-primary" data-action="checkout" ${vacio ? 'disabled' : ''}>Confirmar pedido</button>
      </div>
    `;
  }
}

customElements.define('shopping-cart', ShoppingCart);
