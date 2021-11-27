import React from "react";
import {compress} from "../utils";
import axios from "axios";

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

export const upload = (files, progressCallback, callback) => {
    for (let file of files) {
        const sizeLimit = 100000; // compress above 100kb
        if (file.type.includes('image') && file.size > sizeLimit) {
            compress(file, compressed => {
                doUpload(compressed, progressCallback, callback);
            });
        } else {
            doUpload(file, progressCallback, callback);
        }
    }
};

const doUpload = (file, progressCallback, callback) => {
    let formData = new FormData();
    formData.set('file', file, file.name);
    let config = {
        url: '/documents',
        data: formData,
        method: 'POST',
        headers: {'Content-Type': 'multipart/form-data'},
        onUploadProgress: (progressEvent) => {
            let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            progressCallback(percentCompleted)
        }
    };
    axios.request(config).then(
        response => callback(response.data)
    );
};