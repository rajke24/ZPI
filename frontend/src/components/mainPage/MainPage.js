import React from 'react';
import Conversations from "./conversations/Conversations";
import ChatSideMenu from "./ChatSideMenu";
import Threads from "./threads/Threads";
import Chat from "./chat/Chat";
import './MainPage.scss';

const MainPage = () => {
    return (
        <div className='main-page'>
            <ChatSideMenu side='left' name='Conversations'>
                <Conversations />
            </ChatSideMenu>
            <Chat />
            <ChatSideMenu side='right' name='Threads'>
                <Threads />
            </ChatSideMenu>
        </div>
    );
};

export default MainPage;