import { settings, select } from '../settings.js';

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
    export default AmountWidget;