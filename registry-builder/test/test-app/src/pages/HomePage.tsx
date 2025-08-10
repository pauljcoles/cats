import React from 'react';

export const HomePage: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      
      {/* Navigation elements */}
      <nav>
        <button data-testid="menu-btn">Menu</button>
        <input data-testid="search-input" type="search" placeholder="Search..." />
        <button data-testid="search-btn">Search</button>
      </nav>
      
      {/* Main content */}
      <main>
        <button>Get Started</button>
        <button>Learn More</button>
        <a href="/products">View Products</a>
        <a href="/about">About Us</a>
      </main>
      
      {/* Footer elements */}
      <footer>
        <select aria-label="Country">
          <option value="us">United States</option>
          <option value="ca">Canada</option>
        </select>
        <button>Subscribe</button>
      </footer>
    </div>
  );
};
