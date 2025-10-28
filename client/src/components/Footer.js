import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container>
        <div className="text-center">
          <p className="mb-0">&copy; 2025 WebBanHang. All rights reserved.</p>
          <small className="text-muted">Đồ án Ngôn ngữ lập trình ứng dụng</small>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;

