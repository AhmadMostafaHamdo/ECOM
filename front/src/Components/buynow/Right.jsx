import React, { useEffect, useState } from "react";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

const Right = ({ iteam }) => {
    const { t } = useTranslation();
    const [val, setVal] = useState(false);
    const [price, setPrice] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const total = iteam.reduce((sum, item) => sum + item.price.cost, 0);
        setPrice(total);
    }, [iteam]);

    return (
        <div className="right_buy">
            <div className="cost_right">
                <div className="order-summary-header">
                    <ShoppingCartCheckoutIcon className="summary-icon" />
                    <h3 className="summary-title">{t('cart.orderSummary', 'Order Summary')}</h3>
                </div>

                <div className="summary-details">
                    <div className="summary-row">
                        <span>{t('cart.items', 'Items')} ({iteam.length})</span>
                        <span>Rs. {price.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                        <span>{t('cart.shipping', 'Shipping')}</span>
                        <span className="free-tag">{t('cart.free', 'FREE')}</span>
                    </div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total-row">
                        <span>{t('cart.subtotal', 'Subtotal')}</span>
                        <span className="total-price">Rs. {price.toLocaleString()}</span>
                    </div>
                </div>

                <div className="order-perks">
                    <div className="perk-item">
                        <LocalShippingIcon className="perk-icon" />
                        <span>{t('cart.freeShipping', 'Free shipping on all orders')}</span>
                    </div>
                    <div className="perk-item">
                        <VerifiedIcon className="perk-icon" />
                        <span>{t('cart.qualityGuarantee', 'Quality guaranteed')}</span>
                    </div>
                </div>

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
