import React from 'react';
import './styles.css';

interface Team {
  _id: string;
  name: string;
}

interface SidebarProps {
  teams: Team[];
  selectedTeam: string | null;
  onSelectTeam: (teamId: string) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ teams, selectedTeam, onSelectTeam, isLoading }) => {
  return (
    <div className="sidebar">
      <h2>Teams</h2>
      {isLoading ? (
        <div className="loader"></div>
      ) : teams.length === 0 ? (
        <p className="no-data">No teams available</p>
      ) : (
        <ul>
          {teams.map(team => (
            <li
              key={team._id}
              className={`sidebar-item ${selectedTeam === team._id ? 'selected' : ''}`}
              onClick={() => onSelectTeam(team._id)}
            >
              {team.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Sidebar;