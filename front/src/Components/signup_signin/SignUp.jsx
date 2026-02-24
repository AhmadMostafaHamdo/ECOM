import { Divider } from "@mui/material";
import React, { useState, useContext, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import "./signup.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import { useHistory } from "react-router-dom";
const Signup = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { setAccount } = useContext(Logincontext);
  const abortRef = useRef(null);
  const unmountedRef = useRef(false);
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
    setUdata((pre) => ({
      ...pre,
      [name]: value,
    }));
  };

  const senddata = async (e) => {
    e.preventDefault();

    const { fname, email, mobile, password, cpassword } = udata;
    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch(apiUrl("/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        signal: abortRef.current.signal,
        body: JSON.stringify({
          fname,
          email,
          mobile,
          password,
          cpassword,
        }),
      });

      const data = await res.json();

      if (abortRef.current.signal.aborted || unmountedRef.current) {
        return;
      }

      if (!res.ok || data.error) {
        // Handle specific error messages from the server
        let errorMessage = t("auth.signupError");

        if (data.error) {
          if (data.error.includes("mobile already exists")) {
            errorMessage = t("auth.mobileExists");
          } else if (data.error.includes("email already exists")) {
            errorMessage = t("auth.emailExists");
          } else if (data.error.includes("password")) {
            errorMessage = t("auth.passwordMismatch");
          } else {
            errorMessage = data.error;
          }
        }

        toast.error(errorMessage, {
          position: "top-center",
        });
      } else {
        setAccount(data);
        setUdata({
          fname: "",
          email: "",
          mobile: "",
          password: "",
          cpassword: "",
        });
        toast.success(t("auth.signupSuccess"), {
          position: "top-center",
        });
        setTimeout(() => history.push("/"), 300);
      }
    } catch (error) {
      console.log("Signup error:", error.message);
    } finally {
      abortRef.current = null;
    }
  };

  return (
    <section className="auth_page">
      <div className="sign_container">
        <div className="sign_form">
          <form onSubmit={senddata}>
            <h1>{t("auth.signup")}</h1>
            <p className="auth_subtitle">Join our community today</p>

            <div className="form_row">
              <div className="form_data">
                <label htmlFor="name">{t("auth.firstName")}</label>
                <input
                  type="text"
                  name="fname"
                  onChange={adddata}
                  value={udata.fname}
                  id="name"
                  placeholder="John Doe"
                />
              </div>

              <div className="form_data">
                <label htmlFor="email">{t("auth.email")}</label>
                <input
                  type="email"
                  name="email"
                  onChange={adddata}
                  value={udata.email}
                  id="email"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div className="form_row">
              <div className="form_data">
                <label htmlFor="mobile">{t("auth.mobile")}</label>
                <input
                  type="number"
                  name="mobile"
                  onChange={adddata}
                  value={udata.mobile}
                  id="mobile"
                />
              </div>

              <div className="form_data">
                <label htmlFor="password">{t("auth.password")}</label>
                <input
                  type="password"
                  name="password"
                  onChange={adddata}
                  value={udata.password}
                  id="password"
                />
              </div>
            </div>

            <div className="form_data">
              <label htmlFor="passwordg">{t("auth.confirmPassword")}</label>
              <input
                type="password"
                name="cpassword"
                onChange={adddata}
                value={udata.cpassword}
                id="passwordg"
              />
            </div>

            <button type="submit" className="signin_btn">
              {t("common.signup")}
            </button>
          </form>
        </div>

        <div className="signin_info">
          <p>
            {t("auth.alreadyHaveAccount")}
            <NavLink to="/login">{t("auth.login")}</NavLink>
          </p>
        </div>
      </div>
      <ToastContainer />
    </section>
  );
};

export default Signup;
