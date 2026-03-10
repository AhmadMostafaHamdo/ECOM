import React from 'react';
import './Skeleton.css';

const Skeleton = ({ variant = 'text', width, height, className = '' }) => {
    const style = {
        width: width,
        height: height,
    };

    return (
        <div
            className={`skeleton skeleton-${variant} ${className}`}
            style={style}
        />
    );
};

export default Skeleton;
