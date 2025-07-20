import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './styles.css';

const Navbar: React.FC = () => {
  const { user, activeRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-brand">ProjectSync</div>
      <div className="navbar-links">
        {user && (
          <>
            <span className="user-info">
              {user.registerNumber} ({activeRole})
            </span>
            <a href="/dashboard" className="nav-link">Dashboard</a>
            <a href="/reviews" className="nav-link">Reviews</a>
            <a href="/reset-password" className="nav-link">Reset Password</a>
            {activeRole === 'admin' && (
              <>
                <a href="/admin/users" className="nav-link">Users</a>
                <a href="/admin/teams" className="nav-link">Teams</a>
                <a href="/admin/rubrics" className="nav-link">Rubrics</a>
              </>
            )}
            <button onClick={() => { logout(); navigate('/login'); }} className="logout-button">
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;