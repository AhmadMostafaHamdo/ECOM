import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import { useHistory } from "react-router-dom";
import "./signup.css";

const Sign_in = () => {
  const { t } = useTranslation();
  const { setAccount } = useContext(Logincontext);
  const history = useHistory();

  const [logdata, setData] = useState({
    email: "",
    password: "",
  });

  const adddata = (e) => {
    const { name, value } = e.target;
    setData((pre) => ({
      ...pre,
      [name]: value,
    }));
  };

  const senddata = async (e) => {
    e.preventDefault();

    const { email, password } = logdata;
    try {
      const res = await fetch(apiUrl("/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (res.status === 400 || !data) {
        toast.error(t("auth.invalidCredentials"), {
          position: "top-center",
        });
      } else {
        setAccount(data);
        setData({ email: "", password: "" });
        toast.success(t("auth.loginSuccess"), {
          position: "top-center",
        });
        const nextRoute = data?.role === "admin" ? "/dashboard" : "/";
        setTimeout(() => history.push(nextRoute), 300);
      }
    } catch (error) {
      console.log("Login error:", error.message);
    }
  };

  return (
    <section className="auth_page">
      <div className="sign_container">
        <div className="sign_form">
          <form method="POST">
            <h1>{t("auth.login")}</h1>
            <div className="form_data">
              <label htmlFor="email">{t("auth.email")}</label>
              <input
                type="email"
                name="email"
                onChange={adddata}
                value={logdata.email}
                id="email"
              />
            </div>
            <div className="form_data">
              <label htmlFor="password">{t("auth.password")}</label>
              <input
                type="password"
                name="password"
                onChange={adddata}
                value={logdata.password}
                id="password"
                placeholder={t("auth.passwordPlaceholder")}
              />
            </div>
            <button type="submit" className="signin_btn" onClick={senddata}>
              {t("common.signin")}
            </button>
          </form>
          <ToastContainer />
        </div>
        <div className="create_accountinfo">
          <p>{t("auth.newHere")}</p>
          <button>
            <NavLink to="/signup">{t("auth.createAccount")}</NavLink>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Sign_in;
