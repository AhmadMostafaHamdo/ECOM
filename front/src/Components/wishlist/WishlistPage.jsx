import React, { useCallback, useContext, useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { axiosInstance, ROOT_URL } from "../../api";
import { Logincontext } from "../context/Contextprovider";
import { useLocalize } from "../context/LocalizeContext";
import { formatCurrency } from "../../utils/localizeUtils";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { removeFromWishlistLocal, clearWishlistLocal } from "../redux/features/wishlistSlice";
import "./wishlist.css";
import BackButton from "../common/BackButton";
import Pagination from "../common/Pagination";
import ConfirmDialog from "../common/ConfirmDialog";

// Icons
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import StarRateIcon from "@mui/icons-material/StarRate";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import ClearAllIcon from "@mui/icons-material/ClearAll";

const WishlistPage = () => {
    const { account } = useContext(Logincontext);
    const { activeCountry } = useLocalize();
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [wlPage, setWlPage] = useState(1);
    const [wlTotalPages, setWlTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState(null);
    const [clearing, setClearing] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const dispatch = useDispatch();

    const loadWishlist = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.get("/wishlist");
            if (res.status === 200) {
                setWishlist(res.data.wishlist || []);
            }
        } catch (e) {
            console.error("Wishlist load error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!account) {
            navigate("/login");
            return;
        }
        loadWishlist();
    }, [account, loadWishlist, navigate]);

    const handleRemove = async (productId, productName) => {
        setRemovingId(productId);
        try {
            const res = await axiosInstance.post(`/wishlist/toggle/${productId}`);
            if (res.status === 200 || res.status === 201) {
                setWishlist((prev) => prev.filter((p) => (p._id || p.id) !== productId));
                dispatch(removeFromWishlistLocal(productId));
                toast.success(`تم إزالة "${productName}" من المحفوظات`);
            }
        } catch (e) {
            toast.error("حدث خطأ، حاول مرة أخرى");
        } finally {
            setRemovingId(null);
        }
    };

    const handleClearAll = () => {
        setIsConfirmOpen(true);
    };

    const confirmClearAll = async () => {
        setIsConfirmOpen(false);
        setClearing(true);
        try {
            const res = await axiosInstance.delete("/wishlist");
            if (res.status === 200) {
                setWishlist([]);
                dispatch(clearWishlistLocal());
                toast.success("تم مسح المحفوظات بالكامل");
            }
        } catch (e) {
            toast.error("حدث خطأ، حاول مرة أخرى");
        } finally {
            setClearing(false);
        }
    };

    if (loading) {
        return (
            <div className="wishlist_loader">
                <div className="wishlist_loader_inner">
                    <FavoriteIcon className="wishlist_loader_icon" />
                    <h2>جاري تحميل محفوظاتك...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist_page">
            {/* Header */}
            <div className="wishlist_hero">
                <div className="wishlist_hero_content">
                    <BackButton className="wishlist_back_btn" showText={false} />
                    <div className="wishlist_title_block">
                        <div className="wishlist_icon_circle">
                            <FavoriteIcon />
                        </div>
                        <div>
                            <h1>محفوظاتي</h1>
                            <p>{wishlist.length} منتج محفوظ</p>
                        </div>
                    </div>
                    {wishlist.length > 0 && (
                        <button
                            className="wishlist_clear_btn"
                            onClick={handleClearAll}
                            disabled={clearing}
                        >
                            <ClearAllIcon />
                            <span>{clearing ? "جاري المسح..." : "مسح الكل"}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="wishlist_container">
                {wishlist.length === 0 ? (
                    <div className="wishlist_empty">
                        <div className="wishlist_empty_icon">
                            <FavoriteBorderIcon />
                        </div>
                        <h2>لا توجد منتجات محفوظة</h2>
                        <p>ابدأ بحفظ المنتجات التي تعجبك بالضغط على أيقونة القلب ❤️</p>
                        <NavLink to="/" className="wishlist_browse_btn">
                            <ShoppingCartIcon />
                            تصفح المنتجات
                        </NavLink>
                    </div>
                ) : (
                    <div className="wishlist_grid">
                        {wishlist.map((product) => {
                            const productId = product._id || product.id;
                            const isRemoving = removingId === productId;

                            return (
                                <div
                                    key={productId}
                                    className={`wishlist_card ${isRemoving ? "removing" : ""}`}
                                >
                                    {/* Remove button */}
                                    <button
                                        className="wishlist_remove_btn"
                                        onClick={() =>
                                            handleRemove(productId, product.title?.shortTitle)
                                        }
                                        disabled={isRemoving}
                                        title="إزالة من المحفوظات"
                                    >
                                        {isRemoving ? (
                                            <span className="wishlist_spinner" />
                                        ) : (
                                            <DeleteOutlineIcon />
                                        )}
                                    </button>

                                    {/* Product Image */}
                                    <NavLink
                                        to={`/getproductsone/${product.id || productId}`}
                                        className="wishlist_card_img_link"
                                    >
                                        <div className="wishlist_card_img">
                                            <img
                                                src={ (() => {
                                                    const img = product.url || product.detailUrl;
                                                    if (!img) return '';
                                                    return img.startsWith('http') || img.startsWith('blob:') ? img : `${ROOT_URL}${img}`;
                                                })() }
                                                alt={product.title?.shortTitle || 'Product'}
                                                loading="lazy"
                                            />
                                            {product.discount && (
                                                <span className="wishlist_discount_badge">
                                                    <LocalOfferIcon style={{ fontSize: 12 }} />
                                                    {product.discount}
                                                </span>
                                            )}
                                        </div>
                                    </NavLink>

                                    {/* Product Info */}
                                    <div className="wishlist_card_info">
                                        <p className="wishlist_category">{product.category}</p>
                                        <NavLink
                                            to={`/getproductsone/${product.id || productId}`}
                                            className="wishlist_card_title"
                                        >
                                            {product.title?.shortTitle}
                                        </NavLink>

                                        <div className="wishlist_card_meta">
                                            <span className="wishlist_rating">
                                                <StarRateIcon style={{ fontSize: 14 }} />
                                                {Number(
                                                    product.averageRating || product.rating || 0
                                                ).toFixed(1)}
                                                {product.totalReviews > 0 && (
                                                    <span className="wishlist_review_count">
                                                        ({product.totalReviews})
                                                    </span>
                                                )}
                                            </span>
                                            <span className="wishlist_views">
                                                <VisibilityIcon style={{ fontSize: 14 }} />
                                                {product.views || 0}
                                            </span>
                                        </div>

                                        <div className="wishlist_card_price">
                                            <span className="wishlist_price_current">
                                                {formatCurrency(product.price?.cost || 0, activeCountry.locale, product.price?.currency || activeCountry.currency)}
                                            </span>
                                            {product.price?.mrp > product.price?.cost && (
                                                <span className="wishlist_price_original">
                                                    {formatCurrency(product.price?.mrp || 0, activeCountry.locale, product.price?.currency || activeCountry.currency)}
                                                </span>
                                            )}
                                        </div>

                                        <NavLink
                                            to={`/getproductsone/${product.id || productId}`}
                                            className="wishlist_view_btn"
                                        >
                                            <ShoppingCartIcon style={{ fontSize: 16 }} />
                                            عرض المنتج
                                        </NavLink>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={isConfirmOpen}
                title="مسح جميع المحفوظات"
                message="هل أنت متأكد من رغبتك في مسح كافة المنتجات من المحفوظات؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="مسح الكل"
                cancelText="إلغاء"
                onConfirm={confirmClearAll}
                onCancel={() => setIsConfirmOpen(false)}
                loading={clearing}
                type="danger"
            />
        </div>
    );
};

export default WishlistPage;
