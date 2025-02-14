import fetchWithCsrf from './csrf';

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
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            console.error('Error parsing response:', e);
            return { 
                errors: { 
                    credential: 'Server error: Invalid response format'
                } 
            };
        }

        console.log('Login response:', { 
            status: response.status, 
            ok: response.ok,
            data 
        });

        if (!response.ok) {
            if (response.status === 401) {
                return { 
                    errors: { 
                        credential: 'Invalid credentials'
                    } 
                };
            }
            return { 
                errors: data.errors || { 
                    credential: data.message || 'Server error'
                } 
            };
        }

        if (!data || !data.user) {
            console.error('Invalid response format:', data);
            return { 
                errors: { 
                    credential: 'Server error: Missing user data'
                } 
            };
        }

        dispatch(setUser(data.user));
        return { user: data.user };

    } catch (error) {
        console.error('Login error:', error);
        return { 
            errors: { 
                credential: error.message || 'Network error. Please try again.'
            } 
        };
    }
};
//restore user session
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

export const signUp = (user) => async (dispatch) => {
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