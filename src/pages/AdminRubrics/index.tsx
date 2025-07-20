import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Navbar from '../../components/Navbar';
import './styles.css';

interface Rubric {
  _id: string;
  name: string;
  description: string;
  maxScore: number;
}

const AdminRubrics: React.FC = () => {
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [newRubric, setNewRubric] = useState({ name: '', description: '', maxScore: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/rubrics').then(response => {
      setRubrics(response.data);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/rubrics', newRubric);
      setNewRubric({ name: '', description: '', maxScore: 0 });
      const response = await api.get('/rubrics');
      setRubrics(response.data);
    } catch (error) {
      console.error('Error creating rubric:', error);
    }
  };

  return (
    <div className="admin-rubrics-container">
      <Navbar />
      <div className="container">
        <h2>Manage Rubrics</h2>
        <form onSubmit={handleSubmit} className="rubric-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={newRubric.name}
              onChange={(e) => setNewRubric({ ...newRubric, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newRubric.description}
              onChange={(e) => setNewRubric({ ...newRubric, description: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Max Score</label>
            <input
              type="number"
              value={newRubric.maxScore}
              onChange={(e) => setNewRubric({ ...newRubric, maxScore: Number(e.target.value) })}
              required
            />
          </div>
          <button type="submit" className="submit-button">Create Rubric</button>
        </form>
        <div className="rubric-list">
          <h3>Existing Rubrics</h3>
          {isLoading ? (
            <div className="loader"></div>
          ) : rubrics.length === 0 ? (
            <p className="no-data">No rubrics available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Max Score</th>
                </tr>
              </thead>
              <tbody>
                {rubrics.map(rubric => (
                  <tr key={rubric._id}>
                    <td>{rubric.name}</td>
                    <td>{rubric.description}</td>
                    <td>{rubric.maxScore}</td>
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

export default AdminRubrics;