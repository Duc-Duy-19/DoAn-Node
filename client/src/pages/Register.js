import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Frontend Validation
    const errors = {};

    if (!formData.username || formData.username.length < 3) {
      errors.username = 'Tên đăng nhập phải có ít nhất 3 ký tự';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError('Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      console.log('Register result:', result);
      
      if (result.success) {
        setSuccess(result.message || 'Đăng ký thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Register error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>✨</div>
          <h2>Tạo tài khoản mới</h2>
          <p>Tham gia cộng đồng mua sắm của chúng tôi</p>
        </div>
        
        {error && (
          <Alert variant="danger" className="mb-3" style={{borderRadius: '12px'}}>
            <strong>⚠️</strong> {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-3" style={{borderRadius: '12px'}}>
            <strong>✓</strong> {success}
          </Alert>
        )}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên đăng nhập *</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Nhập tên đăng nhập (tối thiểu 3 ký tự)"
                    value={formData.username}
                    onChange={handleChange}
                    isInvalid={!!fieldErrors.username}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.username}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Tên đăng nhập phải có ít nhất 3 ký tự
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    isInvalid={!!fieldErrors.email}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.email}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Email phải đúng định dạng (vd: user@gmail.com)
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu *</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                    value={formData.password}
                    onChange={handleChange}
                    isInvalid={!!fieldErrors.password}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.password}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu *</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!fieldErrors.confirmPassword}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {fieldErrors.confirmPassword}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Nhập lại mật khẩu để xác nhận
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                  style={{
                    padding: '0.875rem',
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang đăng ký...
                    </>
                  ) : (
                    <>
                      <span style={{marginRight: '0.5rem'}}>🚀</span>
                      Đăng ký ngay
                    </>
                  )}
                </Button>
                
                <div className="auth-divider">
                  <span>Hoặc</span>
                </div>
                
                <div className="text-center">
                  <p style={{color: 'var(--gray-color)', marginBottom: '0.5rem'}}>
                    Đã có tài khoản?
                  </p>
                  <Link 
                    to="/login" 
                    className="text-decoration-none"
                    style={{
                      fontWeight: '600',
                      fontSize: '1.05rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>🔑</span> Đăng nhập ngay
                  </Link>
                </div>
              </Form>
            </div>
          </div>
  );
}

export default Register;

