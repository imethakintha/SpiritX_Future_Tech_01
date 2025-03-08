import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function Landing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    if (location.state && location.state.username) {
      setUsername(location.state.username);
    } else {
      fetch('http://localhost:5000/api/user', {
        credentials: 'include'
      })
      .then(res => res.json())
      .then(data => {
        if (data.username) {
          setUsername(data.username);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
    }
  }, [location, navigate]);

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <div className="landing-container">
      <h2>Hello, {username}!</h2>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Landing;
