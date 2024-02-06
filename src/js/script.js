// eslint-disable-next-line no-redeclare
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

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
      defaultMax: 10,
    },

    cart: {
      defaultDeliveryFee: 20,
    },

  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),

    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),

  };
  class Product{
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();

      console.log('new Product:', thisProduct);

      thisProduct.getElements();

      console.log('Get All Elements:', thisProduct);

      thisProduct.initAccordion();

      console.log('Init Accordion:', thisProduct);

      thisProduct.initOrderForm();

      thisProduct.initAmountWidget();
      console.log('Init Amount Widget:', thisProduct);

      thisProduct.processOrder();

    }

    renderInMenu(){
      const thisProduct = this;
      /* generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      console.log('Accordion Trigger:', thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);

    }
    initAccordion(){
      const thisProduct = this;

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function(event) {
      /* prevent default action for event */
    event.preventDefault();
      /* find active product (product that has active class) */
    const activeProduct = document.querySelector('.product.active');
      /* if there is active product and it's not thisProduct.element, remove class active from it */
    if (activeProduct && activeProduct !== thisProduct.element) {
        activeProduct.classList.remove('active');
    }

      /* toggle active class on thisProduct.element */
    thisProduct.element.classList.toggle('active');
  });

  }
  initOrderForm(){
    const thisProduct = this;
    console.log('Init Order Form:', thisProduct);

    thisProduct.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

    for(let input of thisProduct.formInputs){
      input.addEventListener('change', function(){
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function(event){
      event.preventDefault();
      thisProduct.processOrder();
    });

  }
  processOrder() {
    const thisProduct = this;
    console.log('Process order:', thisProduct);

    const formData = utils.serializeFormToObject(thisProduct.form);
    console.log('formData', formData);

    // set price to default price
    let price = thisProduct.data.price;

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      console.log(paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        console.log(optionId, option);

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
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = price;
  }
  initAmountWidget(){
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem, thisProduct);
  // Upewnij się, że element istnieje przed dodaniem listenera
  if (thisProduct.amountWidget.element) {
    // Add Event Listener for the 'update' event on thisProduct.amountWidget
    thisProduct.amountWidget.element.addEventListener('update', function () {
      thisProduct.processOrder();
    });
  }
  }
  }
 class AmountWidget {
  constructor(element, productInstance){
    const thisWidget = this;
    this.element = element;
    this.productInstance = productInstance;
    this.getElements(element);
    this.initActions();
    this.setValue(settings.amountWidget.defaultValue);



    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);
  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  console.log('Input element:', thisWidget.input);
  console.log('Decrease button element:', thisWidget.linkDecrease);
  console.log('Increase button element:', thisWidget.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;
    const minValue = settings.amountWidget.defaultMin;
    const maxValue = settings.amountWidget.defaultMax;
    const newValue = parseInt(value);

    /* TODO: Add validation */

    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
       thisWidget.value = newValue;
       // Wywołaj announce z klasy Product
       thisWidget.announce();
    }
       //Update the widget value
     thisWidget.input.value = thisWidget.value;
     console.log('New value set:', thisWidget.value);
    }
  announce() {
      const thisWidget = this;
      const event = new Event('update');
      if (thisWidget.productInstance && thisWidget.productInstance.amountWidget) {
        thisWidget.productInstance.amountWidget.element.dispatchEvent(event);
      }
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
class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);

    console.log('new Cart', thisCart)

    thisCart.initActions();
  }
  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
  }
  initActions(){
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.toggleCart();
    });

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
    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
  };

  app.init();
}