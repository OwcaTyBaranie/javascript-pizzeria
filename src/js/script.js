/* eslint-disable no-undef */
{
  'use strict';
  const select = {
  templateOf: {
  menuProduct: '#template-menu-product',
  cartProduct: '#template-cart-product',
  },
  containerOf: {
  menu: '#product-list',
  cart: '#cart',
  },
  all: {
  menuProducts: '#product-list > .product',
  menuProductsActive: '#product-list > .product.active',
  formInputs: 'input, select',
  },
  menuProduct: {
  clickable: '.product__header',
  form: '.product__order',
  priceElem: '.product__total-price .price',
  imageWrapper: '.product__images',
  amountWidget: '.widget-amount',
  cartButton: '[href="#add-to-cart"]',
  },
  widgets: {
  amount: {
  input: 'input.amount',
  linkDecrease: 'a[href="#less"]',
  linkIncrease: 'a[href="#more"]',
  },
  },
  cart: {
  productList: '.cart__order-summary',
  toggleTrigger: '.cart__summary',
  totalNumber: `.cart__total-number`,
  totalPrice_top: '.cart__total-price strong',
  totalPrice_bottom: '.cart__order-total .cart__order-price-sum strong',
  subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
  deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
  form: '.cart__order',
  formSubmit: '.cart__order [type="submit"]',
  phone: '[name="phone"]',
  address: '[name="address"]',
  },
  cartProduct: {
  amountWidget: '.widget-amount',
  price: '.cart__product-price',
  edit: '[href="#edit"]',
  remove: '[href="#remove"]',
  },
  };
  const classNames = {
  menuProduct: {
  wrapperActive: 'active',
  imageVisible: 'active',
  },
  cart: {
  wrapperActive: 'active',
  },
  };
  const settings = {
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  amountWidget: {
  defaultValue: 1,
  defaultMin: 1,
  defaultMax: 9,
  },
  cart: {
  defaultDeliveryFee: 20,
  },
  };
  const templates = {
  menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };
  class AmountWidget {
  constructor(element) {
  const thisWidget = this;
  thisWidget.value = settings.amountWidget.defaultValue;
  thisWidget.getElements(element);
  thisWidget.initActions()
  thisWidget.setValue(thisWidget.input.value);
  }
  getElements(element) {
  const thisWidget = this;
  thisWidget.dom = {};
  thisWidget.element = element;
  thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
  thisWidget.dom.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
  thisWidget.dom.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value) {
  const thisWidget = this;
  const newValue = parseInt(value);
  if (newValue !== thisWidget.value && thisWidget.isValid(newValue)) {
  thisWidget.value = newValue;
  thisWidget.announce();
  }
  thisWidget.input.value = thisWidget.value;
  }
  isValid(value) {
  return !isNaN(value)
  && value >= settings.amountWidget.defaultMin
  && value <= settings.amountWidget.defaultMax;
  }
  renderValue() {
  const thisWidget = this;
  thisWidget.dom.input.value = thisWidget.value;

  }
  announce() {
  const thisWidget = this;
  const event = new CustomEvent('update',{
    bubbles: true
  });
  thisWidget.element.dispatchEvent(event);
  }
  initActions() {
  const thisWidget = this;
  // Event listener dla zmiany wartości inputa
  thisWidget.input.addEventListener('change', () => {

  thisWidget.setValue(thisWidget.input.value);
  });
  // Event listener dla przycisku zmniejszenia
  thisWidget.dom.linkDecrease.addEventListener('click', (event) => {
  event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
  thisWidget.setValue(thisWidget.value
  - 1);
  });
  // Event listener dla przycisku zwiększenia
  thisWidget.dom.linkIncrease.addEventListener('click', (event) => {
  event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
  thisWidget.setValue(thisWidget.value + 1);
  });

  }
  }
  class Product {
  constructor(id, data) {
  const thisProduct = this;
  thisProduct.id = id;
  thisProduct.data = data;
  thisProduct.renderInMenu();
  thisProduct.getElements();
  thisProduct.initAmountWidget();
  thisProduct.initAccordion();
  thisProduct.initOrderForm();
  thisProduct.processOrder();
  }
  renderInMenu() {
  const thisProduct = this;
  // generate HTML based on template /
  const generatedHTML = templates.menuProduct(thisProduct.data);
  // create element using utils.createElementFromHTML /
  thisProduct.element = utils.createDOMFromHTML(generatedHTML);
  // find menu container /
  const menuContainer = document.querySelector(select.containerOf.menu);
  // add element to menu /
  menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
  const thisProduct = this;
  thisProduct.dom = {};
  thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
  thisProduct.dom.form = thisProduct.element.querySelector(select.menuProduct.form);
  thisProduct.dom.formInputs = thisProduct.dom.form.querySelectorAll(select.all.formInputs);
  thisProduct.dom.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
  thisProduct.dom.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
  thisProduct.dom.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
  thisProduct.dom.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
  const thisProduct = this;
  // START: add event listener to clickable trigger on event click /
  thisProduct.dom.accordionTrigger.addEventListener('click', function (event) {
  // prevent default action for event /
  event.preventDefault();
  // find active product (product that has active class) /
  const activeProduct = document.querySelector('.product.active');
  // if there is active product and it's not thisProduct.element, remove class active from it /
  if (activeProduct && activeProduct !== thisProduct.element) {
  activeProduct.classList.remove('active');
  }
  // toggle active class on thisProduct.element /
  thisProduct.element.classList.toggle('active');
  });
  }
  initOrderForm() {
  const thisProduct = this;
  thisProduct.dom.form.addEventListener('submit', function (event) {
  event.preventDefault();
  thisProduct.processOrder();
  });
  for (let input of thisProduct.dom.formInputs) {
  input.addEventListener('change', function () {
  thisProduct.processOrder();
  });
  }
  thisProduct.dom.cartButton.addEventListener('click', function (event) {
  event.preventDefault();
  thisProduct.processOrder();
  thisProduct.addToCart();
  });
  }
  processOrder() {
  const thisProduct = this;
  const formData = utils.serializeFormToObject(thisProduct.dom.form);
  // set price to default price
  let price = thisProduct.data.price;
  // for every category (param)...
  for (let paramId in thisProduct.data.params) {
  // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
  const param = thisProduct.data.params[paramId];
  // for every option in this category
  for (let optionId in param.options) {
  // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
  const option = param.options[optionId];
  // Check if the option is selected in the form data
  const isOptionSelected = formData[paramId] && formData[paramId].includes(optionId);
  // Check if the option is the default option
  const isDefaultOption = option.default;
  // If the option is selected and is not the default option, add its price to the total price
  if (isOptionSelected && !isDefaultOption) {
  price += option.price;
  }
  // If the option is not selected and is the default option, subtract its price from the total price
  if (!isOptionSelected && isDefaultOption) {
  price -= option.price;
  }
  // Update image visibility based on selected option
  const imageSelector = '.' + paramId + '-' + optionId;
  const optionImage = thisProduct.element.querySelector(imageSelector);
  // Check if optionImage is not null or undefined before accessing its properties
  if (optionImage) {
  // Show the image if the option is selected
  if (isOptionSelected) {
  optionImage.classList.add(classNames.menuProduct.imageVisible);
  } else {
  optionImage.classList.remove(classNames.menuProduct.imageVisible);
  }
  }
  }
  }
  //multiply price by amount
  price *= thisProduct.amountWidget.value
  //Give thisProduct new property priceSingle
  thisProduct.priceSingle = thisProduct.data.price;
  // update calculated price in the HTML
  thisProduct.dom.priceElem.innerHTML = price;
  }
  initAmountWidget() {
  const thisProduct = this;
  thisProduct.amountWidget = new AmountWidget(thisProduct.dom.amountWidgetElem, thisProduct);
  if (thisProduct.amountWidget.element) {
  thisProduct.amountWidget.element.addEventListener('update', function () {
  thisProduct.processOrder();
  });
  }
  }
  addToCart() {
  const thisProduct = this;
  app.cart.add(thisProduct.prepareCartProduct());
  }
  prepareCartProduct() {
  const thisProduct = this;
  const productSummary = {
  id: thisProduct.id,
  name: thisProduct.data.name,
  amount: thisProduct.amountWidget.value,
  priceSingle: thisProduct.priceSingle,
  price: thisProduct.priceSingle * thisProduct.amountWidget.value,
  params: thisProduct.prepareCartProductParams(),
  };
  return productSummary;
  }
  prepareCartProductParams() {
  const thisProduct = this;
  const formData = utils.serializeFormToObject(thisProduct.dom.form);
  const params = {};
  // for every category (param)
  for (let paramId in thisProduct.data.params) {
  const param = thisProduct.data.params[paramId];
  // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
  params[paramId] = {
  label: param.label,
  options: {}
  };
  // for every option in this category
  for (let optionId in param.options) {
  const option = param.options[optionId];
  const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
  if (optionSelected) {
  // option is selected!
  // Add the selected option to the options object of the category param
  params[paramId].options[optionId] = option.label;
  }
  }
  }
  return params;
  }
  }
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
  class CartProduct {
  constructor(menuProduct, element) {
  const thisCartProduct = this;

  thisCartProduct.id = menuProduct.id;
  thisCartProduct.name = menuProduct.name;
  thisCartProduct.amount = menuProduct.amount;
  thisCartProduct.price = menuProduct.price;
  thisCartProduct.priceSingle = menuProduct.priceSingle;
  thisCartProduct.getElements(element);
  thisCartProduct.initAmountWidget();
  thisCartProduct.initActions();
  }
  getElements(element) {
  const thisCartProduct = this;
  thisCartProduct.dom = {}
  thisCartProduct.dom.wrapper = element;
  thisCartProduct.dom.amountWidgetElem = element.querySelector(select.cartProduct.amountWidget);
  thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
  thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
  thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
  }
  initAmountWidget() {
  const thisCartProduct = this;
  thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem);
  thisCartProduct.dom.amountWidgetElem.addEventListener('update', function(){
  thisCartProduct.amount = thisCartProduct.amountWidget.value;
  thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
  thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
  });
  }
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    thisCartProduct.dom.wrapper.dispatchEvent(event);

  }
  initActions(){
  const thisCartProduct = this;
  thisCartProduct.dom.edit.addEventListener('click', function(event){
    event.preventDefault();
  })

  thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();

    });

 }
 getData() {
  const thisCartProduct = this;
  const cartProductSummary = {
      id: thisCartProduct.id,
      amount: thisCartProduct.amount,
      price: thisCartProduct.price,
      priceSingle: thisCartProduct.priceSingle,
      name: thisCartProduct.name,
      params: thisCartProduct.params,
  }
  console.log('cartProductSummary', cartProductSummary)
  return cartProductSummary;
}
}

  const app = {
  initMenu: function () {
  const thisApp = this;

  for (let productData in thisApp.data.products) {
    new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
  }
  },
  init: function () {
  const thisApp = this;
  thisApp.initData();
  thisApp.initCart();
  },
  initCart: function () {
  const thisApp = this;
  thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));
  thisApp.productList = document.querySelector(select.containerOf.menu);
  thisApp.productList.addEventListener('add-to-cart', function (event) {
  app.cart.add(event.detail.product);
  });
  },
  initData: function () {
  const thisApp = this;
  thisApp.data = {};
  const url = settings.db.url + '/' + settings.db.products;

  fetch(url)
  .then(function(rawResponse){
    return rawResponse.json();
  })
  .then(function(parsedResponse){
    console.log('parsedResponse', parsedResponse);

    /* save parsedResponse as thisApp.data.products */
    thisApp.data.products = parsedResponse;
    /* execute initMenu method*/
    thisApp.initMenu();
  });

  console.log('thisApp.data', JSON.stringify(thisApp.data));
  },
  };
  app.init();
  }