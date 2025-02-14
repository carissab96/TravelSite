import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
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
        console.log('Spots API response:', data);
        
        // Handle both possible response formats
        const spots = data.Spots || data.spots || data;
        if (!Array.isArray(spots)) {
            console.error('Unexpected spots data format:', spots);
            throw new Error('Invalid spots data format');
        }
        return spots;
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
    async (spotData, { rejectWithValue }) => {
        try {
            // Extract images array from spotData
            const { images, ...spotDetails } = spotData;

            // Create the spot
            const spotResponse = await fetchWithCsrf('/api/spots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(spotDetails)
            });

            let responseData;
            try {
                responseData = await spotResponse.json();
            } catch (parseError) {
                return rejectWithValue('Failed to parse server response');
            }

            if (!spotResponse.ok) {
                return rejectWithValue({
                    message: responseData.message || 'Failed to create spot',
                    errors: responseData.errors || {}
                });
            }

            const createdSpot = responseData.spot || responseData;
            if (!createdSpot || !createdSpot.id) {
                return rejectWithValue('Invalid response from server');
            }

            // Add images
            for (const image of images) {
                const imageResponse = await fetchWithCsrf(`/api/spots/${createdSpot.id}/images`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(image)
                });

                if (!imageResponse.ok) {
                    // If image upload fails, delete the spot
                    await fetchWithCsrf(`/api/spots/${createdSpot.id}`, {
                        method: 'DELETE'
                    });
                    return rejectWithValue('Failed to add images to spot');
                }
            }

            // Return the created spot with its ID
            return { spot: createdSpot };
        } catch (error) {
            console.error('Error in createSpot:', error);
            return rejectWithValue(error.message || 'An unexpected error occurred');
        }
    }
);

export const fetchUserSpots = createAsyncThunk(
    'spots/fetchUserSpots',
    async () => {
        const response = await fetchWithCsrf('/api/spots/current');
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch user spots');
        }
        const data = await response.json();
        return data.Spots || [];
    }
);

export const updateSpot = createAsyncThunk(
    'spots/updateSpot',
    async ({ spotId, spotData }) => {
        const response = await fetchWithCsrf(`/api/spots/${spotId}`, {
            method: 'PUT',
            body: JSON.stringify(spotData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update spot');
        }
        return response.json();
    }
);

export const deleteSpot = createAsyncThunk(
    'spots/deleteSpot',
    async (spotId) => {
        const response = await fetchWithCsrf(`/api/spots/${spotId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to delete spot');
        }
        const data = await response.json();
        return { spotId, ...data };
    }
);
// Initial State
const initialState = {
    allSpots: {},
    singleSpot: null,
    isLoading: false,
    error: null,
    userSpots: null
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
                state.allSpots[action.payload.spot.id] = action.payload.spot;
                state.singleSpot = action.payload.spot;
            })
            .addCase(createSpot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Fetch User Spots
            .addCase(fetchUserSpots.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserSpots.fulfilled, (state, action) => {
                state.isLoading = false;
                state.userSpots = {};
                action.payload.forEach(spot => {
                    state.userSpots[spot.id] = {
                        ...spot,
                        avgRating: spot.avgRating || 'New',
                        previewImage: spot.previewImage || null
                    };
                });
            })
            .addCase(fetchUserSpots.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Delete Spot
            .addCase(deleteSpot.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(deleteSpot.fulfilled, (state, action) => {
                state.isLoading = false;
                const { spotId } = action.payload;
                // Remove from allSpots
                if (state.allSpots && spotId in state.allSpots) {
                    delete state.allSpots[spotId];
                }
                // Remove from userSpots if present
                if (state.userSpots && spotId in state.userSpots) {
                    delete state.userSpots[spotId];
                }
            })
            .addCase(deleteSpot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            // Update Spot
            .addCase(updateSpot.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateSpot.fulfilled, (state, action) => {
                state.isLoading = false;
                const updatedSpot = action.payload.spot;
                state.allSpots[updatedSpot.id] = updatedSpot;
                if (state.userSpots) {
                    state.userSpots[updatedSpot.id] = updatedSpot;
                }
                state.singleSpot = updatedSpot;
            })
            .addCase(updateSpot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

// Memoized Selectors
export const selectAllSpots = createSelector(
    state => state.spots.allSpots,
    allSpots => Object.values(allSpots)
);

export default spotsSlice.reducer;