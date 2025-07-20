import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar';
import ReviewContainer from '../../components/ReviewContainer';
import api from '../../services/api';
import './styles.css';
import Navbar from '../../components/Navbar';

interface Team {
  _id: string;
  name: string;
  students: { _id: string; registerNumber: string }[];
}

interface ReviewRound {
  _id: string;
  name: string;
  rubrics: { _id: string; name: string; maxScore: number }[];
}

interface Review {
  _id: string;
  reviewRound: { _id: string; name: string };
  team: { _id: string; name: string };
  student: { _id: string; registerNumber: string };
  reviewer: { _id: string; registerNumber: string };
  rubricScores: { rubric: { _id: string; name: string; maxScore: number }; score: number }[];
}

const Reviews: React.FC = () => {
  const { activeRole } = useContext(AuthContext);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [reviewRounds, setReviewRounds] = useState<ReviewRound[]>([]);
  const [feedback, setFeedback] = useState<{ _id: string; feedbackText: string; allowReview: boolean; isLocked: boolean } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.get('/teams')
      .then(response => {
        setTeams(response.data);
        if (response.data.length > 0) {
          setSelectedTeam(response.data[0]._id);
        }
      })
      .finally(() => setIsLoading(false));
  }, [activeRole]);

  useEffect(() => {
    setIsLoading(true);
    api.get('/reviewRounds')
      .then(response => {
        setReviewRounds(response.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      setIsLoading(true);
      api.get(`/guideFeedback/${selectedTeam}`).then(response => {
        setFeedback(response.data);
      });
      Promise.all(
        reviewRounds.map(round =>
          api.get(`/reviews/${round._id}/${selectedTeam}`).then(response => ({
            roundId: round._id,
            reviews: response.data,
          }))
        )
      ).then(results => {
        const allReviews = results.flatMap(result => result.reviews);
        setReviews(allReviews);
      }).finally(() => setIsLoading(false));
    }
  }, [selectedTeam, reviewRounds]);

  const handleSubmitFeedback = async (feedbackText: string, allowReview: boolean) => {
    try {
      const response = await api.post('/guideFeedback', { teamId: selectedTeam, feedbackText, allowReview });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const handleLockFeedback = async (isLocked: boolean) => {
    try {
      await api.post('/guideFeedback/lock', { feedbackId: feedback?._id, isLocked });
      setFeedback({ ...feedback!, isLocked });
    } catch (error) {
      console.error('Error locking feedback:', error);
    }
  };

  const handleSubmitReview = async (studentId: string, rubricScores: { rubric: string; score: number }[], reviewRoundId: string) => {
    try {
      await api.post('/reviews', { reviewRoundId, teamId: selectedTeam, studentId, rubricScores });
      const response = await api.get(`/reviews/${reviewRoundId}/${selectedTeam}`);
      setReviews(prev => [
        ...prev.filter(review => review.reviewRound._id !== reviewRoundId),
        ...response.data,
      ]);
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  return (
    <div className="reviews-container">
      <Navbar />
      <div className="reviews-content">
        <Sidebar
          teams={teams}
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
          isLoading={isLoading}
        />
        <div className="reviews-main">
          {selectedTeam && reviewRounds.map(round => (
            <ReviewContainer
              key={round._id}
              reviewRound={round}
              reviews={reviews.filter(review => review.reviewRound._id === round._id)}
              feedback={feedback}
              onSubmitFeedback={handleSubmitFeedback}
              onLockFeedback={handleLockFeedback}
              onSubmitReview={(studentId, rubricScores) => handleSubmitReview(studentId, rubricScores, round._id)}
              teamStudents={teams.find(team => team._id === selectedTeam)?.students || []}
              isLoading={isLoading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reviews;