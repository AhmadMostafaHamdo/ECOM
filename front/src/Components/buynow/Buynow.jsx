import { Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import "./buynow.css";
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
                <div className="buynow_section">
                    <div className="buynow_container">
                        <div className="left_buy">
                            <h1>Shopping Cart</h1>
                            <p>Review your selected items</p>
                            <span className="leftbuyprice">Price</span>
                            <Divider />

                            {cartdata.map((e) => (
                                <React.Fragment key={e.id}>
                                    <div className="item_containert">
                                        <img src={e.detailUrl} alt="item" />
                                        <div className="item_details">
                                            <h3>{e.title.longTitle}</h3>
                                            <h3>{e.title.shortTitle}</h3>
                                            <h3 className="diffrentprice">Rs. {e.price.cost}</h3>
                                            <p className="unusuall">Usually dispatched within 48 hours.</p>
                                            <p>Eligible for free shipping</p>
                                            <img
                                                src="https://m.media-amazon.com/images/G/31/marketing/fba/fba-badge_18px-2x._CB485942108_.png"
                                                alt="badge"
                                            />
                                            <Option deletedata={e.id} get={getdatabuy} />
                                        </div>
                                        <h3 className="item_price">Rs. {e.price.cost}</h3>
                                    </div>
                                    <Divider />
                                </React.Fragment>
                            ))}

                            <Subtotal iteam={cartdata} />
                        </div>
                        <Right iteam={cartdata} />
                    </div>
                </div>
            ) : (
                <Empty />
            )}
        </>
    );
};

export default Buynow;
