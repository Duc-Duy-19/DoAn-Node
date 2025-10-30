import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Checkout() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [addressesRes, cartRes] = await Promise.all([
        api.get('/addresses'),
        api.get('/carts')
      ]);

      if (addressesRes.data.success) {
        setAddresses(addressesRes.data.data);
        // Auto select default address
        const defaultAddr = addressesRes.data.data.find(a => a.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr._id);
        }
      }

      if (cartRes.data.success && cartRes.data.data.length > 0) {
        setCart(cartRes.data.data[0]);
      }
    } catch (err) {
      setError('Không thể tải dữ liệu');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert('Giỏ hàng trống');
      return;
    }

    setProcessing(true);
    setError('');

    try {
      const response = await api.post('/orders', {
        shippingAddressId: selectedAddress,
        paymentMethod: paymentMethod
      });

      if (response.data.success) {
        setOrderNumber(response.data.data.orderNumber);
        setShowModal(true);
      }
    } catch (err) {
      setError(err.response?.data?.data || 'Không thể tạo đơn hàng');
    } finally {
      setProcessing(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/orders');
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
        <Alert variant="warning">Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán.</Alert>
        <Button onClick={() => navigate('/products')}>Tiếp tục mua sắm</Button>
      </Container>
    );
  }

  return (
    <>
      <Container className="py-4">
        <h2 className="mb-4">Thanh toán</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Row>
          {/* Address Selection */}
          <Col md={8}>
            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">Địa chỉ giao hàng</h5>
                {addresses.length === 0 ? (
                  <Alert variant="warning">
                    Bạn chưa có địa chỉ nào. 
                    <Button variant="link" onClick={() => navigate('/addresses')}>
                      Thêm địa chỉ mới
                    </Button>
                  </Alert>
                ) : (
                  <Form>
                    {addresses.map(address => (
                      <Form.Check
                        key={address._id}
                        type="radio"
                        name="address"
                        id={`address-${address._id}`}
                        label={
                          <div>
                            <strong>{address.fullName}</strong> - {address.phone}
                            <br />
                            {address.detailAddress}, {address.ward}, {address.district}, {address.province}
                            {address.isDefault && <Badge bg="primary" className="ms-2">Mặc định</Badge>}
                          </div>
                        }
                        checked={selectedAddress === address._id}
                        onChange={() => setSelectedAddress(address._id)}
                        className="mb-3"
                      />
                    ))}
                  </Form>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Body>
                <h5 className="mb-3">Phương thức thanh toán</h5>
                <Form>
                  <Form.Check
                    type="radio"
                    label="💵 Thanh toán khi nhận hàng (COD)"
                    name="payment"
                    value="COD"
                    checked={paymentMethod === 'COD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    label="🏦 Chuyển khoản ngân hàng"
                    name="payment"
                    value="bank_transfer"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mb-2"
                  />
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary */}
          <Col md={4}>
            <Card>
              <Card.Body>
                <h5 className="mb-3">Tóm tắt đơn hàng</h5>
                {cart.items.map(item => (
                  <div key={item._id} className="d-flex justify-content-between mb-2">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <strong>Tổng cộng:</strong>
                  <strong className="text-danger">{calculateTotal().toLocaleString('vi-VN')}₫</strong>
                </div>
                <Button
                  variant="primary"
                  className="w-100"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={processing || !selectedAddress}
                >
                  {processing ? 'Đang xử lý...' : 'Đặt hàng'}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Success Modal */}
      <Modal show={showModal} onHide={handleModalClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Đặt hàng thành công!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center">
            <div className="mb-3" style={{ fontSize: '48px' }}>✅</div>
            <p>Đơn hàng của bạn đã được tạo thành công!</p>
            <p><strong>Mã đơn hàng: {orderNumber}</strong></p>
            <p className="text-muted">Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.</p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleModalClose}>
            Xem đơn hàng
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Checkout;

