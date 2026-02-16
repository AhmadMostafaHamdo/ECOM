import React from "react";
import "../newnav/newnav.css";

const CATEGORY_ALL = "All Categories";

const Newnav = ({ categories = [CATEGORY_ALL], selectedCategory = CATEGORY_ALL, onCategoryChange = () => {} }) => {
    const visibleCategories = Array.isArray(categories) && categories.length ? categories : [CATEGORY_ALL];

    return (
        <div className="new_nav">
            <div className="nav_data">
                <div className="left_data">
                    {visibleCategories.map((category) => (
                        <button
                            key={category}
                            type="button"
                            className={selectedCategory === category ? "category_chip active" : "category_chip"}
                            onClick={() => onCategoryChange(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Newnav;
