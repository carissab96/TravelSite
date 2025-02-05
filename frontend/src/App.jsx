import react from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LoginFormPage from './components/LoginFormPage.jsx';


const HomePage = () => {
  return <h1> Hello from Home Page </h1>;
}
// Create router configuration
const router = createBrowserRouter([
  {
      path: '/',
      element: <HomePage />
  },
  {
      path: '/login',
      element: <LoginFormPage />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;