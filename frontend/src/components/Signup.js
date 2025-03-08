import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  // Validate username length in real time
  useEffect(() => {
    if (form.username && form.username.length < 8) {
      setErrors(prev => ({ ...prev, username: 'Username must be at least 8 characters long' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.username;
        return newErrors;
      });
    }
  }, [form.username]);

  // Check password strength as user types
  useEffect(() => {
    if (form.password) {
      let strength = 0;
      if (form.password.length >= 8) strength += 1;
      if (/[a-z]/.test(form.password)) strength += 1;
      if (/[A-Z]/.test(form.password)) strength += 1;
      if (/[0-9]/.test(form.password)) strength += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) strength += 1;
      
      if (strength <= 2) {
        setPasswordStrength('Weak');
      } else if (strength === 3 || strength === 4) {
        setPasswordStrength('Medium');
      } else {
        setPasswordStrength('Strong');
      }
    } else {
      setPasswordStrength('');
    }
  }, [form.password]);

  // Validate that Confirm Password matches Password in real time
  useEffect(() => {
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [form.password, form.confirmPassword]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.username) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setGeneralError('');
    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setGeneralError(data.message || 'Signup failed');
      } else {
        alert(data.message);
        // After successful signup, redirect to login page after 2 seconds
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setGeneralError('Server error. Please try again later.');
    }
  };

  return (
    <div className="signup-container">
      <h2>Signup</h2>
      {generalError && <div className="general-error">{generalError}</div>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            name="username" 
            value={form.username} 
            onChange={handleChange}
          />
          {errors.username && <div className="error">{errors.username}</div>}
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            name="password" 
            value={form.password} 
            onChange={handleChange}
          />
          {errors.password && <div className="error">{errors.password}</div>}
          {passwordStrength && <div>Password Strength: {passwordStrength}</div>}
        </div>
        <div>
          <label>Confirm Password:</label>
          <input 
            type="password" 
            name="confirmPassword" 
            value={form.confirmPassword} 
            onChange={handleChange}
          />
          {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Signup;
