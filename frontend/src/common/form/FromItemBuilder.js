import React from "react";
import FormInput from "./FormInput";
import {useFormik} from "formik";

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
            default:
                return 'Unknown type';
        }
    });
}