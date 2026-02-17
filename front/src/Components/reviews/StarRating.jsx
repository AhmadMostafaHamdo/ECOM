import React, { useState } from 'react';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import './StarRating.css';

const StarRating = ({
    rating = 0,
    interactive = false,
    size = 'md',
    showValue = false,
    onChange = () => { },
    className = ''
}) => {
    const [hoverRating, setHoverRating] = useState(0);
    const displayRating = hoverRating || rating;

    const sizeClasses = {
        sm: 'star-rating-sm',
        md: 'star-rating-md',
        lg: 'star-rating-lg'
    };

    const renderStar = (position) => {
        const fillValue = displayRating - position + 1;

        if (fillValue >= 1) {
            return <StarIcon className="star-icon star-filled" />;
        } else if (fillValue > 0 && fillValue < 1 && !interactive) {
            return <StarHalfIcon className="star-icon star-half" />;
        } else {
            return <StarBorderIcon className="star-icon star-empty" />;
        }
    };

    return (
        <div className={`star-rating ${sizeClasses[size]} ${className}`}>
            <div className="star-rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onMouseEnter={() => interactive && setHoverRating(star)}
                        onMouseLeave={() => interactive && setHoverRating(0)}
                        onClick={() => interactive && onChange(star)}
                        className={`star-button ${!interactive ? 'star-button-static' : ''}`}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                    >
                        {renderStar(star)}
                    </button>
                ))}
            </div>
            {showValue && (
                <span className="star-rating-value">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
};

export default StarRating;
