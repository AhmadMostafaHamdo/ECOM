import { axiosInstance } from "../../api";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addToWishlistLocal, removeFromWishlistLocal } from "../redux/features/wishlistSlice";
import { useCallback, useState } from "react";

/**
 * useWishlist — Hook for toggling product wishlist status
 * @param {boolean} initialSaved - whether the product is already saved
 * @param {string} productId - the product's _id or id
 * @param {string} productName - display name for toast messages
 * @param {boolean} isLoggedIn - whether the user is authenticated
 * @param {Function} onLoginRequired - callback when user needs to login
 */
const useWishlist = (initialSaved = false, productId, productName = "", isLoggedIn = false, onLoginRequired) => {
    const [saved, setSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const toggle = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!isLoggedIn) {
            if (onLoginRequired) onLoginRequired();
            else toast.info("يجب تسجيل الدخول لحفظ المنتجات");
            return;
        }

        if (!productId || loading) return;

        setLoading(true);
        try {
            const res = await axiosInstance.post(`/wishlist/toggle/${productId}`);

            if (res.status === 200 || res.status === 201) {
                const data = res.data;
                setSaved(data.saved);
                if (data.saved) {
                    dispatch(addToWishlistLocal({ id: productId, _id: productId }));
                    toast.success(`❤️ تم حفظ "${productName}" في المحفوظات`);
                } else {
                    dispatch(removeFromWishlistLocal(productId));
                    toast.info(`💔 تم إزالة "${productName}" من المحفوظات`);
                }
            } else {
                toast.error("حدث خطأ، حاول مرة أخرى");
            }
        } catch (err) {
            console.error("Wishlist toggle error:", err);
            toast.error("حدث خطأ في الاتصال");
        } finally {
            setLoading(false);
        }
    }, [productId, productName, isLoggedIn, onLoginRequired, loading, dispatch]);

    return { saved, toggle, loading };
};

export default useWishlist;
