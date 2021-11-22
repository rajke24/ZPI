import React from 'react';
import Avatar from "../../../common/avatar/Avatar";
import './Conversation.scss';
import {useHistory, useParams} from "react-router";
import * as classnames from "classnames";
import {useSelector} from "react-redux";

const Conversation = ({name, lastMessage}) => {
    const history = useHistory();
    const params = useParams();
    const profile = useSelector(state => state.persistentState.profile)

    return (
        <div className={classnames('conversation', {selected: params.name === name})} onClick={() => history.push(`/chat/${name}`)}>
            <div className='marker' />
            <div className='conversation-data'>
                <Avatar name={name} color='#1181A5' />
                <div className='conversation-info'>
                    <span className='name'>{name}</span>
                    {lastMessage && <span className='last-message'>{lastMessage.sender_id === profile.id ? 'You:' : 'Him:'} {lastMessage.content}</span>}
                </div>
            </div>
        </div>
    );
};

export default Conversation;