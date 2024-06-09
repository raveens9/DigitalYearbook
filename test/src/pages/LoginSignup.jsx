import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../APIs/AuthContext';
import './LoginSignup.css';
import User_icon from '../contents/Assets/images/User.png'
import Lock_icon from '../contents/Assets/images/Lock.jpg';
import Mail_icon from '../contents/Assets/images/Mail.jpg';
import { signUp, login } from '../APIs/auth';

export const LoginSignup = () => {
  const [action, setAction] = useState("Sign Up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async () => {
    try {
      await signUp(email, password, name); // Pass name to signUp function
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogin = async () => {
    try {
      await login(email, password);
      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className='container'>
      <div className='header'>
        <div className='text'>{action}</div>
      </div>
      <div className='inputs'>
        <div className='input'> {/* Always render the name input */}
          <img src={User_icon} alt="" className='icon' />
          <input
            type="text"
            className='input-box'
            placeholder='Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className='input'>
          <img src={Mail_icon} alt="" className='icon' />
          <input
            type="email"
            className='input-box'
            placeholder='Email address'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className='input'>
          <img src={Lock_icon} alt="" className='icon' />
          <input
            type="password"
            className='input-box'
            placeholder='Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      {error && <div className='error'>{error}</div>}
      {action === 'Sign Up' ? <div /> :
        <div className='forgotPassword'>
          Forgot Password?<span> Click here!</span>
        </div>}
      <div className="submit_container">
        <div
          className={action === 'Login' ? "submit gray" : "submit"}
          onClick={() => {
            setAction("Sign Up");
            setError("");
          }}
        >
          Sign Up
        </div>
        <div
          className={action === 'Sign Up' ? "submit gray" : "submit"}
          onClick={() => {
            setAction("Login");
            setError("");
          }}
        >
          Login
        </div>
      </div>
      <div className="submit_container">
        {action === 'Sign Up' ? (
          <div className="submit" onClick={handleSignUp}>Submit</div>
        ) : (
          <div className="submit" onClick={handleLogin}>Submit</div>
        )}
      </div>
    </div>
  );
};
