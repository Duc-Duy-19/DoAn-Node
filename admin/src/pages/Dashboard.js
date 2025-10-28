import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Toast, ToastContainer, Button } from 'react-bootstrap';
import { getSocket } from '../services/socket';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastTitle, setToastTitle] = useState('');

  useEffect(() => {
    fetchStats();

    // Listen to realtime events
    const socket = getSocket();
    if (socket) {
      socket.on('order_created', (data) => {
        setToastTitle('🎉 Đơn hàng mới!');
        setToastMessage(`${data.user} đã đặt đơn hàng ${data.orderNumber} - ${data.totalAmount.toLocaleString('vi-VN')}₫`);
        setShowToast(true);
        fetchStats(); // Refresh stats
        
        // Play sound (optional)
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZRQ0PVKzn77BdGAg+lt7xwW0iBS+Bzv');
        audio.play().catch(() => {});
      });

      socket.on('new_review', (data) => {
        setToastTitle('⭐ Đánh giá mới');
        setToastMessage(`${data.username} đã đánh giá ${data.productName} - ${data.rating}⭐`);
        setShowToast(true);
      });
    }

    return () => {
      if (socket) {
        socket.off('order_created');
        socket.off('new_review');
      }
    };
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        api.get('/products'),
        api.get('/orders'),
        api.get('/users')
      ]);

      const products = productsRes.data.success ? productsRes.data.data.length : 0;
      const orders = ordersRes.data.success ? ordersRes.data.data : [];
      const users = usersRes.data.success ? usersRes.data.data.length : 0;
      
      const revenue = orders.reduce((sum, order) => {
        if (order.status !== 'cancelled') {
          return sum + order.totalAmount;
        }
        return sum;
      }, 0);

      setStats({
        totalProducts: products,
        totalOrders: orders.length,
        totalUsers: users,
        totalRevenue: revenue
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <>
      <Container fluid className="py-4">
        <h2 className="mb-4">📊 Dashboard - Tổng quan hệ thống</h2>

        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Card.Body>
                <div style={{ fontSize: '48px' }}>🛍️</div>
                <h2 className="mb-0">{stats.totalProducts}</h2>
                <p className="mb-0">Sản phẩm</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <Card.Body>
                <div style={{ fontSize: '48px' }}>📦</div>
                <h2 className="mb-0">{stats.totalOrders}</h2>
                <p className="mb-0">Đơn hàng</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <Card.Body>
                <div style={{ fontSize: '48px' }}>👥</div>
                <h2 className="mb-0">{stats.totalUsers}</h2>
                <p className="mb-0">Người dùng</p>
              </Card.Body>
            </Card>
          </Col>

          <Col md={3} className="mb-3">
            <Card className="text-center shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <Card.Body>
                <div style={{ fontSize: '48px' }}>💰</div>
                <h2 className="mb-0">{(stats.totalRevenue / 1000000).toFixed(1)}M</h2>
                <p className="mb-0">Doanh thu (₫)</p>
                <small>{stats.totalRevenue.toLocaleString('vi-VN')}₫</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Notifications & Quick Links */}
        <Row className="mb-4">
          <Col md={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">🔔 Thông báo Realtime</h5>
                <Alert variant="success" className="mb-2">
                  <strong>✅ Đã kết nối:</strong> Bạn sẽ nhận thông báo ngay khi có đơn hàng mới hoặc đánh giá mới.
                </Alert>
                <Alert variant="info" className="mb-0">
                  <strong>ℹ️ Tính năng:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Thông báo đơn hàng mới realtime</li>
                    <li>Thông báo review mới</li>
                    <li>Âm thanh cảnh báo khi có đơn hàng</li>
                    <li>Badge hiển thị số lượng thông báo</li>
                  </ul>
                </Alert>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">⚡ Truy cập nhanh</h5>
                <div className="d-grid gap-2">
                  <Button variant="outline-primary" href="/products">
                    🛍️ Quản lý sản phẩm
                  </Button>
                  <Button variant="outline-success" href="/orders">
                    📦 Quản lý đơn hàng
                  </Button>
                  <Button variant="outline-info" href="/users">
                    👥 Quản lý người dùng
                  </Button>
                  <Button variant="outline-warning" href="/categories">
                    📂 Quản lý danh mục
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* System Info */}
        <Row>
          <Col md={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <h5 className="mb-3">💡 Hướng dẫn sử dụng</h5>
                <Row>
                  <Col md={6}>
                    <h6>🎯 Quản lý sản phẩm:</h6>
                    <ul>
                      <li>Thêm sản phẩm mới với upload ảnh</li>
                      <li>Chỉnh sửa thông tin & giá</li>
                      <li>Quản lý tồn kho</li>
                      <li>Xóa sản phẩm (soft delete)</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h6>📦 Quản lý đơn hàng:</h6>
                    <ul>
                      <li>Xem chi tiết đơn hàng</li>
                      <li>Cập nhật trạng thái (pending → confirmed → shipping → completed)</li>
                      <li>Khách hàng nhận thông báo realtime</li>
                      <li>Theo dõi doanh thu</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={10000} autohide>
          <Toast.Header>
            <strong className="me-auto">{toastTitle}</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Dashboard;

