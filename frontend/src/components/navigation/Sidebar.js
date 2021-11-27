import React from 'react';
import './Sidebar.scss';
import {NavLink} from "react-router-dom";
import Icon, {chatIcon, invitationsIcon, logoutIcon, settingsIcon} from "../../common/icon/Icon";
import {logout} from "../template/AppTemplateActions";
import {useDispatch} from "react-redux";

const Sidebar = () => {
    const dispatch = useDispatch();

    return (
        <div className='sidebar'>
            <ul className='nav-list'>
                <li>
                    <NavLink className='nav-link' to='/chat' >
                        <Icon icon={chatIcon}/>
                    </NavLink>
                    <span className='sidebar-tooltip'>Chat</span>
                </li>
                <li>
                    <NavLink className='nav-link' to='/invitations' >
                        <Icon icon={invitationsIcon}/>
                    </NavLink>
                    <span className='sidebar-tooltip'>Invitations</span>
                </li>
                <li>
                    <NavLink className='nav-link' to='/settings' >
                        <Icon icon={settingsIcon}/>
                    </NavLink>
                    <span className='sidebar-tooltip'>Settings</span>
                </li>
            </ul>
            <div className='nav-link' onClick={() => dispatch(logout())}><Icon icon={logoutIcon}/></div>
        </div>
    );
};

export default Sidebar;