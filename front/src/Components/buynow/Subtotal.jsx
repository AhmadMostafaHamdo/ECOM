import React, { useEffect, useState } from "react";

const Subtotal = ({ iteam }) => {
    const [price, setPrice] = useState(0);

    useEffect(() => {
        const total = iteam.reduce((sum, item) => sum + item.price.cost, 0);
        setPrice(total);
    }, [iteam]);

    return (
        <div className="sub_item">
            <h3>
                Subtotal ({iteam.length} items): <strong>Rs. {price}</strong>
            </h3>
        </div>
    );
};

export default Subtotal;
