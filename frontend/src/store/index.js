import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './session';
import spotsReducer from './spots';
import logger from 'redux-logger';

const middleware = (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
        serializableCheck: false
    });

    if (import.meta.env.MODE !== 'production') {
        middlewares.push(logger);
    }

    return middlewares;
};

const store = configureStore({
    reducer: {
        session: sessionReducer,
        spots: spotsReducer
    },
    middleware,
    devTools: import.meta.env.MODE !== 'production'
});

export default store;