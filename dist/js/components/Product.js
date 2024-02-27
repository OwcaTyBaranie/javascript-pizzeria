import {select, classNames, templates} from './settings.js';
import utils from './utils.js';
import AmountWidget from './AmountWidget.js';
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

        //  app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
          bubbles: true,
          detail: {
            product: thisProduct.prepareCartProduct(),
          },
        }
        );
        thisProduct.element.dispatchEvent(event);
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
    export default Product;