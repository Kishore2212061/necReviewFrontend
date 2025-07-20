import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import './styles.css';

interface User {
  _id: string;
  registerNumber: string;
  email: string;
  roles: string[];
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUsers, setNewUsers] = useState([{ registerNumber: '', email: '', roles: [''] }]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/users').then(response => {
      setUsers(response.data);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleAddUser = () => {
    setNewUsers([...newUsers, { registerNumber: '', email: '', roles: [''] }]);
  };

  const handleUserChange = (index: number, field: string, value: string | string[]) => {
    const updatedUsers = [...newUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    setNewUsers(updatedUsers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/bulk-add', { users: newUsers });
      setNewUsers([{ registerNumber: '', email: '', roles: [''] }]);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error adding users:', error);
    }
  };

  return (
    <div className="admin-users-container">
      <Navbar />
      <div className="container">
        <h2>Manage Users</h2>
        <form onSubmit={handleSubmit} className="user-form">
          {newUsers.map((user, index) => (
            <div key={index} className="user-form-row">
              <input
                type="text"
                placeholder="Register Number"
                value={user.registerNumber}
                onChange={(e) => handleUserChange(index, 'registerNumber', e.target.value)}
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => handleUserChange(index, 'email', e.target.value)}
                required
              />
              <select
                multiple
                value={user.roles}
                onChange={(e) => handleUserChange(index, 'roles', Array.from(e.target.selectedOptions, option => option.value))}
              >
                <option value="admin">Admin</option>
                <option value="guide">Guide</option>
                <option value="reviewer">Reviewer</option>
                <option value="student">Student</option>
              </select>
            </div>
          ))}
          <div className="form-actions">
            <button type="button" onClick={handleAddUser} className="add-button">Add Another User</button>
            <button type="submit" className="submit-button">Submit Users</button>
          </div>
        </form>
        <div className="user-list">
          <h3>Existing Users</h3>
          {isLoading ? (
            <div className="loader"></div>
          ) : users.length === 0 ? (
            <p className="no-data">No users available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Register Number</th>
                  <th>Email</th>
                  <th>Roles</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id}>
                    <td>{user.registerNumber}</td>
                    <td>{user.email}</td>
                    <td>{user.roles.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;