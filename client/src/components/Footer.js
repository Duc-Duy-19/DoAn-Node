import React from 'react';
import { Container } from 'react-bootstrap';

function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-auto">
      <Container>
        <div className="row align-items-start">
          <div className="col-md-4 mb-4">
            <h5 className="text-white">ChunPhone</h5>
            <p className="text-muted small mb-2">Cửa hàng điện thoại &amp; phụ kiện chính hãng. Giao hàng nhanh, hỗ trợ bảo hành và đổi trả.</p>
            <p className="small mb-1">Hotline: <strong className="text-white">1900-1234</strong></p>
            <p className="small">Email: <a href="mailto:support@chunphone.example" className="text-light">support@chunphone.example</a></p>
          </div>

          <div className="col-md-3 mb-4">
            <h6 className="text-white">Liên kết nhanh</h6>
            <ul className="list-unstyled small text-muted">
              <li className="my-1"><a href="/products" className="text-light text-decoration-none">Sản phẩm</a></li>
              <li className="my-1"><a href="/products" className="text-light text-decoration-none">Danh mục</a></li>
              <li className="my-1"><a href="/cart" className="text-light text-decoration-none">Giỏ hàng</a></li>
              <li className="my-1"><a href="/orders" className="text-light text-decoration-none">Đơn hàng của tôi</a></li>
            </ul>
          </div>

          <div className="col-md-5 mb-4">
            <div className="d-flex justify-content-between">
              <div>
                <h6 className="text-white">Kết nối với chúng tôi</h6>
                <div className="mb-3">
                  <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="me-3 text-light text-decoration-none">Facebook</a>
                  <a href="https://www.instagram.com/thawng._/" target="_blank" rel="noopener noreferrer" className="me-3 text-light text-decoration-none">Instagram</a>
                  <a href="https://www.tiktok.com/@chubeebii" target="_blank" rel="noopener noreferrer" className="text-light text-decoration-none">TikTok</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary" />

        <div className="d-flex justify-content-between align-items-center flex-column flex-md-row">
          <div className="small text-muted">&copy; {new Date().getFullYear()} ChunPhone. All rights reserved.</div>
          <div className="small text-muted">Đồ án Ngôn ngữ lập trình ứng dụng - Kỳ TDH</div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;

