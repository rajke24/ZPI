import {LOGOUT} from "../components/template/AppTemplateActions";

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
        default:
            return state
    }
};
