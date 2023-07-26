import React from 'react';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageSlider = () => {
    const images = [
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/1.png?alt=media&token=9c451daf-c8b8-4613-8568-bba4cd36095a',
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/2.png?alt=media&token=ac26a1d5-2e08-4a19-8b30-25c4e39f9df5',
      'url_de_la_imagen_3',
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
              <img src={image} alt={`Imagen ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    );
  };
  
  export default ImageSlider;
  