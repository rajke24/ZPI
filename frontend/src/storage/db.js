import Dexie from 'dexie'
import {get, get_image} from "../shared/ApiClientBuilder";

const db = new Dexie('byespy_database');

db.version(6).stores(
    { conversations: "++id,receiver,sender_id,name,messages,known_receiver_devices"},
)
db.version(7).stores(
    {
        userData: "user_id,device_id,registration_id,my_identity_key,prekeys,identity_keys,signed_prekeys,sessions",
    }
)
db.version(8).stores(
    {
        avatarData: "user_id,avatar",
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

export const downloadAndStoreImage = async function (user_id) {
    get_image("get_avatar/" + user_id, {}, (response) => {
        db.avatarData.put(
            {user_id: user_id, avatar: response.data},
            [user_id]
        ).then(function (updated) {
            if (updated)
                console.log ("Avatar updated of: " + user_id);
            else
                console.log ("Image not updated");
        });
    })
}

export default db;