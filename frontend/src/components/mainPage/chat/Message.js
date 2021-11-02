import React from 'react';
import './Message.scss';

const Message = ({message, type}) => {
    return (
        <div className={`message-wrapper ${type}`}>
            <div className='message'>
                <span>{message}</span>
            </div>
        </div>
    );
};

export default Message;