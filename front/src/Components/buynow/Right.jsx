import React, { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useHistory } from "react-router";

const Right = ({ iteam }) => {
    const [val, setVal] = useState(false);
    const [price, setPrice] = useState(0);
    const history = useHistory("");

    useEffect(() => {
        const total = iteam.reduce((sum, item) => sum + item.price.cost, 0);
        setPrice(total);
    }, [iteam]);

    const proceesby = () => {
        alert("Your order has been confirmed.");
        history.push("/");
    };

    return (
        <div className="right_buy">
            <img
                src="https://images-eu.ssl-images-amazon.com/images/G/31/checkout/assets/TM_desktop._CB443006202_.png"
                alt="payment methods"
            />
            <div className="cost_right">
                <p>
                    Your order is eligible for free delivery.
                    <span> You can choose faster delivery at checkout.</span>
                </p>
                <h3>
                    Subtotal ({iteam.length} items): <span>Rs. {price}</span>
                </h3>
                <button className="rightbuy_btn" onClick={proceesby}>
                    Proceed to Buy
                </button>
                <div className="emi" onClick={() => setVal(!val)}>
                    EMI available
                    {!val ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </div>
                <span className={val ? "show" : "hide"}>
                    Your order may qualify for EMI options with eligible credit cards. Terms apply.
                </span>
            </div>
        </div>
    );
};

export default Right;
