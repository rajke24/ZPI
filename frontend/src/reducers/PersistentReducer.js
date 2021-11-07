import {LOGOUT, PROFILE_LOAD} from "../components/template/AppTemplateActions";
import {LOGIN} from "../components/authPages/LoginPageActions";

const initialState = {
    access_token: null,
    refresh_token: null,
    profile: null,
    locale: 'en'
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOGOUT:
            return {...initialState}
        case LOGIN:
            return {
                ...state,
                ...action.tokens
            }
        case PROFILE_LOAD:
            return {
                ...state,
                profile: action.profile,
            }
        default:
            return state
    }
};
