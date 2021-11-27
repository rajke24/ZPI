import React from "react";
import formField from "./FormField";

const FormCheckbox = ({error, name, value, onChange, disabled}) => {
    const handleChange = e => {
        onChange(name, e.target.checked);
    }

    return <input
        type="checkbox"
        onChange={handleChange}
        name={name}
        disabled={disabled}
        value={value}
        checked={value}
        className="form-control"/>
};


export default formField(FormCheckbox);