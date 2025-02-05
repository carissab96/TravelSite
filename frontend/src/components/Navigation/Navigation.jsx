import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
      </li>
      {isLoaded && (
        <li>
          {sessionUser ? (
            <button onClick={() => {}}>Profile</button>
          ) : (
            <NavLink to="/login">Log In</NavLink>
          )}
        </li>
      )}
    </ul>
  );
}

export default Navigation;
