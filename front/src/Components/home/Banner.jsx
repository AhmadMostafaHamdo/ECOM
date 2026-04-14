import React from "react";
import "../home/banner.css";
import { useTranslation } from "react-i18next";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const slides = [
  {
    src: "/assets/banners/fashion.png",
    labelKey: "home.bannerLabel1",
    titleKey: "home.heroDesignTitle",
    defaultLabel: "New Season Collection",
    defaultTitle: "Discover Premium Fashion",
  },
  {
    src: "/assets/banners/electronics.png",
    labelKey: "home.bannerLabel2",
    titleKey: "home.bannerTitle2",
    defaultLabel: "Tech & Gadgets",
    defaultTitle: "Cutting-Edge Electronics",
  },
  {
    src: "/assets/banners/home.png",
    labelKey: "home.bannerLabel3",
    titleKey: "home.bannerTitle3",
    defaultLabel: "Home & Living",
    defaultTitle: "Transform Your Space",
  },
  {
    src: "/assets/banners/sale.png",
    labelKey: "home.bannerLabel4",
    titleKey: "home.bannerTitle4",
    defaultLabel: "Limited Time Offer",
    defaultTitle: "Up to 70% Off Today",
  },
];

const Banner = React.memo(({ onExplore }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const { t } = useTranslation();

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="banner_wrapper">
      <div className="banner_custom_slider">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`banner_slide ${i === activeIndex ? "active" : ""}`}
            style={{ 
              opacity: i === activeIndex ? 1 : 0,
              visibility: i === activeIndex ? "visible" : "hidden",
              transition: "opacity 0.6s ease-in-out"
            }}
          >
            <img
              src={slide.src}
              alt={`Banner ${i + 1}`}
              className="banner_img"
              loading={i === 0 ? "eager" : "lazy"}
            />
            <div className="banner_overlay">
              <p>{t(slide.labelKey, slide.defaultLabel)}</p>
              <h2>{t(slide.titleKey, slide.defaultTitle)}</h2>
              <button
                type="button"
                className="banner_cta"
                onClick={onExplore}
              >
                {t("home.shopNow", "Shop Now")}
                <ArrowForwardIcon style={{ fontSize: "1rem" }} />
              </button>
            </div>
          </div>
        ))}
        
        <div className="banner_indicators">
          {slides.map((_, i) => (
            <button
              key={i}
              className={`indicator ${i === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

export default Banner;
