import { select, templates, settings, classNames } from '../settings.js'
import utils from '../utils.js'
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
    constructor(element){
       const thisBooking = this;

       thisBooking.render(element);
       thisBooking.initWidgets();
       thisBooking.getData();
       thisBooking.tableSelect();


    }
    getData(){
      const thisBooking = this;
      const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.minDate);
      const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerElem.maxDate);
      const params = {
        booking:[
          startDateParam,
          endDateParam ,
        ],
        eventsCurrent:[
          settings.db.notRepeatParam,
          startDateParam,
          endDateParam,
        ],
        eventsRepeat:[
          settings.db.repeatParam,
          endDateParam,
        ],

      };

      // console.log('getData params', params);
      const urls = {
        booking:        settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
        eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
        eventsRepeat:   settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
      };
      // console.log('getData urls', urls)
      Promise.all([
        fetch(urls.booking),
        fetch(urls.eventsCurrent),
        fetch(urls.eventsRepeat),
      ])
        .then(function(allResponses){
          const  bookingsResponse = allResponses[0];
          const  eventsCurrentResponse = allResponses[1];
          const  eventsRepeatResponse = allResponses[2];
          return Promise.all ([
            bookingsResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json(),
          ]);
        })
        .then(function([bookings, eventsCurrent, eventsRepeat]){
          thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
        });

    }

    parseData(bookings, eventsCurrent, eventsRepeat){
      const thisBooking = this;

      thisBooking.booked = {};

      for(let item of bookings){
        thisBooking.makeBooked(item.data, item.hour, item.duration, item.table)
      }
      console.log('thisBooking.booked', thisBooking.booked);

      for(let item of eventsCurrent){
        thisBooking.makeBooked(item.data, item.hour, item.duration, item.table)
      }

      const minDate = thisBooking.datePickerElem.minDate;
      const maxDate = thisBooking.datePickerElem.maxDate;

      for(let item of eventsRepeat){
        if(item.repeat == 'daily'){
          for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
            thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
          }
      }
    }

      thisBooking.updateDOM();
    }
    makeBooked(date, hour, duration, table){
      const thisBooking = this;

      if(typeof thisBooking.booked[date] == 'undefined'){
        thisBooking.booked[date] = {};
      }

      const startHour = utils.hourToNumber(hour);


      for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock +=  0.5 ){
        //console.log('loop',hourBlock);

      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
      }
    }

    updateDOM() {
      const thisBooking = this;

      thisBooking.date = thisBooking.datePickerElem.value;
      thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerElem.value);

      let allAvailable = false;

      const tables = thisBooking.element.querySelectorAll(select.booking.tables);

      for (let table of tables) {
        table.classList.remove(classNames.booking.tableClicked);
      }

      if (
        typeof thisBooking.booked[thisBooking.date] == 'undefined'
         ||
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
      ) {
        allAvailable = true;
      }

      for (let table of tables) {
        let tableId = table.getAttribute(settings.booking.tableIdAttribute);
        if (!isNaN(tableId)) {
          tableId = parseInt(tableId);
        }
        if (
          !allAvailable &&
          thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
        ) {
          table.classList.add(classNames.booking.tableBooked);
        } else {
          table.classList.remove(classNames.booking.tableBooked);
        }
      }
    }

    tableSelect(){
      const thisBooking = this;

      thisBooking.element.addEventListener('click', function(event){
        event.preventDefault();
        const clickedElement = event.target;
        const table = clickedElement.getAttribute(settings.booking.tableIdAttribute);
          if(table != null){

            if(!clickedElement.classList.contains(classNames.booking.tableBooked)){
              const tables = thisBooking.element.querySelectorAll(select.booking.tables);
                for(let table of tables){
                  table.classList.remove(classNames.booking.tableClicked);
                }
                clickedElement.classList.toggle(classNames.booking.tableClicked);
            }
          }
      });
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

          thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
     }
     initWidgets() {
        const thisBooking = this;
        thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerElem = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerElem = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('update', function(){
          thisBooking.updateDOM();
        });

     }
}
export default Booking;