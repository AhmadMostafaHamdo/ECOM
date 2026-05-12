import React, { useRef, useContext } from "react";
import { Logincontext } from "../context/Contextprovider";
import { resolveImageUrl } from "../../utils/categoryUtils";
import "../newnav/newnav.css";

const CATEGORY_ALL = "";

const Newnav = ({
  categories = [{ name: CATEGORY_ALL }],
  selectedCategory = CATEGORY_ALL,
  selectedSubCategory = "",
  onCategoryChange = () => { },
  onSubCategoryChange = () => { },
  onApplyFilters = () => { },
}) => {
  const scrollRef = useRef(null);
  const { account, setShowLoginPrompt } = useContext(Logincontext);

  // Normalize categories: support strings and object shapes
  const visibleCategories = Array.isArray(categories) && categories.length
    ? categories.map((cat) =>
      typeof cat === "string" ? { name: cat, value: cat, label: cat, image: "", subCategories: [] } : cat,
    )
    : [{ name: CATEGORY_ALL, value: CATEGORY_ALL, label: CATEGORY_ALL, image: "", subCategories: [] }];

  const activeCategory = visibleCategories.find((category) => category.value === selectedCategory);
  const visibleSubCategories = activeCategory?.subCategories || [];

  const handleCategoryClick = (category, e) => {
    if (!account) {
      setShowLoginPrompt(true);
      return;
    }

    onCategoryChange(category.value);
    onApplyFilters(null);
    e.target.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const handleSubCategoryClick = (subCategory, e) => {
    if (!account) {
      setShowLoginPrompt(true);
      return;
    }

    onSubCategoryChange(subCategory.value);
    onApplyFilters(null);
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
              key={category.value || category.name}
              type="button"
              className={
                selectedCategory === category.value
                  ? "category_chip active"
                  : "category_chip"
              }
              onClick={(e) => handleCategoryClick(category, e)}
            >
              {category.image && (
                <div
                  className="category_image_thumb"
                  style={{
                    backgroundImage: `url(${resolveImageUrl(category.image)})`,
                  }}
                />
              )}
              <span className="category_label">{category.label || category.name}</span>
            </button>
          ))}
        </div>

        {visibleSubCategories.length > 0 && (
          <div className="sub_category_row" aria-label="Sub categories">
            {visibleSubCategories.map((subCategory) => (
              <button
                key={subCategory.value}
                type="button"
                className={
                  selectedSubCategory === subCategory.value
                    ? "sub_category_chip active"
                    : "sub_category_chip"
                }
                onClick={(e) => handleSubCategoryClick(subCategory, e)}
              >
                {subCategory.image && (
                  <div
                    className="category_image_thumb"
                    style={{
                      backgroundImage: `url(${resolveImageUrl(subCategory.image)})`,
                    }}
                  />
                )}
                <span className="category_label">{subCategory.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Newnav;
