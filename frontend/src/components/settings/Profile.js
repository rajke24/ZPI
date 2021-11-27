import React from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages} from "react-intl";
import * as Yup from "yup";
import {addValidation} from "../../common/form/FromSchemaBuilder";

const messages = buildMessages(defineMessages({
    avatar: {
        id: 'Profile.Avatar.Label',
        defaultMessage: 'Avatar'
    },
    username: {
        id: 'Profile.Username.Label',
        defaultMessage: 'Username'
    },
    changePassword: {
        id: 'Profile.ChangePassword.Label',
        defaultMessage: 'Change password'
    },
    currentPassword: {
        id: 'Profile.CurrentPassword.Label',
        defaultMessage: 'Current password'
    },
    newPassword: {
        id: 'Profile.NewPassword.Label',
        defaultMessage: 'New password'
    },
    newPasswordConfirm: {
        id: 'Profile.NewPasswordConfirm.Label',
        defaultMessage: 'Confirm new password'
    },
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true}),
})

const Profile = () => {
    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    return (
        <div>
            {buildFields([
                {
                    fieldType: 'avatar',
                    name: 'document',
                    label: messages.avatar,
                    crop: true
                },
                {
                    fieldType: 'input',
                    name: 'username',
                    label: messages.username
                },
                {
                    fieldType: 'checkbox',
                    name: 'change_password',
                    label: messages.changePassword
                },
            ], formik, validationSchema)}

            {formik.values.change_password && buildFields([
                {
                    fieldType: 'password',
                    name: 'current_password',
                    label: messages.currentPassword
                },
                {
                    fieldType: 'password',
                    name: 'new_password',
                    label: messages.newPassword
                },
                {
                    fieldType: 'password',
                    name: 'new_password_confirm',
                    label: messages.newPasswordConfirm
                },
            ], formik, validationSchema)}
        </div>
    );
};

export default Profile;