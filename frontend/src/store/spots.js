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
        const data = await response.json();
        
        return data;
    }
);

export const createSpot = createAsyncThunk(
    'spots/createSpot',
    async (spotData, { rejectWithValue }) => {
        try {
            // First, create the spot
            // Clean up lat/lng - convert empty strings to null
            const lat = spotData.lat && spotData.lat.trim() !== '' ? parseFloat(spotData.lat) : null;
            const lng = spotData.lng && spotData.lng.trim() !== '' ? parseFloat(spotData.lng) : null;

            // Validate lat/lng before sending
            if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
                return rejectWithValue({ message: 'Latitude must be between -90 and 90' });
            }
            if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
                return rejectWithValue({ message: 'Longitude must be between -180 and 180' });
            }

            const price = parseFloat(spotData.price);
            if (isNaN(price) || price <= 0) {
                return rejectWithValue({ message: 'Price must be a positive number' });
            }

            // Clean up the data for submission
            const spotBody = {
                address: spotData.address.trim(),
                city: spotData.city.trim(),
                state: spotData.state.trim(),
                country: spotData.country.trim(),
                name: spotData.name.trim(),
                description: spotData.description.trim(),
                price
            };

            // Only include lat/lng if they are valid numbers
            if (lat !== null) spotBody.lat = lat;
            if (lng !== null) spotBody.lng = lng;

            const spotResponse = await fetchWithCsrf('/api/spots', {
                method: 'POST',
                body: JSON.stringify(spotBody)
            });

            if (!spotResponse.ok) {
                const errorData = await spotResponse.json();
                return rejectWithValue(errorData);
            }

            if (!spotResponse.ok) {
                const errorData = await spotResponse.json();
                console.error('Spot creation failed:', errorData);
                return rejectWithValue(errorData);
            }

            const spot = await spotResponse.json();
            console.log('Spot creation response:', spot); // Debug log
            
            if (!spot || typeof spot.id !== 'number') {
                console.error('Invalid spot data:', spot);
                return rejectWithValue({ 
                    message: 'Invalid spot data received from server. Expected spot object with numeric ID.'
                });
            }

            // Then, add images one by one
            const validImages = spotData.images
                .filter(image => image && image.url && image.url.trim())
                .map(image => ({
                    url: image.url.trim(),
                    preview: !!image.preview
                }));

            console.log('Processing images for spot ID:', spot.id); // Debug log

            if (validImages.length > 0) {
                const imagePromises = validImages.map(async (image) => {
                    try {
                        console.log(`Uploading image to spot ${spot.id}:`, image); // Debug log
                        
                        const imageResponse = await fetchWithCsrf(`/api/spots/${spot.id}/images`, {
                            method: 'POST',
                            body: JSON.stringify(image)
                        });

                        if (!imageResponse.ok) {
                            const error = await imageResponse.json();
                            console.error(`Failed to add image to spot ${spot.id}:`, error);
                            throw error; // Throw error to be caught in catch block
                        }

                        const imageResult = await imageResponse.json();
                        console.log(`Successfully uploaded image to spot ${spot.id}:`, imageResult);
                        return imageResult;
                    } catch (error) {
                        console.error(`Error uploading image to spot ${spot.id}:`, error);
                        throw error; // Re-throw to be caught by Promise.all
                    }
                });

                try {
                    // Wait for all image uploads to complete
                    const results = await Promise.all(imagePromises);
                    console.log(`All images uploaded for spot ${spot.id}:`, results);
                    
                    // Check if at least the preview image was uploaded
                    if (!results.some(r => r && r.preview)) {
                        console.warn(`No preview image was successfully uploaded for spot ${spot.id}`);
                    }
                } catch (error) {
                    console.error(`Failed to upload some images for spot ${spot.id}:`, error);
                    // Don't reject here - we still created the spot successfully
                }
            }

            // Return the created spot
            return spot;
        } catch (error) {
            console.error('Error in createSpot:', error);
            return rejectWithValue({
                message: error.message || 'An unexpected error occurred'
            });
        }
    }
);
export const updateSpot = createAsyncThunk(
    'spots/updateSpot',
    async ({ spotId, ...spotData }, { rejectWithValue }) => {
        try {
            // Clean up lat/lng - convert empty strings to null
            const lat = spotData.lat && spotData.lat.trim() !== '' ? parseFloat(spotData.lat) : null;
            const lng = spotData.lng && spotData.lng.trim() !== '' ? parseFloat(spotData.lng) : null;

            // Validate lat/lng before sending
            if (lat !== null && (isNaN(lat) || lat < -90 || lat > 90)) {
                return rejectWithValue({ message: 'Latitude must be between -90 and 90' });
            }
            if (lng !== null && (isNaN(lng) || lng < -180 || lng > 180)) {
                return rejectWithValue({ message: 'Longitude must be between -180 and 180' });
            }

            // Format images data if present
            let formattedData = { ...spotData };
            if (spotData.images && Array.isArray(spotData.images)) {
                formattedData.images = spotData.images.map(image => ({
                    url: image.url || image,
                    preview: false // Will be set to true for first image in backend
                }));
            }

            const response = await fetchWithCsrf(`/api/spots/${spotId}`, {
                method: 'PUT',
                body: JSON.stringify(formattedData)
            });

            if (!response.ok) {
                const error = await response.json();
                return rejectWithValue(error);
            }

            const updatedSpot = await response.json();
            return updatedSpot;
        } catch (error) {
            return rejectWithValue({
                message: error.message || 'Failed to update spot'
            });
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
                    SpotImages: action.payload.SpotImages || [],
                    Owner: action.payload.Owner || {},
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
                const formattedSpot = {
                    ...action.payload,
                    avgRating: 'New',
                    SpotImages: action.payload.SpotImages || [],
                    Owner: action.payload.Owner || {},
                    numReviews: 0
                };
                state.allSpots[action.payload.id] = formattedSpot;
                state.singleSpot = formattedSpot;
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
                state.singleSpot = action.payload;
                if (state.allSpots) {
                    state.allSpots[action.payload.id] = action.payload;
                }
                if (state.userSpots) {
                    state.userSpots[action.payload.id] = action.payload;
                }
            })
            .addCase(updateSpot.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    }
});

export default spotsSlice.reducer;