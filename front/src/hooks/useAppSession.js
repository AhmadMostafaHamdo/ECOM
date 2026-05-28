import { useContext, useEffect, useState } from "react";
import { Logincontext } from "../Components/context/Contextprovider";
import { axiosInstance } from "../services/http";

export const useAppSession = () => {
  const { setAccount } = useContext(Logincontext);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      // Only attempt server-side validation if we have a stored token
      const storedToken = localStorage.getItem("accessToken");
      if (!storedToken || storedToken === "undefined" || storedToken === "null") {
        // No token saved — user is not logged in, skip API call
        if (mounted) {
          setAccount("");
          setAuthChecked(true);
        }
        return;
      }

      try {
        const response = await axiosInstance.get("/validuser");

        if (!mounted) return;

        if (response.status === 200 || response.status === 201) {
          const payload = response.data;
          setAccount(payload);

          // Refresh the stored token if the server returned a new one
          if (payload?.token) {
            localStorage.setItem("accessToken", payload.token);
          }

          // Keep authUser in sync with server data
          const userData = { ...payload };
          delete userData.token;
          localStorage.setItem("authUser", JSON.stringify(userData));
          return;
        }

        // Unexpected non-2xx status — clear auth
        setAccount("");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("authUser");
      } catch {
        // /validuser failed (401 or network error)
        // The 401 interceptor in api.js will handle redirect for real 401s.
        // Here we just clear the React state so the UI is in sync.
        if (mounted) {
          setAccount("");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authUser");
        }
      } finally {
        if (mounted) {
          setAuthChecked(true);
        }
      }
    };

    loadSession();

    return () => {
      mounted = false;
    };
  }, [setAccount]);

  return authChecked;
};
