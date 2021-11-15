import React from 'react';

import {ReactComponent as Lock} from "./lock.svg";
import {ReactComponent as Mail} from "./mail.svg";
import {ReactComponent as Send} from "./send.svg";
import {ReactComponent as CaretDown} from "./caretDown.svg";
import {ReactComponent as Chat} from "./chat.svg";
import {ReactComponent as Invitations} from "./invitations.svg";
import {ReactComponent as Logout} from "./logout.svg";
import {ReactComponent as Settings} from "./settings.svg";

export const lockIcon = Lock;
export const mailIcon = Mail;
export const sendIcon = Send;
export const caretDownIcon = CaretDown;
export const chatIcon = Chat;
export const invitationsIcon = Invitations;
export const logoutIcon = Logout;
export const settingsIcon = Settings;

const Icon = ({id, onClick, icon}) => {
    return <div className="icon" id={id} onClick={onClick}>{React.createElement(icon)}</div>
};

export default Icon;