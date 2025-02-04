import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";

// Uncomment and update these imports when you have the reducer files ready
// import authReducer from "./auth";
// import uiReducer from "./ui";

const rootReducer = combineReducers({
    // Uncomment these when you have the reducers ready
    // auth: authReducer,
    // ui: uiReducer
});

let enhancer;

if (import.meta.env.MODE === 'production') {
    enhancer = applyMiddleware(thunk);
} else {
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
    // Dynamically import logger only in development
    const reduxLogger = await import("redux-logger").then(module => module.default);
    enhancer = composeEnhancers(applyMiddleware(thunk, reduxLogger));
}

const configureStore = (preloadedState) => {
    const store = createStore(rootReducer, preloadedState, enhancer);
    return store;
};

export default configureStore;