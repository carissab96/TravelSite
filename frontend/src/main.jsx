import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Provider } from "react-redux";
import { restoreCSRF, fetchWithCsrf } from './store/csrf'
import store from "./store/store.js";
import * as sessionActions from './store/session';



//call restoreCSRF() before rendering the App
if (import.meta.env.MODE !== 'Production') {
  restoreCSRF();

  window.csrfFetch = fetchWithCsrf;
  window.store = store;
  window.sessionActions = sessionActions;
}


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
