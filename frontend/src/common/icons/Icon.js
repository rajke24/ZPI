import React from 'react';

import {ReactComponent as Lock} from "./lock.svg";
import {ReactComponent as Mail} from "./mail.svg";
import {ReactComponent as Thunderstorm} from "./thunderstorm.svg";

export const lockIcon = Lock;
export const mailIcon = Mail;
export const thunderstormIcon = Thunderstorm;

const Icon = ({id, onClick, icon}) => {
    return <div className="icon" id={id} onClick={onClick}>{React.createElement(icon)}</div>
};

export default Icon;