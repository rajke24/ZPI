import React from 'react';

import {ReactComponent as Lock} from "./lock.svg";
import {ReactComponent as Mail} from "./mail.svg";
import {ReactComponent as Send} from "./send.svg";

export const lockIcon = Lock;
export const mailIcon = Mail;
export const sendIcon = Send;

const Icon = ({id, onClick, icon}) => {
    return <div className="icon" id={id} onClick={onClick}>{React.createElement(icon)}</div>
};

export default Icon;