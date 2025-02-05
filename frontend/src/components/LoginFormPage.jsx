import react from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as sessionActions from '../store/session';
import { useNavigate } from 'react-router-dom';

// These hooks set up your component's state and Redux connection
const LoginFormPage = () => {
    const dispatch = useDispatch();
    const sessionUser = useSelector(state => state.session.user);
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

// This effect handles redirect if user is already logged in
useEffect(() => {
        if (sessionUser) {
            navigate('/');
        }
    }, [sessionUser, navigate]);

    useEffect(() => {
        setErrors([]);
    }, []);

// This handles form submission
const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const res = await dispatch(sessionActions.login({ credential, password }));
    if (res && res.errors) {
        setErrors(res.errors);
    }
};


return (
    <div>
        <h1>User Login</h1>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="credential">Username or Email</label>
                <input
                    type="text"
                    id="credential"
                    name="credential"
                    onChange={(e) => setCredential(e.target.value)}
                    placeholder="Username or Email"
                />
                <label htmlFor="password">Password</label>
                <input  
                    type="password"
                    id="password"
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                />
                <button type="submit">Login</button>
            </div>

    {errors.length > 0 && (
        <ul 
            style={{
                color: 'red',
                margin: '10px 0',
                padding: '10px',
                border: '1px solid red',
                borderRadius: '4px',
                backgroundColor: '#ffebee'
            }}
            className="error-list"
        >
            {errors.map((error, idx) => (
                <li key={idx} style={{ marginLeft: '20px' }}>{error}</li>
            ))}
        </ul>
    )}
    </form>
    </div>
)}

export default LoginFormPage;