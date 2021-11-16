import React from 'react';
import {reverseColor} from "../utils";
import './Avatar.scss';
import * as classnames from "classnames";

const Avatar = ({image, name, color, big, small}) => {
    const shortName = name.split(' ').slice(0, 2).map(word => word[0]).join('').toUpperCase();

    return (
        <div className={classnames('avatar', {'big': big, 'small': small})} style={{background: color}}>
            {image ? <img src={image} alt={name}/> : <div style={{color: reverseColor(color)}}>{shortName}</div>}
        </div>
    );
};

export default Avatar;