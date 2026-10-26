import { formatCOP, escapeHtml } from '../cart.js';

class ProductCard extends HTMLElement {
  connectedCallback() {
    this.addEventListener('click', (e) => {
      const boton = e.target.closest('button[data-add]');
      if (!boton || boton.disabled) return;
      this.dispatchEvent(new CustomEvent('add-to-cart', {
        detail: { productId: this._product.id },
        bubbles: true,
        composed: true
      }));
    });
    this.render();
  }

  set product(value) {
    this._product = value;
    this.render();
  }

  get product() {
    return this._product;
  }

  render() {
    const p = this._product;
    if (!p) {
      this.innerHTML = '';
      return;
    }

    const disponible = p.active && p.stock > 0;
    let estado = `Stock: ${p.stock}`;
    let textoBoton = 'Agregar al carrito';
    if (!p.active) {
      estado = 'No disponible';
      textoBoton = 'No disponible';
    } else if (p.stock === 0) {
      estado = 'Agotado';
      textoBoton = 'Agotado';
    }

    this.innerHTML = `
      <article class="card ${disponible ? '' : 'card-off'}">
        <p class="card-category">${escapeHtml(p.category)}</p>
        <h3>${escapeHtml(p.name)}</h3>
        <p class="card-desc">${escapeHtml(p.description || '')}</p>
        <p class="card-price">${formatCOP(p.price)}</p>
        <p class="card-stock">${estado}</p>
        <button class="btn btn-primary" data-add ${disponible ? '' : 'disabled'}>${textoBoton}</button>
      </article>
    `;
  }
}

customElements.define('product-card', ProductCard);
