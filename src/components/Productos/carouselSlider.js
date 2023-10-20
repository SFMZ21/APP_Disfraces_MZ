import React, { useState,useContext, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import {DataContext} from "../../context/DataProvider";
import { ProductoItem } from "./ProductoItem";
import {useParams} from 'react-router-dom';


const CarouselSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const value =useContext(DataContext);
  const [productos]=value.productos;
  const [detalle,setDetalle] =useState([]);
  const [url, setUrl] = useState(0);
  const params = useParams();
  let item =0;

  useEffect(()=>{
    productos.forEach(producto=>{
      item =0;
      if(producto.id === parseInt(params.id)){
        setDetalle(producto)
        setUrl(0)
      }
    })
  },[params.id,productos]);
  

  const images = [
    { src: [detalle.image], alt: 'Image 1' },
    { src: detalle.img1, alt: 'Image 2' },
    { src: detalle.img2, alt: 'Image 3' },
    { src: detalle.img3, alt: 'Image 4' },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setCurrentSlide(index),
  };

  return (
    <div className="">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="image-container">
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </Slider>
      
    </div>
  );
};

export default CarouselSlider;
