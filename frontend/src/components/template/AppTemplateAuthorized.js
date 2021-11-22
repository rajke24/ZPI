import React, {useEffect} from 'react';
import {useSelector} from "react-redux";
import "./AppTemplateAuthorized.scss"
import {defaultRoute, matchesAnyAuthorizedRoute} from "../../AuthorizedRoutes";
import {useHistory, useLocation} from "react-router";
import Sidebar from "../navigation/Sidebar";
import Topbar from "../navigation/Topbar";
import db, {createConversation} from "../../storage/db";
import {get, remove} from "../../shared/ApiClientBuilder";

const AppTemplateAuthorized = ({children}) => {
    const profile = useSelector(state => state.persistentState.profile);
    const location = useLocation();
    const history = useHistory();

    const actions = {
        fetchAcceptedInvitations: (callback) => get('/invitations/accepted', {}, callback),
        deleteInvitation: (invitation, callback) => remove(`/invitations/${invitation.id}`, callback)
    }

    if (profile && !matchesAnyAuthorizedRoute(location.pathname)) history.push(defaultRoute());

    useEffect(() => {
        actions.fetchAcceptedInvitations(invitations => {
            invitations.map(invitation => {
                createConversation(profile, invitation.invitee);
                actions.deleteInvitation(invitation);
            })
        })
    }, [location])

    return <>
        {profile && <div className='app-wrapper'>
            <div className='app-container'>
                <Sidebar/>
                <Topbar/>
                <div className='app'>
                    {children}
                </div>
            </div>
        </div> }
    </>
}

export default AppTemplateAuthorized;
