import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Outlet, useLocation } from "react-router-dom";
import Navbaar from "../Components/header/Navbaar";
import Newnav from "../Components/newnav/Newnav";
import Footer from "../Components/footer/Footer";
import ChatWidget from "../Components/chat/ChatWidget";
import FloatingNavButton from "../Components/common/FloatingNavButton";
import LoginPrompt from "../Components/common/LoginPrompt";
import "./layouts.css";

const transition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.26, ease: [0.2, 0.8, 0.2, 1] },
};

const StorefrontLayout = ({
  categories,
  selectedCategory,
  onCategoryChange,
  onApplyFilters,
  onSearchChange,
  showLoginPrompt,
  onCloseLoginPrompt,
}) => {
  const location = useLocation();
  const isHomeRoute = location.pathname === "/";

  return (
    <div className="storefront-layout__body">
      <Navbaar onSearch={onSearchChange} />

      {isHomeRoute && (
        <Newnav
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          onApplyFilters={onApplyFilters}
        />
      )}

      <main className="app_main storefront-layout__content">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="page_transition"
            initial={transition.initial}
            animate={transition.animate}
            exit={transition.exit}
            transition={transition.transition}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
      <ChatWidget />
      <FloatingNavButton />

      {showLoginPrompt && <LoginPrompt onCancel={onCloseLoginPrompt} />}
    </div>
  );
};

export default StorefrontLayout;
