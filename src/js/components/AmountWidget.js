import { settings, select } from '../settings.js';
import BaseWidget from './BaseWidget.js';
class AmountWidget extends BaseWidget{
  constructor(element) {
  super(element,  settings.amountWidget.defaultValue);

    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.initActions();
    


    }
    getElements() {
    const thisWidget = this;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
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

    initActions() {
    const thisWidget = this;
    // Event listener dla zmiany wartości inputa
    thisWidget.dom.input.addEventListener('change', () => {

    thisWidget.value = thisWidget.dom.input.value;
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