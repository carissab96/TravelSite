// /frontend/src/components/Reviews/Reviews.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSpotReviews } from '../../store/reviews';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import DeleteReviewModal from '../DeleteReviewModal/DeleteReviewModal';
import './Reviews.css';

function Reviews({ spotId }) {
    const dispatch = useDispatch();
    const reviews = useSelector(state => state.reviews.spot.items);
    const reviewsLoading = useSelector(state => state.reviews.spot.loading);
    const reviewsError = useSelector(state => state.reviews.spot.error);
    const currentUser = useSelector(state => state.session.user);
    
    const isSpotOwner = currentUser && spot && currentUser.id === spot.ownerId;
    const hasUserReviewed = currentUser && reviews.some(review => review.userId === currentUser.id);

    useEffect(() => {
        if (spotId) {
            dispatch(fetchSpotReviews(spotId));
        }
    }, [dispatch, spotId]);

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (reviewsLoading) {
        return <div className="reviews-section">Loading reviews...</div>;
    }

    if (reviewsError && !(reviewsError).includes("couldn't be found")) {
        return <div className="reviews-section">Error loading reviews: {reviewsError}</div>;
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews-section">
                <p className="no-reviews">Be the first to post a review!</p>
            </div>
        );
    }

    return (
        <div className="reviews-section">
            <h2>Reviews</h2>
            <div className="reviews-list">
                {Array.isArray(reviews) && reviews.map(review => (
                    <div key={review.id} className="review-item">
                        <div className="reviewer-info">
                            <h3>{review.User?.firstName || 'Anonymous'}</h3>
                            <span className="review-date">{formatDate(review.createdAt)}</span>
                        </div>
                        <div className="review-rating">
                            <span className="stars">★ {review.stars}</span>
                        </div>
                        <p className="review-text">{review.comment}</p>
                        {currentUser && currentUser.id === review.userId && (
                            <OpenModalButton 
                                modalComponent={<DeleteReviewModal spotId={spotId} reviewId={review.id} />}
                                buttonText="Delete Review"
                                className="delete-review-button"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Reviews;