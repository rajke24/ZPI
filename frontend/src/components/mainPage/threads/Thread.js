import React from 'react';
import './Thread.scss'
const Thread = ({name}) => {
    return (
        <div className='thread'>
            <span># {name}</span>
        </div>
    );
};

export default Thread;