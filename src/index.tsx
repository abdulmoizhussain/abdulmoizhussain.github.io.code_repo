import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import "bootstrap/dist/css/bootstrap.min.css";
import * as serviceWorker from './common/utils/service-worker';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register({
  onUpdate: (_: ServiceWorkerRegistration) => { },
  onSuccess: (_: ServiceWorkerRegistration) => { },
});

