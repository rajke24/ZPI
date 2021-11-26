import ByteBuffer from "bytebuffer"
import db, {createUser} from "../storage/db";

function SignalProtocolStore() {
    this.myIdentityKeyPair = undefined;
    this.myRegistrationId = undefined;
    this.identityKeys = {};
    this.myPreKeys = {};
    this.mySignedPreKeys = {};
    this.sessions = {};
}

function arraybuffer_to_string(arraybuffer) {
    return JSON.stringify(Array.from(new Uint8Array(arraybuffer)))
}

function string_to_arraybuffer(string) {
    return new Uint8Array(JSON.parse(string)).buffer;
}

SignalProtocolStore.prototype = {
    Direction: {
        SENDING: 1,
        RECEIVING: 2,
    },
    setIdentityKeyPair: function(identityKeyPair) {
        this.myIdentityKeyPair = identityKeyPair;
    },
    getIdentityKeyPair: function () {
        return Promise.resolve(this.myIdentityKeyPair);
    },
    setLocalRegistrationId: function(registrationId) {
        this.myRegistrationId = registrationId;
    },
    getLocalRegistrationId: function () {
        return Promise.resolve(this.myRegistrationId);
    },
    isTrustedIdentity: function (identifier, identityKey, direction) {
        if (identifier === null || identifier === undefined) {
            throw new Error("tried to check identity key for undefined/null key");
        }
        if (!(identityKey instanceof ArrayBuffer)) {
            throw new Error("Expected identityKey to be an ArrayBuffer");
        }
        const trusted = this.identityKeys['identityKey' + identifier];
        if (trusted === undefined) {
            return Promise.resolve(true);
        }
        return Promise.resolve(this.toStringComp(identityKey) === this.toStringComp(trusted));
    },
    loadIdentityKey: function (identifier) {
        if (identifier === null || identifier === undefined)
            throw new Error("Tried to get identity key for undefined/null key");
        return Promise.resolve(this.identityKeys['identityKey' + identifier]);
    },
    saveIdentity: function (identifier, identityKey) {
        if (identifier === null || identifier === undefined)
            throw new Error("Tried to put identity key for undefined/null key");

        var address = new window.libsignal.SignalProtocolAddress.fromString(identifier);

        var existing = this.identityKeys['identityKey' + address.getName()];
        this.identityKeys['identityKey' + address.getName()] = identityKey;

        if (existing && this.toStringComp(identityKey) !== this.toStringComp(existing)) {
            return Promise.resolve(true);
        } else {
            return Promise.resolve(false);
        }

    },

    /* Returns a prekeypair object or undefined */
    loadPreKey: function (keyId) {
        var res = this.myPreKeys['25519KeypreKey' + keyId];
        if (res !== undefined) {
            res = {pubKey: res.keyPair.pubKey, privKey: res.keyPair.privKey};
        }
        return Promise.resolve(res);
    },
    storePreKey: function (keyId, keyPair) {
        return Promise.resolve(this.myPreKeys['25519KeypreKey' + keyId] = keyPair);
    },
    removePreKey: function (keyId) {
        return Promise.resolve(delete this.myPreKeys['25519KeypreKey' + keyId]);
    },

    /* Returns a signed keypair object or undefined */
    loadSignedPreKey: function (keyId) {
        var res = this.mySignedPreKeys['25519KeysignedKey' + keyId];
        if (res !== undefined) {
            res = {pubKey: res.keyPair.pubKey, privKey: res.keyPair.privKey};
        }
        return Promise.resolve(res);
    },
    storeSignedPreKey: function (keyId, keyPair) {
        return Promise.resolve(this.mySignedPreKeys['25519KeysignedKey' + keyId] = keyPair);
    },
    removeSignedPreKey: function (keyId) {
        return Promise.resolve(delete this.mySignedPreKeys['25519KeysignedKey' + keyId]);
    },

    loadSession: function (identifier) {
        return Promise.resolve(this.sessions['session' + identifier]);
    },
    storeSession: function (identifier, record) {
        return Promise.resolve(this.sessions['session' + identifier] = record);
    },
    removeSession: function (identifier) {
        return Promise.resolve(delete this.sessions['session' + identifier]);
    },
    removeAllSessions: function (identifier) {
        return Promise.resolve(this.sessions = {});
    },
    toStringComp: function (thing) {
        if (typeof thing == 'string') {
            return thing;
        }
        return new ByteBuffer.wrap(thing).toString('binary');
    },
    save: async function(user_id) {
        /*let preKeys = {};
        for(const [key, value] of Object.entries(this.myPreKeys)) {
            preKeys[key] = this.preKeyToString(value);
        }

        let signedPreKeys = {};
        for(const [key, value] of Object.entries(this.mySignedPreKeys)) {
            signedPreKeys[key] = this.signedPreKeyToString(value);
        }

        let sessions = {};
        for(const [key, value] of Object.entries(this.sessions)) {
            sessions[key] = value;
        }

        let identityKeys = {};
        for(const [key, value] of Object.entries(this.identityKeys)) {
            identityKeys[key] = value;
        }*/

        /*await db.userData.put({
            user_id: user_id,
            registration_id: this.myRegistrationId,
            my_identity_key: this.identityKeyToString(this.myIdentityKeyPair),
            preKeys: preKeys,
            identity_keys: identityKeys,
            signed_prekeys: signedPreKeys,
            sessions: sessions
        })*/
        await db.userData.put({
            user_id: user_id,
            registration_id: this.myRegistrationId,
            my_identity_key: this.myIdentityKeyPair,
            preKeys: this.myPreKeys,
            identity_keys: this.identityKeys,
            signed_prekeys: this.mySignedPreKeys,
            sessions: this.sessions
        });
    },
    identityKeyToString: function(identityKeyPair) {
        return {
            privKey: arraybuffer_to_string(identityKeyPair.privKey),
            pubKey: arraybuffer_to_string(identityKeyPair.pubKey)
        }
    },
    identityKeyToObject: function(identityKeyPair) {
        return {
            privKey: string_to_arraybuffer(identityKeyPair.privKey),
            pubKey: string_to_arraybuffer(identityKeyPair.pubKey)
        }
    },
    preKeyToString: function(preKey) {
        return {
            keyId: preKey.keyId,
            keyPair: {
                privKey: arraybuffer_to_string(preKey.keyPair.privKey),
                pubKey: arraybuffer_to_string(preKey.keyPair.pubKey)
            }
        }
    },
    preKeyToObject: function(preKey) {
        return {
            keyId: preKey.keyId,
            keyPair: {
                privKey: string_to_arraybuffer(preKey.keyPair.privKey),
                pubKey: string_to_arraybuffer(preKey.keyPair.pubKey)
            }
        }
    },
    signedPreKeyToString: function(signedPreKey) {
        return {
            keyId: signedPreKey.keyId,
            keyPair: {
                privKey: arraybuffer_to_string(signedPreKey.keyPair.privKey),
                pubKey: arraybuffer_to_string(signedPreKey.keyPair.pubKey)
            },
            signature: arraybuffer_to_string(signedPreKey.signature)
        }
    },
    signedPreKeyToObject: function(signedPreKey) {
        return {
            keyId: signedPreKey.keyId,
            keyPair: {
                privKey: string_to_arraybuffer(signedPreKey.keyPair.privKey),
                pubKey: string_to_arraybuffer(signedPreKey.keyPair.pubKey)
            },
            signature: string_to_arraybuffer(signedPreKey.signature)
        }
    },
}

export default SignalProtocolStore;