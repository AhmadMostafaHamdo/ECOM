import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import { useHistory } from "react-router-dom";
import './signup.css'

const Sign_in = () => {
    const { setAccount } = useContext(Logincontext);
    const history = useHistory();

    const [logdata, setData] = useState({
        email: "",
        password: ""
    });

    const adddata = (e) => {
        const { name, value } = e.target;
        setData((pre) => ({
            ...pre,
            [name]: value
        }));
    };

    const senddata = async (e) => {
        e.preventDefault();

        const { email, password } = logdata;
        try {
            const res = await fetch(apiUrl("/login"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await res.json();

            if (res.status === 400 || !data) {
                toast.error("Invalid details.", {
                    position: "top-center"
                });
            } else {
                setAccount(data);
                setData({ email: "", password: "" });
                toast.success("Logged in successfully.", {
                    position: "top-center"
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
                <div className="sign_header">
                    <img src="./blacklogoamazon.png" alt="signin logo" />
                    <p>Welcome back to Studio Commerce</p>
                </div>
                <div className="sign_form">
                    <form method="POST">
                        <h1>Sign In</h1>
                        <div className="form_data">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" onChange={adddata} value={logdata.email} id="email" />
                        </div>
                        <div className="form_data">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={adddata}
                                value={logdata.password}
                                id="password"
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <button type="submit" className="signin_btn" onClick={senddata}>
                            Continue
                        </button>
                    </form>
                    <ToastContainer />
                </div>
                <div className="create_accountinfo">
                    <p>New here?</p>
                    <button>
                        <NavLink to="/signup">Create your account</NavLink>
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Sign_in;
