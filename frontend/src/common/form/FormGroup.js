import React from "react";
import {useIntl} from "react-intl";
import FormFeedback from "./FormFeedback";

export const isRequiredField = (validationSchema, name) => {
    if (validationSchema) {
        const field = validationSchema.describe().fields[name];
        return field && field.tests.some(t => t.name === 'required');
    } else {
        return false;
    }
}

export const defaultOnChange = (formik) => async (name, value) => {
    return new Promise(resolve => {
        formik.setFieldValue(name, value).then(() => {
            if (formik.submitCount > 0) {
                formik.validateForm().then(() => {
                    resolve();
                });
            } else {
                resolve();
            }
        });
    });
};

const formGroup = (WrappedComponent) => {
    return (props) => {
        const {label, formik, validationSchema, name, hidden, width, placeholder, includeFieldNameInError} = props;
        const {formatMessage} = useIntl();
        const fieldName = label ? formatMessage(label) : placeholder ? placeholder : null

        const newProps = {
            ...props,
            onChange: defaultOnChange(formik),
            value: formik.values[name],
            error: formik.errors[name]
        };

        const error = formik.errors[name];
        if (hidden) {
            return null
        }

        return <> {label || placeholder ?
            <div style={{width: '100%'}}>
                {label && <div className="label">
                     <label for={name}>
                        {isRequiredField(validationSchema, name) &&
                        <span className="required-star">*</span>
                        }
                        {fieldName}
                    </label>
                </div>}
                <div>
                    {error && <FormFeedback error={true} full={false}>
                        {`${includeFieldNameInError ? fieldName : ''} ${formatMessage(error.message, error.params)}`}
                    </FormFeedback>}
                    <WrappedComponent {...newProps}/>
                </div>
            </div>
            :
            <WrappedComponent {...newProps}/>}
        </>
    };
}

export default formGroup;