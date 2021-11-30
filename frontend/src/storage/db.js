import Dexie from 'dexie'

const db = new Dexie('byespy_database');

db.version(6).stores(
    { conversations: "++id,receiver,sender_id,name,messages,known_receiver_devices"},
)
db.version(7).stores(
    {
        userData: "user_id,device_id,registration_id,my_identity_key,prekeys,identity_keys,signed_prekeys,sessions",
    }
)

export const createConversation = async (sender, receiver, messages=[]) => {
    if(receiver.username === null || receiver.username === undefined)
        receiver.username = receiver.email;
    await db.conversations.add({
        name: receiver.username,
        sender_id: sender.id,
        receiver,
        messages,
        known_receiver_devices: []
    })
}

export default db;