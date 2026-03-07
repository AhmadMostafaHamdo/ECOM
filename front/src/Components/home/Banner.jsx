import React from "react";
import Carousel from "react-material-ui-carousel";
import "../home/banner.css";

const data = [
    "https://rukminim1.flixcart.com/flap/1680/280/image/1defb861e409319b.jpg?q=50",
    "https://rukminim1.flixcart.com/flap/1680/280/image/685712c6cefb3c02.jpg?q=50",
    "https://rukminim1.flixcart.com/flap/1680/280/image/8d4150cc4f3f967d.jpg?q=50",
    "https://rukminim1.flixcart.com/flap/1680/280/image/685712c6cefb3c02.jpg?q=50"
];

const Banner = React.memo(() => {
    const { t } = useTranslation();
    return (
        <div className="banner_wrapper" style={{ marginTop: "var(--header-height)" }}>
            <Carousel
                className="carasousel"
                autoPlay={true}
                animation="slide"
                indicators={true}
                navButtonsAlwaysVisible={true}
                cycleNavigation={true}
                duration={550}
                indicatorIconButtonProps={{
                    style: {
                        color: "rgba(255, 255, 255, 0.55)",
                        margin: "0 5px"
                    }
                }}
                activeIndicatorIconButtonProps={{
                    style: {
                        color: "#ffffff"
                    }
                }}
                navButtonsProps={{
                    style: {
                        background: "rgba(6, 34, 83, 0.76)",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "44px",
                        height: "44px"
                    }
                }}
            >
                {data.map((imag, i) => (
                    <div key={i} className="banner_slide">
                        <img src={imag} alt={`Banner ${i + 1}`} className="banner_img" />
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
