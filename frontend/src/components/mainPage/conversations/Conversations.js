import React, {useState} from 'react';
import Conversation from "./Conversation";
import {useLiveQuery} from "dexie-react-hooks";
import db from '../../../storage/db';
import {useDispatch, useSelector} from "react-redux";
import './Conversations.scss';

const Conversations = () => {
    const profile = useSelector(state => state.persistentState.profile);
    const [searchQuery, setSearchQuery] = useState('');
    const conversations = useLiveQuery(() => db.conversations.where({sender_id: profile.id}).filter(c => c.name.includes(searchQuery)).toArray(), [searchQuery])?.map(c => ({
        name: c.name,
        lastMessage: c.messages[c.messages.length - 1],
        id: c.id
    }));

    const dispatch = useDispatch();

    const clearTable = async event => {
        event.preventDefault();
        await db.conversations.clear();
    }

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