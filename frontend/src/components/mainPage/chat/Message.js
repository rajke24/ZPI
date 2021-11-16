import React from 'react';
import './Message.scss';
import {useSelector} from "react-redux";

const Message = ({message}) => {
    const profile = useSelector(state => state.persistentState.profile)

    const message_type = message.sender_id === profile.id ? 'sent' : 'received'
    return (
        <div className={`message-wrapper ${message_type}`}>
            <div className='message'>
                <span>{message.content}</span>
            </div>
        </div>
    );
};

export default Message;