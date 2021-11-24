import React, {useEffect, useState} from 'react';
import './Chat.scss';
import Message from "./Message";
import Icon, {sendIcon} from "../../../common/icons/Icon";
import {get, post, save} from "../../../shared/ApiClientBuilder";
import MessagesChannel from '../../../channels/messages_channel'
import {useSelector} from "react-redux";
import {useLiveQuery} from "dexie-react-hooks";
import db from '../../../storage/db';
import {useParams} from "react-router";
import Conversations from "../conversations/Conversations";
import Avatar from "../../../common/avatar/Avatar";

const Chat = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const profile = useSelector(state => state.persistentState.profile);
    const params = useParams();
    const conversation = useLiveQuery(() => db.conversations.get({sender_id: profile.id, name: params.name}), [params.name])

    useEffect(() => {
        MessagesChannel.received = data => {
            const message = {...data.message, message_type: data.message.sender_id === profile.id ? 'sent' : 'received'}
            const otherUserId = profile.id === message.receiver_id ? message.sender_id : message.receiver_id
            db.conversations.where({sender_id: profile.id, 'receiver.id': otherUserId}).modify(c => c.messages.push(message))
        }
    }, [params.name])

    const actions = {
        sendMessage: () => {
            const encryptedMessage = currentMessage + '/'
            save('messages/save_message', 'POST', {
                content: encryptedMessage,
                receiver_id: conversation.receiver.id,
                sent_at: new Date(),
                type: 'type'
            }, () => setCurrentMessage(''))
        },
        sendPreKeys: () => {
           function arraybuffer_to_string(arraybuffer) {
               return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
           }

           function string_to_arraybuffer(string) {
               return new Uint8Array(JSON.parse(string)).buffer;
           }

            window.libsignal.KeyHelper.generateIdentityKeyPair().then(myIdentityKeyPair => {
                window.libsignal.KeyHelper.generatePreKey(0).then(myPreKey => {
                    window.libsignal.KeyHelper.generatePreKey(1).then(myPreKey2 => {
                        window.libsignal.KeyHelper.generateSignedPreKey(myIdentityKeyPair, 100).then(mySignedPreKey => {
                            let config = {
                                identityKey: arraybuffer_to_string(myIdentityKeyPair.pubKey),
                                preKeys: [
                                    {
                                        keyId: myPreKey.keyId,
                                        publicKey: arraybuffer_to_string(myPreKey.keyPair.pubKey)
                                    },
                                    {
                                        keyId: myPreKey2.keyId,
                                        publicKey: arraybuffer_to_string(myPreKey2.keyPair.pubKey)
                                    }
                                ],
                                signedPreKey: {
                                    keyId: mySignedPreKey.keyId,
                                    publicKey: arraybuffer_to_string(mySignedPreKey.keyPair.pubKey),
                                    signature: arraybuffer_to_string(mySignedPreKey.signature)
                                }
                            };
                            console.log(config);
                            post('pre_keys_bundle', config, () => console.log("Done!"));
                        });
                    });
                });
            });
        },
        getPreKeys: () => {
            console.log(conversation.receiver.id)
            get("/pre_keys_bundle/", {id: conversation.receiver.id}, (result) => console.log(result));
        }

    }

    const onEnterPress = (e) => {
        if (e.key === 'Enter') {
            actions.sendMessage();
        }
    }

    return (
        <div className='chat'>
            <Conversations />
            {conversation && <div className='chat-window'>
                <div className='chat-header'>
                    <Avatar name='Tabaluga' color='#1181A5'/>
                    <div className='friend-info'>
                        <span className='name'>{conversation.receiver.email}</span>
                        <span className='status'>Online</span>
                    </div>
                </div>
                <div className='messages'>
                    {conversation?.messages.map((message) => <Message message={message}/>)}
                </div>
                <div className='chat-input'>
                    <input onKeyPress={e => onEnterPress(e)} value={currentMessage}
                           onChange={e => setCurrentMessage(e.target.value)} placeholder='Type a new message...'/>
                    <button onClick={actions.sendMessage}>
                        Send
                        <Icon icon={sendIcon}/>
                    </button>
                </div>
                <div classname='send_prekeys'>
                    <button onClick={actions.sendPreKeys}>
                        PreKeys send
                    </button>
                </div>
                <div classname='get_prekeys'>
                    <button onClick={actions.getPreKeys}>
                        PreKeys get
                    </button>
                </div>
            </div>}
        </div>
    );
};

export default Chat;