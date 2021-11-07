import React from 'react';
import {useSelector} from "react-redux";
import "./AppTemplateAuthorized.scss"
import {defaultRoute, matchesAnyAuthorizedRoute} from "../../AuthorizedRoutes";
import {useHistory, useLocation} from "react-router";

const AppTemplateAuthorized = ({children}) => {
    const profile = useSelector(state => state.persistentState.profile);
    const location = useLocation();
    const history = useHistory();

    if (profile && !matchesAnyAuthorizedRoute(location.pathname)) history.push(defaultRoute());

    return <>
        {profile && <div className='app-container'>
            {children}
        </div>}
    </>
}

export default AppTemplateAuthorized;
