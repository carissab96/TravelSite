import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotDetails } from '../../../store/spots';
import { fetchSpotReviews } from '../../../store/reviews';
import './SpotDetails.css';
import Reviews from '../../Reviews/Reviews';
import ReviewModal from '../../ReviewModal/ReviewModal';

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const [showReviewModal, setShowReviewModal] = useState(false);
    
    console.log('SpotDetails component render - spotId:', spotId);

    const spot = useSelector(state => state.spots.singleSpot);
    const reviews = useSelector(state => state.reviews.spot.items);
    const isLoading = useSelector(state => state.spots.isLoading);
    const error = useSelector(state => state.spots.error);
    const user = useSelector(state => state.session.user);

    // Check if current user is the owner
    const isOwner = user && spot && user.id === spot.ownerId;
    
    // Check if current user has already reviewed
    const hasReviewed = user && reviews.some(review => review.userId === user.id);

        const handlePostReview = () => {
            console.log('handlePostReview');
            if (!isOwner && !hasReviewed) {
                //Proceed to open the ReviewModal
                setShowReviewModal(true);
            } else {
                //show a message that the user already has a review
                window.alert('You already have a review for this spot');
            }
        };

    useEffect(() => {
        if (!spotId) return;
        console.log('Dispatching fetchSpotDetails...', spotId);
        dispatch(fetchSpotDetails(parseInt(spotId, 10)));
        // dispatch(fetchSpotReviews(parseInt(spotId, 10)));
    }, [dispatch, spotId]);

    console.log('Component render - spot:', spot, 'isLoading:', isLoading, 'error:', error);

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    if (isLoading || !spot) {
        return <div className="loading">Loading spot details...</div>;
    }

    const handleReserve = () => {
        window.alert('Feature coming soon');
    };

    const handleReviewSuccess = () => {
        // Refresh reviews after a new review is posted
        console.log('Dispatching fetchSpotReviews...');
        dispatch(fetchSpotReviews(parseInt(spotId, 10)));
        console.log('Dispatching fetchSpotDetails...');
        dispatch(fetchSpotDetails(parseInt(spotId, 10))); // To update avg rating
    };

    return (
        <div className="spot-details">
            <div className="spot-details-content">
                <header className="spot-header">
                    <div className="title-location">
                        <h1>{spot.name}</h1>
                        <p className="location">{spot.city}, {spot.state}, {spot.country}</p>
                    </div>
                </header>
            
            <div className="images-container">
                <div className="main-image">
                    <img 
                        src={
                            (spot.images && spot.images.length > 0 && spot.images[0]?.url) || 
                            'https://placehold.co/600x400?text=No+Image'
                        } 
                        alt={spot.name}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                    />
                </div>
                <div className="small-images">
                    {spot.images && spot.images.length > 1 ? 
                        spot.images.slice(1, 5).map((image, index) => (
                            <img 
                                key={index}
                                src={image.url || 'https://placehold.co/600x400?text=No+Image'}
                                alt={`${spot.name} view ${index + 2}`}
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/600x400?text=No+Image';
                                }}
                            />
                        ))
                    : null}
                </div>
            </div>

            <div className="spot-content">
                <div className="spot-info">
                    <h2>Hosted by {spot.owner?.firstName || 'Unknown'} {spot.owner?.lastName || ''}</h2>
                    <p className="description">{spot.description}</p>
                </div>
                <div className="callout-box">
                    <div className="price-info">
                        <span className="price">${spot.price}</span> <span className="per-night">night</span>
                    </div>
                    <div className="rating-info">
                        <span className="stars">★ {spot.avgRating === 'New' ? 'New' : Number(spot.avgRating).toFixed(1)}</span>
                        {spot.numReviews > 0 && (
                            <span className="reviews-count">
                                · {spot.numReviews} {spot.numReviews === 1 ? 'review' : 'reviews'}
                            </span>
                        )}
                    </div>
                    <button className="reserve-button" onClick={handleReserve}>
                        Reserve
                    </button>
                </div>
            </div>

            {/* Reviews Section */}
            <section className="reviews-section">
                <div className="reviews-header">
                    <h2>
                        ★ {spot.avgStarRating ? spot.avgStarRating.toFixed(1) : 'New'} · 
                        {spot.numReviews || 0} {(spot.numReviews === 1) ? 'Review' : 'Reviews'}
                    </h2>
                        <button 
                            onClick={handlePostReview}
                            className="post-review-button">
                            Post Your Review
                        </button>
                        {showReviewModal && (
                            <ReviewModal
                                spotId={spotId}
                                onClose={() => setShowReviewModal(false)}
                                onSuccess={handleReviewSuccess}
                            />
                        )}  
                </div>
                
                {/* Review Modal */}
                {showReviewModal && (
                    <ReviewModal 
                        spotId={parseInt(spotId, 10)}
                        onClose={() => setShowReviewModal(false)}
                        onSuccess={handleReviewSuccess}
                    />
                )}

                {/* Reviews List */}
                <Reviews spotId={parseInt(spotId, 10)} />
            </section>
            </div>
        </div>
    );
}

export default SpotDetails;
