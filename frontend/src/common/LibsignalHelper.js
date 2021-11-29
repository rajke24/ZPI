import {get, post, save} from "../shared/ApiClientBuilder";
import db, {createConversation} from "../storage/db";

function LibsignalHelper() {

}

//region Ensuring stuff
LibsignalHelper.ensureIdentityKeys = function(protocol_store, myId) {
    return new Promise((resolve, reject) => {
        if(protocol_store.myIdentityKeyPair === undefined) {
            console.log("no identity key!");
            createUserKeys()
                .then(generatedUserKeys => {
                    return storeUserKeys(protocol_store, generatedUserKeys);
                }).then((generatedUserKeys) => {
                return sendUserKeysToServer(protocol_store, generatedUserKeys)
            }).then(() => {
                console.log("Finished creating identity keys!");
                protocol_store.save(myId);
                resolve();
            });
        } else {
            console.log("Identity key OK")
            resolve();
        }
    });
}

function createUserKeys() {
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
}

function storeUserKeys(protocolStore, generatedUserKeys) {
    return new Promise((resolve, reject) => {
        console.log("Storing identity keys!");
        protocolStore.setIdentityKeyPair(generatedUserKeys.identityKeyPair);
        protocolStore.setLocalRegistrationId(generatedUserKeys.registrationId);
        protocolStore.storePreKey(generatedUserKeys.preKeys[0].keyId, generatedUserKeys.preKeys[0]).then(() => {
            protocolStore.storeSignedPreKey(generatedUserKeys.signedPreKey.keyId, generatedUserKeys.signedPreKey).then(() => {
                resolve(generatedUserKeys);
            });
        });
    });
}

function sendUserKeysToServer(protocolStore, generatedUserKeys) {
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
        post('pre_keys_bundle', prekey_bundle_data, result => {
            let deviceId = result.device_id;
            console.log("Device id: " + deviceId);
            protocolStore.setDeviceId(deviceId);

            console.log("Prekey bundle data sent!");
            resolve();
        });
    });
}

function ensureSession(protocolStore, receiver) {
    return new Promise((resolve, reject) => {
        protocolStore.loadSession(receiver.id).then(session => {
            if(session === undefined) {
                console.log("No session! Creating new one...")
                createSession(protocolStore, receiver).then(() => {
                    resolve();
                });
            } else {
                console.log("Session OK");
                resolve();
            }
        });
    });
}

function createSession(protocol_store, receiver) {
    return new Promise((resolve, reject) => {
        get("/pre_keys_bundle/", {id: receiver.user_id}, (result) => {
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

            let receiverAddress = new window.libsignal.SignalProtocolAddress(receiver.user_id, receiver.device_id);
            let sessionBuilder = new window.libsignal.SessionBuilder(protocol_store, receiverAddress);
            sessionBuilder.processPreKey(receivedPreKeyBundle).then(() => {
                console.log("New session created!");
                resolve();
            });
        });
    });
}

function ensureConversation(profileId, otherUserId, receiver_email) {
    return new Promise((resolve, reject) => {
        db.conversations.get({sender_id: profileId, 'receiver.id': otherUserId}).then(result => {
            if(result === undefined) {
                console.log("No conversation, creating new one...");
                createConversation({id: profileId}, {id: otherUserId, email: receiver_email}).then(_ => {
                    resolve();
                });
            } else {
                console.log("Conversation OK");
                resolve();
            }
        });
    });
}

//endregion

//region Decrypting messages

//make sure to call ensureProtocolStore() before calling this function!
LibsignalHelper.onDataReceived = function(data, profileId, protocolStore) {
    return new Promise((resolve, reject) => {
        const message = {...data.message, message_type: data.message.sender_id === profileId ? 'sent' : 'received'}
        if(message.receiver_id !== profileId) {
            console.log("Message isn't for me so skipping!");
            resolve();
            return;
        }
        console.log("Message is for me so decrypting!");
        LibsignalHelper.ensureIdentityKeys(protocolStore, profileId)
            .then(_ => {
                return decryptMessage(protocolStore, message)
            })
            .then(decryptedMessage => {
                ensureConversation(profileId, message.sender_id, decryptedMessage.email).then(_ => {
                    saveReceivedMessage(profileId, decryptedMessage, message, protocolStore)
                    console.log("Finished decrypting message!");
                    resolve();
                });
            })
    });
}

function decryptMessage(protocolStore, message) {
    return new Promise((resolve, reject) => {
        const ciphertext = JSON.parse(message.content);
        let decryptionMethod = getDecryptionMethod(ciphertext, message.sender_id, protocolStore);
        decryptionMethod(ciphertext.body, 'binary').then(newPlaintext => {
            let decryptedMessage = new TextDecoder('utf-8').decode(newPlaintext);
            let emailEndPosition = decryptedMessage.search("/");

            let toReturn = {
                email: decryptedMessage.substr(0, emailEndPosition),
                message: decryptedMessage.substr(emailEndPosition + 1)
            }
            resolve(toReturn);
        });
    });
}

function getDecryptionMethod(ciphertext, senderId, protocolStore) {
    const receiverAddress = new window.libsignal.SignalProtocolAddress(senderId.toString(), 1);
    const sessionCipher = new window.libsignal.SessionCipher(protocolStore, receiverAddress);

    if(ciphertext.type === 3) {
        return sessionCipher.decryptPreKeyWhisperMessage;
    } else if(ciphertext.type === 1) {
        return sessionCipher.decryptWhisperMessage;
    } else {
        console.error("Unknown ciphertext type! Type: " + ciphertext.type);
    }
}

function saveReceivedMessage (myId, decryptedMessage, message, protocolStore) {
    message.content = decryptedMessage.message;
    db.conversations.where({sender_id: myId, 'receiver.id': message.sender_id}).modify(c => c.messages.push(message));
    protocolStore.save(myId);
}

//endregion

//region Encrypting messages

//make sure to call ensureProtocolStore() before calling this function!
LibsignalHelper.sendMessage = function(plaintextMessage, protocolStore, sender, receiver) {
    return new Promise((resolve, reject) => {
        LibsignalHelper.ensureIdentityKeys(protocolStore, sender.user_id).then(_ => {
            return ensureSession(protocolStore, receiver);
        }).then(_ => {
            return encryptMessage(protocolStore, sender, receiver, plaintextMessage);
        }).then(ciphertext => {
            return sendMessageToServer(ciphertext, receiver)
        }).then(messageParams => {
            return saveSendMessage(messageParams, receiver, sender, plaintextMessage)
        }).then(_ => {
            protocolStore.save(sender.user_id);
            console.log("Finished sending process!");
            resolve();
        });
    });
}

function encryptMessage(protocolStore, sender, receiver, message) {
    let messageWithEmail = `${sender.email}/${message}`;

    return new Promise((resolve, reject) => {
        let receiverAddress = new window.libsignal.SignalProtocolAddress(receiver.user_id, receiver.device_id);
        let sessionCipher = new window.libsignal.SessionCipher(protocolStore, receiverAddress);
        sessionCipher.encrypt(messageWithEmail).then(ciphertext => {
            resolve(ciphertext);
        });
    });
}

function sendMessageToServer(ciphertext, receiver){
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

function saveSendMessage(message_params, receiver, sender, plaintextMessage) {
    return new Promise((resolve, reject) => {
        let message = {
            content: plaintextMessage,
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

//endregion

//region Utils
function arraybuffer_to_string(arraybuffer) {
    return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
}

function string_to_arraybuffer(string) {
    return new Uint8Array(JSON.parse(string)).buffer;
}
//endregion

export default LibsignalHelper;