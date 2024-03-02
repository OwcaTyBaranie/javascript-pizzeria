import { select, templates } from '../settings.js'
import utils from '../utils.js'
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
    constructor(element){
       const thisBooking = this;

       thisBooking.render(element);
       thisBooking.initWidgets();


    }
     render(element){
        const thisBooking = this;
        //generate HTML from templates.bookingWidget
         const generatedHTML = templates.bookingWidget();
        //create empty object thisBooking.dom
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
        //add wrapper and connect it with referation to container of elemenet
        const bookingContainer = document.querySelector(select.containerOf.booking);
        //change value of wrapper(innnerHTML) for template HTML
         bookingContainer.appendChild(thisBooking.element).innerHTML;

         thisBooking.dom = {};
         thisBooking.dom.wrapper = element;
         thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
          thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);
          thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
          thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);
     }
     initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);


        thisBooking.dom.hoursAmount.addEventListener('change', function () {

          });

        thisBooking.dom.peopleAmount.addEventListener('change', function(){

          });
     }
}
export default Booking;