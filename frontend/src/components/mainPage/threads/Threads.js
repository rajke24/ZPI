import React from 'react';
import Thread from "./Thread";

const threads = [
    {id: 1, name: 'Thread 1', lastMessage: 'last message'},
    {id: 2, name: 'Thread 2', lastMessage: 'last message 2'},
    {id: 2, name: 'Thread 3', lastMessage: 'last message 3'},
]

const Threads = () => {
    return (
        <div className='threads'>
            {threads.map(({id, name}) => <Thread name={name}/>)}
        </div>
    );
};

export default Threads;