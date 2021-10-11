import {applyMiddleware, compose, createStore} from 'redux';
import {connectRouter, routerMiddleware} from 'connected-react-router';
import thunk from 'redux-thunk';
import rootReducer from './reducers/reducers';
import storage from 'redux-persist/lib/storage';
import {persistCombineReducers, persistStore} from 'redux-persist';
import history from './history';

const initialState = {};
const enhancers = [];
const middleware = [thunk, routerMiddleware(history)];

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['persistentState']
};

if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const composedEnhancers = compose(
    applyMiddleware(...middleware),
    ...enhancers
);

const persistCombinedReducers = persistCombineReducers(persistConfig, rootReducer);

export default () => {
    const store = createStore(
        connectRouter(history)(persistCombinedReducers),
        initialState,
        composedEnhancers
    );
    let persistor = persistStore(store);
    return {store, persistor};
};