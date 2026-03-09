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
import { axiosInstance } from "../../api";
import { toast } from "react-toastify";
import ReportModal from "../common/ReportModal";
import useWishlist from "../wishlist/useWishlist";
import ProductLayout from "./components/ProductLayout";
import BackButton from "../common/BackButton";

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
  const [reportOpen, setReportOpen] = useState(false);
  const [initialSaved, setInitialSaved] = useState(false);
  const [productMongoId, setProductMongoId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const getinddata = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/getproductsone/${id}`);
        const data = res.data;

        setIndedata(data);
        setProductMongoId(data._id);
        setLikeCount(data.likeCount || 0);
        setLiked(account && data.likedBy?.includes(account._id));

        // Check wishlist status
        if (account) {
          try {
            const wRes = await axiosInstance.get("/wishlist");
            if (wRes.status === 200) {
              const wData = wRes.data;
              const isInWishlist = (wData.data || []).some(
                (p) => (p._id || p.id)?.toString() === data._id?.toString()
              );
              setInitialSaved(isInWishlist);
            }
          } catch { }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        const message = error.response?.data?.error || t("errors.somethingWentWrong");
        toast.error(message);
      } finally {
        setTimeout(() => setLoading(false), 400);
      }
    };

    getinddata();
  }, [id, account, t]);

  const addtocart = async (itemId) => {
    if (!account) {
      toast.error(t('auth.loginRequired', 'Please login to add items to cart'));
      navigate('/login');
      return;
    }
    setAddingToCart(true);
    try {
      const res = await axiosInstance.post(`/addcart/${itemId}`, { inddata });
      const data1 = res.data;

      if (res.status !== 201) {
        toast.error("No data available");
      } else {
        setAccount(data1);
        toast.success(t('cart.itemAdded', 'Added to cart!'));
        setTimeout(() => {
          setAddingToCart(false);
          navigate("/buynow");
        }, 600);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      setAddingToCart(false);
      toast.error(error.response?.data?.error || "Error adding to cart");
    }
  };

  const handleLike = async () => {
    if (!account) {
      toast.error(t('auth.loginRequired', 'Please login to like this product'));
      return;
    }
    setLikeLoading(true);
    try {
      const res = await axiosInstance.post(`/products/${id}/like`);
      if (res.status === 200) {
        const data = res.data;
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      }
    } catch (err) {
      console.error('Like error:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleChatWithSeller = async () => {
    if (!account) {
      toast.error(t('auth.loginRequired', 'Please login to chat with seller'));
      navigate('/login');
      return;
    }

    let sellerId = null;

    if (inddata?.createdBy) {
      sellerId = typeof inddata.createdBy === 'object'
        ? inddata.createdBy._id || inddata.createdBy
        : inddata.createdBy;
    }

    if (!sellerId || sellerId?.toString() === account._id?.toString()) {
      if (sellerId?.toString() === account._id?.toString()) {
        toast.info(t('product.ownProduct', 'This is your own product'));
        return;
      }
      try {
        const adminRes = await axiosInstance.get('/getadmin');
        if (adminRes.status === 200) {
          const adminData = adminRes.data;
          sellerId = adminData._id;
        }
      } catch { }
    }

    if (!sellerId) {
      toast.error(t('product.chatUnavailable', 'Cannot start chat right now, please try again'));
      return;
    }

    try {
      setChatLoading(true);
      toast.info(t('product.openingChat', 'Opening chat...'), { autoClose: 1200 });

      const res = await axiosInstance.post('/conversations', {
        recipientId: sellerId,
        productId: inddata._id || id
      });

      if (res.status === 200 || res.status === 201) {
        const conversation = res.data;
        openChat(conversation);
      } else {
        toast.error(t('product.chatFail', 'Failed to open chat'));
      }
    } catch (err) {
      const errData = err.response?.data || {};
      if (errData?.error === 'Cannot chat with yourself') {
        toast.info(t('product.chatSelf', 'You cannot chat with yourself'));
      } else {
        toast.error(t('product.chatFail', 'Failed to open chat'));
      }
      console.error('Chat error:', err);
    } finally {
      setChatLoading(false);
    }
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
      <div className="container" style={{ padding: '20px 0 0 0' }}>
        <BackButton />
      </div>
      {inddata && Object.keys(inddata).length ? (
        <>
          <ProductLayout
            product={inddata}
            images={images}
            liked={liked}
            handleLike={handleLike}
            likeCount={likeCount}
            likeLoading={likeLoading}
            handleChatWithSeller={handleChatWithSeller}
            chatLoading={chatLoading}
            addtocart={addtocart}
            addingToCart={addingToCart}
            wishSaved={wishSaved}
            toggleWishlist={toggleWishlist}
            wishLoading={wishLoading}
            setReportOpen={setReportOpen}
            account={account}
          />
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
