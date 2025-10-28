import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';

function Home() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, productsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);

      if (categoriesRes.data.success) {
        setCategories(categoriesRes.data.data);
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data.slice(0, 8)); // Hiển thị 8 sản phẩm đầu
      }
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang tải...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-5">
          <h3 className="mb-3">Danh mục</h3>
          <Row>
            {categories.slice(0, 6).map(category => (
              <Col key={category._id} xs={6} md={4} lg={2} className="mb-3">
                <Link 
                  to={`/products?category=${category._id}`}
                  className="text-decoration-none"
                >
                  <div className="text-center p-3 border rounded hover-shadow" style={{ cursor: 'pointer' }}>
                    {category.imageURL ? (
                      <img 
                        src={category.imageURL} 
                        alt={category.name}
                        style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                        className="rounded-circle mb-2"
                      />
                    ) : (
                      <div 
                        className="bg-secondary rounded-circle mx-auto mb-2"
                        style={{ width: '60px', height: '60px' }}
                      />
                    )}
                    <small className="text-dark">{category.name}</small>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </section>
      )}

      {/* Featured Products */}
      <section>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>Sản phẩm nổi bật</h3>
          <Button variant="outline-primary" as={Link} to="/products">
            Xem tất cả
          </Button>
        </div>
        <Row>
          {products.map(product => (
            <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
        </Row>
      </section>
    </Container>
  );
}

export default Home;

