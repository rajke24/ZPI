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
        const message = {...data.message, message_type: data.message.sender.user_id === profileId ? 'sent' : 'received'}
        if(message.receiver.user_id !== profileId) {
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
                ensureConversation(profileId, message.sender.user_id, decryptedMessage.email).then(_ => {
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
        let decryptionMethod = getDecryptionMethod(ciphertext, message.sender.user_id, message.sender.device_id, protocolStore);
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

function getDecryptionMethod(ciphertext, senderId, senderDeviceId, protocolStore) {
    const receiverAddress = new window.libsignal.SignalProtocolAddress(senderId.toString(), senderDeviceId);
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
    db.conversations.where({sender_id: myId, 'receiver.id': message.sender.user_id}).modify(c => c.messages.push(message));
    protocolStore.save(myId);
}

//endregion

//region Encrypting messages


function getKnownDevices(profileId, otherUserId) {
    return new Promise((resolve, reject) => {
        db.conversations.get({sender_id: profileId, 'receiver.id': otherUserId}).then(result => {
            resolve(result.known_receiver_devices);
        });
    });
}


//make sure to call ensureProtocolStore() before calling this function!
LibsignalHelper.sendMessage = function(plaintextMessage, protocolStore, sender, receiver) {
    return new Promise((resolve, reject) => {
        LibsignalHelper.ensureIdentityKeys(protocolStore, sender.user_id).then(_ => {
            return getKnownDevices(sender.user_id, receiver.user_id);
        }).then(knownReceiverDevices => {
            return encryptAllMessages(protocolStore, sender, receiver, plaintextMessage, knownReceiverDevices)
        }).then(ciphertexts => {
            return sendAllMessagesToServer(ciphertexts, receiver, protocolStore, sender, plaintextMessage);
        }).then(messageParams => {
            return saveSendMessage(messageParams, receiver, sender, plaintextMessage);
        }).then(_ => {
            protocolStore.save(sender.user_id);
            console.log("Finished sending process!");
            resolve();
        });
    });
}

function encryptAllMessages(protocolStore, sender, receiver, message, knownReceiverDevices) {
    return new Promise((resolve, reject) => {
       let messageWithEmail = `${sender.email}/${message}`;
       Promise.all(knownReceiverDevices.map(device_id => encryptMessage(protocolStore, sender, receiver, messageWithEmail, device_id))).then(ciphertexts => {
          resolve(ciphertexts);
       });
    });
}

function encryptAllMessagesRepeat(protocolStore, sender, receiver, message, knownReceiverDevices, previousCiphertexts) {
    return new Promise((resolve, reject) => {
        let updatedCiphertexts = previousCiphertexts.filter(function(value) {
           return knownReceiverDevices.includes(value.device_id); //we are removing devices that are outdated
        });

        let alreadyEncryptedDevices = previousCiphertexts.map(value => value.device_id);
        let nonEncryptedDevices = knownReceiverDevices.filter(function(value) {
            return !alreadyEncryptedDevices.includes(value);
        });

        let messageWithEmail = `${sender.email}/${message}`;
        Promise.all(nonEncryptedDevices.map(device_id => encryptMessage(protocolStore, sender, receiver, messageWithEmail, device_id))).then(ciphertexts => {
            resolve(updatedCiphertexts.concat(ciphertexts));
        });
    });
}

function encryptMessage(protocolStore, sender, receiver, message, receiver_device_id) {
    return new Promise((resolve, reject) => {
        let receiverAddress = new window.libsignal.SignalProtocolAddress(receiver.user_id, receiver_device_id);
        let sessionCipher = new window.libsignal.SessionCipher(protocolStore, receiverAddress);
        sessionCipher.encrypt(message).then(ciphertext => {
            resolve({ device_id: receiver_device_id[0], ciphertext: ciphertext });
        });
    });
}

function sendAllMessagesToServer(ciphertexts, receiver, protocolStore, sender, message) {
    return new Promise((resolve, reject) => {
        let messages = [];
        let currentDate = new Date();
        for(let i = 0; i < ciphertexts.length; i++) {
           const ciphertext = ciphertexts[i];
           messages.push( {
              content: JSON.stringify(ciphertext.ciphertext),
              receiver_device_id:  ciphertext.device_id,
              sent_at: currentDate,
              type: 'type'
           });
        }
        save('messages/save_message', 'POST', {
            receiver_user_id: receiver.user_id,
            sender_device_id: protocolStore.getDeviceId(),
            messages: messages
        }, (params) => {
            if(params.message_id === undefined) {
                console.log(params);
                updateDevices(sender.user_id, receiver.user_id, protocolStore, params.invalid_devices).then(_ => {
                    return getKnownDevices(sender.user_id, receiver.user_id)
                }).then(knownDevices => {
                    return encryptAllMessagesRepeat(protocolStore, sender, receiver, message, knownDevices, ciphertexts);
                }).then(ciphertexts => {
                    return sendAllMessagesToServer(ciphertexts, receiver, protocolStore, sender, message);
                }).then(new_params => {
                    resolve(new_params);
                });
            } else {
                console.log("Message sent!");
                resolve( {
                    message_id: params.message_id,
                    send_at: currentDate
                });
            }
        });
    });
}


function createSession(otherUserId, protocolStore, deviceToAdd) {
    return new Promise((resolve, reject) => {
        let preKeyBundle = {
            registrationId: 1, //TODO
            identityKey: string_to_arraybuffer(deviceToAdd.prekey_bundle.identity_key),
            preKey: {
                keyId: deviceToAdd.prekey_bundle.prekey.keyId,
                publicKey: string_to_arraybuffer(deviceToAdd.prekey_bundle.prekey.publicKey)
            },
            signedPreKey: {
                keyId: deviceToAdd.prekey_bundle.signed_key.keyId,
                publicKey: string_to_arraybuffer(deviceToAdd.prekey_bundle.signed_key.publicKey),
                signature: string_to_arraybuffer(deviceToAdd.prekey_bundle.signed_key.signature)
            }
        };
        let receiverAddress = new window.libsignal.SignalProtocolAddress(otherUserId, deviceToAdd.device_id);
        let sessionBuilder = new window.libsignal.SessionBuilder(protocolStore, receiverAddress);
        sessionBuilder.processPreKey(preKeyBundle).then(() => {
            console.log("New session created!");
            resolve();
        });
    });
}


function updateDevices(profileId, otherUserId, protocolStore, invalid_devices) {
    return new Promise((resolve, reject) => {
        let devicesToRemove = invalid_devices.filter(function(value) {
            return value.prekey_bundle === undefined;
        });
        devicesToRemove = devicesToRemove.map(function(value) {
            return value.device_id;
        });

        let devicesToAdd = invalid_devices.filter(function(value) {
            return value.prekey_bundle !== undefined;
        });

        new Promise((resolve, reject) => {
            if(devicesToRemove.length !== 0) {
                db.conversations.get({sender_id: profileId, 'receiver.id': otherUserId}).then(result => {
                    let knownDevices = result.known_receiver_devices;
                    let updatedDevices = knownDevices.filter(function(value) {
                        return !devicesToRemove.includes(value);
                    });

                    db.conversations.update(result.id, {known_receiver_devices: updatedDevices});
                    resolve();
                });
            } else {
                resolve();
            }
        }).then(_ => {
            return new Promise((resolve, reject) => {
                if(devicesToAdd.length !== 0) {
                    Promise.all(devicesToAdd.map(deviceToAdd => createSession(otherUserId, protocolStore, deviceToAdd))).then(_ => {
                        db.conversations.get({sender_id: profileId, 'receiver.id': otherUserId}).then(result => {
                            let knownDevices = result.known_receiver_devices;
                            let devicesToAddIndexes = devicesToAdd.map(value => value.device_id);

                            let updatedDevices = knownDevices.concat(devicesToAddIndexes);
                            db.conversations.update(result.id, {known_receiver_devices: updatedDevices});
                            resolve();
                        });
                    });
                } else {
                    resolve();
                }
            });
        }).then(_ => {
            protocolStore.save(profileId);
            resolve();
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