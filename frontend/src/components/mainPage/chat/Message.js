import React from 'react';
import './Message.scss';

const Message = ({message}) => {
    return (
        <div className={`message-wrapper ${message.message_type}`}>
            <div className='message'>
                <span>{message.content}</span>
            </div>
        </div>
    );
};

export default Message;