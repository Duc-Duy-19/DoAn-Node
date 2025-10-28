import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <BSNavbar variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          <strong>📱 ChunPhone</strong>
        </BSNavbar.Brand>

        {/* Search Bar */}
        <div className="navbar-search d-none d-lg-flex">
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Bạn muốn mua gì hôm nay?"
            />
            <button className="btn" type="button">
              🔍
            </button>
          </div>
        </div>

        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            <Nav.Link as={Link} to="/cart" className="position-relative">
              <span style={{fontSize: '1.3rem'}}>🛒</span>
              <span className="d-none d-lg-inline ms-2">Giỏ hàng</span>
              {/* Cart Badge - uncomment when you have cart count */}
              {/* <span className="cart-badge">0</span> */}
            </Nav.Link>

            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <span>
                    <span style={{fontSize: '1.1rem', marginRight: '0.3rem'}}>👤</span>
                    {user?.username || 'User'}
                  </span>
                } 
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  👤 Thông tin cá nhân
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders">
                  📋 Đơn hàng của tôi
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/addresses">
                  📍 Địa chỉ giao hàng
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} style={{color: '#D70018'}}>
                  🚪 Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">
                <span style={{fontSize: '1.1rem', marginRight: '0.3rem'}}>👤</span>
                Đăng nhập
              </Nav.Link>
            )}
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}

export default Navbar;

