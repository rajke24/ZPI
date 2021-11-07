import axios from 'axios/index';
import {push} from 'react-router-redux';
import {reloadProfile} from "../template/AppTemplateActions";

export const LOGIN = 'LOGIN';

export const login = dispatch => (email, password, authenticationCode, errorCallback) => {
    const tokenConfig = {
        url: '/oauth/token',
        method: 'POST',
        data: {email: email, password: password, authentication_code: authenticationCode, grant_type: 'password'}
    };
    axios.request(tokenConfig).then(tokenResponse => {
        dispatch({
            type: LOGIN,
            tokens: tokenResponse.data
        });

        reloadProfile(dispatch)();
        setTimeout(() => {
            dispatch(push('/'));
        }, 500);
    }).catch(exception => {
        if (exception && exception.status === 400 && exception.data.error === 'invalid_grant') {
            errorCallback()
        }
    })
};
