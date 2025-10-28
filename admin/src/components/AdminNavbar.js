import React from 'react';
import { Navbar, Container, Nav, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminNavbar({ notifications }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" sticky="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand style={{fontSize: '1.5rem', fontWeight: '700'}}>
          <span style={{marginRight: '0.5rem'}}>🔧</span>
          <span style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Admin Panel
          </span>
        </Navbar.Brand>
        <Nav className="ms-auto align-items-center">
          {notifications > 0 && (
            <Nav.Item className="d-flex align-items-center me-3">
              <div className="position-relative">
                <span style={{fontSize: '1.5rem'}}>🔔</span>
                <Badge 
                  bg="danger" 
                  pill 
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-10px',
                    fontSize: '0.75rem'
                  }}
                >
                  {notifications}
                </Badge>
              </div>
            </Nav.Item>
          )}
          <NavDropdown 
            title={
              <span style={{color: '#1e293b', fontWeight: '600'}}>
                <span style={{fontSize: '1.1rem', marginRight: '0.5rem'}}>👤</span>
                {user?.username}
              </span>
            } 
            id="admin-dropdown"
            align="end"
          >
            <NavDropdown.Item disabled style={{background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'}}>
              <Badge bg="primary" className="me-2">{user?.role?.name}</Badge>
              <small className="text-muted">Administrator</small>
            </NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout} style={{color: '#ef4444', fontWeight: '600'}}>
              <span style={{marginRight: '0.5rem'}}>🚪</span> Đăng xuất
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default AdminNavbar;

