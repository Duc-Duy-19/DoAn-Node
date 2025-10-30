import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Cart() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated, authLoading]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/carts');
      if (response.data.success && response.data.data.length > 0) {
        setCart(response.data.data[0]); // Get first cart
      } else {
        setCart({ items: [] });
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await api.put(`/carts/update/${productId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    try {
      await api.delete(`/carts/remove/${productId}`);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể xóa sản phẩm');
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>Giỏ hàng trống</h3>
        <p className="text-muted">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <Button as={Link} to="/products" variant="primary">
          Tiếp tục mua sắm
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Giỏ hàng của bạn</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Table responsive>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {cart.items.map((item) => (
            <tr key={item._id}>
              <td>
                <div className="d-flex align-items-center">
                  <img
                    src={item.product?.imageURLs?.[0] || 'https://via.placeholder.com/80'}
                    alt={item.product?.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                    className="rounded me-3"
                  />
                  <div>
                    <Link to={`/products/${item.product?._id}`} className="text-decoration-none">
                      {item.product?.name || 'Unknown'}
                    </Link>
                    <br />
                    <small className="text-muted">
                      Còn {item.product?.stock} sản phẩm
                    </small>
                  </div>
                </div>
              </td>
              <td>{item.price.toLocaleString('vi-VN')}₫</td>
              <td>
                <Form.Control
                  type="number"
                  min="1"
                  max={item.product?.stock}
                  value={item.quantity}
                  onChange={(e) => handleUpdateQuantity(item.product._id, parseInt(e.target.value))}
                  style={{ width: '80px' }}
                />
              </td>
              <td>
                <strong>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</strong>
              </td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveItem(item.product._id)}
                >
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end">
        <h4>
          Tổng cộng: <span className="text-danger">{calculateTotal().toLocaleString('vi-VN')}₫</span>
        </h4>
        <Button variant="primary" size="lg" as={Link} to="/checkout" className="mt-3">
          Tiến hành thanh toán
        </Button>
      </div>
    </Container>
  );
}

export default Cart;

