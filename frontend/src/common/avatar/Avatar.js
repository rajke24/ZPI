import React from 'react';
import {reverseColor} from "../utils";
import './Avatar.scss';

const Avatar = ({image, name, color}) => {
    const shortName = name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();

    return (
        <div className='avatar' style={{background: color}}>
            {image ? <img src={image} alt={name}/> : <div style={{color: reverseColor(color)}}>{shortName}</div>}
        </div>
    );
};

export default Avatar;