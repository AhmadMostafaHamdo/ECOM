import { Divider } from "@mui/material";
import React, { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { Logincontext } from "../context/Contextprovider";
import "./signup.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiUrl } from "../../api";
import { useHistory } from "react-router-dom";
const Signup = () => {
    const history = useHistory();
    const { setAccount } = useContext(Logincontext);
    const [udata, setUdata] = useState({
        fname: "",
        email: "",
        mobile: "",
        password: "",
        cpassword: ""
    });

    const adddata = (e) => {
        const { name, value } = e.target;
        setUdata((pre) => ({
            ...pre,
            [name]: value
        }));
    };

    const senddata = async (e) => {
        e.preventDefault();

        const { fname, email, mobile, password, cpassword } = udata;
        try {
            const res = await fetch(apiUrl("/register"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    fname,
                    email,
                    mobile,
                    password,
                    cpassword
                })
            });

            const data = await res.json();

            if (res.status === 422 || !data) {
                toast.error(data.error, {
                    position: "top-center"
                });
            } else {
                setAccount(data);
                setUdata({
                    fname: "",
                    email: "",
                    mobile: "",
                    password: "",
                    cpassword: ""
                });
                toast.success("Registration completed successfully.", {
                    position: "top-center"
                });
                setTimeout(() => history.push("/"), 300);
            }
        } catch (error) {
            console.log("Signup error:", error.message);
        }
    };

    return (
        <section className="auth_page">
            <div className="sign_container">
                <div className="sign_header">
                    <img src="./blacklogoamazon.png" alt="signup logo" />
                    <p>Create your Studio Commerce account</p>
                </div>
                <div className="sign_form">
                    <form method="POST">
                        <h1>Create account</h1>
                        <div className="form_data">
                            <label htmlFor="name">Your name</label>
                            <input type="text" name="fname" onChange={adddata} value={udata.fname} id="name" />
                        </div>
                        <div className="form_data">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" onChange={adddata} value={udata.email} id="email" />
                        </div>
                        <div className="form_data">
                            <label htmlFor="mobile">Mobile number</label>
                            <input type="number" name="mobile" onChange={adddata} value={udata.mobile} id="mobile" />
                        </div>
                        <div className="form_data">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                onChange={adddata}
                                value={udata.password}
                                id="password"
                                placeholder="At least 6 characters"
                            />
                        </div>
                        <div className="form_data">
                            <label htmlFor="passwordg">Confirm password</label>
                            <input type="password" name="cpassword" onChange={adddata} value={udata.cpassword} id="passwordg" />
                        </div>
                        <button type="submit" className="signin_btn" onClick={senddata}>
                            Continue
                        </button>

                        <Divider />

                        <div className="signin_info">
                            <p>Already have an account?</p>
                            <NavLink to="/login">Sign in</NavLink>
                        </div>
                    </form>
                </div>
                <ToastContainer />
            </div>
        </section>
    );
};

export default Signup;
