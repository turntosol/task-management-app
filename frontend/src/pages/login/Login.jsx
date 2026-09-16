import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom';
import {signInWithEmailAndPassword} from "firebase/auth";
import { auth } from "../../firebase/config";

import './login.scss'


const Login = () => {

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const {
            email,
            password,
        } = formData;

        if (
            email.trim() === "" ||
            password.trim() === ""
        ) {
            setError(
                "Please fill in both fields"
            );
            return;
        }

        try {

            setError("");
            setLoading(true);

            const userCredential = await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
            );

            const user = userCredential.user;
            console.log("Firebase User:", user);
            const token = await user.getIdToken();
            console.log("Firebase ID Token:", token);
            navigate("/home");

        } catch (error) {
            console.error(error);
            switch (error.code) {
                case "auth/invalid-credential":
                    setError(
                        "Invalid email or password."
                    );
                    break;

                case "auth/user-not-found":
                    setError(
                        "User not found."
                    );
                    break;

                case "auth/wrong-password":
                    setError(
                        "Incorrect password."
                    );
                    break;

                default:
                    setError(
                        "Login failed. Please try again."
                    );
            }

        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="login">
        <div className="right">
            <img 
                src="https://res.cloudinary.com/decumd3lu/image/upload/v1787952696/duck_enbmod.jpg" 
                alt="Welcome to our productivity app" 
            />
        </div>
        <div className="left">
            <form onSubmit={handleSubmit}>
                <div className="wrapper">
                    <h1>Log In</h1>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        autoComplete="email"
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                    />

                    <button
                        className="btn"
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Log In"}
                    </button>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <p>
                        Don't have an account?{" "}
                        <Link to="/register" style={{ textDecoration: "none" }}>
                            Sign Up
                        </Link>
                    </p>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login
