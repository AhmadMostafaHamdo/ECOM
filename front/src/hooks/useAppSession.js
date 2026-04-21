import { useContext, useEffect, useState } from "react";
import { Logincontext } from "../Components/context/Contextprovider";
import { axiosInstance } from "../services/http";

export const useAppSession = () => {
  const { setAccount } = useContext(Logincontext);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const response = await axiosInstance.get("/validuser");

        if (!mounted) {
          return;
        }

        if (response.status === 200 || response.status === 201) {
          const payload = response.data;
          setAccount(payload);

          if (payload?.token) {
            localStorage.setItem("auth_token", payload.token);
          }

          return;
        }

        setAccount(false);
        localStorage.removeItem("auth_token");
      } catch {
        if (mounted) {
          setAccount(false);
          localStorage.removeItem("auth_token");
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
