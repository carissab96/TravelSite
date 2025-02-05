import { fetchWithCsrf } from './csrf';

// Action Types
const SET_USER = 'session/SET_USER';
const REMOVE_USER = 'session/REMOVE_USER';

// Action Creators
const setUser = (user) => ({
    type: SET_USER,
    payload: user
});

const removeUser = () => ({
    type: REMOVE_USER
});

// Thunk Action Creators
export const login = (credentials) => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/session', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
        const data = await response.json();
        dispatch(setUser(data.user));
        return data;
    } catch (error) {
        const data = await error.json();
        return data;
    }
};

export const restoreUser = () => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/session');
        const data = await response.json();
        dispatch(setUser(data.user));
        return data;
    } catch (error) {
        const data = await error.json();
        return data;
    }
};

export const signup = (user) => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
        const data = await response.json();
        dispatch(setUser(data.user));
        return data;
    } catch (error) {
        const data = await error.json();
        return data;
    }
};

export const logout = () => async (dispatch) => {
    try {
        const response = await fetchWithCsrf('/api/session', {
            method: 'DELETE'
        });
        dispatch(removeUser());
        return response;
    } catch (error) {
        const data = await error.json();
        return data;
    }
};

// Initial State
const initialState = { 
    user: null
};

// Reducer
const sessionReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_USER:
            return { 
                user: action.payload ? {
                    id: action.payload.id,
                    email: action.payload.email,
                    username: action.payload.username,
                    firstName: action.payload.firstName,
                    lastName: action.payload.lastName
                } : null
            };
        case REMOVE_USER:
            return { 
                user: null
            };
        default:
            return state;
    }
};

export default sessionReducer;