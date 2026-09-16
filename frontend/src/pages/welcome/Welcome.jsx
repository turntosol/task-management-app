import React from 'react'
import { Link } from 'react-router-dom'
import './welcome.scss'

const Welcome = () => {
  return (
    <div className="welcome">
        <div className="right">
            <img 
                src="https://res.cloudinary.com/decumd3lu/image/upload/v1787952696/duck_enbmod.jpg" 
                alt="Welcome to the productivity app" 
            />
        </div>
        <div className="left">
            <div className="wrapper">
                <h1>Productive Mind</h1>
                <p className="body">
                    Organize your tasks, manage your time, and boost your productivity
                    with our intuitive interface 
                </p>
                <button className='btn'>
                    <Link to="/register" style={{ textDecoration: "none", color: "black" }}>Get Started</Link>
                </button>
                <p>
                    Already have an account?
                    <span 
                        style={{ 
                            color: "#007bff",
                            cursor: "pointer",
                            textDecoration: "none",
                            marginLeft: "5px",
                     }}>
                        <Link to="/login" style={{ textDecoration: "none" }}>Log In</Link>
                    </span>
                </p>
            </div>
        </div>
    </div>
  )
}

export default Welcome
