import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import { useNavigate } from "react-router-dom";
import "./signup.css";

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
    const { fname, email, mobile, password, cpassword } = udata;
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        signal: abortRef.current.signal,
        body: JSON.stringify({ fname, email, mobile, password, cpassword }),
      });
      const data = await res.json();
      if (abortRef.current.signal.aborted || unmountedRef.current) return;
      if (!res.ok || data.error) {
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
      } else {
        setAccount(data);
        setUdata({
          fname: "",
          email: "",
          mobile: "",
          password: "",
          cpassword: "",
        });
        toast.success(t("auth.signupSuccess"), { position: "top-center" });
        setTimeout(() => navigate("/"), 300);
      }
    } catch (error) {
      console.log("Signup error:", error.message);
    } finally {
      abortRef.current = null;
      setLoading(false);
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
              <span>{t("auth.brandName", "السوق العربي الأوروبي")}</span>
            </div>
            <h2 className="hero_title">
              {t("auth.signupHero1", "انضم إلى")}
              <br />
              {t("auth.signupHero2", "مجتمعنا")}
              <br />
              <em>{t("auth.signupHero3", "اليوم.")}</em>
            </h2>
            <p className="hero_sub">
              {t(
                "auth.signupHeroSub",
                "سجّل حسابك مجاناً واستمتع بأفضل عروض التسوق.",
              )}
            </p>
            <ul className="hero_features">
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat1", "شحن سريع لجميع الدول")}
              </li>
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat2", "ضمان استرداد المبلغ")}
              </li>
              <li>
                <span className="feat_check">✓</span>
                {t("auth.feat3", "عروض حصرية للأعضاء")}
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
            <span className="brand_name">{t("auth.brand", "متجرنا")}</span>
          </div>

          <h1 className="form_title">{t("auth.signup", "إنشاء حساب")}</h1>
          <p className="form_sub">
            {t("auth.signupSub", "أنشئ حسابك مجاناً في دقيقة واحدة")}
          </p>

          <form onSubmit={senddata} noValidate className="the_form">
            <div className="fields_row">
              <div className="field">
                <label htmlFor="su_fname">{t("auth.firstName", "الاسم")}</label>
                <input
                  id="su_fname"
                  type="text"
                  name="fname"
                  placeholder={t("auth.firstNamePlaceholder", "محمد")}
                  value={udata.fname}
                  onChange={adddata}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="su_email">
                  {t("auth.email", "البريد الإلكتروني")}
                </label>
                <input
                  id="su_email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={udata.email}
                  onChange={adddata}
                  required
                />
              </div>
            </div>

            <div className="fields_row">
              <div className="field">
                <label htmlFor="su_mobile">
                  {t("auth.mobile", "رقم الجوال")}
                </label>
                <input
                  id="su_mobile"
                  type="number"
                  name="mobile"
                  placeholder="05xxxxxxxx"
                  value={udata.mobile}
                  onChange={adddata}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="su_pass">
                  {t("auth.password", "كلمة المرور")}
                </label>
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
            </div>

            <div className="field">
              <label htmlFor="su_cpass">
                {t("auth.confirmPassword", "تأكيد كلمة المرور")}
              </label>
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

            <button type="submit" className="login_btn" disabled={loading}>
              {loading ? (
                <span className="spin" />
              ) : (
                t("common.signup", "إنشاء الحساب")
              )}
            </button>
          </form>

          <p className="switch_p">
            {t("auth.alreadyHaveAccount", "لديك حساب بالفعل؟")}
            <NavLink to="/login" className="switch_a">
              {t("auth.login", "تسجيل الدخول")}
            </NavLink>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signup;
