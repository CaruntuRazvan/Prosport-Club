import React from 'react';
//import '../styles/FeedbackList.css';

const FeedbackList = ({ feedbacks, userRole }) => {
  if (!feedbacks || feedbacks.length === 0) {
    return <p>No feedback available for this event.</p>;
  }

  return (
    <div className="feedback-list">
      <h3>Feedback</h3>
      <ul>
        {feedbacks.map(feedback => (
          <li key={feedback._id}>
            {userRole === 'player' ? (
              <span>Feedback: {feedback.satisfactionLevel} - {feedback.comment || 'No comment'}</span>
            ) : (
              <>
                <strong>
                  {feedback.receiverId.firstName && feedback.receiverId.lastName
                    ? `${feedback.receiverId.firstName} ${feedback.receiverId.lastName}`
                    : feedback.receiverId.name || 'Unknown'}
                </strong>: {feedback.satisfactionLevel} - {feedback.comment || 'No comment'}
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeedbackList;