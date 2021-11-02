import React from 'react';
import './ChatSideMenu.scss';

const ChatSideMenu = ({name, children, side}) => {
    return (
        <div className={`side-menu ${side}`}>
            <div className='side-menu-header'>
                {name}
            </div>
            <div className='side-menu-list'>
                {children}
            </div>
        </div>
    );
};

export default ChatSideMenu;