import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.post('/auth/forgotpassword', { email });
      if (response.data.success) {
        setSuccess('Email khôi phục mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư.');
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.data || 'Không thể gửi email khôi phục');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-4">
          <Card>
            <Card.Body className="p-4">
              <h3 className="text-center mb-4">Quên mật khẩu</h3>
              <p className="text-muted text-center mb-4">
                Nhập email của bạn để nhận link khôi phục mật khẩu
              </p>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-decoration-none">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
}

export default ForgotPassword;

