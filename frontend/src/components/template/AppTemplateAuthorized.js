import React from 'react';
import {useSelector} from "react-redux";
import "./AppTemplateAuthorized.scss"

const AppTemplateAuthorized = ({children}) => {
    const profile = useSelector(state => state.persistentState.profile);

    return <>
        {profile && <div className='app-container'>
            {children}
        </div>}
    </>
}

export default AppTemplateAuthorized;
