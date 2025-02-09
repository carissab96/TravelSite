// /frontend/src/components/Reviews/Reviews.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSpotReviews } from '../../store/reviews';
import './Reviews.css';

function Reviews({ spotId }) {
    const dispatch = useDispatch();
    const reviews = useSelector(state => state.reviews.spot.items);
    const currentUser = useSelector(state => state.session.user);
    const spot = useSelector(state => state.spots.singleSpot);
    
    const isSpotOwner = currentUser && spot && currentUser.id === spot.ownerId;
    const hasUserReviewed = currentUser && reviews.some(review => review.userId === currentUser.id);
    const canPostReview = currentUser && !isSpotOwner && !hasUserReviewed;

    useEffect(() => {
        if (spotId) {
            dispatch(fetchSpotReviews(spotId));
        }
    }, [dispatch, spotId]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews-section">
                <h2>Reviews</h2>
                <p className="no-reviews">Be the first to post a review!</p>
                {canPostReview && (
                    <button className="post-review-button">Post Your Review</button>
                )}
            </div>
        );
    }

    return (
        <div className="reviews-section">
            <h2>Reviews</h2>
            <div className="reviews-list">
                {reviews.map(review => (
                    <div key={review.id} className="review-item">
                        <div className="reviewer-info">
                            <h3>{review.User?.firstName}</h3>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                    </div>
                ))}
            </div>
            {canPostReview && (
                <button className="post-review-button">Post Your Review</button>
            )}
        </div>
    );
}

export default Reviews;