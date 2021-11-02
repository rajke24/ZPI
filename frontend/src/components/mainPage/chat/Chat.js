import React from 'react';
import './Chat.scss';
import Avatar from "../../../common/avatar/Avatar";
import Message from "./Message";
import Icon, {sendIcon} from "../../../common/icons/Icon";

const messages = [
    {id: 1, type: 'sent', message: 'Cześć'},
    {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    {id: 3, type: 'received', message: 'Siemka'},
    {id: 3, type: 'received', message: 'Wszystko w porządku'},
    {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    {id: 1, type: 'sent', message: 'Cześć'},
    {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    // {id: 1, type: 'sent', message: 'Cześć'},
    // {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    // {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    // {id: 1, type: 'sent', message: 'Cześć'},
    // {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    // {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    // {id: 1, type: 'sent', message: 'Cześć'},
    // {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    // {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    // {id: 1, type: 'sent', message: 'Cześć'},
    // {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    // {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    // {id: 1, type: 'sent', message: 'Cześć'},
    // {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    // {id: 3, type: 'received', message: 'Siemka'},
    // {id: 3, type: 'received', message: 'Wszystko w porządku'},
    // {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
]

const Chat = () => {
    return (
        <div className='chat'>
            <div className='header'>
                {/*<Avatar name='chat' color='#f3568a'/>*/}
                Conversation 1
            </div>
            <div className='messages'>
                {messages.map(({type, message}) => <Message type={type} message={message} /> )}
            </div>
            <div className='chat-input'>
                <input placeholder='Type a new message...'/>
                <button>
                    Send
                    <Icon icon={sendIcon} />
                </button>
            </div>
        </div>
    );
};

export default Chat;