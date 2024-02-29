import { select, templates } from '../settings.js'
import utils from '../utils.js'
import AmountWidget from './AmountWidget.js';
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
         thisBooking.dom.hoursAmount = element.querySelector(
            select.booking.hoursAmount
          );
          thisBooking.dom.peopleAmount = element.querySelector(
            select.booking.peopleAmount
          );
     }
     initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.dom.hoursAmount.addEventListener('change', function () {

          });

        thisBooking.dom.peopleAmount.addEventListener('change', function(){

          });
     }
}
export default Booking;