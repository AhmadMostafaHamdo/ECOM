import React, { useContext, useEffect, useState } from "react";
import "./cart.css";
import { Divider } from "@mui/material";
import { useHistory, useParams } from "react-router";
import { Logincontext } from "../context/Contextprovider";
import { ShoppingCart, LocalShipping, Verified, LocalOffer, StarRate, Visibility } from "@mui/icons-material";
import { apiUrl } from "../../api";

const Cart = () => {
    const { setAccount } = useContext(Logincontext);
    const { id } = useParams("");
    const history = useHistory();
    const [inddata, setIndedata] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const getinddata = async () => {
            setLoading(true);
            try {
                const res = await fetch(apiUrl(`/getproductsone/${id}`), {
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
                    setIndedata(data);
                }
            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        getinddata();
    }, [id]);

    const addtocart = async (itemId) => {
        setAddingToCart(true);
        try {
            const check = await fetch(apiUrl(`/addcart/${itemId}`), {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inddata
                }),
                credentials: "include"
            });

            const data1 = await check.json();

            if (check.status !== 201) {
                alert("No data available");
            } else {
                setAccount(data1);
                setTimeout(() => {
                    setAddingToCart(false);
                    history.push("/buynow");
                }, 700);
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="cart_section">
                <div className="product_loader">
                    <div className="loader_content_product">
                        <div className="product_loader_icon">
                            <ShoppingCart className="cart_icon_loading" />
                        </div>
                        <div className="loader_spinner_product"></div>
                        <h2>Loading product details</h2>
                        <p>Please wait while we fetch complete information.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="cart_section">
            {inddata && Object.keys(inddata).length ? (
                <div className="cart_container">
                    <div className="left_cart">
                        <div className="product_image_wrapper">
                            <img src={inddata.detailUrl} alt="product" />
                            {inddata.discount && (
                                <div className="product_discount_badge">
                                    <LocalOffer className="offer_icon_small" />
                                    {inddata.discount}
                                </div>
                            )}
                        </div>
                        <div className="cart_btn">
                            <button className="cart_btn1" onClick={() => addtocart(inddata.id)} disabled={addingToCart}>
                                {addingToCart ? (
                                    <>
                                        <div className="button_loader"></div>
                                        <span>Adding...</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="btn_icon" />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>
                            <button className="cart_btn2">
                                <Verified className="btn_icon" />
                                <span>Buy Now</span>
                            </button>
                        </div>
                    </div>

                    <div className="right_cart">
                        <div className="product_header">
                            <h3>{inddata.title.shortTitle}</h3>
                            <h4>{inddata.title.longTitle}</h4>
                            <div className="product_meta">
                                <span className="rating_chip">
                                    <StarRate />
                                    {Number(inddata.rating || 0).toFixed(1)}
                                </span>
                                <span className="views_chip">
                                    <Visibility />
                                    {inddata.views || 0} views
                                </span>
                            </div>
                        </div>

                        <Divider className="product_divider" />

                        <div className="price_section_cart">
                            <p className="mrp">
                                MRP: <del>Rs. {inddata.price.mrp}</del>
                            </p>
                            <div className="deal_price">
                                <span className="deal_label">Today&apos;s Price:</span>
                                <span className="price_value">Rs. {inddata.price.cost}</span>
                            </div>
                            <div className="savings">
                                <span>You save:</span>
                                <span className="save_value">
                                    Rs. {inddata.price.mrp - inddata.price.cost} ({inddata.price.discount})
                                </span>
                            </div>
                        </div>

                        <div className="discount_box">
                            <div className="discount_item">
                                <LocalOffer className="discount_icon" />
                                <div>
                                    <h5>
                                        Discount: <span>{inddata.discount}</span>
                                    </h5>
                                </div>
                            </div>
                            <div className="discount_item">
                                <LocalShipping className="discount_icon" />
                                <div>
                                    <h4>
                                        Free delivery: <span>Within 3 to 5 business days</span>
                                    </h4>
                                    <p>
                                        Priority shipping option available at checkout.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="description_box">
                            <h5>About this item</h5>
                            <p>{inddata.description}</p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

export default Cart;
