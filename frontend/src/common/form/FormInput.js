import React from "react";
import * as classnames from "classnames";
import formField from "./FormField";
import './FormInput.scss';

const FormInput = ({
                       error, name, value, onChange, disabled,
                       placeholder, onBlur, autoFocus, fieldType, icon
                   }) => {
    const handleChange = e => onChange(name, e.target.value);

    const onKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onBlur && onBlur()
        }
    }

    return <div className='input-wrapper'>
        <input
            type={fieldType}
            autoFocus={autoFocus}
            placeholder={placeholder}
            onChange={handleChange}
            onBlur={onBlur}
            onKeyPress={onKeyPress}
            name={name}
            value={value}
            disabled={disabled}
            className={classnames('form-element', {"invalid": error, 'filled': value})}/>
        {icon && icon}
    </div>
};


export default formField(FormInput);