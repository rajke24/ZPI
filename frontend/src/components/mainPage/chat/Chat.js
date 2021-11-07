import React, {useEffect, useState} from 'react';
import './Chat.scss';
import Message from "./Message";
import Icon, {sendIcon} from "../../../common/icons/Icon";
import {save} from "../../../shared/ApiClientBuilder";
import MessagesChannel from '../../../channels/messages_channel'
import {useSelector} from "react-redux";

const Chat = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const profile = useSelector(state => state.persistentState.profile);

    useEffect(() => {
        MessagesChannel.received = data => {
            const messages = data.messages.map(message => ({
                ...message,
                message_type: message.user_from_id === profile.id ? 'sent' : 'received'
            }))
            setMessages(messages);
        }
    }, [])

    const actions = {
        sendMessage: () => save('message/save_message', 'POST', {
            content: currentMessage,
            mail_to: profile.email === 'tabaluga@mm.pl' ? 'jarek@mm.pl' : 'tabaluga@mm.pl',
            sent_at: new Date(),
            type: 'type'
        }, () => setCurrentMessage('')),
    }

    const onEnterPress = (e) => {
        if (e.key === 'Enter') {
            actions.sendMessage();
        }
    }

    return (
        <div className='chat'>
            <div className='header'>
                {/*<Avatar name='chat' color='#f3568a'/>*/}
                Conversation 1
            </div>
            <div className='messages'>
                {messages.map((message) => <Message message={message}/>)}
            </div>
            <div className='chat-input'>
                <input onKeyPress={e => onEnterPress(e)} value={currentMessage}
                       onChange={e => setCurrentMessage(e.target.value)} placeholder='Type a new message...'/>
                <button onClick={() => actions.sendMessage()}>
                    Send
                    <Icon icon={sendIcon}/>
                </button>
            </div>
        </div>
    );
};

export default Chat;