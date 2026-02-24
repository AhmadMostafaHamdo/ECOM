import React, { useRef } from "react";
import "../newnav/newnav.css";

const CATEGORY_ALL = "All Categories";

const Newnav = ({
  categories = [CATEGORY_ALL],
  selectedCategory = CATEGORY_ALL,
  onCategoryChange = () => {},
}) => {
  const scrollRef = useRef(null);
  const visibleCategories =
    Array.isArray(categories) && categories.length
      ? categories
      : [CATEGORY_ALL];

  const handleCategoryClick = (category, e) => {
    onCategoryChange(category);
    // UX: Center the selected chip in the scroll view
    e.target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <div className="new_nav">
      <div className="nav_data">
        <div className="left_data" ref={scrollRef}>
          {visibleCategories.map((category) => (
            <button
              key={category}
              type="button"
              className={
                selectedCategory === category
                  ? "category_chip active"
                  : "category_chip"
              }
              onClick={(e) => handleCategoryClick(category, e)}
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
