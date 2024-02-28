// import { select, templates } from '.../settings.s'
// import utils from '../utils.js'
class Booking {
    constructor(element){
       const thisBooking = this;

       thisBooking.render(element);
       thisBooking.initWidgets();


    }
    // render(element){
    //     const thisBooking = this;
    //     //generate HTML from templates.bookingWidget
    //     const generatedHTML = templates.bookingWidget();
    //     //create empty object thisBooking.dom
    //     thisBooking.element = utils.createDOMFromHTML(generatedHTML);
    //     //add wrapper and connect it with referation to container of elemenet
    //     const bookingContainer = document.querySelector(select.containerOf.booking);
    //     //change value of wrapper(innnerHTML) for template HTML
    //     bookingContainer.appendChild(thisBooking.element).innerHTML;
    // }
}
export default Booking;