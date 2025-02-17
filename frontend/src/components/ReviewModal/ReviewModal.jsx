import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createReview } from '../../store/reviews';
import './ReviewModal.css';

const ReviewModal = ({ spotId, onClose, onSuccess }) => {
    const dispatch = useDispatch();
    const [review, setReview] = useState('');
    const [stars, setStars] = useState(0);
    const [error, setError] = useState(null);
    const [hoveredStar, setHoveredStar] = useState(0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!review.trim() || stars === 0) return;

        try {
            console.log('Attempting to create a review');
            console.log('Review data:', {
                spotId, review: { comment: review, stars }
            })
            await dispatch(createReview({
                spotId,
                review: {
                    comment: review,
                    stars
                }
            })).unwrap();
            console.log('Review created successfully');
            onSuccess();
            onClose();
        } catch (err) {
            console.error('Failed to create a review', err);
            setError(err.message);
        }
    };

    const handleStarClick = (rating) => {
        setStars(rating);
    };

    const handleStarHover = (rating) => {
        setHoveredStar(rating);
    };

    const handleStarLeave = () => {
        setHoveredStar(0);
    };

    return (
        <div className="review-modal">
            <div className="review-modal-content">
                <h2>How was your stay?</h2>
                {error && <div className="error">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <textarea
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                        placeholder="Leave your review here..."
                        rows="5"
                    />
                    
                    <div className="stars-container">
                        {[1, 2, 3, 4, 5].map((rating) => (
                            <span
                                key={rating}
                                className={`star ${rating <= (hoveredStar || stars) ? 'filled' : ''}`}
                                onClick={() => handleStarClick(rating)}
                                onMouseEnter={() => handleStarHover(rating)}
                                onMouseLeave={handleStarLeave}
                            >
                                ★
                            </span>
                        ))}
                        <span className="stars-label">Stars</span>
                    </div>

                    <button 
                        type="submit" 
                        disabled={!review.trim() || stars === 0}
                        className="submit-button"
                    >
                        Submit Your Review
                    </button>
                </form>

                <button onClick={onClose} className="close-button">×</button>
            </div>
        </div>
    );
};

export default ReviewModal;
