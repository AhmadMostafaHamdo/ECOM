import { useContext } from "react";
import { Logincontext } from "../Components/context/Contextprovider";

/**
 * Hook that returns { authReady, isAuthenticated } for dashboard components
 * to guard their protected API calls.
 *
 * Usage:
 *   const { authReady, isAuthenticated } = useAuthGuard();
 *   useEffect(() => {
 *     if (!authReady || !isAuthenticated) return;
 *     // ... make protected API call
 *   }, [authReady, isAuthenticated]);
 */
export const useAuthGuard = () => {
  const { authReady, account } = useContext(Logincontext);
  const isAuthenticated = !!account;

  // Keeping hasToken alias for backward compatibility with existing components
  return { authReady, isAuthenticated, hasToken: isAuthenticated };
};
