import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupFormModal.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);
  const { closeModal } = useModal();

  // Reset form when modal closes
  useEffect(() => {
    return () => {
      setEmail("");
      setUsername("");
      setFirstName("");
      setLastName("");
      setPassword("");
      setConfirmPassword("");
      setErrors({});
    };
  }, []);

  // Validate form
  useEffect(() => {
    setIsValid(
      email.length > 0 &&
      username.length >= 4 &&
      firstName.length > 0 &&
      lastName.length > 0 &&
      password.length >= 6 &&
      password === confirmPassword
    );
  }, [email, username, firstName, lastName, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;

    if (password !== confirmPassword) {
      return setErrors({
        confirmPassword: "Confirm Password field must be the same as the Password field"
      });
    }

    setErrors({});
    const result = await dispatch(
      sessionActions.signUp({
        email,
        username,
        firstName,
        lastName,
        password
      })
    );

    if (result?.errors) {
      setErrors(result.errors);
    } else if (result?.user) {
      closeModal();
    }
  };

  return (
    <div className="signup-form-container">
      <div className="modal-header">
        <h1>Sign Up</h1>
        <button 
        type="button" 
        className="close-button" 
        onClick={closeModal}
        aria-label="Close"
      >
        ×
      </button>
      </div>
      <form onSubmit={handleSubmit} className="signup-form">
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && (
          <ul className="error-list">
            <li>{errors.email}</li>
          </ul>
        )}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && (
          <ul className="error-list">
            <li>{errors.username}</li>
          </ul>
        )}
        <label>
          First Name
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </label>
        {errors.firstName && (
          <ul className="error-list">
            <li>{errors.firstName}</li>
          </ul>
        )}
        <label>
          Last Name
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </label>
        {errors.lastName && (
          <ul className="error-list">
            <li>{errors.lastName}</li>
          </ul>
        )}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && (
          <ul className="error-list">
            <li>{errors.password}</li>
          </ul>
        )}
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && (
          <ul className="error-list">
            <li>{errors.confirmPassword}</li>
          </ul>
        )}
        <button 
          type="submit" 
          disabled={!isValid}
          className={!isValid ? 'disabled' : ''}
        >
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default SignupFormModal;
