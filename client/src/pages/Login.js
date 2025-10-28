import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔐</div>
          <h2>Chào mừng trở lại</h2>
          <p>Đăng nhập để tiếp tục mua sắm</p>
        </div>
        
        {error && (
          <Alert variant="danger" className="mb-3" style={{borderRadius: '12px'}}>
            <strong>⚠️</strong> {error}
          </Alert>
        )}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{fontWeight: '600', color: 'var(--dark-color)'}}>
              <span style={{marginRight: '0.5rem'}}>👤</span>Tên đăng nhập *
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                fontSize: '1rem'
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label style={{fontWeight: '600', color: 'var(--dark-color)'}}>
              <span style={{marginRight: '0.5rem'}}>🔑</span>Mật khẩu *
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: '0.875rem 1rem',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                fontSize: '1rem'
              }}
            />
          </Form.Group>

          <div className="text-end mb-3">
            <Link 
              to="/forgot-password" 
              className="text-decoration-none"
              style={{
                fontSize: '0.95rem',
                fontWeight: '500',
                color: 'var(--primary-color)'
              }}
            >
              Quên mật khẩu? →
            </Link>
          </div>

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
                Đang đăng nhập...
              </>
            ) : (
              <>
                <span style={{marginRight: '0.5rem'}}>🚀</span>
                Đăng nhập
              </>
            )}
          </Button>
          
          <div className="auth-divider">
            <span>Hoặc</span>
          </div>
          
          <div className="text-center">
            <p style={{color: 'var(--gray-color)', marginBottom: '0.5rem'}}>
              Chưa có tài khoản?
            </p>
            <Link 
              to="/register" 
              className="text-decoration-none"
              style={{
                fontWeight: '600',
                fontSize: '1.05rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span>✨</span> Đăng ký ngay
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;

