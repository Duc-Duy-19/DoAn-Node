import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Badge } from 'react-bootstrap';
import api from '../services/api';

function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      if (response.data.success) setOrders(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`);
      if (response.data.success) {
        setSelectedOrder(response.data.data);
        setNewStatus(response.data.data.status);
        setShowModal(true);
      }
    } catch (err) {
      alert('Không thể tải chi tiết đơn hàng');
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await api.put(`/orders/${selectedOrder._id}/status`, { status: newStatus });
      alert('Đã cập nhật trạng thái đơn hàng');
      fetchOrders();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể cập nhật');
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'warning', confirmed: 'info', shipping: 'primary',
      completed: 'success', cancelled: 'danger'
    };
    return <Badge bg={map[status] || 'secondary'}>{status}</Badge>;
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <>
      <Container fluid className="py-4">
        <h2 className="mb-4">Quản lý đơn hàng</h2>
        <Table responsive hover striped>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
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
                <td>{order.user?.username}</td>
                <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{order.totalAmount.toLocaleString('vi-VN')}₫</td>
                <td>{statusBadge(order.status)}</td>
                <td>
                  <Button size="sm" variant="outline-primary" onClick={() => handleViewOrder(order._id)}>
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Đơn hàng {selectedOrder?.orderNumber}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <p><strong>Khách hàng:</strong> {selectedOrder.user?.username} ({selectedOrder.user?.email})</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress?.detailAddress}, {selectedOrder.shippingAddress?.ward}, {selectedOrder.shippingAddress?.district}, {selectedOrder.shippingAddress?.province}</p>
              <p><strong>SĐT:</strong> {selectedOrder.shippingAddress?.phone}</p>
              
              <h6 className="mt-3">Sản phẩm:</h6>
              <Table size="sm">
                <thead><tr><th>Sản phẩm</th><th>Giá</th><th>SL</th><th>Tổng</th></tr></thead>
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
              <h5 className="text-end">Tổng: {selectedOrder.totalAmount.toLocaleString('vi-VN')}₫</h5>

              <Form.Group className="mt-3">
                <Form.Label>Cập nhật trạng thái:</Form.Label>
                <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="confirmed">Đã xác nhận</option>
                  <option value="shipping">Đang giao</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="cancelled">Đã hủy</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
          <Button variant="primary" onClick={handleUpdateStatus}>Cập nhật trạng thái</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Orders;

