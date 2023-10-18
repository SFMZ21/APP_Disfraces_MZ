import React from 'react';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const ImageSlider = () => {
    const images = [
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/PORTADA%20INICIO%20(2000%20%C3%97%201000%C2%A0px)%20(2).png?alt=media&token=1cbc9386-76ec-4e00-a49d-d1a1c44b1e89&_gl=1*lmwgg0*_ga*MTYxMDY2NDkxNy4xNjgxMDc3NzM0*_ga_CW55HF8NVT*MTY5NzYxMjE5MC41MC4xLjE2OTc2MTQxNzIuMjUuMC4w',
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/portadainicio2.png?alt=media&token=4b21b545-b038-4920-a2e9-09b31d0b026e',
      'https://firebasestorage.googleapis.com/v0/b/disfraces-mz.appspot.com/o/PORTADA%20INICIO%20(2000%20%C3%97%201000%C2%A0px)%20(1).png?alt=media&token=b14b479d-7c50-4133-a4e3-88d805d37a92&_gl=1*1nekre6*_ga*MTYxMDY2NDkxNy4xNjgxMDc3NzM0*_ga_CW55HF8NVT*MTY5NzYxMjE5MC41MC4xLjE2OTc2MTI0MzkuMTcuMC4w',
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
  