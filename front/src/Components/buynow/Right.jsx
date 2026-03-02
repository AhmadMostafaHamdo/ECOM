import React, { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const Right = ({ iteam }) => {
    const { t } = useTranslation();
    const [val, setVal] = useState(false);
    const [price, setPrice] = useState(0);
    const history = useNavigate("");

    useEffect(() => {
        const total = iteam.reduce((sum, item) => sum + item.price.cost, 0);
        setPrice(total);
    }, [iteam]);

    const proceesby = () => {
        alert(t('cart.orderConfirmed'));
        navigate("/");
    };

    return (
        <div className="right_buy">
            <img
                src="https://images-eu.ssl-images-amazon.com/images/G/31/checkout/assets/TM_desktop._CB443006202_.png"
                alt="payment methods"
            />
            <div className="cost_right">
                <p>
                    {t('cart.eligibleFree')}
                    <span> {t('cart.fasterCheckout')}</span>
                </p>
                <h3>
                    {t('cart.subtotal')} ({iteam.length} {iteam.length === 1 ? t('cart.item') : t('cart.items')}): <span>Rs. {price}</span>
                </h3>
                <button className="rightbuy_btn" onClick={proceesby}>
                    {t('cart.proceedToBuy')}
                </button>
                <div className="emi" onClick={() => setVal(!val)}>
                    {t('cart.emiAvailable')}
                    {!val ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </div>
                <span className={val ? "show" : "hide"}>
                    {t('cart.emiTerms')}
                </span>
            </div>
        </div>
    );
};

export default Right;
