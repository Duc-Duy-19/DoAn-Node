import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '📊 Dashboard', icon: '📊' },
    { path: '/products', label: '🛍️ Sản phẩm', icon: '🛍️' },
    { path: '/categories', label: '📂 Danh mục', icon: '📂' },
    { path: '/orders', label: '📦 Đơn hàng', icon: '📦' },
    { path: '/users', label: '👥 Người dùng', icon: '👥' },
    { path: '/reviews', label: '⭐ Đánh giá', icon: '⭐' }
  ];

  return (
    <div className="sidebar" style={{ width: '250px', minHeight: 'calc(100vh - 56px)' }}>
      <Nav className="flex-column p-3">
        {menuItems.map(item => (
          <Nav.Link
            key={item.path}
            as={Link}
            to={item.path}
            className={`py-3 px-4 mb-2 rounded ${location.pathname === item.path ? 'active' : ''}`}
            style={{
              fontSize: '1rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <span style={{fontSize: '1.2rem', marginRight: '0.75rem'}}>{item.icon}</span>
            {item.label.replace(item.icon, '').trim()}
          </Nav.Link>
        ))}
      </Nav>
    </div>
  );
}

export default Sidebar;

