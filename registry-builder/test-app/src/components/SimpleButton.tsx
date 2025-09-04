import React from 'react';

export const SimpleButton: React.FC = () => {
  return (
    <div className="simple-button-demo">
      {/* Clear button with text */}
      <button 
        data-testid="clear-button"
        aria-label="Clear form data"
        onClick={() => {}}
      >
        Clear Form
      </button>
      
      {/* Link with role */}
      <a 
        href="/help"
        role="button"
        aria-label="Get help with this form"
        data-testid="help-link"
      >
        Help
      </a>
      
      {/* Input with placeholder */}
      <input
        type="text"
        placeholder="Enter your search term"
        aria-label="Search input"
        data-testid="search-input"
      />
      
      {/* Image with alt text */}
      <img 
        src="/logo.png"
        alt="Company Logo"
        title="Our Company"
        data-testid="company-logo"
      />
      
      {/* Select with role */}
      <select 
        aria-label="Choose your country"
        data-testid="country-select"
      >
        <option value="">Select Country</option>
        <option value="us">United States</option>
        <option value="uk">United Kingdom</option>
      </select>
    </div>
  );
};