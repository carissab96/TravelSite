import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWithCsrf } from './csrf';

// Thunk action to fetch reviews for a spot
export const fetchSpotReviews = createAsyncThunk(
    'reviews/fetchSpotReviews',
    async (spotId) => {
        try {
            const response = await fetchWithCsrf(`/api/reviews/${spotId}/reviews`);
            if (!response.ok) {
                if (response.status === 404) {
                    return []; // Return empty array for spots with no reviews
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
            const response = await fetchWithCsrf(`/api/reviews/${spotId}/reviews`, {
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
            });
    }
});

export const { clearSpotReviews } = reviewsSlice.actions;

// Selectors
export const selectSpotReviews = (state) => state.reviews.spot.items;
export const selectSpotReviewsLoading = (state) => state.reviews.spot.loading;
export const selectSpotReviewsError = (state) => state.reviews.spot.error;

export default reviewsSlice.reducer;