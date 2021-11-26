import React, {useEffect, useState} from 'react';
import './Chat.scss';
import Message from "./Message";
import Icon, {sendIcon} from "../../../common/icons/Icon";
import {get, post, save} from "../../../shared/ApiClientBuilder";
import MessagesChannel from '../../../channels/messages_channel'
import {useSelector} from "react-redux";
import {useLiveQuery} from "dexie-react-hooks";
import db, {createUser} from '../../../storage/db';
import {useParams} from "react-router";
import Conversations from "../conversations/Conversations";
import Avatar from "../../../common/avatar/Avatar";
import SignalProtocolStore from "../../../common/MySignalProtocolStore";

let myProtocolStore;

const Chat = () => {
    const [currentMessage, setCurrentMessage] = useState('');
    const profile = useSelector(state => state.persistentState.profile);
    const params = useParams();
    const conversation = useLiveQuery(() => db.conversations.get({sender_id: profile.id, name: params.name}), [params.name])

    const getDecryptionMethod = (ciphertext, sender_id, protocol_store) => {
        const receiverAddress = new window.libsignal.SignalProtocolAddress(sender_id.toString(), 1);
        const sessionCipher = new window.libsignal.SessionCipher(protocol_store, receiverAddress);

        if(ciphertext.type === 3) {
            return sessionCipher.decryptPreKeyWhisperMessage;
        } else if(ciphertext.type === 1) {
            return sessionCipher.decryptWhisperMessage;
        } else {
            console.error("Unknown ciphertext type! Type: " + ciphertext.type);
        }
    };

    const decryptMessage = (protocol_store, message) => {
        return new Promise((resolve, reject) => {
            const ciphertext = JSON.parse(message.content);
            let decryptionMethod = getDecryptionMethod(ciphertext, message.sender_id, protocol_store);
            decryptionMethod(ciphertext.body, 'binary').then(newPlaintext => {
                let decryptedMessage = new TextDecoder('utf-8').decode(newPlaintext);
                resolve(decryptedMessage);
            });
        });
    };

    const saveReceivedMessage = (myId, decryptedMessage, message) => {
        message.content = decryptedMessage;
        db.conversations.where({sender_id: myId, 'receiver.id': message.sender_id}).modify(c => c.messages.push(message));
        myProtocolStore.save(profile.id);
    };

    useEffect(() => {
        MessagesChannel.received = data => {

            const message = {...data.message, message_type: data.message.sender_id === profile.id ? 'sent' : 'received'}
            if(message.receiver_id !== profile.id) {
                console.log("Received message not for me so skipping!");
                return;
            }
            console.log("Received message for me");
            ensureProtocolStore(profile.id)
                .then(_ => {
                    return ensureIdentityKeys(myProtocolStore)
                }).then(_ => {
                    return decryptMessage(myProtocolStore, message)
                }).then(decryptedMessage => {
                    saveReceivedMessage(profile.id, decryptedMessage, message)
                    console.log("Finished decrypting message!");
                })
        }
    }, [params.name])

    function arraybuffer_to_string(arraybuffer) {
        return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
    }

    function string_to_arraybuffer(string) {
        return new Uint8Array(JSON.parse(string)).buffer;
    }

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

    const ensureIdentityKeys = (protocol_store) => {
      return new Promise((resolve, reject) => {
         if(protocol_store.myIdentityKeyPair === undefined) {
             console.log("no identity key!");
             createUserKeys()
                 .then(generatedUserKeys => {
                    return storeUserKeys(protocol_store, generatedUserKeys);
                }).then((generatedUserKeys) => {
                    return sendUserKeysToServer(generatedUserKeys)
                }).then(() => {
                    console.log("Finished creating identity keys!");
                    resolve();
                });
         } else {
             console.log("Identity key OK")
             resolve();
         }
      });
    };

    const createUserKeys = () => {
        return new Promise((resolve, reject) => {
            window.libsignal.KeyHelper.generateIdentityKeyPair().then(myIdentityKeyPair => {
                window.libsignal.KeyHelper.generatePreKey(1).then(myPreKey => {
                    window.libsignal.KeyHelper.generatePreKey(2).then(myPreKey2 => {
                        window.libsignal.KeyHelper.generateSignedPreKey(myIdentityKeyPair, 100).then(mySignedPreKey => {
                            const registrationId = 1; //TODO
                            resolve({
                                registrationId: registrationId,
                                identityKeyPair: myIdentityKeyPair,
                                preKeys: [
                                    myPreKey,
                                    myPreKey2
                                ],
                                signedPreKey: mySignedPreKey
                            });
                        });
                    });
                });
            });
        });
    };

    const storeUserKeys = (protocol_store, generatedUserKeys) => {
        return new Promise((resolve, reject) => {
            console.log("Storing identity keys!");
            protocol_store.setIdentityKeyPair(generatedUserKeys.identityKeyPair);
            protocol_store.setLocalRegistrationId(generatedUserKeys.registrationId);
            protocol_store.storePreKey(generatedUserKeys.preKeys[0].keyId, generatedUserKeys.preKeys[0]).then(() => {
                protocol_store.storeSignedPreKey(generatedUserKeys.signedPreKey.keyId, generatedUserKeys.signedPreKey).then(() => {
                    resolve(generatedUserKeys);
                });
            });
        });
    }

    const sendUserKeysToServer = (generatedUserKeys) => {
        return new Promise((resolve, reject) => {
            let prekey_bundle_data = {
                identityKey: arraybuffer_to_string(generatedUserKeys.identityKeyPair.pubKey),
                preKeys: [
                    {
                        keyId: generatedUserKeys.preKeys[0].keyId,
                        publicKey: arraybuffer_to_string(generatedUserKeys.preKeys[0].keyPair.pubKey)
                    },
                    {
                        keyId: generatedUserKeys.preKeys[1].keyId,
                        publicKey: arraybuffer_to_string(generatedUserKeys.preKeys[1].keyPair.pubKey)
                    }
                ],
                signedPreKey: {
                    keyId: generatedUserKeys.signedPreKey.keyId,
                    publicKey: arraybuffer_to_string(generatedUserKeys.signedPreKey.keyPair.pubKey),
                    signature: arraybuffer_to_string(generatedUserKeys.signedPreKey.signature)
                }
            };
            post('pre_keys_bundle', prekey_bundle_data, () => {
                console.log("Prekey bundle data sent!");
                resolve();
            });
        });
    };

    const ensureSession = (protocol_store, receiver) => {
        return new Promise((resolve, reject) => {
            protocol_store.loadSession(receiver.id).then(session => {
               if(session === undefined) {
                   console.log("No session! Creating new one...")
                   createSession(protocol_store, receiver.id).then(() => {
                      resolve();
                   });
               } else {
                   console.log("Session OK");
                   resolve();
               }
            });
        });
    };

    const createSession = (protocol_store, receiver_id) => {
        return new Promise((resolve, reject) => {
            get("/pre_keys_bundle/", {id: receiver_id}, (result) => {
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
                let sessionBuilder = new window.libsignal.SessionBuilder(protocol_store, receiverAddress);
                sessionBuilder.processPreKey(receivedPreKeyBundle).then(() => {
                    console.log("New session created!");
                    resolve();
                });
            });
        });
    };

    const encryptMessage = (protocol_store, receiver) => {
        return new Promise((resolve, reject) => {
            let receiverAddress = new window.libsignal.SignalProtocolAddress(receiver.user_id, receiver.device_id);
            let sessionCipher = new window.libsignal.SessionCipher(protocol_store, receiverAddress);
            sessionCipher.encrypt(currentMessage).then(ciphertext => {
                resolve(ciphertext);
            });
        });
    };

    const sendMessageToServer = (ciphertext, receiver) => {
        return new Promise((resolve, reject) => {
            let currentDate = new Date();
            save('messages/save_message', 'POST', {
                content: JSON.stringify(ciphertext),
                receiver_id: receiver.user_id,
                sent_at: currentDate,
                type: 'type'
            }, (params) => {
                console.log("Message sent!");
                resolve({
                    message_id: params.message_id,
                    send_at: currentDate
                });
            });
        });
    }

    const saveSendMessage = (message_params, receiver, sender) => {
        return new Promise((resolve, reject) => {
            let message = {
                content: currentMessage,
                id: message_params.message_id,
                message_type: 'sent',
                receiver_id: receiver.user_id,
                sender_id: sender.user_id,
                send_at: message_params.send_at
            };
            db.conversations.where({sender_id: message.sender_id, 'receiver.id': message.receiver_id}).modify(c => c.messages.push(message));
            console.log("Saved my message!");
            resolve();
        });
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
                    return ensureIdentityKeys(myProtocolStore);
                }).then(_ => {
                    return ensureSession(myProtocolStore, receiver);
                }).then(_ => {
                    return encryptMessage(myProtocolStore, receiver);
                }).then(ciphertext => {
                    return sendMessageToServer(ciphertext, receiver)
                }).then(messageParams => {
                    return saveSendMessage(messageParams, receiver, sender)
                }).then(_ => {
                    myProtocolStore.save(sender.user_id);
                    setCurrentMessage('');
                    console.log("Finished sending process!");
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

                                   let identityKeyStringVersion = {
                                        privKey: arraybuffer_to_string(myIdentityKeyPair.privKey),
                                        pubKey:arraybuffer_to_string(myIdentityKeyPair.pubKey)
                                   };
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