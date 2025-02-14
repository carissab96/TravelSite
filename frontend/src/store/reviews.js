import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithCsrf } from './csrf';

// Thunk action to fetch reviews for a spot
export const fetchSpotReviews = createAsyncThunk(
    'reviews/fetchSpotReviews',
    async (spotId) => {
        try {
            const response = await fetchWithCsrf(`/api/reviews/reviews/${spotId}/reviews`);
            // For new spots with no reviews yet, the backend returns 404
            // We should handle this gracefully by returning an empty array
            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                const error = await response.json();
                throw new Error(error.message || 'Failed to fetch reviews');
            }
            const data = await response.json();
            return data.reviews || [];
        } catch (error) {
            console.error('Error fetching reviews:', error);
            throw error;
        }
    }
);

// Thunk action to create a new review
export const createReview = createAsyncThunk(
    'reviews/createReview',
    async ({ spotId, review }) => {
        try {
            const response = await fetchWithCsrf(`/api/reviews/reviews/${spotId}/reviews`, {
                method: 'POST',
                body: JSON.stringify(review)
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create review');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }
);

// Thunk action to delete a review
export const deleteReview = createAsyncThunk(
    'reviews/deleteReview',
    async (reviewId) => {
        try {
            const response = await fetchWithCsrf(`/api/reviews/${reviewId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete review');
            }
            return reviewId; // Return the ID of the deleted review
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }
);

// Thunk action to fetch spot details
export const fetchSpotDetails = createAsyncThunk(
    'spots/fetchSpotDetails',
    async (spotId) => {
        const response = await fetchWithCsrf(`/api/spots/${spotId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch spot details');
        }
        const data = await response.json();
        return data;
    }
);

const reviewsSlice = createSlice({
    name: 'reviews',
    initialState: {
        spot: {
            // Reviews for the currently viewed spot
            items: [],
            loading: false,
            error: null
        },
        user: {
            // Reviews by the current user
            items: [],
            loading: false,
            error: null
        }
    },
    reducers: {
        clearSpotReviews: (state) => {
            state.spot.items = [];
            state.spot.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Handle fetchSpotReviews
            .addCase(fetchSpotReviews.pending, (state) => {
                state.spot.loading = true;
                state.spot.error = null;
            })
            .addCase(fetchSpotReviews.fulfilled, (state, action) => {
                state.spot.loading = false;
                state.spot.items = action.payload;
            })
            .addCase(fetchSpotReviews.rejected, (state, action) => {
                state.spot.loading = false;
                state.spot.error = action.error.message;
            })
            // Handle createReview
            .addCase(createReview.fulfilled, (state, action) => {
                state.spot.items.unshift(action.payload); // Add new review at the beginning
            })
            // Handle deleteReview
            .addCase(deleteReview.fulfilled, (state, action) => {
                state.spot.items = state.spot.items.filter(review => review.id !== action.payload);
            })  
            .addCase(deleteReview.rejected, (state, action) => {
                state.spot.loading = false;
                state.spot.error = action.error.message;
            });
    }
});

export const { clearSpotReviews } = reviewsSlice.actions;

// Selectors
export const selectSpotReviews = (state) => state.reviews.spot.items;
export const selectSpotReviewsLoading = (state) => state.reviews.spot.loading;
export const selectSpotReviewsError = (state) => state.reviews.spot.error;

// export { fetchSpotReviews, };

export default reviewsSlice.reducer;