import React from "react";
import Carousel from "react-material-ui-carousel";
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
  const { t } = useTranslation();

  return (
    <div className="banner_wrapper">
      <Carousel
        className="carasousel"
        autoPlay={true}
        animation="slide"
        indicators={true}
        navButtonsAlwaysVisible={true}
        cycleNavigation={true}
        duration={600}
        interval={5000}
        indicatorIconButtonProps={{
          style: {
            color: "rgba(255, 255, 255, 0.4)",
            margin: "0 4px",
            transform: "scale(0.75)",
          },
        }}
        activeIndicatorIconButtonProps={{
          style: {
            color: "var(--primary)",
            transform: "scale(1.1)",
          },
        }}
        navButtonsProps={{
          style: {
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(6px)",
            color: "#ffffff",
            borderRadius: "50%",
            width: "44px",
            height: "44px",
            margin: "0 10px",
          },
        }}
      >
        {slides.map((slide, i) => (
          <div key={i} className="banner_slide">
            <img
              src={slide.src}
              alt={`Banner ${i + 1}`}
              className="banner_img"
              loading={i === 0 ? "eager" : "lazy"}
              fetchpriority={i === 0 ? "high" : "low"}
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
      </Carousel>
    </div>
  );
});

export default Banner;
