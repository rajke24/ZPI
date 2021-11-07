import React, {useState} from 'react';
import './Chat.scss';
import Avatar from "../../../common/avatar/Avatar";
import Message from "./Message";
import Icon, {sendIcon} from "../../../common/icons/Icon";
import {get, save} from "../../../shared/ApiClientBuilder";

const messages = [
    {id: 1, type: 'sent', message: 'Cześć'},
    {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    {id: 3, type: 'received', message: 'Siemka'},
    {id: 3, type: 'received', message: 'Wszystko w porządku'},
    {id: 3, type: 'sent', message: 'Nie chcesz wyjść na piwo jutro ?'},
    {id: 1, type: 'sent', message: 'Cześć'},
    {id: 2, type: 'sent', message: 'Co tam u ciebie słychać ?'},
    {id: 3, type: 'received', message: 'Siemka'},
]

const Chat = () => {
    const [message, setMessage] = useState();

    const actions = {
        sendMessage: () => save('message/save_message', 'POST', {
            content: message,
            mail_to: 'tabaluga@mm.pl',
            sent_at: new Date(),
            type: 'type'
        }),
    }

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
                <input onChange={e => setMessage(e.target.value)} placeholder='Type a new message...'/>
                <button onClick={() => actions.sendMessage()}>
                    Send
                    <Icon icon={sendIcon} />
                </button>
            </div>
        </div>
    );
};

export default Chat;