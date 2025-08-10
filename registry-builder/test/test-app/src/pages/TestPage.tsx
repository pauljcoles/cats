import React from 'react';

export const TestPage: React.FC = () => {
  return (
    <div>
      <h1>Test Page</h1>
      
      {/* Test ID elements - should get highest priority */}
      <button data-testid="submit-btn">Submit Form</button>
      <input data-testid="email-input" type="email" placeholder="Enter email" />
      
      {/* Elements with text content */}
      <button>Add to Cart</button>
      <button>Buy Now</button>
      <a href="/products">View Products</a>
      
      {/* Elements with placeholders */}
      <input type="text" placeholder="Search products..." />
      <input type="password" placeholder="Enter password" />
      
      {/* Elements with aria-label */}
      <button aria-label="Close dialog">×</button>
      <select aria-label="Select country">
        <option>USA</option>
        <option>Canada</option>
      </select>
      
      {/* Elements with name attributes */}
      <input type="text" name="username" />
      <select name="category">
        <option>Electronics</option>
        <option>Books</option>
      </select>
      
      {/* Elements with IDs */}
      <button id="save-button">Save</button>
      <input type="text" id="search-field" />
      
      {/* Generic elements that should get .first() */}
      <button>Generic Button 1</button>
      <button>Generic Button 2</button>
      <input type="text" />
      <select>
        <option>Option 1</option>
      </select>
    </div>
  );
};

export default TestPage;
