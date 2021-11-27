import React from 'react';

import {ReactComponent as Lock} from "./icons/lock.svg";
import {ReactComponent as Mail} from "./icons/mail.svg";
import {ReactComponent as Send} from "./icons/send.svg";
import {ReactComponent as CaretDown} from "./icons/caretDown.svg";
import {ReactComponent as Chat} from "./icons/chat.svg";
import {ReactComponent as Invitations} from "./icons/invitations.svg";
import {ReactComponent as Logout} from "./icons/logout.svg";
import {ReactComponent as Settings} from "./icons/settings.svg";
import {ReactComponent as Delete} from "./icons/delete.svg";

export const lockIcon = Lock;
export const mailIcon = Mail;
export const sendIcon = Send;
export const caretDownIcon = CaretDown;
export const chatIcon = Chat;
export const invitationsIcon = Invitations;
export const logoutIcon = Logout;
export const settingsIcon = Settings;
export const deleteIcon = Delete;

const Icon = ({id, onClick, icon}) => {
    return <div className="icon" id={id} onClick={onClick}>{React.createElement(icon)}</div>
};

export default Icon;