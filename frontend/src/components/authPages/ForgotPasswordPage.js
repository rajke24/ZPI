import React, {useEffect, useState} from 'react';
import './AuthPages.scss';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory, useParams} from "react-router";
import {login} from "./LoginPageActions";
import {useDispatch} from "react-redux";
import {save} from "../../shared/ApiClientBuilder";
import logo from '../../common/images/logo.svg';
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";

const messages = buildMessages(defineMessages({
    newPassword: {
        id: 'ForgotPasswordPage.NewPassword.Placeholder',
        defaultMessage: 'New password'
    },
    email: {
        id: 'ForgotPasswordPage.Email.Placeholder',
        defaultMessage: 'E-mail'
    },
    confirmPassword: {
        id: 'ForgotPasswordPage.ConfirmPassword.Placeholder',
        defaultMessage: 'Confirm password'
    },
    changePassword: {
        id: 'LoginPage.ChangePassword.Button',
        defaultMessage: 'Change password'
    },
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true}),
    password: addValidation({required: true}),
})

const ForgotPasswordPage = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();
    const dispatch = useDispatch();
    const params = useParams();


    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    // useEffect(() => {
    //     if (activationToken) actions.activateAccount(() => {
    //         setAccountActivated(true)
    //     })
    // }, [activationToken])
    //
    // const saveUser = (e) => {
    //     e.preventDefault()
    //     setError(null);
    //     const {email, password} = formik.values;
    //     actions.login(email, password, () => {
    //         setError(formatMessage(messages.invalidEmailOrPassword))
    //         formik.setSubmitting(false);
    //     })
    // };

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img onClick={() => history.push('/login')} src={logo} alt={formatMessage(messages.appName)}/>
                <h1 className='app-name'>{formatMessage(messages.appName)}</h1>
                <form className='auth-form' >
                    {buildFields([
                        {
                            fieldType: 'input',
                            name: 'email',
                            placeholder: formatMessage(messages.email),
                            icon: <Icon icon={mailIcon}/>
                        },
                        {
                            fieldType: 'password',
                            name: 'password',
                            placeholder: formatMessage(messages.newPassword),
                            icon: <Icon icon={lockIcon}/>
                        },
                        {
                            fieldType: 'password',
                            name: 'confirm_password',
                            placeholder: formatMessage(messages.confirmPassword),
                            // icon: <Icon icon={lockIcon}/>
                        },
                    ], formik, validationSchema)}
                    <button className='auth-general-btn' type="submit">{formatMessage(messages.changePassword)}</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;