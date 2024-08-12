import React from 'react';
import ReactDOM from 'react-dom/client';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
process.env.DEV = "true";
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

/* Cannot use StrictMode because of oauthAgent timing issues when components are rerendered twice in dev mode. 
 * Cookies and csrf tokens can become set in the wrong order. 
*/
root.render(
    <>
        <App />
    </>
);

reportWebVitals();
