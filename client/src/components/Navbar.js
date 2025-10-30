import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar as BSNavbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(async () => {
      const trimmed = query.trim();
      if (!trimmed) {
        setSuggestions([]);
        setShowDropdown(false);
        setHighlightIndex(-1);
        return;
      }
      try {
        setLoading(true);
        const res = await api.get(`/products/search`, { params: { q: trimmed, limit: 8 } });
        if (res.data?.success) {
          setSuggestions(res.data.data);
          setShowDropdown(true);
          setHighlightIndex(-1);
        }
      } catch (e) {
        // noop UX
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToSearchPage = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setShowDropdown(false);
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === 'Enter') {
        goToSearchPage();
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && suggestions[highlightIndex]) {
        navigate(`/products/${suggestions[highlightIndex]._id}`);
        setShowDropdown(false);
      } else {
        goToSearchPage();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <BSNavbar variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          <strong>📱 ChunPhone</strong>
        </BSNavbar.Brand>

        {/* Search Bar */}
        <div className="navbar-search d-none d-lg-flex" ref={containerRef} style={{ position: 'relative' }}>
          <div className="input-group">
            <input
              ref={inputRef}
              type="text"
              className="form-control"
              placeholder="Bạn muốn mua gì hôm nay?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
              onKeyDown={onKeyDown}
            />
            <button className="btn" type="button" onClick={goToSearchPage}>
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
          {showDropdown && suggestions.length > 0 && (
            <div className="search-suggest-dropdown">
              {suggestions.map((p, idx) => (
                <div
                  key={p._id}
                  className={`search-suggest-item ${idx === highlightIndex ? 'active' : ''}`}
                  onMouseEnter={() => setHighlightIndex(idx)}
                  onMouseDown={() => {
                    navigate(`/products/${p._id}`);
                    setShowDropdown(false);
                  }}
                >
                  <img
                    src={p.imageURLs?.[0] || '/logo192.png'}
                    alt={p.name}
                    style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, marginRight: 8 }}
                  />
                  <div className="flex-grow-1">
                    <div className="name text-truncate" title={p.name}>{p.name}</div>
                    <div className="price text-muted" style={{ fontSize: '0.85rem' }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.price || 0)}
                    </div>
                  </div>
                </div>
              ))}
              <div className="search-suggest-footer" onMouseDown={goToSearchPage}>
                Xem tất cả kết quả cho “{query}”
              </div>
            </div>
          )}
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

