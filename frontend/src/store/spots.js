
import { fetchWithCsrf } from './csrf';


// Action Types
const LOAD_SPOTS = 'spots/LOAD_SPOTS';
const RECEIVE_SPOT = 'spots/RECEIVE_SPOT';
const CREATE_SPOT = 'spots/CREATE_SPOT';

// Action Creators
const loadSpots = (spots) => ({
    type: LOAD_SPOTS,
    spots
});

const receiveSpot = (spot) => ({
    type: RECEIVE_SPOT,
    spot
});

const createSpot = (spot) => ({
    type: CREATE_SPOT,
    spot
});

// Thunk Action Creators
export const fetchSpots = () => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/spots');
        if (response.ok) {
            const spots = await response.json();
            dispatch(loadSpots(spots));
            return spots;
        }
    } catch (error) {
        return { errors: ['An error occurred while fetching spots.'] };
    }
};

export const fetchSpotDetails = (spotId) => async (dispatch) => {
    try {
        const response = await fetchWithCsrf(`/api/spots/${spotId}`);
        if (response.ok) {
            const spot = await response.json();
            dispatch(receiveSpot(spot));
            return spot;
        }
    } catch (error) {
        return { errors: ['An error occurred while fetching spot details.'] };
    }
};

export const createNewSpot = (spotData) => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/spots', {
            method: 'POST',
            body: JSON.stringify(spotData)
        });
        
        if (response.ok) {
            const spot = await response.json();
            dispatch(createSpot(spot));
            return spot;
        }
    } catch (error) {
        return { 
            errors: {
                title: error.errors?.title || 'Invalid title',
                price: error.errors?.price || 'Invalid price',
                images: error.errors?.images || 'Invalid image URLs'
            }
        };
    }
};

// Initial State
const initialState = {
    allSpots: {},
    singleSpot: null,
    isLoading: false,
    errors: null
};

// Reducer
const spotsReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOAD_SPOTS: {
            const allSpots = {};
            action.spots.forEach(spot => {
                allSpots[spot.id] = {
                    ...spot,
                    avgRating: spot.avgRating || 'New',
                    previewImage: spot.previewImage || null
                };
            });
            return {
                ...state,
                allSpots,
                isLoading: false,
                errors: null
            };
        }
        case RECEIVE_SPOT:
            return {
                ...state,
                singleSpot: {
                    ...action.spot,
                    avgRating: action.spot.avgRating || 'New',
                    images: action.spot.images || [],
                    owner: {
                        firstName: action.spot.Owner?.firstName,
                        lastName: action.spot.Owner?.lastName
                    }
                },
                isLoading: false,
                errors: null
            };
        case CREATE_SPOT:
            return {
                ...state,
                allSpots: {
                    ...state.allSpots,
                    [action.spot.id]: action.spot
                },
                singleSpot: action.spot,
                isLoading: false,
                errors: null
            };
        default:
            return state;
    }
};

export default spotsReducer;