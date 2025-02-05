import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import * as sessionActions from '../../store/session';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul className="nav-list">
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {isLoaded && (
        <li className="nav-right">
          {sessionUser ? (
            <ProfileButton user={sessionUser} />
          ) : (
            <>
              <NavLink to="/login">Log In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </>
          )}
        </li>
      )}
    </ul>
  );
}

export default Navigation;
