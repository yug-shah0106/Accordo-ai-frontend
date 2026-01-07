import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";

import Svg7 from "../../assets/SVG7.png";
import SVG6 from "../../assets/SVG6.png";
import SVG5 from "../../assets/SVG5.png";
import SVG4 from "../../assets/SVG4.png";
import SVG3 from "../../assets/SVG3.png";
import SVG from "../../assets/SVG.png";
import SVG2 from "../../assets/SVG2.png";


const LogoSlider = () => {
  const logos = [
    Svg7,SVG6,SVG5,SVG4,SVG3,SVG,SVG2
  ];

  return (
    <div className="mx-auto w-[80%] mt-12 pb-0">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={30}
        loop={true}
        speed={2000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          
          640: {
            slidesPerView: 1, 
          },
          
          641: {
            slidesPerView: 6, 
          },
        }}
      >
        {logos.map((logo, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex items-center justify-center">
              <img
                src={logo}
                alt={`Logo ${idx + 1}`}
                className="w-[60%] h-[60%]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default LogoSlider;
