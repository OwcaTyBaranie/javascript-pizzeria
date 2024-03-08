/* eslint-disable */
import { select } from "../settings.js";

class Carousel {
  constructor(element) {
    const thisCarousel = this;
    this.render(element);
    this.initPlugin(element);

  }

  render(element) {
    const thisCarousel = this;

    thisCarousel.wrapper = element.querySelector(select.containerOf.carousel);
    console.log('Executed', thisCarousel.wrapper);
  }

  initPlugin(element) {
    const thisCarousel = this;
    thisCarousel.wrapper = element;
    const flkty = new Flickity(element, {
      // options
      cellAlign: 'left',
      contain: true,
      imagesLoaded: true,
      autoPlay: true,
    });
    console.log(flkty);
  }
}

export default Carousel;