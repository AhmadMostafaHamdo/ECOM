import React from 'react';
import Skeleton from './Skeleton';
import './ProductSkeleton.css';

const ProductSkeleton = () => {
    return (
        <div className="product-skeleton-card">
            <Skeleton variant="rectangular" height="200px" className="mb-4" />
            <div className="p-4">
                <Skeleton variant="text" width="60%" className="mb-2" />
                <Skeleton variant="text" width="90%" className="mb-4" />
                <div className="meta-row">
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="30%" />
                </div>
                <div className="price-section">
                    <Skeleton variant="text" width="40%" height="24px" />
                </div>
            </div>
        </div>
    );
};

export const ProductSkeletonList = ({ count = 4 }) => {
    return (
        <div className="product-skeleton-grid">
            {Array(count).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </div>
    );
};

export default ProductSkeleton;
