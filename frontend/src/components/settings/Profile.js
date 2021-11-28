import React, {useEffect} from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages} from "react-intl";
import * as Yup from "yup";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useDispatch, useSelector} from "react-redux";
import {save} from "../../shared/ApiClientBuilder";
import {doSave} from "../../common/form/FormHelpers";
import {reloadProfile} from "../template/AppTemplateActions";
import './Profile.scss';

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
    }
}));

const validationSchema = Yup.object().shape({
    username: addValidation({required: true, min: 3, max: 50}),
    current_password: addValidation({required: true, min: 8, max: 255, conditional: 'change_password', serverSideValidation: {url: '/profile/validate_password', message: 'invalid'}}),
    password: addValidation({required: true, min: 8, max: 255, conditional: 'change_password'}),
    password_confirm: addValidation({required: true, min: 8, max: 255, sameAs: 'password', conditional: 'change_password'}),
})

const Profile = () => {
    const profile = useSelector(state => state.persistentState.profile);
    const dispatch = useDispatch();

    const actions = {
        updateProfile: (user, callback) => save('/profile', 'PUT', {user}, callback),
        reloadProfile: dispatch(reloadProfile)
    }

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    useEffect(() => formik.setValues(profile), [])

    const saveProfile = (e) => {
        e.preventDefault();
        doSave(formik, actions.updateProfile, () => actions.reloadProfile())
    }

    return (
        <form id='profile-form'>
            {buildFields([
                {
                    fieldType: 'avatar',
                    name: 'document',
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
                    name: 'password',
                    label: messages.newPassword
                },
                {
                    fieldType: 'password',
                    name: 'password_confirm',
                    label: messages.newPasswordConfirm
                },
            ], formik, validationSchema)}
            <button onClick={saveProfile}>Save</button>
        </form>
    );
};

export default Profile;