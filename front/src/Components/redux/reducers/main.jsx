import { getProductsReducers } from "./Productreducers";
import wishlistReducer from "../features/wishlistSlice";
import { combineReducers } from "redux"; // or from '@reduxjs/toolkit'

const rootreducers = combineReducers({
    getproductsdata: getProductsReducers,
    wishlist: wishlistReducer,
});

export default rootreducers;