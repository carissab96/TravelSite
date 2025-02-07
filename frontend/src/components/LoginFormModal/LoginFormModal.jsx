import { useState, useEffect } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../context/Modal';
import './LoginFormModal.css';

function LoginFormModal() {
    const dispatch = useDispatch();
    const [credential, setCredential] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);
    const { closeModal } = useModal();

    // Reset form when modal closes
    useEffect(() => {
        return () => {
            setCredential("");
            setPassword("");
            setErrors({});
        };
    }, []);

    // Validate form
    useEffect(() => {
        setIsValid(credential.length >= 4 && password.length >= 6);
    }, [credential, password]);
  
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        const result = await dispatch(sessionActions.login({ credential, password }));
        if (result && result.errors) {
            setErrors(result.errors);
        } else if (result && result.user) {
            closeModal();
        }
    };

    const loginDemo = (e) => {
        e.preventDefault();
        return dispatch(sessionActions.login({
            credential: 'demo@user.io',
            password: 'password'
        }))
        .then(closeModal)
        .catch(async (res) => {
            const data = await res.json();
            if (data && data.errors) {
                setErrors(data.errors);
            }
        });
    };
  
    return (
        <>
            <h1>Log In</h1>
            <form onSubmit={handleSubmit} className="login-form">
                <label>
                    Username or Email
                    <input
                        type="text"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Password
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                {errors.credential && (
                    <ul className="error-list">
                        <li>{errors.credential}</li>
                    </ul>
                )}
                <button 
                    type="submit" 
                    disabled={!isValid}
                    className={!isValid ? 'disabled' : ''}
                >
                    Log In
                </button>
                <button 
                    type="button" 
                    onClick={loginDemo}
                    className="demo-link"
                >
                    Log in as Demo User
                </button>
            </form>
        </>
    );
  }
  
export default LoginFormModal;