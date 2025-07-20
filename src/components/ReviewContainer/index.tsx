import React, { useContext, useRef, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import './styles.css';

interface Review {
  _id: string;
  reviewRound: { _id: string; name: string };
  student: { _id: string; registerNumber: string };
  reviewer: { _id: string; registerNumber: string };
  rubricScores: { rubric: { _id: string; name: string; maxScore: number }; score: number }[];
}

interface ReviewContainerProps {
  reviewRound: { _id: string; name: string; rubrics: { _id: string; name: string; maxScore: number }[] };
  reviews: Review[];
  feedback: { _id: string; feedbackText: string; allowReview: boolean; isLocked: boolean } | null;
  onSubmitFeedback: (feedbackText: string, allowReview: boolean) => void;
  onLockFeedback: (isLocked: boolean) => void;
  onSubmitReview: (studentId: string, rubricScores: { rubric: string; score: number }[]) => void;
  teamStudents: { _id: string; registerNumber: string }[];
  isLoading?: boolean;
}

const ReviewContainer: React.FC<ReviewContainerProps> = ({
  reviewRound,
  reviews,
  feedback,
  onSubmitFeedback,
  onLockFeedback,
  onSubmitReview,
  teamStudents,
  isLoading = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, activeRole } = useContext(AuthContext);
  // Use refs to track input values for better type safety
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const setInputRef = (studentId: string, rubricId: string) => (el: HTMLInputElement | null) => {
    inputRefs.current[`${studentId}-${rubricId}`] = el;
  };

  const getInputValue = (studentId: string, rubricId: string): number => {
    const input = inputRefs.current[`${studentId}-${rubricId}`];
    return input ? Number(input.value) || 0 : 0;
  };

  const handleReviewSubmit = async (studentId: string, updatedScores: { rubric: string; score: number }[]) => {
    setIsSubmitting(true);
    try {
      await onSubmitReview(studentId, updatedScores);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="review-card">
        <h3>{reviewRound.name}</h3>
        <div className="loading-container">
          <div className="loader">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="review-card">
      <h3>{reviewRound.name}</h3>
      {activeRole === 'admin' && (
        <div className="feedback-control">
          <h4>Feedback Control</h4>
          <label className="checkbox-label">
            Lock Feedback:
            <input
              type="checkbox"
              checked={feedback?.isLocked || false}
              onChange={(e) => onLockFeedback(e.target.checked)}
            />
          </label>
        </div>
      )}
      {activeRole === 'guide' && (
        <div className="feedback-section">
          <h4>Guide Feedback</h4>
          {feedback?.isLocked ? (
            <p className="error">Feedback is locked. Please contact admin.</p>
          ) : (
            <>
              <textarea
                value={feedback?.feedbackText || ''}
                onChange={(e) => onSubmitFeedback(e.target.value, feedback?.allowReview || false)}
                placeholder="Enter feedback"
                disabled={feedback?.isLocked}
                className="feedback-textarea"
              />
              <label className="checkbox-label">
                Allow Review:
                <input
                  type="checkbox"
                  checked={feedback?.allowReview || false}
                  onChange={(e) => onSubmitFeedback(feedback?.feedbackText || '', e.target.checked)}
                  disabled={feedback?.isLocked || (feedback?.allowReview === false && !user?.roles.includes('admin'))}
                />
              </label>
            </>
          )}
        </div>
      )}
      {(activeRole === 'admin' || activeRole === 'guide' || activeRole === 'student') && (
        <div className="feedback-display">
          <h4>Feedback</h4>
          <p>{feedback?.feedbackText || 'No feedback provided'}</p>
          <p>Review Allowed: {feedback?.allowReview ? 'Yes' : 'No'}</p>
        </div>
      )}
      {activeRole === 'reviewer' && feedback?.allowReview && (
        <div className="rubric-table">
          <h4>Rubric Scores</h4>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                {reviewRound.rubrics.map(rubric => (
                  <th key={rubric._id}>{rubric.name} (Max: {rubric.maxScore})</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamStudents.map(student => (
                <tr key={student._id}>
                  <td>{student.registerNumber}</td>
                  {reviewRound.rubrics.map(rubric => {
                    const review = reviews.find(r => r.student._id === student._id);
                    const score = review?.rubricScores.find(s => s.rubric._id === rubric._id)?.score;
                    return (
                      <td key={rubric._id}>
                        <input
                          ref={setInputRef(student._id, rubric._id)}
                          type="number"
                          min="0"
                          max={rubric.maxScore}
                          defaultValue={score || ''}
                          onChange={(e) => {
                            const updatedScores = reviewRound.rubrics.map(r => ({
                              rubric: r._id,
                              score: r._id === rubric._id ? Number(e.target.value) : (reviews.find(rev => rev.student._id === student._id)?.rubricScores.find(s => s.rubric._id === r._id)?.score || 0)
                            }));
                            handleReviewSubmit(student._id, updatedScores);
                          }}
                          disabled={isSubmitting}
                        />
                      </td>
                    );
                  })}
                  <td>
                    <button 
                      onClick={() => {
                        const scores = reviewRound.rubrics.map(r => ({
                          rubric: r._id,
                          score: getInputValue(student._id, r._id)
                        }));
                        handleReviewSubmit(student._id, scores);
                      }}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {(activeRole === 'admin' || activeRole === 'guide' || activeRole === 'student') && (
        <div className="rubric-table">
          <h4>Scores</h4>
          <table>
            <thead>
              <tr>
                <th>Student</th>
                {reviewRound.rubrics.map(rubric => (
                  <th key={rubric._id}>{rubric.name} (Max: {rubric.maxScore})</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {teamStudents.map(student => {
                // Fixed: Changed user?.id to user?._id to match the User type structure
                const review = reviews.find(r => r.student._id === student._id && (activeRole !== 'student' || r.student._id === user?._id));
                return (
                  <tr key={student._id}>
                    <td>{student.registerNumber}</td>
                    {reviewRound.rubrics.map(rubric => (
                      <td key={rubric._id}>{review?.rubricScores.find(s => s.rubric._id === rubric._id)?.score || 'Not scored'}</td>
                    ))}
                    <td>{review ? review.rubricScores.reduce((sum, s) => sum + s.score, 0) : 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewContainer;