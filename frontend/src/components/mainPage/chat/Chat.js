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
import SignalProtocolStore from "../../../common/MySignalProtocolStore";
import LibsignalHelper from "../../../common/LibsignalHelper";

let myProtocolStore;

const Chat = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const profile = useSelector(state => state.persistentState.profile);
    const params = useParams();
    const conversation = useLiveQuery(() => db.conversations.get({sender_id: profile.id, name: params.name}), [params.name])


    useEffect(() => {
        MessagesChannel.received = data => {
            console.log("Received message!");
            ensureProtocolStore({id: profile.id}).then(_ => {
                // noinspection JSIgnoredPromiseFromCall
                LibsignalHelper.onDataReceived(data, profile.id, myProtocolStore)
            });
        }
    }, [params.name])


    const ensureProtocolStore = (user) => {
        return new Promise((resolve, reject) => {
            if(myProtocolStore === undefined) {
                console.log("No store! Loading from memory")
                SignalProtocolStore.load(user.id).then(protocolStore => {
                    myProtocolStore = protocolStore;
                    resolve();
                });
            } else {
                console.log("Store OK");
                resolve();
            }
        });
    };

    function arraybuffer_to_string(arraybuffer) {
        return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
    }

    const actions = {
        sendMessage: () => {
            console.log("Started sending process!");
            const sender = {
                id: profile.id + '.' + 1,
                user_id: profile.id,
                device_id: 1, //TODO
            };
            const receiver = {
                id: conversation.receiver.id + '.' + 1,
                user_id: conversation.receiver.id,
                device_id: 1 //TODO
            };
            ensureProtocolStore(sender)
                .then(_ => {
                    return LibsignalHelper.sendMessage(currentMessage, myProtocolStore, sender, receiver)
                })
                .then(_ => {
                    setCurrentMessage('');
                });
        },
        sendPreKeys: () => {
            window.libsignal.KeyHelper.generateIdentityKeyPair().then(myIdentityKeyPair => {
                window.libsignal.KeyHelper.generatePreKey(1).then(myPreKey => {
                    window.libsignal.KeyHelper.generatePreKey(2).then(myPreKey2 => {
                        window.libsignal.KeyHelper.generateSignedPreKey(myIdentityKeyPair, 100).then(mySignedPreKey => {
                            const myRegistrationId = 1; //TODO

                            myProtocolStore = new SignalProtocolStore();
                            myProtocolStore.setIdentityKeyPair(myIdentityKeyPair);
                            myProtocolStore.setLocalRegistrationId(myRegistrationId);
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
            </div>}
        </div>
    );
};

export default Chat;