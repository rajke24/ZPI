import Dexie from 'dexie'

const db = new Dexie('byespy_database');

db.version(6).stores(
    { conversations: "++id,receiver,sender_id,name,messages"}
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