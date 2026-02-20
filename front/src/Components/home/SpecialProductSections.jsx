import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slide from "./Slide";
import { apiUrl } from "../../api";

const SpecialProductSections = () => {
    const { t } = useTranslation();
    const [topRated, setTopRated] = useState([]);
    const [trending, setTrending] = useState([]);
    const [dealOfTheDay, setDealOfTheDay] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecialProducts = async () => {
            try {
                const fetchSafe = async (url) => {
                    try {
                        const res = await fetch(apiUrl(url));
                        if (!res.ok) return [];
                        return await res.json();
                    } catch (e) {
                        console.error(`Error fetching ${url}:`, e);
                        return [];
                    }
                };

                const [topRatedData, trendingData, discountedData] = await Promise.all([
                    fetchSafe("/products/top-rated?limit=8"),
                    fetchSafe("/products/trending?limit=8"),
                    fetchSafe("/products/discounted?limit=8")
                ]);

                setTopRated(Array.isArray(topRatedData) ? topRatedData : []);
                setTrending(Array.isArray(trendingData) ? trendingData : []);
                setDealOfTheDay(Array.isArray(discountedData) ? discountedData : []);
            } catch (error) {
                console.log("Failed to fetch special products:", error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSpecialProducts();
    }, []);

    if (loading) {
        return (
            <div className="special_sections_loader">
                <div className="loader_spinner"></div>
                <p>{t('home.loadingCurated')}</p>
            </div>
        );
    }

    return (
        <>
            {dealOfTheDay.length > 0 && (
                <Slide title={t('home.dealOfTheDay')} products={dealOfTheDay} category="all" />
            )}

            <div className="center_img">
                <div className="center_img_overlay">
                    <h3>{t('home.savingsHub')}</h3>
                    <p>{t('home.savingsDescription')}</p>
                </div>
                <img
                    src="https://m.media-amazon.com/images/G/31/AMS/IN/970X250-_desktop_banner.jpg"
                    alt="Special offers"
                    loading="lazy"
                />
            </div>

            {trending.length > 0 && (
                <Slide title={t('home.trendingNow')} products={trending} category="all" />
            )}

            {topRated.length > 0 && (
                <Slide title={t('home.topRatedPicks')} products={topRated} category="all" />
            )}
        </>
    );
};

export default SpecialProductSections;
