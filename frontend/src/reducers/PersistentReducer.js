import {LOGOUT} from "../components/template/AppTemplateActions";
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
        default:
            return state
    }
};
