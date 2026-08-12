import SliderModule from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slider = SliderModule.default ?? SliderModule;

export default function CarouselSlider({ images, title }) {
  const availableImages = images.filter(Boolean);
  const settings = {
    dots: availableImages.length > 1,
    infinite: availableImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: availableImages.length > 1,
  };

  return (
    <div className="product-carousel">
      <Slider {...settings}>
        {availableImages.map((image, index) => (
          <div key={`${image}-${index}`} className="image-container">
            <img src={image} alt={`${title}, vista ${index + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
}
