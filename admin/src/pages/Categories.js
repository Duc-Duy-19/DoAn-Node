import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner } from 'react-bootstrap';
import api from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', description: '', imageURL: '' });
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/categories');
      if (res.data.success) setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (cat = null) => {
    if (cat) {
      setEditing(cat);
      setFormData({ name: cat.name, description: cat.description || '', imageURL: cat.imageURL || '' });
      setUploadedImage(cat.imageURL || '');
    } else {
      setEditing(null);
      setFormData({ name: '', description: '', imageURL: '' });
      setUploadedImage('');
    }
    setShowModal(true);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/upload/single', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUploadedImage(response.data.data.fullUrl);
        alert('Upload thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.data || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        imageURL: uploadedImage
      };

      if (editing) {
        await api.put(`/categories/${editing._id}`, data);
      } else {
        await api.post('/categories', data);
      }
      fetchCategories();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.data || 'Lỗi');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể xóa');
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between mb-4">
          <h2>Quản lý danh mục</h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>+ Thêm danh mục</Button>
        </div>
        <Table responsive hover striped>
          <thead><tr><th>Hình ảnh</th><th>Tên</th><th>Mô tả</th><th>Hành động</th></tr></thead>
          <tbody>
            {categories.map(cat => (
              <tr key={cat._id}>
                <td>
                  {cat.imageURL ? (
                    <img src={cat.imageURL} alt={cat.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} className="rounded" />
                  ) : (
                    <div className="bg-secondary rounded" style={{ width: '50px', height: '50px' }} />
                  )}
                </td>
                <td>{cat.name}</td>
                <td>{cat.description}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleOpenModal(cat)}>Sửa</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(cat._id)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton><Modal.Title>{editing ? 'Sửa' : 'Thêm'} danh mục</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                {uploading ? 'Đang upload...' : 'Chọn ảnh (JPEG, PNG, GIF, WebP). Tối đa 5MB'}
              </Form.Text>
              
              {uploadedImage && (
                <div className="mt-3">
                  <strong>Ảnh đã upload:</strong>
                  <div className="position-relative d-inline-block mt-2">
                    <img 
                      src={uploadedImage} 
                      alt="Category"
                      style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                      className="rounded"
                    />
                    <Button
                      size="sm"
                      variant="danger"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={handleRemoveImage}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit">{editing ? 'Cập nhật' : 'Thêm'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Categories;

