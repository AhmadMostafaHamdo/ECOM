import React from 'react';
import './RatingDistribution.css';

const RatingDistribution = ({ distribution = {}, totalReviews = 0, onFilterByRating }) => {
    const stars = [5, 4, 3, 2, 1];

    return (
        <div className="rating-distribution">
            <h4 className="rating-distribution-title">Rating Breakdown</h4>
            <div className="rating-bars">
                {stars.map((starCount) => {
                    const count = distribution[starCount] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                    return (
                        <button
                            key={starCount}
                            className="rating-bar-row"
                            onClick={() => onFilterByRating && onFilterByRating(starCount)}
                            disabled={!onFilterByRating}
                        >
                            <span className="rating-bar-label">{starCount} ★</span>
                            <div className="rating-bar-track">
                                <div
                                    className="rating-bar-fill"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="rating-bar-count">{count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RatingDistribution;
