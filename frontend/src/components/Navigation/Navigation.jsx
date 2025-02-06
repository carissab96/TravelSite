import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaGlobeAmericas } from 'react-icons/fa';
import ProfileButton from './ProfileButton';
import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul className="nav-list">
      <li className="nav-logo">
        <NavLink to="/">
          <FaGlobeAmericas className="site-icon" />
          <span>TravelSite</span>
        </NavLink>
      </li>
      {isLoaded && (
        <li className="nav-right">
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
  );
}

export default Navigation;
