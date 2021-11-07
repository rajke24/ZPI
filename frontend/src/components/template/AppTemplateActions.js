import axios from "axios";

export const LOGOUT = 'LOGOUT';
export const PROFILE_LOAD = 'PROFILE_LOAD';

export const logout = () => {
    return {
        type: LOGOUT
    };
};

export const reloadProfile = (dispatch) => () => {
    const profileConfig = {
        url: '/profile'
    };

    axios.request(profileConfig).then(
        response =>
            dispatch({
                type: PROFILE_LOAD,
                profile: response.data
            }));
}