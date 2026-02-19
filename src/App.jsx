import React from "react";
import { Provider } from 'react-redux';
import { store } from './store';
import Routes from "./Routes";
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <Provider store={store}>
      <HelmetProvider>
        <Routes />
      </HelmetProvider>
    </Provider>
  );
}

export default App;
