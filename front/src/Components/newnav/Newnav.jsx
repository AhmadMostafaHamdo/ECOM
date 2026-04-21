import React, { useRef, useContext } from "react";
import { Logincontext } from "../context/Contextprovider";
import "../newnav/newnav.css";

const CATEGORY_ALL = "All Categories";

const Newnav = ({
  categories = [{ name: CATEGORY_ALL }],
  selectedCategory = CATEGORY_ALL,
  onCategoryChange = () => {},
  onApplyFilters = () => {},
}) => {
  const scrollRef = useRef(null);
  const { account, setShowLoginPrompt } = useContext(Logincontext);
  
  // Normalize categories: support strings and object shapes
  const visibleCategories = Array.isArray(categories) && categories.length
    ? categories.map((cat) =>
        typeof cat === "string" ? { name: cat, label: cat, image: "" } : cat,
      )
    : [{ name: CATEGORY_ALL, label: CATEGORY_ALL, image: "" }];

  const handleCategoryClick = (categoryName, e) => {
    if (!account) {
        setShowLoginPrompt(true);
        return;
    }

    onCategoryChange(categoryName);
    onApplyFilters(null);
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
              <span className="category_label">{category.label || category.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Newnav;
