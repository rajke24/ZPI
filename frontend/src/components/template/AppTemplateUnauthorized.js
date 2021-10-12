import React from 'react';
import "./AppTemplateUnauthorized.scss"
import {useSelector} from "react-redux";
import {matchesAnyUnauthorizedRoute} from "../../UnauthorizedRoutes";


const AppTemplateUnauthorized = ({children}) => {
    const profile = useSelector(state => state.persistentState.profile);

    if (!profile && !matchesAnyUnauthorizedRoute(location.pathname)) {
        history.push('/login');
    }
    if (!profile && location.pathname.split('/').includes('registration')) return children

    return <>
        {!profile && <div className="unauthorized-template">

        </div>}
    </>
}


export default AppTemplateUnauthorized;
