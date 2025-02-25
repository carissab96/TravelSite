import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserSpots } from '../../store/spots';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import DeleteSpotModal from '../DeleteSpotModal/DeleteSpotModal';
import './ManageSpots.css';

const ManageSpots = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const spots = useSelector(state => state.spots.userSpots);
    const user = useSelector(state => state.session.user);

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        dispatch(fetchUserSpots());
    }, [dispatch, user, navigate]);

    const handleUpdate = (spotId) => {
        navigate(`/spots/${spotId}/edit`);
    };
    async function handleCreateNew() {
        navigate('/spots/new');
    }

    if (!spots) return <div className="manage-spots-loading">Loading...</div>;

    return (
        <div className="manage-spots-container">
            <h1>Manage Your Spots</h1>
            <button className="create-spot-button" onClick={handleCreateNew}>
                Create a New Spot
            </button>
            
            <div className="spots-grid">
                {Object.values(spots).map(spot => (
                    <div key={spot.id} className="spot-card">
                        <img 
                            src={spot.previewImage} 
                            alt={spot.name}
                            className="spot-image"
                        />
                        <div className="spot-info">
                            <h3>{spot.name}</h3>
                            <p>{spot.city}, {spot.state}</p>
                            <p className="price"><span>${spot.price}</span> night</p>
                            <div className="spot-rating">
                                <i className="fas fa-star"></i>
                                <span className="stars">{spot.avgRating === 'New' ? 'New' : Number(spot.avgRating).toFixed(1)}</span>
                            </div>
                        </div>
                        <div className="spot-actions">
                            <button 
                                onClick={() => handleUpdate(spot.id)}
                                className="update-button"
                            >
                                Update
                            </button>
                            <OpenModalButton
                                buttonText="Delete"
                                modalComponent={
                                <DeleteSpotModal spotId={spot.id}
                                 onSuccess={() => dispatch(fetchUserSpots())}
                                 onError={() => console.error('Failed to delete spot')}
                                 />}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ManageSpots;