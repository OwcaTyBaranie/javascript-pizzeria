import { settings, select, classNames, templates } from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
    constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.totalPriceTop = 0;
    thisCart.totalPriceBottom = thisCart.totalPriceTop;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.getElements(element);
    thisCart.initActions();
    }
    getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPriceTop = thisCart.dom.wrapper.querySelector(select.cart.totalPrice_top);
    thisCart.dom.totalPriceBottom = thisCart.dom.wrapper.querySelector(select.cart.totalPrice_bottom);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
              thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    // Dodaj kolejne referencje do elementów DOM, które są używane w Cart
    }
    initActions() {
    const thisCart = this;
    if (thisCart.dom.toggleTrigger) {
    thisCart.dom.toggleTrigger.addEventListener('click', function () {
    thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });
    }
    thisCart.dom.productList.addEventListener('update', function(){
      thisCart.update();
    });
    thisCart.dom.productList.addEventListener('remove', function(event){

      thisCart.remove(event.detail.cartProduct);

    });
    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
    }

    add(menuProduct) {
      const thisCart = this;

      // Sprawdź, czy produkt o takim samym id już istnieje w koszyku
      const existingProduct = thisCart.products.find(product => product.id === menuProduct.id);

      if (existingProduct) {
          // Jeśli produkt już istnieje w koszyku, zwiększ ilość istniejącego produktu o ilość nowego produktu
          existingProduct.amount += menuProduct.amount;
      } else {
          // Jeśli produkt nie istnieje w koszyku, dodaj go normalnie
          // generate HTML based on template /
          const generatedHTML = templates.cartProduct(menuProduct);
          // change generated HTML to DOM element /
          const generatedDOM = utils.createDOMFromHTML(generatedHTML);
          // Add element to menu
          thisCart.dom.productList.appendChild(generatedDOM);
          // Use array thisCart.products []
          const cartProduct = new CartProduct(menuProduct, generatedDOM);
          thisCart.products.push(cartProduct);
      }

      // Po dodaniu lub zaktualizowaniu produktów w koszyku, wywołaj metodę update()
      thisCart.update();
  }
  sendOrder(){
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPriceTop,
      subtotalPrice: thisCart.dom.subtotalPrice.innerHTML,
      totalNumber: thisCart.dom.totalNumber.innerHTML,
      deliveryFee: thisCart.dom.deliveryFee.innerHTML,
      products: [],
    }

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    console.log('payload', payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options);
  }

    update() {
      const thisCart = this;
      thisCart.totalNumber = 0;
      thisCart.subtotalPrice = 0;

      for (let product of thisCart.products) {
          thisCart.totalNumber += product.amount;
          thisCart.subtotalPrice += product.amount * product.price;
      }
      thisCart.totalPriceTop = (thisCart.totalNumber !== 0) ? thisCart.subtotalPrice + thisCart.deliveryFee : 0;
      thisCart.totalPriceBottom = thisCart.totalPriceTop;

      thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
      thisCart.dom.totalPriceTop.innerHTML = thisCart.totalPriceTop;
      thisCart.dom.totalPriceBottom.innerHTML = thisCart.totalPriceBottom;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

  }
    remove(cartProduct) {
      const thisCart = this;
      //Usunięcie reprezentacji produktu z HTML-a
      cartProduct.dom.wrapper.remove();

      //Usunięcie informacji o danym produkcie z tablicy thisCart.products
      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
      }
      //Wywołać metodę update w celu przeliczenia sum po usunięciu produktu.
      thisCart.update();
    }
    // Dodaj kolejne metody, które są związane z funkcjonalnością koszyka
    }
    export default Cart;