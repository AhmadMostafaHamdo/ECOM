import React from "react";
import Carousel from "react-material-ui-carousel";
import "../home/banner.css";
import { useTranslation } from "react-i18next";

const data = [
    "/assets/banners/fashion.png",
    "/assets/banners/electronics.png",
    "/assets/banners/home.png",
    "/assets/banners/sale.png"
];

const Banner = React.memo(() => {
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
                duration={700}
                indicatorIconButtonProps={{
                    style: {
                        color: "rgba(255, 255, 255, 0.4)",
                        margin: "0 4px",
                        transform: "scale(0.8)"
                    }
                }}
                activeIndicatorIconButtonProps={{
                    style: {
                        color: "var(--gold)",
                        transform: "scale(1.2)"
                    }
                }}
                navButtonsProps={{
                    style: {
                        background: "rgba(0, 0, 0, 0.3)",
                        backdropFilter: "blur(8px)",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "50px",
                        height: "50px",
                        margin: "0 20px"
                    }
                }}
            >
                {data.map((imag, i) => (
                    <div key={i} className="banner_slide">
                        <img 
                            src={imag} 
                            alt={`Banner ${i + 1}`} 
                            className="banner_img" 
                            loading={i === 0 ? "eager" : "lazy"} 
                            fetchpriority={i === 0 ? "high" : "low"}
                        />
                        <div className="banner_overlay">
                            <p>{t('home.premiumExperience')}</p>
                            <h2>{t('home.heroDesignTitle')}</h2>
                        </div>
                    </div>
                ))}
            </Carousel>
        </div>
    );
});

export default Banner;
