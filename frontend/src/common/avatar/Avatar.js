import React from 'react';
import {reverseColor} from "../utils";
import './Avatar.scss';
import * as classnames from "classnames";
import db from "../../storage/db"


export const changeAvatar = async (user_id, avatar_id) => {
    db.avatarData.get(user_id).then(result => {
        if (result === undefined) {
            console.log("No avatar for this user");
        } else {
            const imgSrc = result.avatar
            let avatarElement = document.getElementById(avatar_id)

            if (avatarElement == null) {
                setTimeout(() => {
                    avatarElement = document.getElementById(avatar_id)
                    if (avatarElement !== null) {
                        avatarElement.innerHTML = "<image src=" + imgSrc + " style='height: 100%; width: 100%; object-fit: scale-down; border-radius: 50%'/>"
                    }
                }, 500)
            } else {
                avatarElement.innerHTML = "<image src=" + imgSrc + " style='height: 100%; width: 100%; object-fit: scale-down; border-radius: 50%'/>"
            }
        }
    });
}



const Avatar = ({image, name, color, big, small, avatar_id, user_id}) => {
    const shortName = name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();

    if (user_id !== undefined) {
        changeAvatar(user_id, avatar_id)
        console.log("changing avatar, ", user_id, ", ", avatar_id)
    }

    return (
        <div className={classnames('avatar', {'big': big, 'small': small})} style={{background: color}} id={avatar_id ? avatar_id : "avatar"}>
            {image ? <img src={image} alt={name}/> : <div style={{color: reverseColor(color)}}>{shortName}</div>}
        </div>
    );
};

export default Avatar;