// eslint-disable-next-line no-redeclare
/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
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
  }
  announce(){
    const thisWidget = this;
    const event = new Event('update');
    thisWidget.element.dispatchEvent(event);
  }

 }

 class AmountWidget {
  constructor(element, productInstance){
    const thisWidget = this;
    thisWidget.productInstance = productInstance;
    thisWidget.getElements(element);
    thisWidget.initActions();
    thisWidget.setValue(settings.amountWidget.defaultValue);



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
       thisWidget.productInstance.announce();

    }
     //Update the widget value
     thisWidget.input.value = thisWidget.value;
     console.log('New value set:', thisWidget.value);

  }
  initActions(){
    const thisWidget = this;
     // Event listener dla zmiany wartości inputa
     thisWidget.input.addEventListener('change', ()=>{
      //console.log('Input value changed:', thisWidget.value);
      thisWidget.setValue(thisWidget.input.value);
     });
     // Event listener dla przycisku zmniejszenia
     thisWidget.linkDecrease.addEventListener('click', (event)=>{
      event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
      thisWidget.setValue(thisWidget.value - 1);
     });
     // Event listener dla przycisku zwiększenia
     thisWidget.linkIncrease.addEventListener('click', (event)=>{
      event.preventDefault(); // Powstrzymaj domyślną akcję dla tego eventu
      thisWidget.setValue(thisWidget.value +1);
     });
     //console.log('initActions completed');
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
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },
  };

  app.init();
}