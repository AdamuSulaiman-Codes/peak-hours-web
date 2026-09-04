import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AppProvider } from './state/AppContext';
import { TimerProvider } from './state/TimerContext';
import { NavProvider } from './state/nav';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <TimerProvider>
        <NavProvider>
          <App />
        </NavProvider>
      </TimerProvider>
    </AppProvider>
  </React.StrictMode>,
);
