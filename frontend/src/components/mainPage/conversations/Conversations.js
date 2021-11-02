import React from 'react';
import Conversation from "./Conversation";

const conversations = [
    {id: 1, name: 'Conv1 asd', lastMessage: 'last message'},
    {id: 2, name: 'Conv2', lastMessage: 'last message 2'},
    {id: 2, name: 'Conv2', lastMessage: 'last message 3'},
]

const Conversations = () => {
    return (
        <div className='conversations'>
            {conversations.map(({id, name, lastMessage}) => <Conversation name={name} lastMessage={lastMessage}/>)}
        </div>
    );
};

export default Conversations;