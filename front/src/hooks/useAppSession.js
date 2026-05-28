import { useContext, useEffect, useState } from "react";
import { Logincontext } from "../Components/context/Contextprovider";
import { axiosInstance } from "../services/http";

export const useAppSession = () => {
  const { setAccount, setAuthReady } = useContext(Logincontext);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      // Tokens are now stored as HttpOnly cookies.
      // We must ALWAYS ask the server if the session is valid.
      try {
        const response = await axiosInstance.get("/validuser");

        if (!mounted) return;

        if (response.status === 200 || response.status === 201) {
          const payload = response.data;
          setAccount(payload); // this also sets authReady = true

          // Keep authUser in sync for UI purposes
          const userData = { ...payload };
          delete userData.token;
          localStorage.setItem("authUser", JSON.stringify(userData));
          return;
        }

        // Unexpected response → clear auth
        if (mounted) {
          setAccount("");
          localStorage.removeItem("authUser");
          
          // Clear any legacy tokens
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userToken");
          localStorage.removeItem("jwt");
        }
      } catch {
        // /validuser failed (401 or network error)
        // The 401 interceptor will handle redirect if needed.
        if (mounted) {
          setAccount("");
          localStorage.removeItem("authUser");

          // Clear any legacy tokens
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authToken");
          localStorage.removeItem("userToken");
          localStorage.removeItem("jwt");
        }
      } finally {
        if (mounted) {
          setAuthReady(true);
          setAuthChecked(true);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [setAccount, setAuthReady]);

  return authChecked;
};
