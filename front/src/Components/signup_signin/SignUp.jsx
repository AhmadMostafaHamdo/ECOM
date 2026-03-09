import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { axiosInstance } from "../../api";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import PhoneInput from "../ui/PhoneInput";

const Signup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setAccount } = useContext(Logincontext);
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

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      abortRef.current?.abort();
    };
  }, []);

  const adddata = (e) => {
    const { name, value } = e.target;
    setUdata((pre) => ({ ...pre, [name]: value }));
  };

  const senddata = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { fname, email, mobile, password, cpassword, country } = udata;
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await axiosInstance.post("/register",
        { fname, email, mobile, password, cpassword, country },
        { signal: abortRef.current.signal }
      );

      const data = res.data;
      if (unmountedRef.current) return;

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      setAccount(data);
      setUdata({
        fname: "",
        email: "",
        mobile: "",
        password: "",
        cpassword: "",
        country: "",
      });
      toast.success(t("auth.signupSuccess"), { position: "top-center" });
      setTimeout(() => navigate("/"), 300);
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;

      console.log("Signup error:", error.message);
      const data = error.response?.data || {};
      let msg = t("auth.signupError");
      if (data.error) {
        if (data.error.includes("mobile already exists"))
          msg = t("auth.mobileExists");
        else if (data.error.includes("email already exists"))
          msg = t("auth.emailExists");
        else if (data.error.includes("password"))
          msg = t("auth.passwordMismatch");
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
        {/* LEFT HERO PANEL */}
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
            <p className="hero_sub">
              {t("auth.signupHeroSub")}
            </p>
            <ul className="hero_features">
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat1")}
              </li>
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat2")}
              </li>
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat3")}
              </li>
            </ul>
          </div>
          <img
            src="./kik.png"
            alt=""
            style={{ width: "15rem", borderRadius: "2rem" }}
          />
          <div className="dec_ring dec_r1" />
          <div className="dec_ring dec_r2" />
          <div className="dec_dot dec_d1" />
          <div className="dec_dot dec_d2" />
          <div className="dec_dot dec_d3" />
        </div>

        {/* RIGHT FORM PANEL */}
        <div className="form_panel">
          <div className="brand_row">
            <div className="brand_icon">
              <span className="bi_dot1" />
              <span className="bi_dot2" />
            </div>
            <span className="brand_name">{t("auth.brand")}</span>
          </div>

          <h1 className="form_title">{t("auth.createAccount")}</h1>
          <p className="form_sub">
            {t("auth.signupSub")}
          </p>

          <form onSubmit={senddata} className="the_form">
            <div className="field">
              <label htmlFor="su_fname">{t("auth.firstName")}</label>
              <input
                id="su_fname"
                type="text"
                name="fname"
                placeholder="Ex: John Doe"
                value={udata.fname}
                onChange={adddata}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="su_email">{t("auth.email")}</label>
              <input
                id="su_email"
                type="email"
                name="email"
                placeholder="example@mail.com"
                value={udata.email}
                onChange={adddata}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="su_mobile">{t("auth.mobile")}</label>
              <PhoneInput
                id="su_mobile"
                name="mobile"
                value={udata.mobile}
                onChange={(value) => setUdata({ ...udata, mobile: value })}
                onCountryChange={(c) => {
                  if (c && !udata.country) {
                    setUdata((prev) => ({ ...prev, country: c.name }));
                  }
                }}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="su_country">{t("auth.country")}</label>
              <input
                id="su_country"
                type="text"
                name="country"
                placeholder={t("auth.countryPlaceholder")}
                value={udata.country}
                onChange={adddata}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="su_pass">{t("auth.password")}</label>
              <input
                id="su_pass"
                type="password"
                name="password"
                placeholder="••••••••"
                value={udata.password}
                onChange={adddata}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="su_cpass">{t("auth.confirmPassword")}</label>
              <input
                id="su_cpass"
                type="password"
                name="cpassword"
                placeholder="••••••••"
                value={udata.cpassword}
                onChange={adddata}
                required
              />
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
      <ToastContainer />
    </div>
  );
};

export default Signup;
