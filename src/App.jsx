import React from "react";
import { Provider } from 'react-redux';
import { store } from './store';
import Routes from "./Routes";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider, ToastProvider } from './context/ThemeContext';

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        {/* ThemeProvider: persists dark/light + syncs CSS class on <html> */}
        <ThemeProvider>
          {/* ToastProvider: global toast stack, bottom-right */}
          <ToastProvider>
            <Routes />
          </ToastProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  );
}

export default App;
