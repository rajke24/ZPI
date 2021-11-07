import React from 'react';
import Avatar from "../../../common/avatar/Avatar";
import './Conversation.scss';
import {useHistory} from "react-router";

const Conversation = ({name, lastMessage}) => {
    const history = useHistory();

    return (
        <div className='conversation' onClick={() => history.push(`/conversations/${name}`)}>
            <Avatar name={name} color='#1181A5' />
            <div className='conversation-info'>
                <span className='name'>{name}</span>
                <span className='last-message'>{lastMessage}</span>
            </div>
        </div>
    );
};

export default Conversation;