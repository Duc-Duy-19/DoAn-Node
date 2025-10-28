import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function ProductCard({ product }) {
  const imageUrl = product.imageURLs && product.imageURLs.length > 0 
    ? product.imageURLs[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img 
        variant="top" 
        src={imageUrl} 
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
        }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title className="text-truncate" title={product.name}>
          {product.name}
        </Card.Title>
        <Card.Text className="text-muted small" style={{ 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {product.description || 'Không có mô tả'}
        </Card.Text>
        <div className="mt-auto">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="text-danger mb-0">
              {product.price.toLocaleString('vi-VN')}₫
            </h5>
            <Badge bg={product.stock > 0 ? 'success' : 'danger'}>
              {product.stock > 0 ? `Còn ${product.stock}` : 'Hết hàng'}
            </Badge>
          </div>
          <Button 
            as={Link} 
            to={`/products/${product._id}`} 
            variant="primary" 
            className="w-100"
          >
            Xem chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;

