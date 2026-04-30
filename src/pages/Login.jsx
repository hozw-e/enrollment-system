import { useState } from 'react';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import ellipse1 from '../assets/ellipse1.png';
import ellipse2 from '../assets/ellipse2.png';
import { FaUserCircle, FaLock } from 'react-icons/fa';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [error, setError]                 = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (username === 'S2026001' && password === 'student123') {
      sessionStorage.setItem('user', JSON.stringify({ role: 'student', username, name: 'Juan Dela Cruz' }));
      navigate('/studentDashboard');
    } else if (username === 'admin001' && password === 'admin123') {
      sessionStorage.setItem('user', JSON.stringify({ role: 'admin', username, name: 'Maria Santos' }));
      navigate('/adminRecords');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="loginPage">

      {/* Background blobs */}
      <img src={ellipse2} className="loginBlob loginBlobLeft1" alt="" />
      <img src={ellipse1} className="loginBlob loginBlobLeft2" alt="" />
      <img src={ellipse2} className="loginBlob loginBlobLeft3" alt="" />
      <img src={ellipse1} className="loginBlob loginBlobRight1" alt="" />
      <img src={ellipse2} className="loginBlob loginBlobRight2" alt="" />
      <img src={ellipse1} className="loginBlob loginBlobRight3" alt="" />

      {/* Card */}
      <div className="loginCard">

        <img src={logo} alt="University Logo" className="loginLogo" />
        <h2 className="loginTitle">USER PORTAL</h2>

        <form onSubmit={handleSubmit} className="loginForm">

          <div className="loginInputWrapper">
            <FaUserCircle className="loginInputIcon" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="loginInput"
              required
            />
          </div>

          <div className="loginInputWrapper">
            <FaLock className="loginInputIcon" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="loginInput"
              required
            />
            <button
              type="button"
              className="loginTogglePassword"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>

          {error && <p className="loginErrorMsg">{error}</p>}

          <button type="submit" className="loginBtn">
            Log in
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;