import React from 'react';
import './Topbar.scss';
import Avatar from "../../common/avatar/Avatar";
import {useSelector} from "react-redux";
import Icon, {caretDownIcon} from "../../common/icons/Icon";
import {useLocation} from "react-router";

const Topbar = () => {
    const {pathname} = useLocation();
    const title = pathname.split('/')[1]
    const profile = useSelector(state => state.persistentState.profile);

    return (
        <div className='topbar'>
            <span className='title'>{title}</span>
            <div className='profile'>
                <div className='profile-email'>
                    <span>{profile.email}</span>
                </div>
                <Avatar color='#000000' name='Jarek A'/>
            </div>
        </div>
    );
};

export default Topbar;