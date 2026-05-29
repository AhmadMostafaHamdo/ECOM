import React, { useRef, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Logincontext } from "../context/Contextprovider";
import {
  resolveImageUrl,
  getLocalizedName,
  getActiveLanguage,
  isDefaultUncategorizedCategory,
} from "../../utils/categoryUtils";
import "./newnav.css";

// Sentinel for "All Categories" — empty string means no filter
const CATEGORY_ALL_ID = "";

/* ─────────────────────────────────────────
   Single reusable circle item
   Used for ALL categories AND subcategories
───────────────────────────────────────── */
const CategoryCircleItem = ({ item, isActive, label, onClick }) => {
  const imgUrl = item?.image ? resolveImageUrl(item.image) : null;
  const initial = (label?.[0] || "A").toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0 group focus:outline-none"
      style={{ minWidth: 68 }}
    >
      {/* Gradient ring */}
      <div
        className={`relative w-[60px] h-[60px] md:w-[68px] md:h-[68px] rounded-full p-[2.5px] transition-all duration-300
          ${
            isActive
              ? "bg-gradient-to-br from-orange-400 via-orange-500 to-amber-600 shadow-[0_0_18px_4px_rgba(249,115,22,0.4)]"
              : "bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-700 group-hover:from-orange-300 group-hover:to-orange-500"
          }`}
      >
        {/* Inner circle */}
        <div className="w-full h-full rounded-full overflow-hidden bg-[var(--surface-2)] flex items-center justify-center">
          {imgUrl ? (
            <>
              <img
                src={imgUrl}
                alt={label}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  if (e.target.nextSibling) e.target.nextSibling.style.display = "flex";
                }}
              />
              {/* Shown only on img error */}
              <div
                className="w-full h-full rounded-full items-center justify-center text-white font-bold text-lg select-none bg-gradient-to-br from-orange-400 to-amber-600"
                style={{ display: "none" }}
              >
                {initial}
              </div>
            </>
          ) : (
            <div className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl select-none bg-gradient-to-br from-orange-400 to-amber-600">
              {initial}
            </div>
          )}
        </div>

        {/* Active dot */}
        {isActive && (
          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-orange-500 border-2 border-white dark:border-[var(--surface)]" />
        )}
      </div>

      {/* Label */}
      <span
        className={`text-[11px] md:text-[12px] font-semibold text-center leading-tight line-clamp-2 max-w-[68px] transition-colors duration-200
          ${isActive ? "text-orange-500" : "text-[var(--text-2)] group-hover:text-orange-500"}`}
      >
        {label}
      </span>
    </button>
  );
};

/* ─────────────────────────────────────────
   Section heading with orange accent bar
───────────────────────────────────────── */
const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 px-4 pt-5 pb-1 md:px-6">
    <span className="block w-1 h-6 rounded-full bg-gradient-to-b from-orange-400 to-orange-600 flex-shrink-0" />
    <h2 className="text-sm md:text-base font-bold tracking-tight text-[var(--text-1)]">
      {children}
    </h2>
  </div>
);

/* ─────────────────────────────────────────
   Main Newnav component
───────────────────────────────────────── */
const Newnav = ({
  categories = [],
  // These are now _id strings (or "" for All), passed from useStorefrontFilters
  selectedCategory = CATEGORY_ALL_ID,
  selectedSubCategory = CATEGORY_ALL_ID,
  onCategoryChange = () => {},
  onSubCategoryChange = () => {},
  onApplyFilters = () => {},
}) => {
  const { account, setShowLoginPrompt } = useContext(Logincontext);
  const { t, i18n } = useTranslation();
  const language = getActiveLanguage(i18n);
  const isRTL = language === "ar";
  const catScrollRef = useRef(null);

  // Helper: detect items that should be hidden
  const isAllCategoriesItem = (cat) => {
    const name =
      typeof cat?.name === "string"
        ? cat.name
        : cat?.name?.en || cat?.name?.ar || "";
    return (
      name.trim().toLowerCase() === "all categories" ||
      cat?.value?.trim?.().toLowerCase() === "all categories" ||
      cat?._id === "all"
    );
  };

  // API categories: strip "Uncategorized" and any "All Categories" duplicates
  const apiCategories = (Array.isArray(categories) ? categories : []).filter(
    (cat) => !isDefaultUncategorizedCategory(cat) && !isAllCategoriesItem(cat)
  );

  // Find the active category object by _id
  const activeCategoryObj = apiCategories.find(
    (cat) => cat._id === selectedCategory || cat.value === selectedCategory
  );

  // Subcategories of the currently selected category
  const visibleSubCategories =
    !selectedCategory || selectedCategory === CATEGORY_ALL_ID
      ? []
      : (activeCategoryObj?.subCategories || []).filter(
          (sub) => sub?.active !== false && !isDefaultUncategorizedCategory(sub)
        );

  /* ── Auth guard helper ── */
  const withAuth = (fn) => {
    if (!account) {
      setShowLoginPrompt(true);
      return;
    }
    fn();
  };

  const handleCategoryClick = (id, e) => {
    withAuth(() => {
      onCategoryChange(id);
      // Scroll the clicked chip into view
      setTimeout(() => {
        e?.currentTarget?.scrollIntoView?.({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }, 50);
    });
  };

  const handleSubCategoryClick = (id) => {
    withAuth(() => {
      onSubCategoryChange(id);
    });
  };

  const isAllActive = !selectedCategory || selectedCategory === CATEGORY_ALL_ID;

  return (
    <nav
      dir={isRTL ? "rtl" : "ltr"}
      style={{marginTop:"4rem"}}
    >
      {/* ── Categories row ── */}
      <div
        ref={catScrollRef}
        className="no-scrollbar flex gap-4 px-4 md:px-6 pt-3 overflow-x-auto"
      >
        {/* Static "All Categories" — always first, never duplicated */}
        <CategoryCircleItem
          item={{ image: "" }}
          isActive={isAllActive}
          label={t("navigation.allCategories", "All Categories")}
          onClick={(e) => handleCategoryClick(CATEGORY_ALL_ID, e)}
        />

        {/* API-sourced categories, matched by _id */}
        {apiCategories.map((cat) => {
          const key = cat._id || cat.slug || cat.value;
          const isActive = selectedCategory === cat._id || selectedCategory === cat.value;
          const label =
            getLocalizedName(cat.label || cat.name, language) || cat.slug || "";

          return (
            <CategoryCircleItem
              key={key}
              item={cat}
              isActive={isActive}
              label={label}
              onClick={(e) => handleCategoryClick(cat._id || cat.value, e)}
            />
          );
        })}
      </div>

      {/* ── Subcategories row — same style, only shown when subcats exist ── */}
      {visibleSubCategories.length > 0 && (
        <div className="pb-5 px-4 md:px-6">
          <div className="h-px mb-4 bg-gradient-to-r from-transparent via-orange-300/40 to-transparent" />

          {/* Horizontal scroll — identical layout to categories row */}
          <div className="no-scrollbar flex gap-4 overflow-x-auto pb-1">
            {visibleSubCategories.map((sub) => {
              const subKey = sub._id || sub.slug || sub.value;
              const isActive =
                selectedSubCategory === sub._id ||
                selectedSubCategory === sub.value;
              const subLabel =
                getLocalizedName(sub.label || sub.name, language) ||
                sub.slug ||
                "";

              return (
                <CategoryCircleItem
                  key={subKey}
                  item={sub}
                  isActive={isActive}
                  label={subLabel}
                  onClick={() => handleSubCategoryClick(sub._id || sub.value)}
                />
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Newnav;
