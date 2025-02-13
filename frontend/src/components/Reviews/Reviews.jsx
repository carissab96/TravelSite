// /frontend/src/components/Reviews/Reviews.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSpotReviews, deleteReview } from '../../store/reviews';
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

    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            await dispatch(deleteReview(reviewId));
            dispatch(fetchSpotReviews(spotId));
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Handle loading state
    const reviewsLoading = useSelector(state => state.reviews.spot.loading);
    const reviewsError = useSelector(state => state.reviews.spot.error);

    if (reviewsLoading) {
        return <div className="reviews-section">Loading reviews...</div>;
    }

    // Don't show error for 404 (no reviews yet)
    if (reviewsError && !reviewsError.includes("couldn't be found")) {
        return <div className="reviews-section">Error loading reviews: {reviewsError}</div>;
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="reviews-section">
                <h2>★ New</h2>
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
                        {currentUser && currentUser.id === review.userId && (
                            <button 
                                onClick={() => handleDeleteReview(review.id)}
                                className="delete-review-button"
                            >
                                Delete Review
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Reviews;