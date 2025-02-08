import { legacy_createStore as createStore, combineReducers, applyMiddleware, compose } from "redux";
import { thunk } from "redux-thunk";
import sessionReducer from './session';
import spotsReducer from './spots';

const rootReducer = combineReducers({
    session: sessionReducer,
    spots: spotsReducer
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