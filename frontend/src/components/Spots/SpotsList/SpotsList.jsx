import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpots, selectAllSpots } from '../../../store/spots';
import SpotTile from './SpotTile';
import './SpotsList.css';

function SpotsList() {
    const dispatch = useDispatch();
    const spots = useSelector(selectAllSpots);
    const isLoading = useSelector(state => state.spots.isLoading);
    const error = useSelector(state => state.spots.error);

    useEffect(() => {
        console.log('Fetching spots...');
        dispatch(fetchSpots());
    }, [dispatch]);

    if (error) {
        return <div className="error">Error loading spots: {error}</div>;
    }

    if (isLoading) {
        return <div className="loading">Loading spots...</div>;
    }

    if (!spots.length) {
        return <div className="no-spots">No spots available.</div>;
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
