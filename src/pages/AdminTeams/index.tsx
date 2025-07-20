import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import './styles.css';

interface User {
  _id: string;
  registerNumber: string;
  roles: string[]; // Added missing roles property
}

interface Team {
  _id: string;
  name: string;
  guide: { _id: string; registerNumber: string };
  reviewers: { _id: string; registerNumber: string }[];
  students: { _id: string; registerNumber: string }[];
}

const AdminTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  // Fixed: Properly typed the arrays as string[] instead of never[]
  const [newTeam, setNewTeam] = useState<{
    name: string;
    guide: string;
    reviewers: string[];
    students: string[];
  }>({ name: '', guide: '', reviewers: [], students: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      api.get('/teams'),
      api.get('/users'),
    ]).then(([teamsResponse, usersResponse]) => {
      setTeams(teamsResponse.data);
      setUsers(usersResponse.data);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teams', newTeam);
      setNewTeam({ name: '', guide: '', reviewers: [], students: [] });
      const response = await api.get('/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <div className="admin-teams-container">
      <Navbar />
      <div className="container">
        <h2>Manage Teams</h2>
        <form onSubmit={handleSubmit} className="team-form">
          <div className="form-group">
            <label>Team Name</label>
            <input
              type="text"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Guide</label>
            <select
              value={newTeam.guide}
              onChange={(e) => setNewTeam({ ...newTeam, guide: e.target.value })}
              required
            >
              <option value="">Select Guide</option>
              {users.filter(user => user.roles.includes('guide')).map(user => (
                <option key={user._id} value={user._id}>{user.registerNumber}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Reviewers</label>
            <select
              multiple
              value={newTeam.reviewers}
              onChange={(e) => setNewTeam({ 
                ...newTeam, 
                reviewers: Array.from(e.target.selectedOptions, option => option.value) 
              })}
            >
              {users.filter(user => user.roles.includes('reviewer')).map(user => (
                <option key={user._id} value={user._id}>{user.registerNumber}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Students</label>
            <select
              multiple
              value={newTeam.students}
              onChange={(e) => setNewTeam({ 
                ...newTeam, 
                students: Array.from(e.target.selectedOptions, option => option.value) 
              })}
            >
              {users.filter(user => user.roles.includes('student')).map(user => (
                <option key={user._id} value={user._id}>{user.registerNumber}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="submit-button">Create Team</button>
        </form>
        <div className="team-list">
          <h3>Existing Teams</h3>
          {isLoading ? (
            <div className="loader"></div>
          ) : teams.length === 0 ? (
            <p className="no-data">No teams available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Guide</th>
                  <th>Reviewers</th>
                  <th>Students</th>
                </tr>
              </thead>
              <tbody>
                {teams.map(team => (
                  <tr key={team._id}>
                    <td>{team.name}</td>
                    <td>{team.guide.registerNumber}</td>
                    <td>{team.reviewers.map(r => r.registerNumber).join(', ')}</td>
                    <td>{team.students.map(s => s.registerNumber).join(', ')}</td>
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

export default AdminTeams;