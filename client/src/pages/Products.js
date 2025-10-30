import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Alert, Button } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Build unified endpoint with query params
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      const qParam = searchParams.get('search') || '';
      if (qParam) params.q = qParam;

      const response = await api.get('/products', { params });
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    const q = searchParams.get('search');
    if (categoryId && q) setSearchParams({ category: categoryId, search: q });
    else if (categoryId) setSearchParams({ category: categoryId });
    else if (q) setSearchParams({ search: q });
    else setSearchParams({});
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Sản phẩm</h2>
      
      <Row>
        {/* Sidebar Filter */}
        <Col md={3} className="mb-4">
          <div className="bg-light p-3 rounded">
            <h5 className="mb-3">Danh mục</h5>
            <Form>
              <Form.Check 
                type="radio"
                label="Tất cả"
                name="category"
                checked={selectedCategory === ''}
                onChange={() => handleCategoryChange('')}
                className="mb-2"
              />
              {categories.map(category => (
                <Form.Check 
                  key={category._id}
                  type="radio"
                  label={category.name}
                  name="category"
                  checked={selectedCategory === category._id}
                  onChange={() => handleCategoryChange(category._id)}
                  className="mb-2"
                />
              ))}
            </Form>
          </div>
        </Col>

        {/* Products Grid */}
        <Col md={9}>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Đang tải sản phẩm...</p>
            </div>
          ) : error ? (
            <Alert variant="danger">{error}</Alert>
          ) : products.length === 0 ? (
            <Alert variant="info">Không có sản phẩm nào</Alert>
          ) : (
            <>
              <p className="text-muted mb-3">
                {searchParams.get('search') ? (
                  <>Tìm thấy {products.length} sản phẩm cho "{searchParams.get('search')}"</>
                ) : (
                  <>Tìm thấy {products.length} sản phẩm</>
                )}
              </p>
              <Row>
                {products.map(product => (
                  <Col key={product._id} xs={12} sm={6} lg={4} className="mb-4">
                    <ProductCard product={product} />
                  </Col>
                ))}
              </Row>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Products;

