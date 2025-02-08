import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotDetails } from '../../../store/spots';
import './SpotDetails.css';

function SpotDetails() {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.singleSpot);

    useEffect(() => {
        dispatch(fetchSpotDetails(spotId));
    }, [dispatch, spotId]);

    if (!spot) return null;

    const handleReserve = () => {
        window.alert('Feature coming soon');
    };

    return (
        <div className="spot-details">
            <h1>{spot.name}</h1>
            <p className="location">{spot.city}, {spot.state}, {spot.country}</p>
            
            <div className="images-container">
                <div className="main-image">
                    <img src={spot.images[0]?.url} alt={spot.name} />
                </div>
                <div className="small-images">
                    {spot.images.slice(1, 5).map((image, index) => (
                        <div key={index} className="small-image">
                            <img src={image.url} alt={`${spot.name} view ${index + 2}`} />
                        </div>
                    ))}
                </div>
            </div>

            <div className="spot-info">
                <div className="host-info">
                    <h2>Hosted by {spot.owner.firstName} {spot.owner.lastName}</h2>
                    <p className="description">{spot.description}</p>
                </div>

                <div className="callout-box">
                    <div className="price">
                        <span className="amount">${spot.price}</span>
                        <span className="night">night</span>
                    </div>
                    <button 
                        className="reserve-button"
                        onClick={handleReserve}
                    >
                        Reserve
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SpotDetails;
