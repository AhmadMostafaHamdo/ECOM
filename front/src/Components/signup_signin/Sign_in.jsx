import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosInstance } from "../../api";
import { useNavigate } from "react-router-dom";
import "./signin.css";

const Sign_in = () => {
  const { t } = useTranslation();
  const { setAccount } = useContext(Logincontext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logdata, setData] = useState({ email: "", password: "" });

  const adddata = (e) => {
    const { name, value } = e.target;
    setData((pre) => ({ ...pre, [name]: value }));
  };

  const senddata = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { email, password } = logdata;
    try {
      const res = await axiosInstance.post("/login", { email, password });

      const data = res.data;
      if (res.status === 400 || !data) {
        toast.error(t("auth.invalidCredentials"), { position: "top-center" });
      } else {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        setAccount(data);
        setData({ email: "", password: "" });
        toast.success(t("auth.loginSuccess"), { position: "top-center" });
        const nextRoute = data?.role === "admin" ? "/dashboard" : "/";
        setTimeout(() => navigate(nextRoute), 300);
      }
    } catch (error) {
      console.log("Login error:", error.message);
      toast.error(t("auth.invalidCredentials"), { position: "top-center" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth_wrapper">
      <div className="auth_card">
        {/* ── LEFT HERO PANEL ── */}
        <div className="hero_panel">
          <div className="hero_blob hero_blob1" />
          <div className="hero_blob hero_blob2" />

          <div className="hero_inner">
            <div className="hero_badge">
              <span className="hbadge_dot" />
              <span>{t("auth.brandName")}</span>
            </div>

            <h2 className="hero_title">
              {t("auth.heroLine1")}
              <br />
              {t("auth.heroLine2")}
              <br />
              <em>{t("auth.heroLine3")}</em>
            </h2>

            <p className="hero_sub">
              {t("auth.heroSub")}
            </p>
          </div>

          <img src="./kik.png" alt="" width="300" style={{ borderRadius: "3rem" }} />

          {/* Floating decorative circles */}
          <div className="dec_ring dec_r1" />
          <div className="dec_ring dec_r2" />
          <div className="dec_dot dec_d1" />
          <div className="dec_dot dec_d2" />
          <div className="dec_dot dec_d3" />
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="form_panel">
          {/* Logo row */}
          <div className="brand_row">
            <div className="brand_icon">
              <span className="bi_dot1" />
              <span className="bi_dot2" />
            </div>
            <span className="brand_name">{t("auth.brand")}</span>
          </div>

          <h1 className="form_title">
            {t("auth.welcomeBack")}
          </h1>
          <p className="form_sub">
            {t("auth.loginSub")}
          </p>

          <form onSubmit={senddata} noValidate className="the_form">
            <div className="field">
              <label htmlFor="si_email">
                {t("auth.email")}
              </label>
              <input
                id="si_email"
                type="email"
                name="email"
                placeholder="name@example.com"
                value={logdata.email}
                onChange={adddata}
                required
              />
            </div>

            <div className="field">
              <div className="field_top_row">
                <label htmlFor="si_pass">
                  {t("auth.password")}
                </label>
                <a href="#" className="forgot_lnk">
                  {t("auth.forgot")}
                </a>
              </div>
              <input
                id="si_pass"
                type="password"
                name="password"
                placeholder="••••••••"
                value={logdata.password}
                onChange={adddata}
                required
              />
            </div>

            <button type="submit" className="login_btn" disabled={loading}>
              {loading ? (
                <span className="spin" />
              ) : (
                t("auth.login")
              )}
            </button>
          </form>

          <div className="or_row">
            <hr />
            <span>{t("auth.or")}</span>
            <hr />
          </div>

          <div className="social_btns">
            <button className="soc_btn">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button className="soc_btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebook
            </button>
          </div>

          <p className="switch_p">
            {t("auth.noAccount")}
            <NavLink to="/signup" className="switch_a">
              {t("auth.createAccount")}
            </NavLink>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Sign_in;
