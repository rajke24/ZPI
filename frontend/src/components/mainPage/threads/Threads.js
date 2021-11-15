import React from 'react';
import Thread from "./Thread";

const threads = [
    {id: 1, name: 'General'},
]

const Threads = () => {
    return (
        <div className='threads'>
            {threads.map(({id, name}) => <Thread name={name}/>)}
        </div>
    );
};

export default Threads;