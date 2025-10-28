import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Button, Modal, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';
import api from '../services/api';

function Orders() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();

    // Listen to realtime order status updates
    const socket = getSocket();
    if (socket) {
      socket.on('order_status_updated', (data) => {
        setToastMessage(`Đơn hàng ${data.orderNumber} đã cập nhật trạng thái: ${getStatusText(data.status)}`);
        setShowToast(true);
        fetchOrders(); // Refresh orders list
      });
    }

    return () => {
      if (socket) {
        socket.off('order_status_updated');
      }
    };
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setShowModal(true);
      }
    } catch (err) {
      alert('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

    try {
      const response = await api.delete(`/orders/${orderId}`);
      if (response.data.success) {
        alert('Đã hủy đơn hàng');
        fetchOrders();
        setShowModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể hủy đơn hàng');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { bg: 'warning', text: 'Chờ xác nhận' },
      confirmed: { bg: 'info', text: 'Đã xác nhận' },
      shipping: { bg: 'primary', text: 'Đang giao' },
      completed: { bg: 'success', text: 'Hoàn thành' },
      cancelled: { bg: 'danger', text: 'Đã hủy' }
    };
    const s = statusMap[status] || { bg: 'secondary', text: status };
    return <Badge bg={s.bg}>{s.text}</Badge>;
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
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
      <Container className="py-4">
        <h2 className="mb-4">Đơn hàng của tôi</h2>

        {orders.length === 0 ? (
          <Alert variant="info">Bạn chưa có đơn hàng nào</Alert>
        ) : (
          <Table responsive hover>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td><strong>{order.orderNumber}</strong></td>
                  <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td><strong>{order.totalAmount.toLocaleString('vi-VN')}₫</strong></td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => fetchOrderDetails(order._id)}
                    >
                      Chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Container>

      {/* Order Detail Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng {selectedOrder?.orderNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <div className="mb-3">
                <strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="mb-3">
                <strong>Địa chỉ giao hàng:</strong><br />
                {selectedOrder.shippingAddress?.fullName} - {selectedOrder.shippingAddress?.phone}<br />
                {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.ward}, 
                {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}
              </div>
              <div className="mb-3">
                <strong>Phương thức thanh toán:</strong> {selectedOrder.paymentMethod}
              </div>
              
              <h6>Sản phẩm:</h6>
              <Table>
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item._id}>
                      <td>{item.product?.name}</td>
                      <td>{item.price.toLocaleString('vi-VN')}₫</td>
                      <td>{item.quantity}</td>
                      <td>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              <div className="text-end">
                <h5>Tổng cộng: <span className="text-danger">{selectedOrder.totalAmount.toLocaleString('vi-VN')}₫</span></h5>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedOrder?.status === 'pending' && (
            <Button variant="danger" onClick={() => handleCancelOrder(selectedOrder._id)}>
              Hủy đơn hàng
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={5000} autohide>
          <Toast.Header>
            <strong className="me-auto">🔔 Thông báo đơn hàng</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Orders;

