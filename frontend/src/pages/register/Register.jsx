import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
    createUserWithEmailAndPassword,
    updateProfile,
} from "firebase/auth";
import { auth } from '../../firebase/config';

import './register.scss'

const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
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
            username,
            email,
            password,
            confirmPassword,
        } = formData;

        if (password !== confirmPassword) {
            setError("Password do not match");
            return;
        }

        try {
            setError("");
            setLoading(true);

            const userCredential =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                );

            const user = userCredential.user;

            await updateProfile(user, {
                displayName: username,
            });

            navigate("/login");

        } catch (error) {
            console.error(error);

            switch (error.code) {
                case "auth/email-already-in-use":
                    setError("Email is already in use.");
                    break;

                case "auth/invalid-email":
                    setError("Invalid email.");
                    break;

                case "auth/weak-password":
                    setError(
                        "Password must be at least 6 characters."
                    );
                    break;

                default:
                    setError(
                        "Registration failed. Please try again."
                    );
            }
        } finally {
            setLoading(false);
        }
    };

  return (
    <div className="register">
        <div className="right">
            <img 
                src="https://res.cloudinary.com/decumd3lu/image/upload/v1787952696/duck_enbmod.jpg" 
                alt="Welcome to our productivity app" 
            />
        </div>
        <div className="left">
            <form onSubmit={handleSubmit}>
                <div className="wrapper">
                    <h1>Sign Up</h1>
                    <p className="body">
                        Organize your tasks, manage your time, and boost your productivity 
                        with our intuitive interface
                    </p>
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button className="btn" type="submit">
                        Sign Up
                    </button>
                    {error && (
                        <div
                        style={{
                            backgroundColor: "#ffe0e0",
                            color: "#d8000c",
                            padding: "12px 16px",
                            border: "1px solid #d8000c",
                            borderRadius: "8px",
                            marginTop: "10px",
                            fontWeight: "500"
                        }}
                        >
                            { error }
                        </div>
                    )}
                    <p style={{ textAlign: "center" }}>
                        Already have an account?{" "}
                        <span style={{ color: "#007bff", cursor: "pointer" }}>
                            {" "}
                             <Link to="/login" style={{ textDecoration: "none" }}>Log In</Link>
                        </span>
                    </p>
                </div>
            </form>
        </div>
    </div>
  )
}

export default Register
