import React, { useEffect, useState } from "react";
import Slide from "./Slide";
import { apiUrl } from "../../api";

const SpecialProductSections = () => {
    const [topRated, setTopRated] = useState([]);
    const [trending, setTrending] = useState([]);
    const [dealOfTheDay, setDealOfTheDay] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpecialProducts = async () => {
            try {
                const [topRatedRes, trendingRes, allProductsRes] = await Promise.all([
                    fetch(apiUrl("/products/top-rated?limit=8")),
                    fetch(apiUrl("/products/trending?limit=8")),
                    fetch(apiUrl("/getproducts"))
                ]);

                const [topRatedData, trendingData, allProductsData] = await Promise.all([
                    topRatedRes.json(),
                    trendingRes.json(),
                    allProductsRes.json()
                ]);

                setTopRated(Array.isArray(topRatedData) ? topRatedData : []);
                setTrending(Array.isArray(trendingData) ? trendingData : []);
                
                // For Deal of the Day, filter products with discount and sort by discount percentage
                const allProducts = Array.isArray(allProductsData) ? allProductsData : [];
                const discountedProducts = allProducts.filter(product => 
                    product.discount && product.discount !== '0' && product.discount !== '0%'
                );
                
                // Sort by discount (higher discount first) and take top 8
                const sortedByDiscount = discountedProducts.sort((a, b) => {
                    const getDiscountValue = (discount) => {
                        const num = parseInt(discount.replace(/[^0-9]/g, ''));
                        return isNaN(num) ? 0 : num;
                    };
                    return getDiscountValue(b.discount) - getDiscountValue(a.discount);
                });
                
                setDealOfTheDay(sortedByDiscount.slice(0, 8));
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
                <p>Loading curated collections...</p>
            </div>
        );
    }

    return (
        <>
            {dealOfTheDay.length > 0 && (
                <Slide title="Deal of the Day" products={dealOfTheDay} />
            )}

            <div className="center_img">
                <div className="center_img_overlay">
                    <h3>Exclusive Savings Hub</h3>
                    <p>Up to 80% off selected categories this week.</p>
                </div>
                <img
                    src="https://m.media-amazon.com/images/G/31/AMS/IN/970X250-_desktop_banner.jpg"
                    alt="Special offers"
                    loading="lazy"
                />
            </div>

            {trending.length > 0 && (
                <Slide title="Trending Now" products={trending} />
            )}
            
            {topRated.length > 0 && (
                <Slide title="Top Rated Picks" products={topRated} />
            )}
        </>
    );
};

export default SpecialProductSections;
