import Dexie from 'dexie'

const db = new Dexie('byespy_database');

db.version(5).stores(
    { conversations: "++id,receiver_id,sender_id,name,messages"}
)

export default db;