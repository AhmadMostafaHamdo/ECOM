import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Slide from "./Slide";
import { axiosInstance } from "../../api";

const SpecialProductSections = () => {
  const { t } = useTranslation();
  const [topRated, setTopRated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [dealOfTheDay, setDealOfTheDay] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpecialProducts = async () => {
      try {
        const [topRatedRes, trendingRes, discountedRes] = await Promise.all([
          axiosInstance.get("/products/top-rated?limit=8").catch(() => ({ data: [] })),
          axiosInstance.get("/products/trending?limit=8").catch(() => ({ data: [] })),
          axiosInstance.get("/products/discounted?limit=8").catch(() => ({ data: [] })),
        ]);

        const topRatedData = topRatedRes.data;
        const trendingData = trendingRes.data;
        const discountedData = discountedRes.data;

        setTopRated(topRatedData.data || (Array.isArray(topRatedData) ? topRatedData : []));
        setTrending(trendingData.data || (Array.isArray(trendingData) ? trendingData : []));
        setDealOfTheDay(discountedData.data || (Array.isArray(discountedData) ? discountedData : []));
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
        <p>{t("home.loadingCurated", "Loading curated picks...")}</p>
      </div>
    );
  }

  return (
    <>
      {dealOfTheDay.length > 0 && (
        <div className="reveal_section" style={{ animationDelay: "0.05s" }}>
          <Slide
            title={t("home.dealOfTheDay", "Deal of the Day")}
            products={dealOfTheDay}
            category="all"
          />
        </div>
      )}

      {trending.length > 0 && (
        <div className="reveal_section" style={{ animationDelay: "0.15s" }}>
          <Slide
            title={t("home.trendingNow", "Trending Now")}
            products={trending}
            category="all"
          />
        </div>
      )}

      {topRated.length > 0 && (
        <div className="reveal_section" style={{ animationDelay: "0.25s" }}>
          <Slide
            title={t("home.topRatedPicks", "Top Rated")}
            products={topRated}
            category="all"
          />
        </div>
      )}
    </>
  );
};

export default SpecialProductSections;
