import React from 'react';
import {render} from "react-dom";
import {Provider} from 'react-redux';
import {PersistGate} from "redux-persist/integration/react";
import ConnectedIntlProvider from './common/ConnectedIntlProvider';
import {Router} from 'react-router-dom';
import configureStore from './store';

const {persistor, store} = configureStore();

render(
  <React.StrictMode>
      <Provider store={store}>
          <PersistGate loading={"Loading..."} persistor={persistor}>

          </PersistGate>
      </Provider>,
  </React.StrictMode>,
  document.getElementById('root')
);