import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../../api';

export const fetchWishlist = createAsyncThunk(
    'wishlist/fetchWishlist',
    async (_, { rejectWithValue }) => {
        try {
            const res = await axiosInstance.get('/wishlist');
            return res.data.wishlist || [];
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        status: 'idle',
        error: null,
    },
    reducers: {
        // We can add local reducers here if needed for optimistic updates
        addToWishlistLocal: (state, action) => {
            state.items.push(action.payload);
        },
        removeFromWishlistLocal: (state, action) => {
            state.items = state.items.filter(item => {
                const id = item._id || item.id;
                return id !== action.payload;
            });
        },
        clearWishlistLocal: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { addToWishlistLocal, removeFromWishlistLocal, clearWishlistLocal } = wishlistSlice.actions;

export default wishlistSlice.reducer;
