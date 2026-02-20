import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Subtotal = ({ iteam }) => {
    const { t } = useTranslation();
    const [price, setPrice] = useState(0);

    useEffect(() => {
        const total = iteam.reduce((sum, item) => sum + item.price.cost, 0);
        setPrice(total);
    }, [iteam]);

    return (
        <div className="sub_item">
            <h3>
                {t('cart.subtotal')} ({iteam.length} {iteam.length === 1 ? t('cart.item') : t('cart.items')}): <strong>Rs. {price}</strong>
            </h3>
        </div>
    );
};

export default Subtotal;
