import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import * as sessionActions from '../../store/session';
import { FaUserCircle } from 'react-icons/fa';
import { FaBars } from 'react-icons/fa';
import OpenModalButton from '../OpenModalButton/OpenModalButton';
import LoginFormModal from '../LoginFormModal/LoginFormModal';
import SignupFormModal from '../SignupFormModal/SignupFormModal';
import './ProfileButton.css';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();
  const menuRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      // Allow clicks on greeting and email
      if (e.target.classList.contains('user-info')) return;
      
      // Close if click is outside menu and not on menu button
      if (!ulRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener('click', closeMenu);
  }, [showMenu]);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout())
      .then(() => {
        setShowMenu(false);
        navigate('/');
      });
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <div className="profile-button-container">
      <button onClick={toggleMenu} className="profile-button" ref={menuRef}>
        <FaBars className="menu-icon" />
        <FaUserCircle className="user-icon" />
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          // Logged in menu items
          <>
            <li className="user-info greeting">Hello, {user.firstName}</li>
            <li className="user-info email">{user.email}</li>
            <li className="menu-divider"></li>
            <li>
            <button 
                onClick={() => {
                navigate('/spots/current');
                setShowMenu(false);  // Close the menu after clicking
              }}
              className="menu-button"
                >
                  Manage Spots
            </button>
            </li>
            <li className="logout-option">
              <button onClick={logout}>Log Out</button>
            </li>
          </>
        ) : (
          // Logged out menu items
          <>
            <li>
              <OpenModalButton
                buttonText="Log In"
                modalComponent={<LoginFormModal />}
                onButtonClick={() => setShowMenu(false)}
              />
            </li>
            <li>
              <OpenModalButton
                buttonText="Sign Up"
                modalComponent={<SignupFormModal />}
                onButtonClick={() => setShowMenu(false)}
              />
            </li>
          </>
        )}
      </ul>
    </div>
  );
}

export default ProfileButton;
