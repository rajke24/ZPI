import React from 'react';
import Avatar from "../../../common/avatar/Avatar";
import './Conversation.scss';

const Conversation = ({name, lastMessage}) => {

    return (
        <div className='conversation'>
            <Avatar name={name} color='#1181A5' />
            <div className='conversation-info'>
                <span className='name'>{name}</span>
                <span className='last-message'>{lastMessage}</span>
            </div>
        </div>
    );
};

export default Conversation;