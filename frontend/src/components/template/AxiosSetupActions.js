import axios from 'axios';
import {LOGIN} from "../login/LoginPageActions";
import {LOGOUT} from "./AppTemplateActions";
import appConfig from "../../config/applicationConfiguration";
import {store} from "../..";


export const setupAxios = (dispatch) => {
    axios.defaults.baseURL = appConfig.apiUrl;

    axios.interceptors.request.use(function (request) {
        const token = store.getState().persistentState.access_token;

        if (token != null) {
            request.headers.authorization = `Bearer ${token}`;
        }
        return request;
    }, function (err) {
        return Promise.reject(err);
    });
    axios.interceptors.response.use((response) => {
        return response;
    }, async (error) => {
        const originalRequest = error.config;
        if (error.response && (error.response.status === 400) && (error.response.data.error === 'invalid_grant')) {
            dispatch({
                type: LOGOUT
            });
            return Promise.reject(error.response);
        } else if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const res = await axios.post('/oauth/token',
                {
                    "refresh_token": store.getState().persistentState.refresh_token,
                    "grant_type": "refresh_token"
                });
            if (res && res.status === 201 || res.status === 200) {
                dispatch({
                    type: LOGIN,
                    tokens: res.data
                });

                const token = store.getState().persistentState.access_token;
                if (token != null) {
                    axios.defaults.headers.authorization = `Bearer ${token}`;
                }
                return axios(originalRequest);
            }
        } else {
            return Promise.reject(error.response);
        }
    });
};