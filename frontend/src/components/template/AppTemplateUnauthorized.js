import React from 'react';
import "./AppTemplateUnauthorized.scss"
import {useSelector} from "react-redux";
import {matchesAnyUnauthorizedRoute} from "../../UnauthorizedRoutes";
import {useHistory, useLocation} from "react-router";

const AppTemplateUnauthorized = ({children}) => {
    const history = useHistory();
    const location = useLocation();
    const profile = useSelector(state => state.persistentState.access_token);

    if (!profile && !matchesAnyUnauthorizedRoute(location.pathname)) {
        history.push('/login');
    }

    return <>
        {!profile && <div className="unauthorized-template">
            {children}
        </div>}
    </>
}


export default AppTemplateUnauthorized;
