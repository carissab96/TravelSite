import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithCsrf } from './csrf';

// Thunk Actions
export const fetchSpots = createAsyncThunk(
    'spots/fetchSpots',
    async () => {
        const response = await fetchWithCsrf('/api/spots');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch spots');
        }
        const data = await response.json();
        return data.Spots || data;
    }
);

export const fetchSpotDetails = createAsyncThunk(
    'spots/fetchSpotDetails',
    async (spotId) => {
        if (!spotId) throw new Error('Spot ID is required');
        
        const response = await fetchWithCsrf(`/api/spots/${spotId}`);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch spot details');
        }
        return response.json();
    }
);

export const createSpot = createAsyncThunk(
    'spots/createSpot',
    async (spotData) => {
        const response = await fetchWithCsrf('/api/spots', {
            method: 'POST',
            body: JSON.stringify(spotData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create spot');
        }
        return response.json();
    }
);

// Initial State
const initialState = {
    allSpots: {},
    singleSpot: null,
    isLoading: false,
    error: null
};

// Slice
const spotsSlice = createSlice({
    name: 'spots',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Spots
            .addCase(fetchSpots.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSpots.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allSpots = {};
                action.payload.forEach(spot => {
                    state.allSpots[spot.id] = {
                        ...spot,
                        avgRating: spot.avgRating || 'New',
                        previewImage: spot.previewImage || null
                    };
                });
            })
            .addCase(fetchSpots.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch Spot Details
            .addCase(fetchSpotDetails.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchSpotDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.singleSpot = {
                    ...action.payload,
                    avgRating: action.payload.avgStarRating || 'New',
                    images: action.payload.SpotImages || [],
                    owner: action.payload.Owner || {},
                    numReviews: action.payload.numReviews || 0
                };
            })
            .addCase(fetchSpotDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Create Spot
            .addCase(createSpot.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createSpot.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allSpots[action.payload.id] = action.payload;
                state.singleSpot = action.payload;
            })
            .addCase(createSpot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

export default spotsSlice.reducer;