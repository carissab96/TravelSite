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
        // First, create the spot
        const spotResponse = await fetchWithCsrf('/api/spots', {
            method: 'POST',
            body: JSON.stringify({
                address: spotData.address,
                city: spotData.city,
                state: spotData.state,
                country: spotData.country,
                lat: spotData.lat,
                lng: spotData.lng,
                name: spotData.name,
                description: spotData.description,
                price: spotData.price
            })
        });

        if (!spotResponse.ok) {
            const error = await spotResponse.json();
            throw new Error(error.message || 'Failed to create spot');
        }

        const spot = await spotResponse.json();

        // Then, add images one by one
        const imagePromises = spotData.images.map(async (image) => {
            const imageResponse = await fetchWithCsrf(`/api/spots/${spot.id}/images`, {
                method: 'POST',
                body: JSON.stringify({
                    url: image.url,
                    preview: image.preview
                })
            });

            if (!imageResponse.ok) {
                const error = await imageResponse.json();
                console.error('Failed to add image:', error);
                // Continue with other images even if one fails
                return null;
            }

            return imageResponse.json();
        });

        await Promise.all(imagePromises);

        // Return the created spot
        return spot;
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
        return spotId;
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
                delete state.allSpots[action.payload];
                if (state.userSpots) {
                    delete state.userSpots[action.payload];
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

export default spotsSlice.reducer;