import SliderModule from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import welcomeImage from "../../images/BienvenidaHada2.jpg";
import brandBanner from "../../images/LogoInicio2.jpg";
import compactBrandBanner from "../../images/LogoInicio.png";

const Slider = SliderModule.default ?? SliderModule;

const ImageSlider = () => {
  const images = [
    { src: brandBanner, alt: "Alquiler de disfraces MZ en Jutiapa" },
    { src: welcomeImage, alt: "Bienvenida a Disfraces MZ" },
    { src: compactBrandBanner, alt: "Logotipo de Disfraces MZ" },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    accessibility: true,
  };

  return (
    <section className="slider-container" aria-label="Presentación de Disfraces MZ">
      <Slider {...settings}>
        {images.map((image) => (
          <div key={image.src}>
            <img className="slider-image" src={image.src} alt={image.alt} />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default ImageSlider;
