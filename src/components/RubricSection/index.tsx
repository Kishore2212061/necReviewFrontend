import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './styles.css';

interface Rubric {
  _id: string;
  name: string;
  maxScore: number;
}

interface Review {
  _id: string;
  student: { _id: string; registerNumber: string };
  rubricScores: { rubric: { _id: string }; score: number }[];
}

interface RubricSectionProps {
  rubric: Rubric;
  reviews: Review[];
  onSubmitReview: (studentId: string, rubricScores: { rubric: string; score: number }[]) => void;
  reviewRoundId: string;
}

const RubricSection: React.FC<RubricSectionProps> = ({ rubric, reviews, onSubmitReview }) => {
  const { user } = useContext(AuthContext);
  const [scores, setScores] = useState<{ [key: string]: number }>({});

  const handleSubmit = (studentId: string) => {
    onSubmitReview(studentId, [{ rubric: rubric._id, score: scores[studentId] || 0 }]);
  };

  return (
    <div className="rubric-section">
      <h4>{rubric.name} (Max Score: {rubric.maxScore})</h4>
      {reviews.map(review => (
        <div key={review.student._id} className="student-score">
          <p>Student: {review.student.registerNumber}</p>
          {user?.roles.includes('reviewer') && (
            <div>
              <input
                type="number"
                min="0"
                max={rubric.maxScore}
                value={scores[review.student._id] || ''}
                onChange={(e) => setScores({ ...scores, [review.student._id]: Number(e.target.value) })}
              />
              <button onClick={() => handleSubmit(review.student._id)}>Submit Score</button>
            </div>
          )}
          <p>Score: {review.rubricScores.find(score => score.rubric._id === rubric._id)?.score || 'Not scored'}</p>
        </div>
      ))}
    </div>
  );
};

export default RubricSection;