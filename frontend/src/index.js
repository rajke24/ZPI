import React from 'react';
import {render} from "react-dom";
import {Provider} from 'react-redux';
import {PersistGate} from "redux-persist/integration/react";
import ConnectedIntlProvider from './common/ConnectedIntlProvider';
import {Router} from 'react-router-dom';
import configureStore from './store';
import history from './history';
import AppTemplateAuthorized from "./components/template/AppTemplateAuthorized";
import AuthorizedRoutes from "./AuthorizedRoutes";
import AppTemplateUnauthorized from "./components/template/AppTemplateUnauthorized";
import UnauthorizedRoutes from "./UnauthorizedRoutes";
import axios from "axios";
import appConfig from "./config/applicationConfiguration";

const {persistor, store} = configureStore();
axios.defaults.baseURL = appConfig.apiUrl

render(
    <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={"Loading..."} persistor={persistor}>
                <ConnectedIntlProvider>
                    <Router history={history}>
                        <AppTemplateAuthorized>
                            <AuthorizedRoutes/>
                        </AppTemplateAuthorized>
                        <AppTemplateUnauthorized>
                            <UnauthorizedRoutes/>
                        </AppTemplateUnauthorized>
                    </Router>
                </ConnectedIntlProvider>
            </PersistGate>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
);