import React, { useRef } from "react";
import "../newnav/newnav.css";

const CATEGORY_ALL = "All Categories";

const Newnav = ({
  categories = [{ name: CATEGORY_ALL }],
  selectedCategory = CATEGORY_ALL,
  onCategoryChange = () => {},
}) => {
  const scrollRef = useRef(null);
  
  // Normalize categories: support strings and object shapes
  const visibleCategories = Array.isArray(categories) && categories.length
    ? categories.map((cat) => typeof cat === 'string' ? { name: cat, image: '' } : cat)
    : [{ name: CATEGORY_ALL, image: '' }];

  const handleCategoryClick = (categoryName, e) => {
    onCategoryChange(categoryName);
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
              key={category.name}
              type="button"
              className={
                selectedCategory === category.name
                  ? "category_chip active"
                  : "category_chip"
              }
              onClick={(e) => handleCategoryClick(category.name, e)}
            >
              {category.image && (
                <div 
                  className="category_image_thumb" 
                  style={{
                    backgroundImage: `url(${category.image})`,
                  }} 
                />
              )}
              <span className="category_label">{category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Newnav;
