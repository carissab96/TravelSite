import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import './SpotTile.css';

function SpotTile({ spot }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/spots/${spot.id}`);
    };

    const renderRating = () => {
        // Show 'New' if avgRating is null, undefined, 0, or NaN
        if (!spot.avgRating || spot.avgRating === 0 || isNaN(spot.avgRating)) {
            return 'New';
        }
        
        // Convert to number and format to 1 decimal place
        const rating = Number(spot.avgRating);
        return (
            <>
                <i className="fas fa-star"></i>
                {` ${rating.toFixed(1)}`}
            </>
        );
    };

    return (
        <div 
            className="spot-tile"
            onClick={handleClick}
            title={spot.name}
        >
            <div className="spot-image-container">
                <img 
                    src={spot.previewImage} 
                    alt={spot.name}
                    onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                    }}
                />
            </div>
            <div className="spot-info">
                <div className="spot-header">
                    <div className="spot-name">{spot.name}</div>
                    <div className="spot-rating">
                        {renderRating()}
                    </div>
                </div>
                <div className="spot-location">
                    {spot.city}, {spot.state}
                </div>
                <div className="spot-price">
                    <span className="price">${spot.price}</span> <span className="night">night</span>
                </div>
            </div>
        </div>
    );
}

SpotTile.propTypes = {
    spot: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        city: PropTypes.string.isRequired,
        state: PropTypes.string.isRequired,
        price: PropTypes.number.isRequired,
        previewImage: PropTypes.string,
        avgRating: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ])
    }).isRequired
};

export default SpotTile;
