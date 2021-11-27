import React from "react";
import FormInput from "./FormInput";
import {useFormik} from "formik";
import FormAvatar from "./FormAvatar";
import FormCheckbox from "./FormCheckbox";

export function useDefaultFormik(props) {
    return useFormik({
        validateOnChange: false,
        onSubmit: () => {
        },
        ...props
    })
}

export const buildFields = (fields, formik, validationSchema) => {
    return fields.map((field, idx) => {
        const props = {formik, validationSchema, ...field}
        switch (field.fieldType) {
            case "input":
            case "password":
                return <FormInput key={idx} {...props}/>
            case "avatar":
                return <FormAvatar key={idx} {...props} />
            case "checkbox":
                return <FormCheckbox key={idx} {...props} />
            default:
                return 'Unknown type';
        }
    });
}