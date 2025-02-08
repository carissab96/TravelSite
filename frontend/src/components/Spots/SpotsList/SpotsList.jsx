import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../../store/spots';
import './SpotsList.css';

function SpotsList() {
    const dispatch = useDispatch();
    const spots = useSelector(state => Object.values(state.spots.allSpots));

    useEffect(() => {
        dispatch(fetchSpots());
    }, [dispatch]);

    return (
        <div className="spots-grid">
            {spots.map(spot => (
                <div key={spot.id} className="spot-tile">
                    {/* We'll add the tile content in the next step */}
                </div>
            ))}
        </div>
    );
}

export default SpotsList;
