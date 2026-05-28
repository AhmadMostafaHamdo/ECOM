import { useContext, useEffect, useState } from "react";
import { Logincontext } from "../Components/context/Contextprovider";
import { axiosInstance } from "../services/http";

export const useAppSession = () => {
  const { setAccount, setAuthReady } = useContext(Logincontext);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const storedToken = localStorage.getItem("accessToken");

      // No token → user is not logged in, skip /validuser API call entirely
      if (!storedToken || storedToken === "undefined" || storedToken === "null") {
        if (mounted) {
          setAuthReady(true);
          setAuthChecked(true);
        }
        return;
      }

      // Token exists in localStorage → validate it with the server
      try {
        const response = await axiosInstance.get("/validuser");

        if (!mounted) return;

        if (response.status === 200 || response.status === 201) {
          const payload = response.data;
          setAccount(payload); // this also sets authReady = true

          // Refresh stored token if server returned a new one
          if (payload?.token) {
            localStorage.setItem("accessToken", payload.token);
          }

          // Keep authUser in sync
          const userData = { ...payload };
          delete userData.token;
          localStorage.setItem("authUser", JSON.stringify(userData));
          return;
        }

        // Unexpected response → clear auth
        if (mounted) {
          setAccount("");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authUser");
        }
      } catch {
        // /validuser failed (401 or network error)
        // The 401 interceptor will handle redirect if needed.
        // Here we only clear React state so UI is consistent.
        if (mounted) {
          setAccount("");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authUser");
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
