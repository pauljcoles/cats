import React, { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { FormField } from '../components/FormField';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
const SORT_OPTIONS = ['name', 'price', 'category'];

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [cart, setCart] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts([
        { id: '1', name: 'iPhone 14', price: 999, category: 'Electronics', inStock: true },
        { id: '2', name: 'T-Shirt', price: 25, category: 'Clothing', inStock: false },
        { id: '3', name: 'JavaScript Book', price: 45, category: 'Books', inStock: true },
        { id: '4', name: 'Garden Hose', price: 30, category: 'Home & Garden', inStock: true },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const addToCart = (productId: string) => {
    setCart(prev => new Set([...prev, productId]));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = new Set(prev);
      newCart.delete(productId);
      return newCart;
    });
  };

  const isInCart = (productId: string) => cart.has(productId);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price;
      case 'category':
        return a.category.localeCompare(b.category);
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="loading-container">
        {/* Loader spinner */}
        <div 
          className="loading-spinner" 
          data-testid="products-loader"
          role="status"
          aria-label="Loading products"
        >
          <p>Loading products...</p>
        </div>
        
        {/* Skeleton placeholders */}
        <div className="products-skeleton" data-testid="products-skeleton">
          {[1, 2, 3].map(i => (
            <div 
              key={i}
              className="skeleton-card pulse" 
              data-testid={`product-skeleton-${i}`}
              aria-hidden="true"
            >
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page" data-testid="product-list-container">
      <header className="page-header">
        <h1>Our Products</h1>
        <div className="cart-summary" data-testid="cart-summary">
          <span role="status" aria-live="polite">
            Cart: {cart.size} items
          </span>
          <Button 
            variant="secondary" 
            size="sm"
            data-testid="view-cart-btn"
          >
            View Cart
          </Button>
        </div>
      </header>

      <div className="filters-section" data-testid="filters-container">
        <FormField
          label="Search Products"
          type="text"
          name="search"
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by product name..."
        />

        <FormField
          label="Category"
          type="select"
          name="category"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={CATEGORIES}
        />

        <FormField
          label="Sort By"
          type="select"
          name="sortBy"
          value={sortBy}
          onChange={setSortBy}
          options={SORT_OPTIONS}
        />

        <Button
          variant="secondary"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('');
            setSortBy('name');
          }}
          data-testid="clear-filters-btn"
        >
          Clear Filters
        </Button>
      </div>

      <div className="products-grid" data-testid="products-grid" role="region" aria-label="Products">
        {sortedProducts.length === 0 ? (
          <div 
            className="no-products" 
            data-testid="no-products-message"
            role="status"
          >
            <p>No products found matching your criteria.</p>
          </div>
        ) : (
          sortedProducts.map(product => (
            <article 
              key={product.id}
              className="product-card"
              data-testid={`product-card-${product.id}`}
              aria-labelledby={`product-title-${product.id}`}
            >
              <div className="product-info">
                <h3 
                  id={`product-title-${product.id}`}
                  data-testid={`product-title-${product.id}`}
                >
                  {product.name}
                </h3>
                <p 
                  className="product-price"
                  data-testid={`product-price-${product.id}`}
                  aria-label={`Price: $${product.price}`}
                >
                  ${product.price}
                </p>
                <p 
                  className="product-category"
                  data-testid={`product-category-${product.id}`}
                >
                  {product.category}
                </p>
                <div 
                  className={`stock-status ${product.inStock ? 'in-stock' : 'out-of-stock'}`}
                  data-testid={`stock-status-${product.id}`}
                  role="status"
                >
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
              </div>

              <div className="product-actions">
                {product.inStock && !isInCart(product.id) && (
                  <Button
                    variant="primary"
                    onClick={() => addToCart(product.id)}
                    data-testid={`add-to-cart-${product.id}`}
                    aria-label={`Add ${product.name} to cart`}
                  >
                    Add to Cart
                  </Button>
                )}

                {isInCart(product.id) && (
                  <Button
                    variant="danger"
                    onClick={() => removeFromCart(product.id)}
                    data-testid={`remove-from-cart-${product.id}`}
                    aria-label={`Remove ${product.name} from cart`}
                  >
                    Remove from Cart
                  </Button>
                )}

                {!product.inStock && (
                  <Button
                    variant="secondary"
                    disabled
                    data-testid={`notify-restock-${product.id}`}
                    aria-label={`Notify when ${product.name} is back in stock`}
                  >
                    Notify When Available
                  </Button>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};