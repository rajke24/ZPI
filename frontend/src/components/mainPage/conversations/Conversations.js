import React, {useEffect, useState} from 'react';
import Conversation from "./Conversation";
import {useLiveQuery} from "dexie-react-hooks";
import db from '../../../storage/db';
import {useDispatch, useSelector} from "react-redux";
import './Conversations.scss';
import {useHistory, useParams} from "react-router";

const Conversations = () => {
    const profile = useSelector(state => state.persistentState.profile);
    const [searchQuery, setSearchQuery] = useState('');
    const history = useHistory();
    const params = useParams();

    const conversations = useLiveQuery(() => db.conversations.where({sender_id: profile.id}).filter(c => c.name.includes(searchQuery)).toArray(), [searchQuery])?.map(c => ({
        name: c.name,
        lastMessage: c.messages[c.messages.length - 1],
        id: c.id
    }));

    useEffect(() => {
        if (conversations?.length > 0 && !params.name)
            history.push(`/chat/${conversations[0].name}`)
    }, [conversations])

    return (
        <div className='conversations'>
            <input className='search-input' value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                   placeholder='Search...'/>
            {conversations && conversations.map(({id, name, lastMessage}) => <Conversation key={id} name={name}
                                                                                           lastMessage={lastMessage}/>)}
        </div>
    );
};

export default Conversations;