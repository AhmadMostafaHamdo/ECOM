import React, { useContext, useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import "./cart.css";
import { Divider } from "@mui/material";
import { useNavigate, useParams } from "react-router";
import { Logincontext } from "../context/Contextprovider";
import { useChatContext } from "../context/ChatContext";
import {
  ShoppingCart,
  LocalShipping,
  LocalOffer,
  StarRate,
  Visibility,
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  Share,
} from "@mui/icons-material";
import { apiUrl } from "../../api";
import { toast } from "react-toastify";
import ReviewForm from "../reviews/ReviewForm";
import ReviewList from "../reviews/ReviewList";
import RatingDistribution from "../reviews/RatingDistribution";
import StarRating from "../reviews/StarRating";
import CommentSection from "../comments/CommentSection";
import ReportModal from "../common/ReportModal";
import useWishlist from "../wishlist/useWishlist";


const Cart = () => {
  const { t } = useTranslation();
  const { setAccount, account } = useContext(Logincontext);
  const { openChat } = useChatContext();
  const { id } = useParams("");
  const navigate = useNavigate();
  const [inddata, setIndedata] = useState("");
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSummary, setReviewSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [reportOpen, setReportOpen] = useState(false);
  const [initialSaved, setInitialSaved] = useState(false);
  const [productMongoId, setProductMongoId] = useState(null);

  useEffect(() => {
    const getinddata = async () => {
      setLoading(true);
      try {
        const res = await fetch(apiUrl(`/getproductsone/${id}`), {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = data?.error || t("errors.somethingWentWrong");
          alert(message);
        } else {
          setIndedata(data);
          setProductMongoId(data._id);
          setLikeCount(data.likeCount || 0);
          setLiked(account && data.likedBy?.includes(account._id));
          // Check wishlist status
          if (account) {
            try {
              const wRes = await fetch(apiUrl("/wishlist"), { credentials: "include" });
              if (wRes.ok) {
                const wData = await wRes.json();
                const isInWishlist = (wData.wishlist || []).some(
                  (p) => (p._id || p.id)?.toString() === data._id?.toString()
                );
                setInitialSaved(isInWishlist);
              }
            } catch { }
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };

    getinddata();
  }, [id, account]);

  const addtocart = async (itemId) => {
    if (!account) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      const check = await fetch(apiUrl(`/addcart/${itemId}`), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inddata }),
        credentials: "include",
      });

      const data1 = await check.json();

      if (check.status !== 201) {
        alert("No data available");
      } else {
        setAccount(data1);
        toast.success('Added to cart!');
        setTimeout(() => {
          setAddingToCart(false);
          navigate("/buynow");
        }, 600);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddingToCart(false);
    }
  };

  const handleLike = async () => {
    if (!account) {
      toast.error('Please login to like this product');
      return;
    }
    try {
      const res = await fetch(apiUrl(`/products/${id}/like`), {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleChatWithSeller = async () => {
    if (!account) {
      toast.error('يجب تسجيل الدخول أولاً للتواصل مع البائع');
      navigate('/login');
      return;
    }

    let sellerId = null;

    // Try to get seller from product
    if (inddata?.createdBy) {
      sellerId = typeof inddata.createdBy === 'object'
        ? inddata.createdBy._id || inddata.createdBy
        : inddata.createdBy;
    }

    // If no seller or seller is the current user, get the admin
    if (!sellerId || sellerId?.toString() === account._id?.toString()) {
      if (sellerId?.toString() === account._id?.toString()) {
        toast.info('هذا منتجك الخاص');
        return;
      }
      // Fetch admin as fallback
      try {
        const adminRes = await fetch(apiUrl('/getadmin'), { credentials: 'include' });
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          sellerId = adminData._id;
        }
      } catch {
        // ignore
      }
    }

    if (!sellerId) {
      toast.error('لا يمكن فتح محادثة الآن، حاول مرة أخرى');
      return;
    }

    try {
      toast.info('جاري فتح المحادثة...', { autoClose: 1200 });

      const res = await fetch(apiUrl('/conversations'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: sellerId, productId: inddata._id || id }),
      });

      if (res.ok) {
        const conversation = await res.json();
        openChat(conversation);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error === 'Cannot chat with yourself') {
          toast.info('لا يمكنك التواصل مع نفسك');
        } else {
          toast.error('فشل في فتح المحادثة');
        }
      }
    } catch (err) {
      toast.error('خطأ في الاتصال بالخادم');
      console.error('Chat error:', err);
    }
  };


  const handleReviewSubmit = () => {
    setShowReviewForm(false);
    // ReviewList will refresh automatically
  };

  // Wishlist
  const { saved: wishSaved, toggle: toggleWishlist, loading: wishLoading } = useWishlist(
    initialSaved,
    productMongoId,
    inddata?.title?.shortTitle || '',
    !!account,
    () => navigate('/login')
  );

  const images = inddata?.images?.length ? inddata.images : [inddata?.detailUrl].filter(Boolean);

  if (loading) {
    return (
      <div className="cart_section">
        <div className="product_loader">
          <div className="loader_content_product">
            <div className="product_loader_icon">
              <ShoppingCart className="cart_icon_loading" />
            </div>
            <div className="loader_spinner_product"></div>
            <h2>{t("cart.loadingDetails")}</h2>
            <p>{t("cart.fetchInfo")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart_section">
      {inddata && Object.keys(inddata).length ? (
        <>
          {/* Main Product Card */}
          <div className="cart_container">
            {/* Left - Image Gallery */}
            <div className="left_cart">
              <div className="product_image_wrapper">
                <img
                  src={images[selectedImage] || inddata.detailUrl}
                  alt={inddata.title?.shortTitle || 'product'}
                />
                {inddata.discount && (
                  <div className="product_discount_badge">
                    <LocalOffer className="offer_icon_small" />
                    {inddata.discount}
                  </div>
                )}
                {/* Like Button Overlay */}
                <button className={`product-like-overlay ${liked ? 'liked' : ''}`} onClick={handleLike}>
                  {liked ? <Favorite /> : <FavoriteBorder />}
                  <span>{likeCount}</span>
                </button>
              </div>

              {/* Image Thumbnails */}
              {images.length > 1 && (
                <div className="product-thumbnails">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      className={`product-thumb ${selectedImage === idx ? 'active' : ''}`}
                      onClick={() => setSelectedImage(idx)}
                    >
                      <img src={img} alt={`view ${idx + 1}`} />
                    </button>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="cart_btn">

                <button className="cart_btn_chat" onClick={handleChatWithSeller}>
                  <ChatBubbleOutline className="btn_icon" />
                  <span>تواصل مع البائع</span>
                </button>

                {/* Wishlist Save Button */}
                <button
                  className={`cart_btn_wishlist ${wishSaved ? 'cart_btn_wishlist--saved' : ''}`}
                  onClick={toggleWishlist}
                  disabled={wishLoading}
                  title={wishSaved ? 'إزالة من المحفوظات' : 'حفظ في المحفوظات'}
                >
                  {wishSaved ? <Favorite className="btn_icon" /> : <FavoriteBorder className="btn_icon" />}
                  <span>{wishSaved ? 'تم الحفظ' : 'حفظ في المحفوظات'}</span>
                </button>

                {account && (
                  <button
                    className="cart_btn_report"
                    onClick={() => setReportOpen(true)}
                    title="الإبلاغ عن هذا المنتج"
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '10px 18px', borderRadius: '10px',
                      border: '1px solid #fecaca', background: '#fff5f5',
                      color: '#ef4444', cursor: 'pointer',
                      fontSize: '13px', fontWeight: '700',
                      transition: 'all 0.2s', marginTop: '8px'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff5f5'; }}
                  >
                    ⚠️ الإبلاغ عن المنتج
                  </button>
                )}

              </div>

            </div>

            {/* Right - Product Details */}
            <div className="right_cart">
              <div className="product_header">
                <div className="product-category-tag">
                  {inddata.category || 'Product'}
                </div>
                <h3>{inddata.title.shortTitle}</h3>
                <h4>{inddata.title.longTitle}</h4>
                <div className="product_meta">
                  <span className="rating_chip">
                    <StarRate />
                    {Number(inddata.averageRating || inddata.rating || 0).toFixed(1)}
                    {inddata.totalReviews > 0 && (
                      <span className="review-count-mini">({inddata.totalReviews})</span>
                    )}
                  </span>
                  <span className="views_chip">
                    <Visibility />
                    {inddata.views || 0} {t("product.views")}
                  </span>
                  <span className="like_chip">
                    <Favorite />
                    {likeCount}
                  </span>
                </div>
              </div>

              <Divider className="product_divider" />

              {/* Price Section */}
              <div className="price_section_cart">
                <p className="mrp">
                  MRP: <del>Rs. {inddata.price.mrp}</del>
                </p>
                <div className="deal_price">
                  <span className="deal_label">{t("cart.todayPrice")}:</span>
                  <span className="price_value">Rs. {inddata.price.cost}</span>
                </div>
                <div className="savings">
                  <span>{t("cart.youSave")}:</span>
                  <span className="save_value">
                    Rs. {inddata.price.mrp - inddata.price.cost} (
                    {inddata.price.discount})
                  </span>
                </div>
              </div>

              {/* Info Boxes */}
              <div className="discount_box">
                <div className="discount_item">
                  <LocalOffer className="discount_icon" />
                  <div>
                    <h5>
                      {t("cart.discount")}: <span>{inddata.discount}</span>
                    </h5>
                  </div>
                </div>

              </div>

              {/* Rating Summary */}
              {reviewSummary && reviewSummary.totalReviews > 0 && (
                <div className="product-rating-summary">
                  <div className="rating-summary-left">
                    <div className="rating-big-number">{reviewSummary.averageRating.toFixed(1)}</div>
                    <StarRating rating={reviewSummary.averageRating} size="md" />
                    <span className="rating-total">{reviewSummary.totalReviews} reviews</span>
                  </div>
                  <div className="rating-summary-right">
                    <RatingDistribution
                      distribution={reviewSummary.ratingDistribution}
                      totalReviews={reviewSummary.totalReviews}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="product-tabs-section">
            <div className="product-tabs-nav">
              <button
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                About
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews {reviewSummary?.totalReviews ? `(${reviewSummary.totalReviews})` : ''}
              </button>
              <button
                className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                Comments
              </button>
            </div>

            <div className="product-tab-content">
              {activeTab === 'description' && (
                <div className="description_box">
                  <h5>{t("cart.aboutItem")}</h5>
                  <p>{inddata.description || 'No description available.'}</p>
                  {inddata.tagline && (
                    <div className="product-tagline">
                      <span>"{inddata.tagline}"</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-tab-content">
                  <div className="review-form-toggle">
                    {showReviewForm ? (
                      <ReviewForm
                        targetType="product"
                        targetId={inddata.id}
                        onSubmit={handleReviewSubmit}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    ) : (
                      <button
                        className="write-review-btn"
                        onClick={() => setShowReviewForm(true)}
                      >
                        <StarRate />
                        Write a Review
                      </button>
                    )}
                  </div>
                  <ReviewList
                    targetType="product"
                    targetId={inddata.id}
                    onReviewsUpdate={setReviewSummary}
                  />
                </div>
              )}

              {activeTab === 'comments' && (
                <CommentSection productId={inddata.id} />
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Report Modal */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="product"
        targetId={inddata?._id || inddata?.id}
        targetName={inddata?.title?.shortTitle || ''}
      />
    </div>
  );
};

export default Cart;
