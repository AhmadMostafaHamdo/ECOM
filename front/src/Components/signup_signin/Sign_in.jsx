import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { toast } from "react-toastify";
import { axiosInstance } from "../../api";
import { useNavigate } from "react-router-dom";
import "./signin.css";

const Sign_in = () => {
  const { t } = useTranslation();
  const { setAccount, setShowLoginPrompt } = useContext(Logincontext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logdata, setData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  const adddata = (e) => {
    const { name, value } = e.target;
    setData((pre) => ({ ...pre, [name]: value }));
    if (errors[name]) setErrors((pre) => ({ ...pre, [name]: null }));
  };

  const senddata = async (e) => {
    e.preventDefault();
    const { email, password } = logdata;
    const newErrors = {};

    if (!email) {
      newErrors.email = t("auth.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t("auth.invalidEmail");
    }

    if (!password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.passwordLength");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
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
        setShowLoginPrompt(false);
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
            <div className={`field ${errors.email ? "error" : ""}`}>
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
              />
              {errors.email && <span className="error_msg">{errors.email}</span>}
            </div>

            <div className={`field ${errors.password ? "error" : ""}`}>
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
              />
              {errors.password && <span className="error_msg">{errors.password}</span>}
            </div>

            <button type="submit" className="login_btn" disabled={loading}>
              {loading ? (
                <span className="spin" />
              ) : (
                t("auth.login")
              )}
            </button>
          </form>


          <p className="switch_p">
            {t("auth.noAccount")}
            <NavLink to="/signup" className="switch_a">
              {t("auth.createAccount")}
            </NavLink>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sign_in;
