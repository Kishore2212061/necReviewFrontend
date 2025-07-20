import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import './styles.css';

const Dashboard: React.FC = () => {
  const { user, activeRole, setActiveRole } = useContext(AuthContext);

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="container">
        <h2>Dashboard</h2>
        <div className="role-switcher">
          <h3>Switch Role</h3>
          <div className="role-buttons">
            {user?.roles.map(role => (
              <button
                key={role}
                className={`role-button ${activeRole === role ? 'active' : ''}`}
                onClick={() => setActiveRole(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="dashboard-content">
          <h3>Welcome, {user?.registerNumber}!</h3>
          <p>Active Role: <span className="active-role">{activeRole}</span></p>
          <p>Navigate to the Reviews section to manage or view team progress.</p>
          {activeRole === 'admin' && (
            <p>Manage users, teams, and rubrics from the navigation menu above.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;