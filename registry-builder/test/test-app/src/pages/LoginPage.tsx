import React from 'react';

export const LoginPage: React.FC = () => {
  return (
    <div>
      <h1>Login Page</h1>
      
      {/* Login form elements */}
      <form>
        <input data-testid="username-input" type="text" placeholder="Username" />
        <input data-testid="password-input" type="password" placeholder="Password" />
        <button data-testid="login-btn">Login</button>
        <button type="button">Forgot Password</button>
      </form>
      
      {/* Additional elements */}
      <a href="/register">Create Account</a>
      <select aria-label="Language">
        <option value="en">English</option>
        <option value="es">Spanish</option>
      </select>
      
      <div>
        <input type="checkbox" id="remember" />
        <label htmlFor="remember">Remember me</label>
      </div>
    </div>
  );
};
