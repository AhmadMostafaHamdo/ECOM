import { configureStore } from '@reduxjs/toolkit'; // toolkit added
import rootreducers from "./Components/redux/reducers/main";

const store = configureStore({
    reducer: rootreducers,
    // Redux Toolkit comes with built-in thunk and DevTools setup.
});

export default store;