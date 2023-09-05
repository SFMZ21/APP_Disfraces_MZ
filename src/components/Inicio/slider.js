import React from 'react';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageSlider = () => {
    const images = [
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/portadainicio2.png?alt=media&token=4b21b545-b038-4920-a2e9-09b31d0b026e',
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/2.png?alt=media&token=ac26a1d5-2e08-4a19-8b30-25c4e39f9df5',
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/portadaInicio.png?alt=media&token=56a890f1-8604-485a-b78e-736c26fd92bd',
    ];
  
    const settings = {
      dots: true,
      infinite: true,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
    };
  
    return (
      <div className="slider-container">
        <Slider {...settings}>
          {images.map((image, index) => (
            <div key={index}>
              <img className="slider-image" src={image} alt={`Imagen ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    );
  };
  
  export default ImageSlider;
  