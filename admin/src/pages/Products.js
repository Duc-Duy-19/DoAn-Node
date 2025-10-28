import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Badge, Row, Col } from 'react-bootstrap';
import api from '../services/api';

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageURLs: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories')
      ]);
      if (productsRes.data.success) setProducts(productsRes.data.data);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        stock: product.stock,
        category: product.category?._id || '',
        imageURLs: product.imageURLs?.join(', ') || ''
      });
      setUploadedImages(product.imageURLs || []);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageURLs: '' });
      setUploadedImages([]);
    }
    setShowModal(true);
  };

  const handleImageUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i]);
      }

      const response = await api.post('/upload/multiple', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        const newImages = response.data.data.map(img => img.fullUrl);
        setUploadedImages(prev => [...prev, ...newImages]);
        alert('Upload thành công!');
      }
    } catch (err) {
      alert(err.response?.data?.data || 'Lỗi khi upload ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: formData.category,
        imageURLs: uploadedImages
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, data);
      } else {
        await api.post('/products', data);
      }
      
      fetchData();
      setShowModal(false);
    } catch (err) {
      alert(err.response?.data?.data || 'Lỗi khi lưu sản phẩm');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.data || 'Không thể xóa sản phẩm');
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <>
      <Container fluid className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Quản lý sản phẩm</h2>
          <Button variant="primary" onClick={() => handleOpenModal()}>+ Thêm sản phẩm</Button>
        </div>

        <Table responsive hover striped>
          <thead>
            <tr>
              <th>Tên sản phẩm</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>{product.name}</td>
                <td>{product.price.toLocaleString('vi-VN')}₫</td>
                <td><Badge bg={product.stock > 0 ? 'success' : 'danger'}>{product.stock}</Badge></td>
                <td>{product.category?.name}</td>
                <td>
                  <Button size="sm" variant="outline-primary" className="me-2" onClick={() => handleOpenModal(product)}>Sửa</Button>
                  <Button size="sm" variant="outline-danger" onClick={() => handleDelete(product._id)}>Xóa</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên sản phẩm</Form.Label>
              <Form.Control value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá</Form.Label>
                  <Form.Control type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tồn kho</Form.Label>
                  <Form.Control type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                <option value="">Chọn danh mục</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hình ảnh</Form.Label>
              <Form.Control 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
              <Form.Text className="text-muted">
                {uploading ? 'Đang upload...' : 'Chọn tối đa 5 ảnh (JPEG, PNG, GIF, WebP). Tối đa 5MB/ảnh'}
              </Form.Text>
              
              {uploadedImages.length > 0 && (
                <div className="mt-3">
                  <strong>Ảnh đã upload:</strong>
                  <Row className="mt-2">
                    {uploadedImages.map((url, index) => (
                      <Col key={index} xs={6} md={3} className="mb-2">
                        <div className="position-relative">
                          <img 
                            src={url} 
                            alt={`Product ${index + 1}`}
                            style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                            className="rounded"
                          />
                          <Button
                            size="sm"
                            variant="danger"
                            className="position-absolute top-0 end-0 m-1"
                            onClick={() => handleRemoveImage(index)}
                          >
                            ✕
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button variant="primary" type="submit">{editingProduct ? 'Cập nhật' : 'Thêm mới'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default Products;

