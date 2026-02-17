import React from 'react';
import './Card.css';

const Card = ({
    children,
    hoverable = false,
    clickable = false,
    className = '',
    onClick,
    ...props
}) => {
    const classes = [
        'card',
        hoverable && 'card-hoverable',
        clickable && 'card-clickable',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={clickable ? 'button' : undefined}
            tabIndex={clickable ? 0 : undefined}
            {...props}
        >
            {children}
        </div>
    );
};

Card.Header = ({ children, className = '', ...props }) => (
    <div className={`card-header ${className}`} {...props}>
        {children}
    </div>
);

Card.Body = ({ children, className = '', ...props }) => (
    <div className={`card-body ${className}`} {...props}>
        {children}
    </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
    <div className={`card-footer ${className}`} {...props}>
        {children}
    </div>
);

export default Card;
