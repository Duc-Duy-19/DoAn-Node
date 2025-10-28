import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner } from 'react-bootstrap';
import api from '../services/api';

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reviews');
      if (res.data.success) setReviews(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      fetchReviews();
    } catch (err) {
      alert('Không thể xóa');
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Quản lý đánh giá</h2>
      <Table responsive hover striped>
        <thead><tr><th>Người dùng</th><th>Sản phẩm</th><th>Đánh giá</th><th>Bình luận</th><th>Hành động</th></tr></thead>
        <tbody>
          {reviews.map(review => (
            <tr key={review._id}>
              <td>{review.user?.username}</td>
              <td>{review.product?.name}</td>
              <td>{'⭐'.repeat(review.rating)}</td>
              <td>{review.comment}</td>
              <td>
                <Button size="sm" variant="outline-danger" onClick={() => handleDelete(review._id)}>Xóa</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Reviews;

