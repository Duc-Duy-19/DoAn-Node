import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge, Form, Card, Alert, Spinner, Toast, ToastContainer } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function ProductDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`)
      ]);

      if (productRes.data.success) {
        setProduct(productRes.data.data);
      }
      if (reviewsRes.data.success) {
        setReviews(reviewsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await api.post('/carts/add', {
        productId: id,
        quantity: quantity
      });

      if (response.data.success) {
        setToastMessage('Đã thêm vào giỏ hàng!');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage(err.response?.data?.data || 'Không thể thêm vào giỏ hàng');
      setShowToast(true);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Không tìm thấy sản phẩm</Alert>
      </Container>
    );
  }

  const mainImage = product.imageURLs && product.imageURLs.length > 0
    ? product.imageURLs[0]
    : 'https://via.placeholder.com/500x500?text=No+Image';

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  return (
    <>
      <Container className="py-4">
        <Row>
          {/* Product Images */}
          <Col md={6} className="mb-4">
            <img
              src={mainImage}
              alt={product.name}
              className="img-fluid rounded"
              style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=No+Image';
              }}
            />
          </Col>

          {/* Product Info */}
          <Col md={6}>
            <h2>{product.name}</h2>
            <div className="mb-3">
              <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
                {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
              </Badge>
              <span className="ms-2">
                ⭐ {avgRating} ({reviews.length} đánh giá)
              </span>
            </div>

            <h3 className="text-danger mb-4">
              {product.price.toLocaleString('vi-VN')}₫
            </h3>

            <div className="mb-4">
              <h5>Mô tả sản phẩm</h5>
              <p className="text-muted">
                {product.description || 'Không có mô tả'}
              </p>
            </div>

            {product.category && (
              <p>
                <strong>Danh mục:</strong> {product.category.name}
              </p>
            )}

            {product.stock > 0 && (
              <div className="mb-3">
                <Form.Label>Số lượng:</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ width: '100px' }}
                />
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-100"
              disabled={product.stock === 0}
              onClick={handleAddToCart}
            >
              {product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </Button>
          </Col>
        </Row>

        {/* Reviews Section */}
        <Row className="mt-5">
          <Col>
            <h4 className="mb-3">Đánh giá sản phẩm ({reviews.length})</h4>
            {reviews.length === 0 ? (
              <Alert variant="info">Chưa có đánh giá nào</Alert>
            ) : (
              reviews.map(review => (
                <Card key={review._id} className="mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <strong>{review.user?.username}</strong>
                      <span>{'⭐'.repeat(review.rating)}</span>
                    </div>
                    <p className="text-muted small mb-2">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="mb-0">{review.comment}</p>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>
      </Container>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default ProductDetail;

