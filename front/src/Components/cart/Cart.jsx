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
import { apiUrl, getCookie } from "../../api";
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
                const isInWishlist = (wData.data || []).some(
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
      toast.error(t('auth.loginRequired', 'Please login to add items to cart'));
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
        toast.success(t('cart.itemAdded', 'Added to cart!'));
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
      toast.error(t('auth.loginRequired', 'Please login to like this product'));
      return;
    }
    setLikeLoading(true);
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

    // Try to get seller from product
    if (inddata?.createdBy) {
      sellerId = typeof inddata.createdBy === 'object'
        ? inddata.createdBy._id || inddata.createdBy
        : inddata.createdBy;
    }

    // If no seller or seller is the current user, get the admin
    if (!sellerId || sellerId?.toString() === account._id?.toString()) {
      if (sellerId?.toString() === account._id?.toString()) {
        toast.info(t('product.ownProduct', 'This is your own product'));
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
      toast.error(t('product.chatUnavailable', 'Cannot start chat right now, please try again'));
      return;
    }

    try {
      setChatLoading(true);
      toast.info(t('product.openingChat', 'Opening chat...'), { autoClose: 1200 });

      const res = await fetch(apiUrl('/conversations'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-csrf-token': getCookie('csrfToken')
        },
        credentials: 'include',
        body: JSON.stringify({ recipientId: sellerId, productId: inddata._id || id }),
      });

      if (res.ok) {
        const conversation = await res.json();
        openChat(conversation);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error === 'Cannot chat with yourself') {
          toast.info(t('product.chatSelf', 'You cannot chat with yourself'));
        } else {
          toast.error(t('product.chatFail', 'Failed to open chat'));
        }
      }
    } catch (err) {
      toast.error(t('errors.serverError', 'Server connection error'));
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
