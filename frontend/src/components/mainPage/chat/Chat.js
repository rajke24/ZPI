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
import SignalProtocolStore from "../../../common/InMemorySignalProtocolStore";

let myProtocolStore;

const Chat = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const profile = useSelector(state => state.persistentState.profile);
    const params = useParams();
    const conversation = useLiveQuery(() => db.conversations.get({sender_id: profile.id, name: params.name}), [params.name])

    useEffect(() => {
        MessagesChannel.received = data => {
            const message = {...data.message, message_type: data.message.sender_id === profile.id ? 'sent' : 'received'}
            if(message.receiver_id !== profile.id) {
                console.log("Received message where I am not a receiver so skipped it");
                return;
            }
            const sessionCipher = new window.libsignal.SessionCipher(myProtocolStore, new window.libsignal.SignalProtocolAddress(message.sender_id.toString(), 1));
            const ciphertext = JSON.parse(message.content);

            let decryptionMethod;
            if(ciphertext.type === 3) {
                decryptionMethod = sessionCipher.decryptPreKeyWhisperMessage;
            } else if(ciphertext.type === 1) {
                decryptionMethod = sessionCipher.decryptWhisperMessage;
            } else {
                console.error("Unknown ciphertext type! Type: " + ciphertext.type);
                return;
            }
            decryptionMethod(ciphertext.body, 'binary').then(newPlaintext => {
                message.content = new TextDecoder('utf-8').decode(newPlaintext);
                db.conversations.where({sender_id: profile.id, 'receiver.id': message.sender_id}).modify(c => c.messages.push(message));
            });
        }
    }, [params.name])

    function arraybuffer_to_string(arraybuffer) {
        return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
    }

    function string_to_arraybuffer(string) {
        return new Uint8Array(JSON.parse(string)).buffer;
    }

    const actions = {
        sendMessage: () => {
            const sessionCipher = new window.libsignal.SessionCipher(myProtocolStore, new window.libsignal.SignalProtocolAddress(conversation.receiver.id.toString(), 1));
            sessionCipher.encrypt(currentMessage).then(ciphertext => {
                let date = new Date()
                save('messages/save_message', 'POST', {
                    content: JSON.stringify(ciphertext),
                    receiver_id: conversation.receiver.id,
                    sent_at: date,
                    type: 'type'
               }, (params) => {
                    let sent_message = {
                        content: currentMessage,
                        id: params.message_id,
                        message_type: 'sent',
                        receiver_id: conversation.receiver.id,
                        sender_id: profile.id,
                        send_at: date
                    };
                    db.conversations.where({sender_id: profile.id, 'receiver.id': conversation.receiver.id}).modify(c => c.messages.push(sent_message));
                    setCurrentMessage('');
               })
            });
        },
        sendPreKeys: () => {
            window.libsignal.KeyHelper.generateIdentityKeyPair().then(myIdentityKeyPair => {
                window.libsignal.KeyHelper.generatePreKey(1).then(myPreKey => {
                    window.libsignal.KeyHelper.generatePreKey(2).then(myPreKey2 => {
                        window.libsignal.KeyHelper.generateSignedPreKey(myIdentityKeyPair, 100).then(mySignedPreKey => {
                            const myRegistrationId = 1; //TODO

                            myProtocolStore = new SignalProtocolStore();
                            myProtocolStore.put('identityKey', myIdentityKeyPair);
                            myProtocolStore.put('registrationId', myRegistrationId);
                            myProtocolStore.storePreKey(myPreKey.keyId, myPreKey).then(() => {
                               myProtocolStore.storeSignedPreKey(mySignedPreKey.keyId, mySignedPreKey).then(() => {
                                   let my_prekey_bundle_data = {
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
                                   post('pre_keys_bundle', my_prekey_bundle_data, () => console.log("Prekey sent!"));
                               });
                            });
                        });
                    });
                });
            });
        },
        getPreKeys: () => {
            get("/pre_keys_bundle/", {id: conversation.receiver.id}, (result) => {
                let receivedPreKeyBundle = {
                    registrationId: 1, //TODO
                    identityKey: string_to_arraybuffer(result.identity_key),
                    preKey: {
                        keyId: result.prekey.keyId,
                        publicKey: string_to_arraybuffer(result.prekey.publicKey)
                    },
                    signedPreKey: {
                        keyId: result.signed_key.keyId,
                        publicKey: string_to_arraybuffer(result.signed_key.publicKey),
                        signature: string_to_arraybuffer(result.signed_key.signature)
                    }
                };
                let receiverAddress = new window.libsignal.SignalProtocolAddress(conversation.receiver.id.toString(), 1);

                let sessionBuilder = new window.libsignal.SessionBuilder(myProtocolStore, receiverAddress);
                sessionBuilder.processPreKey(receivedPreKeyBundle).then(() => {
                    console.log("Prekey processed!");
                });

            });
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
                <div className='send_prekeys'>
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