import React, {useState} from 'react';
import logo from "../../common/images/logo.svg";
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";
import {defineMessages, useIntl} from "react-intl";
import {useHistory, useParams} from "react-router";
import * as Yup from "yup";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {buildMessages} from "../../common/commonMessages";
import {save} from "../../shared/ApiClientBuilder";
import {doSave} from "../../common/form/FormHelpers";
import {Link} from "react-router-dom";
import FormFeedback from "../../common/form/FormFeedback";
import './AuthPages.scss';

const messages = buildMessages(defineMessages({
    password: {
        id: 'ResetPasswordPage.Password.Placeholder',
        defaultMessage: 'Password'
    },
    confirmPassword: {
        id: 'ResetPasswordPage.ConfirmPassword.Placeholder',
        defaultMessage: 'Confirm password'
    },
    resetPassword: {
        id: 'ResetPasswordPage.ResetPassword.Button',
        defaultMessage: 'Reset password'
    },
    changedMind: {
        id: 'ResetPasswordPage.ChangedMind.Label',
        defaultMessage: 'Changed your mind ?'
    },
    signIn: {
        id: 'ResetPasswordPage.SignIn.Link',
        defaultMessage: 'SIGN IN'
    },
    signInBtn: {
        id: 'ResetPasswordPage.SignInBtn.Button',
        defaultMessage: 'Sign in'
    }
}));

const validationSchema = Yup.object().shape({
    password: addValidation({required: true, min: 8, max: 255}),
    confirmPassword: addValidation({required: true, min: 8, max: 255, sameAs: 'password'}),
})

const ResetPasswordPage = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();
    const urlParams = useParams();
    const [notification, setNotification] = useState();
    const token = urlParams.password_reset_token

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    const actions = {
        resetPassword: (params, callback) => save('/reset_password', 'POST', params, callback)
    }

    const resetPassword = e => {
        e.preventDefault();

        doSave(formik, (values) => {
            actions.resetPassword({password: values.password, token}, (notification) => setNotification(notification));
        })
    }

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img onClick={() => history.push('/login')} src={logo} alt={formatMessage(messages.appName)}/>
                <h1 className='app-name'>{formatMessage(messages.appName)}</h1>
                {!notification && <form className='auth-form'>
                    {buildFields([
                        {
                            fieldType: 'password',
                            name: 'password',
                            placeholder: formatMessage(messages.password),
                            icon: <Icon icon={lockIcon}/>
                        },
                        {
                            fieldType: 'password',
                            name: 'confirmPassword',
                            placeholder: formatMessage(messages.confirmPassword)
                        },
                    ], formik, validationSchema)}
                    <button className='primary-btn' onClick={e => resetPassword(e)}>{formatMessage(messages.resetPassword)}</button>
                    <div className='labeled-link'>
                        {formatMessage(messages.changedMind)}
                        <Link className='auth-link' to='/login'>{formatMessage(messages.signIn)}</Link>
                    </div>
                </form>}
                {notification && <div>
                    <FormFeedback full={true} success={notification.successful}>{notification.message}</FormFeedback>
                    {notification.successful ?
                        <button style={{width: '100%', padding: '10px'}} className='secondary-btn' onClick={() => history.push('/login')}>{formatMessage(messages.signIn)}</button> :
                        <div>
                            <button style={{width: '100%', padding: '10px'}} className='secondary-btn' onClick={() => history.push('/forgot_password')}>{formatMessage(messages.resetPassword)}</button>
                            <div className='labeled-link'>
                                {formatMessage(messages.changedMind)}
                                <Link className='auth-link' to='/login'>{formatMessage(messages.signIn)}</Link>
                            </div>
                        </div>}
                </div>}
            </div>
        </div>
    );
};

export default ResetPasswordPage;