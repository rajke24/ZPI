import React from "react";

export const doSave = (formik, saveFn, saveCallback, toApi = values => values, toFormik = values => values) => {
    formik.setSubmitting(true);
    formik.submitForm();
    formik.validateForm().then((errors) => {
        if (Object.keys(errors).length > 0) {
            formik.setSubmitting(false);
        } else {
            saveFn(toApi(formik.values), result => {
                formik.setValues(toFormik(result)).then(() => {
                    setTimeout(() => formik.setSubmitting(false), 500);
                });
                saveCallback && saveCallback(result);
            });
        }
    });
};