import React, { useEffect, useState } from "react";
import Empty from "./Empty";
import Option from "./Option";
import Right from "./Right";
import Subtotal from "./Subtotal";
import { apiUrl } from "../../api";

const Buynow = () => {
    const [cartdata, setCartdata] = useState([]);

    const getdatabuy = async () => {
        const res = await fetch(apiUrl("/cartdetails"), {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            credentials: "include"
        });

        const data = await res.json();

        if (res.status !== 201) {
            alert("No data available");
        } else {
            setCartdata(data.carts);
        }
    };

    useEffect(() => {
        getdatabuy();
    }, []);

    return (
        <>
            {cartdata.length ? (
                <div className="min-h-screen bg-gray-50 p-5 md:p-10 font-sans">
                    <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8">
                        {/* Left Section - Cart Items */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">
                            <div className="p-12 bg-gradient-to-br from-purple-500 to-purple-700 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-2 tracking-tight leading-tight">
                                        Shopping Cart
                                    </h1>
                                    <p className="text-base text-white/85 font-medium">
                                        {cartdata.length} {cartdata.length === 1 ? 'item' : 'items'} in your cart
                                    </p>
                                </div>
                                <div className="absolute bottom-[-40px] right-12 w-44 h-44 bg-white/15 rounded-full z-0"></div>
                            </div>

                            <div className="px-12 pb-6">
                                {cartdata.map((item, index) => (
                                    <div key={item.id} className="grid grid-cols-[140px_1fr] gap-7 py-8 border-b border-gray-200 last:border-b-0 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                        <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200 transition-all duration-300 hover:-translate-y-1 hover:scale-102 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30">
                                            <img src={item.detailUrl} alt={item.title.shortTitle} className="w-full h-35 object-contain block transition-transform duration-300 hover:scale-105" />
                                        </div>

                                        <div className="flex flex-col gap-5">
                                            <div className="flex-1">
                                                <h3 className="font-heading text-xl font-bold text-gray-900 mb-1.5 leading-tight tracking-tight">
                                                    {item.title.longTitle}
                                                </h3>
                                                <p className="text-sm text-gray-600 mb-4 font-medium">
                                                    {item.title.shortTitle}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2.5 mb-3">
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-green-500/30">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <path d="M16 3h5v5M4 20L21 3"/>
                                                        </svg>
                                                        Free Shipping
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-400 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-500/30">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="1" y="3" width="15" height="13"/>
                                                            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                                            <circle cx="5.5" cy="18.5" r="2.5"/>
                                                            <circle cx="18.5" cy="18.5" r="2.5"/>
                                                        </svg>
                                                        48h Dispatch
                                                    </span>
                                                </div>

                                                <div className="mt-2">
                                                    <img 
                                                        src="https://m.media-amazon.com/images/G/31/marketing/fba/fba-badge_18px-2x._CB485942108_.png" 
                                                        alt="Prime badge" 
                                                        className="h-5 w-auto opacity-90 transition-opacity duration-200 hover:opacity-100 hover:scale-105"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-end justify-between gap-5 pt-2">
                                                <div className="flex flex-col items-start bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-2 border-green-300 relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-500/20 hover:border-green-400">
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full transition-transform duration-500 hover:translate-x-full"></div>
                                                    <span className="text-[11px] uppercase tracking-wide text-green-800 font-bold mb-1">Price</span>
                                                    <span className="font-heading text-2xl font-black text-green-700 leading-none relative z-10">₹{item.price.cost.toLocaleString()}</span>
                                                </div>
                                                <Option deletedata={item.id} get={getdatabuy} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 pt-4 bg-gradient-to-b from-transparent to-gray-50">
                                <Subtotal iteam={cartdata} />
                            </div>
                        </div>

                        {/* Right Section - Summary */}
                        <div className="sticky top-10">
                            <Right iteam={cartdata} />
                        </div>
                    </div>
                </div>
            ) : (
                <Empty />
            )}
        </>
    );
};

export default Buynow;