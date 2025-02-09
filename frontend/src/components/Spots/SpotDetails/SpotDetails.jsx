import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotDetails } from '../../../store/spots';
import './SpotDetails.css';

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const spot = useSelector(state => {
        console.log('Current Redux state:', state);
        return state.spots.singleSpot;
    });
    const isLoading = useSelector(state => state.spots.isLoading);
    const error = useSelector(state => state.spots.error);

    useEffect(() => {
        console.log('SpotDetails useEffect - spotId:', spotId);
        if (!spotId) return;

        dispatch(fetchSpotDetails(parseInt(spotId, 10)));
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

    return (
        <div className="spot-details">
            <header className="spot-header">
                <h1>{spot.name}</h1>
                <p className="location">
                    {spot.city}, {spot.state}, {spot.country}
                </p>
            </header>
            
            <div className="images-container">
                <div className="main-image">
                    <img 
                        src={spot.images[0]?.url || 'https://placehold.co/600x400?text=No+Image'} 
                        alt={spot.name}
                        onError={(e) => {
                            e.target.src = 'https://placehold.co/600x400?text=No+Image';
                        }}
                    />
                </div>
                <div className="small-images">
                    {spot.images.slice(1, 5).map((image, index) => (
                        <img 
                            key={index}
                            src={image.url}
                            alt={`${spot.name} view ${index + 2}`}
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/600x400?text=No+Image';
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="spot-content">
                <div className="spot-info">
                    <h2>Hosted by {spot.owner.firstName} {spot.owner.lastName}</h2>
                    <p className="description">{spot.description}</p>
                </div>

                <div className="callout-box">
                    <div className="price-info">
                        <span className="price">${spot.price}</span>
                        <span className="per-night">night</span>
                    </div>
                    <div className="rating-info">
                        <span className="stars">★ {spot.avgRating === 'New' ? 'New' : Number(spot.avgRating).toFixed(1)}</span>
                        {spot.numReviews > 0 && <span className="reviews-count">· {spot.numReviews} reviews</span>}
                    </div>
                    <button className="reserve-button" onClick={handleReserve}>
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotDetails;
