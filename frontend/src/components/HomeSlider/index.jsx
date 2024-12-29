import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomeSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2500,
  };

  const slides = [
    {
      id: 1,
      image: "https://antares.am/wp-content/uploads/2024/12/Music.jpg",
      alt: "Slide 1",
    },
    {
      id: 2,
      image:
        "https://i.ytimg.com/vi/KzqoSeVMGrQ/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD82WBkkmy4mTE6QVUzjbYTm6_PHQ",
      alt: "Slide 2",
    },
    {
      id: 3,
      image:
        "https://static1.srcdn.com/wordpress/wp-content/uploads/2023/01/featured-image-anime-focused-on-classical-music.jpg",
      alt: "Slide 3",
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide.id} className="outline-none">
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HomeSlider;
