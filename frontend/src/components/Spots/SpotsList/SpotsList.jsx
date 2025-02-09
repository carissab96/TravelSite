import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots } from '../../../store/spots';
import SpotTile from './SpotTile';
import './SpotsList.css';

function SpotsList() {
    const dispatch = useDispatch();
    const spots = useSelector(state => {
        console.log('Redux state:', state);
        return Object.values(state.spots.allSpots);
    });

    useEffect(() => {
        console.log('Fetching spots...');
        dispatch(fetchSpots());
    }, [dispatch]);

    if (!spots.length) {
        return <div className="loading">Loading spots...</div>;
    }

    return (
        <div className="spots-grid">
            {spots.map(spot => (
                <SpotTile key={spot.id} spot={spot} />
            ))}
        </div>
    );
}

export default SpotsList;
