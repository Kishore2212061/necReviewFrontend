import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import './styles.css';

const ResetPassword: React.FC = () => {
  const { resetPassword } = useContext(AuthContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      await resetPassword(oldPassword, newPassword);
      setSuccess('Password reset successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setError('Failed to reset password. Please check your old password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="reset-password-container">
      <Navbar />
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        {isLoading ? (
          <div className="loader"></div>
        ) : (
          <>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={handleSubmit} disabled={isLoading}>
              Reset Password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;