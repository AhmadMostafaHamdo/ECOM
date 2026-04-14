import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { toast } from "react-toastify";
import { axiosInstance } from "../../api";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import PhoneInput from "../ui/PhoneInput";

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAccount, setShowLoginPrompt } = useContext(Logincontext);
  const abortRef = useRef(null);
  const unmountedRef = useRef(false);
  const [loading, setLoading] = useState(false);

  const [udata, setUdata] = useState({
    fname: "",
    email: "",
    mobile: "",
    password: "",
    cpassword: "",
    country: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      abortRef.current?.abort();
    };
  }, []);

  const adddata = (e) => {
    const { name, value } = e.target;
    setUdata((pre) => ({ ...pre, [name]: value }));
    if (errors[name]) setErrors((pre) => ({ ...pre, [name]: null }));
  };

  const senddata = async (e) => {
    e.preventDefault();
    const { fname, email, mobile, password, cpassword, country } = udata;
    const newErrors = {};

    if (!fname) newErrors.fname = t("auth.firstNameRequired");
    if (!country || country.trim() === "") newErrors.country = t("auth.countryRequired");
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = t("auth.emailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = t("auth.invalidEmail");
    }
    if (!mobile) newErrors.mobile = t("auth.mobileRequired");

    if (!password) {
      newErrors.password = t("auth.passwordRequired");
    } else if (password.length < 6) {
      newErrors.password = t("auth.passwordLength");
    }
    if (!cpassword) {
      newErrors.cpassword = t("auth.passwordRequired");
    } else if (password !== cpassword) {
      newErrors.cpassword = t("auth.passwordMismatch");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await axiosInstance.post(
        "/register",
        { fname: fname.trim(), email: trimmedEmail, mobile: mobile.trim(), password, cpassword, country: country.trim() },
        { signal: abortRef.current.signal }
      );

      const data = res.data;
      if (unmountedRef.current) return;

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      setAccount(data);
      setShowLoginPrompt(false);
      setUdata({ fname: "", email: "", mobile: "", password: "", cpassword: "", country: "" });
      toast.success(t("auth.signupSuccess"), { position: "top-center" });
      const nextRoute = data?.role === "admin" ? "/dashboard" : "/";
      setTimeout(() => navigate(nextRoute), 300);
    } catch (error) {
      if (error.name === "CanceledError" || error.name === "AbortError") return;
      console.log("Signup error:", error.message);
      let data = error.response?.data || {};
      if (typeof data === "string") data = { error: data };
      let msg = t("auth.signupError");

      if (!error.response) {
        msg = "Cannot connect to server. Please make sure the backend is running.";
      } else if (data.error) {
        if (data.error.includes("mobile already exists")) msg = t("auth.mobileExists");
        else if (data.error.includes("email already exists")) msg = t("auth.emailExists");
        else if (data.error.includes("password")) msg = t("auth.passwordMismatch");
        else msg = data.error;
      }
      toast.error(msg, { position: "top-center" });
    } finally {
      if (!unmountedRef.current) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth_wrapper">
      <div className="auth_card auth_card_wide">

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
              {t("auth.signupHero1")}
              <br />
              {t("auth.signupHero2")}
              <br />
              <em>{t("auth.signupHero3")}</em>
            </h2>

            <p className="hero_sub">{t("auth.signupHeroSub")}</p>

            <ul className="hero_features">
              <li><span className="feat_check">✓</span>{t("auth.feat1")}</li>
              <li><span className="feat_check">✓</span>{t("auth.feat2")}</li>
              <li><span className="feat_check">✓</span>{t("auth.feat3")}</li>
            </ul>
          </div>

          <img src="./kik.png" alt="" style={{ width: "13rem", borderRadius: "1rem" }} />

          <div className="dec_ring dec_r1" />
          <div className="dec_ring dec_r2" />
          <div className="dec_dot dec_d1" />
          <div className="dec_dot dec_d2" />
          <div className="dec_dot dec_d3" />
        </div>

        {/* ── RIGHT FORM PANEL ── */}
        <div className="form_panel">
          <div className="brand_row">
            <div className="brand_icon">
              <span className="bi_dot1" />
              <span className="bi_dot2" />
            </div>
            <span className="brand_name">{t("auth.brand")}</span>
          </div>

          <h1 className="form_title">{t("auth.createAccount")}</h1>
          <p className="form_sub">{t("auth.signupSub")}</p>

          <form onSubmit={senddata} className="the_form">
            <div className={`field ${errors.fname ? "error" : ""}`}>
              <label htmlFor="su_fname">{t("auth.firstName")}</label>
              <input
                id="su_fname" type="text" name="fname"
                placeholder="Ex: John Doe"
                value={udata.fname} onChange={adddata} required
              />
              {errors.fname && <span className="error_msg">{errors.fname}</span>}
            </div>

            <div className={`field ${errors.email ? "error" : ""}`}>
              <label htmlFor="su_email">{t("auth.email")}</label>
              <input
                id="su_email" type="email" name="email"
                placeholder="example@mail.com"
                value={udata.email} onChange={adddata} 
              />
              {errors.email && <span className="error_msg">{errors.email}</span>}
            </div>

            <div className={`field ${errors.mobile ? "error" : ""}`}>
              <label htmlFor="su_mobile">{t("auth.mobile")}</label>
              <PhoneInput
                id="su_mobile" name="mobile"
                value={udata.mobile}
                onChange={(value) => {
                  setUdata({ ...udata, mobile: value });
                  if (errors.mobile) setErrors({ ...errors, mobile: null });
                }}
                error={errors.mobile}
                
              />
              {errors.mobile && <span className="error_msg">{errors.mobile}</span>}
            </div>

            <div className={`field ${errors.country ? "error" : ""}`}>
              <label htmlFor="su_country">{t("auth.country")}</label>
              <input
                id="su_country" type="text" name="country"
                placeholder={t("auth.countryPlaceholder")}
                value={udata.country} onChange={adddata} required
              />
              {errors.country && <span className="error_msg">{errors.country}</span>}
            </div>

            <div className={`field ${errors.password ? "error" : ""}`}>
              <label htmlFor="su_pass">{t("auth.password")}</label>
              <input
                id="su_pass" type="password" name="password"
                placeholder="••••••••"
                value={udata.password} onChange={adddata} 
              />
              {errors.password && <span className="error_msg">{errors.password}</span>}
            </div>

            <div className={`field ${errors.cpassword ? "error" : ""}`}>
              <label htmlFor="su_cpass">{t("auth.confirmPassword")}</label>
              <input
                id="su_cpass" type="password" name="cpassword"
                placeholder="••••••••"
                value={udata.cpassword} onChange={adddata} 
              />
              {errors.cpassword && <span className="error_msg">{errors.cpassword}</span>}
            </div>

            <button type="submit" className="signup_btn" disabled={loading}>
              {loading ? <span className="spin" /> : t("auth.signup")}
            </button>
          </form>

          <div className="auth_footer_lnk">
            {t("auth.alreadyHaveAccount")}{" "}
            <NavLink to="/login">{t("auth.login")}</NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;