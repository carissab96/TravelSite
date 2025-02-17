import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import * as sessionActions from './store/session';
import Navigation from './components/Navigation';
import SpotsList from './components/Spots/SpotsList/SpotsList';
import SpotDetails from './components/Spots/SpotDetails/SpotDetails';
import CreateSpotForm from './components/CreateSpotForm/CreateSpotForm';
import ManageSpots from './components/ManageSpots/ManageSpots';
import UpdateSpot from './components/UpdateSpot/UpdateSpot';
import About from './components/About/About';
import Footer from './components/Footer/Footer';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true);
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      <main className="main-content">
        {isLoaded && <Outlet />}
      </main>
      <Footer />
    </>
  );
}

// Create router configuration
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <SpotsList />
      },
      {
        path: '/spots/new',
        element: <CreateSpotForm />
      },
      {
        path: '/spots/:spotId',
        element: <SpotDetails />
      },
      {
        path: '/about',
        element: <About />
      },
      {
        path: '/spots/:spotId/edit',
        element: <UpdateSpot />
      },
      {
        path: '/spots/current',
        element: <ManageSpots />
      }
    
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;