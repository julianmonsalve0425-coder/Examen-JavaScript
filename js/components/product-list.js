import './product-card.js';

class ProductList extends HTMLElement {
  set products(list) {
    this.innerHTML = '';

    if (list.length === 0) {
      this.innerHTML = '<p class="empty">No hay productos que coincidan con los filtros.</p>';
      return;
    }

    for (const product of list) {
      const card = document.createElement('product-card');
      card.product = product;
      this.appendChild(card);
    }
  }
}

customElements.define('product-list', ProductList);
