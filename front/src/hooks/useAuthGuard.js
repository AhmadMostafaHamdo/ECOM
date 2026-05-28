import { useContext } from "react";
import { Logincontext } from "../Components/context/Contextprovider";

/**
 * Hook that returns { authReady, hasToken } for dashboard components
 * to guard their protected API calls.
 *
 * Usage:
 *   const { authReady, hasToken } = useAuthGuard();
 *   useEffect(() => {
 *     if (!authReady || !hasToken) return;
 *     // ... make protected API call
 *   }, [authReady, hasToken]);
 */
export const useAuthGuard = () => {
  const { authReady } = useContext(Logincontext);
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const hasToken = !!(token && token !== "undefined" && token !== "null");

  return { authReady, hasToken };
};
