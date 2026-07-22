
import './app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { TripPlannerProvider } from './context/TripPlannerContext';
import { UserProvider } from './context/UserContext';
import { AuthProvider } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppConfigProvider } from './context/AppConfigContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary name="Voyageurs">
      <AppConfigProvider>
        <ThemeProvider>
          <NotificationProvider>
            <AuthProvider>
              <UserProvider>
                <TripPlannerProvider>
                  <ChatProvider>
                    <App />
                  </ChatProvider>
                </TripPlannerProvider>
              </UserProvider>
            </AuthProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AppConfigProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

// Register the service worker for PWA functionality
serviceWorkerRegistration.register();
