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
        try {
            const result = await dispatch(sessionActions.login({ credential, password }));
            console.log('Login result:', result);
            
            if (result && result.errors) {
                setErrors(result.errors);
                return;
            }
            
            if (result && result.user) {
                closeModal();
                return;
            }
            
            setErrors({ credential: 'An unexpected error occurred' });
        } catch (error) {
            console.error('Login error:', error);
            setErrors({ credential: 'An unexpected error occurred' });
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
        <div className="login-form-container">
            <div className="modal-header">
            <h1>Log In</h1>
            <button 
                type="button" 
                className="close-button" 
                onClick={closeModal}
                aria-label="Close"
            >
                ×
            </button>
            </div>
         
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
                <div className="error-container">
                    {errors.credential && (
                        <p className="error-message">{errors.credential}</p>
                    )}
                    {errors.password && (
                        <p className="error-message">{errors.password}</p>
                    )}
                </div>
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
        </div>
    );
  }
  
export default LoginFormModal;