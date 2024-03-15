/* eslint-disable */
import { select } from "../settings.js";

class Carousel {
  constructor(element) {
    const thisCarousel = this;
    this.render(element);
    this.initPlugin(element);

  }

  render() {
    const thisCarousel = this;

    thisCarousel.wrapper = document.querySelector('.carousel');
    console.log('Executed', thisCarousel.wrapper);
  }

  initPlugin() {
    const thisCarousel = this;
    thisCarousel.wrapper = element;
    const flkty = new Flickity('.carousel', {
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