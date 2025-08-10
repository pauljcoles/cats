import React from 'react';

export const ProductPage: React.FC = () => {
  return (
    <div>
      <h1>Product Page</h1>
      
      {/* Product details */}
      <div>
        <button data-testid="add-to-cart">Add to Cart</button>
        <button data-testid="buy-now">Buy Now</button>
        <button>Add to Wishlist</button>
      </div>
      
      {/* Product options */}
      <form>
        <select data-testid="size-select" aria-label="Size">
          <option value="s">Small</option>
          <option value="m">Medium</option>
          <option value="l">Large</option>
        </select>
        
        <select data-testid="color-select" aria-label="Color">
          <option value="red">Red</option>
          <option value="blue">Blue</option>
        </select>
        
        <input data-testid="quantity-input" type="number" min="1" value="1" />
      </form>
      
      {/* Reviews */}
      <div>
        <button>Write Review</button>
        <a href="#reviews">View All Reviews</a>
      </div>
    </div>
  );
};
