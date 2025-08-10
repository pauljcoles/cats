import React from 'react';

export const CheckoutPage: React.FC = () => {
  return (
    <div>
      <h1>Checkout Page</h1>
      
      {/* Shipping form */}
      <form data-testid="shipping-form">
        <h2>Shipping Information</h2>
        <input data-testid="first-name" type="text" placeholder="First Name" />
        <input data-testid="last-name" type="text" placeholder="Last Name" />
        <input data-testid="address" type="text" placeholder="Address" />
        <input data-testid="city" type="text" placeholder="City" />
        
        <select data-testid="state-select" aria-label="State">
          <option value="ca">California</option>
          <option value="ny">New York</option>
        </select>
        
        <input data-testid="zip-code" type="text" placeholder="ZIP Code" />
      </form>
      
      {/* Payment form */}
      <form data-testid="payment-form">
        <h2>Payment Information</h2>
        <input data-testid="card-number" type="text" placeholder="Card Number" />
        <input data-testid="expiry" type="text" placeholder="MM/YY" />
        <input data-testid="cvv" type="text" placeholder="CVV" />
      </form>
      
      {/* Actions */}
      <div>
        <button data-testid="place-order">Place Order</button>
        <button type="button">Back to Cart</button>
        <a href="/cart">Edit Cart</a>
      </div>
    </div>
  );
};
