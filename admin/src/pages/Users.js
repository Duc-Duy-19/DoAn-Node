import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Spinner } from 'react-bootstrap';
import api from '../services/api';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Container className="text-center py-5"><Spinner animation="border" /></Container>;

  return (
    <Container fluid className="py-4">
      <h2 className="mb-4">Quản lý người dùng</h2>
      <Table responsive hover striped>
        <thead><tr><th>Username</th><th>Email</th><th>Họ tên</th><th>Quyền</th></tr></thead>
        <tbody>
          {users.map(user => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.fullName || '-'}</td>
              <td><Badge bg={user.role?.name === 'ADMIN' ? 'danger' : 'info'}>{user.role?.name}</Badge></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default Users;

