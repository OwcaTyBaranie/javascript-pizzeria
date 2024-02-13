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
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
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
  constructor(element, productInstance){
    const thisWidget = this;
    console.profile('thisWidget', thisWidget);
    this.element = element;
    this.productInstance = productInstance;


    this.getElements(element);
    this.initActions();
    this.setValue(settings.amountWidget.defaultValue);
  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;
    const minValue = settings.amountWidget.defaultMin;
    const maxValue = settings.amountWidget.defaultMax;
    const newValue = parseInt(value);

    // TODO: Add validation /

    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
       thisWidget.value = newValue;
       // Wywołaj announce z klasy Product
       thisWidget.announce();
    }
       //Update the widget value
     thisWidget.input.value = thisWidget.value;

    }
  announce() {
      const thisWidget = this;
      const event = new Event('update');
      if (thisWidget.productInstance && thisWidget.productInstance.amountWidget) {
        thisWidget.productInstance.amountWidget.element.dispatchEvent(event);
      }
      console.log('Price updated. New price:', thisWidget.productInstance.price);
  }
  initActions(){
    const thisWidget = this;
     // Event listener dla zmiany wartości inputa
     thisWidget.input.addEventListener('change', ()=>{
      //console.log('Input value changed:', thisWidget.value);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.announce();
     });
     // Event listener dla przycisku zmniejszenia
     thisWidget.linkDecrease.addEventListener('click', (event)=>{
      event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
      thisWidget.setValue(thisWidget.value - 1);
      thisWidget.announce();
     });
     // Event listener dla przycisku zwiększenia
     thisWidget.linkIncrease.addEventListener('click', (event)=>{
      event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
      thisWidget.setValue(thisWidget.value +1);
      thisWidget.announce();
     });
     //console.log('initActions completed');
  }

}
class Product{
  constructor(id, data){
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

  }

  renderInMenu(){
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
  initAccordion(){
    const thisProduct = this;

  // START: add event listener to clickable trigger on event click /
  thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {
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
initOrderForm(){
  const thisProduct = this;

  thisProduct.dom.form.addEventListener('submit', function(event){
    event.preventDefault();
    thisProduct.processOrder();
  });

  for(let input of thisProduct.dom.formInputs){
    input.addEventListener('change', function(){
      thisProduct.processOrder();
    });
  }

  thisProduct.dom.cartButton.addEventListener('click', function(event){
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
  price *= thisProduct.amountWidget.value;
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
addToCart(){
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
  for(let paramId in thisProduct.data.params) {
    const param = thisProduct.data.params[paramId];

    // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
    params[paramId] = {
      label: param.label,
      options: {}
    };

    // for every option in this category
    for(let optionId in param.options) {
      const option = param.options[optionId];
      const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

      if(optionSelected) {
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
    thisCart.getElements(element);
    thisCart.initActions();


  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    // Dodaj kolejne referencje do elementów DOM, które są używane w Cart
  }
  initActions(){
    const thisCart = this;
    if (thisCart.dom.toggleTrigger) {
      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
  }

  add(menuProduct){

    const thisCart = this;
    console.log('adding product', menuProduct);
    // generate HTML based on template /
    const generatedHTML = templates.cartProduct(menuProduct);
    // change generated HTML to DOM element /
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //Add element to menu
    thisCart.dom.productList.appendChild(generatedDOM);
    //Use array thisCart.products []
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    console.log('thisCart.products', thisCart.products);
  }

  // Dodaj kolejne metody, które są związane z funkcjonalnością koszyka
}

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;
    console.log('thisCartProduct', thisCartProduct);

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();


  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {
      wrapper: element,
      amountWidgetElem: element.querySelector(select.cartProduct.amountWidget),
      price: element.querySelector(select.cartProduct.price),
      edit: element.querySelector(select.cartProduct.edit),
      remove: element.querySelector(select.cartProduct.remove),
    };
  }
  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidgetElem, thisCartProduct.amount);

    if(thisCartProduct.amountWidget.element) {
      thisCartProduct.dom.amountWidgetElem.addEventListener('updated', function(){
        thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
      });
    }

  }

}
  const app = {
    initMenu: function() {
      const thisApp = this;
      //console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    init: function(){
      const thisApp = this;
      console.log('** App starting **');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
    initCart: function(){
      const thisApp = this;
      thisApp.cart = new Cart(document.querySelector(select.containerOf.cart));

      thisApp.productList = document.querySelector(select.containerOf.menu);
      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
  };

  app.init();
}