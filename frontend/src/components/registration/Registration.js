import React from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory} from "react-router";
import {post} from "../../shared/ApiClientBuilder";
import '../../styles/AuthPages.scss';
import logo from "../../common/images/logo.svg";
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";

const messages = buildMessages(defineMessages({
    email: {
        id: 'Registration.Email.Label',
        defaultMessage: 'E-mail'
    },
    password: {
        id: 'Registration.Password.Label',
        defaultMessage: 'Password'
    },
    confirmPassword: {
        id: 'Registration.ConfirmPassword.Label',
        defaultMessage: 'Confirm password'
    },
    signUp: {
        id: 'Registration.SignUp.Button',
        defaultMessage: 'Sign up'
    },
    appName: {
        id: "Registration.AppName.Header",
        defaultMessage: 'ByeSpy'
    }
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true, unique: '/check_email_uniqueness'}),
    password: addValidation({required: true}),
    confirmPassword: addValidation({required: true, sameAs: 'password'}),
})

const Registration = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();

    const signUp = (callback) => post('/sign_up', {
        user: {
            email: formik.values.email,
            password: formik.values.password
        }
    }, callback);

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img src={logo} />
                <h2 className='app-name'>{formatMessage(messages.appName)}</h2>
                <form className='auth-form' onSubmit={e => {
                    e.preventDefault();
                    signUp(() => history.push('/login'));
                }}>
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
                            placeholder: formatMessage(messages.password),
                            icon: <Icon icon={lockIcon}/>
                        },
                        {
                            fieldType: 'password',
                            name: 'confirm_password',
                            placeholder: formatMessage(messages.confirmPassword)
                        },
                    ], formik, validationSchema)}
                    <button className='auth-general-btn' type="submit">{formatMessage(messages.signUp)}</button>
                </form>
            </div>
        </div>
    );
};

export default Registration;