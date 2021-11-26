import Dexie from 'dexie'

const db = new Dexie('byespy_database');

db.version(6).stores(
    { conversations: "++id,receiver,sender_id,name,messages"},
)
db.version(7).stores(
    {
        userData: "user_id,registration_id,my_identity_key,prekeys,identity_keys,signed_prekeys,sessions",
    }
)

export const createConversation = async (name, sender, receiver) => {
    await db.conversations.add({
        name,
        sender_id: sender.id,
        receiver,
        messages: []
    })
}

export default db;