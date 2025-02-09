import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from "react-redux";
import { restoreCSRF, fetchWithCsrf } from './store/csrf'
import store from "./store";
import * as sessionActions from './store/session';
import { ModalProvider, Modal } from './components/context/Modal';

// Initialize CSRF token
async function initializeApp() {
  if (import.meta.env.MODE !== 'production') {
    await restoreCSRF();
    window.csrfFetch = fetchWithCsrf;
    window.store = store;
    window.sessionActions = sessionActions;
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <Provider store={store}>
        <ModalProvider>
          <App />
          <Modal />
        </ModalProvider>
      </Provider>
    </React.StrictMode>
  );
}

initializeApp();
