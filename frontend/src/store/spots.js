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
    async (spotFormData, { rejectWithValue }) => {
        try {
            console.log('Starting spot creation...');
            // First, create the spot
            const spotResponse = await fetchWithCsrf('/api/spots', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    address: spotFormData.get('address'),
                    city: spotFormData.get('city'),
                    state: spotFormData.get('state'),
                    country: spotFormData.get('country'),
                    lat: Number(spotFormData.get('lat')),
                    lng: Number(spotFormData.get('lng')),
                    name: spotFormData.get('name'),
                    description: spotFormData.get('description'),
                    price: Number(spotFormData.get('price'))
                })
            });

            if (!spotResponse.ok) {
                try {
                    const error = await spotResponse.json();
                    return rejectWithValue(error.message || 'Failed to create spot');
                } catch (jsonError) {
                    console.error('Error parsing response:', jsonError);
                    const textError = await spotResponse.text();
                    console.error('Raw response:', textError);
                    return rejectWithValue('Server error: ' + textError);
                }
            }

            const spotResponseData = await spotResponse.json();
            const createdSpot = spotResponseData.spot || spotResponseData;

            if (!createdSpot || !createdSpot.id) {
                throw new Error('Invalid response from server');
            }

            // Upload preview image
            const previewImage = spotFormData.get('previewImage');
            if (previewImage) {
                const previewFormData = new FormData();
                previewFormData.append('image', previewImage);
                previewFormData.append('preview', 'true');

                const previewResponse = await fetchWithCsrf(`/api/spots/${createdSpot.id}/images`, {
                    method: 'POST',
                    body: previewFormData
                });

                if (!previewResponse.ok) {
                    // If preview image upload fails, delete the spot
                    await fetchWithCsrf(`/api/spots/${createdSpot.id}`, { method: 'DELETE' });
                    const error = await previewResponse.json();
                    return rejectWithValue(error.message || 'Failed to upload preview image');
                }
            }

            // Upload additional images
            const additionalImages = spotFormData.getAll('images');
            for (const image of additionalImages) {
                const imageFormData = new FormData();
                imageFormData.append('image', image);
                imageFormData.append('preview', 'false');

                const imageResponse = await fetchWithCsrf(`/api/spots/${createdSpot.id}/images`, {
                    method: 'POST',
                    body: imageFormData
                });

                if (!imageResponse.ok) {
                    // Log error but continue with other images
                    console.error('Failed to upload additional image:', await imageResponse.json());
                }
            }

            // Get the final spot with all images
            const finalResponse = await fetchWithCsrf(`/api/spots/${createdSpot.id}`);
            if (!finalResponse.ok) {
                throw new Error('Failed to fetch updated spot details');
            }

            return await finalResponse.json();
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
                state.allSpots[action.payload.id] = action.payload;
                state.singleSpot = action.payload;
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