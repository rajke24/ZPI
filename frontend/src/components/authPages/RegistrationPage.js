import React, {useState} from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory} from "react-router";
import {post} from "../../shared/ApiClientBuilder";
import './AuthPages.scss';
import logo from "../../common/images/logo.svg";
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";
import {Link} from "react-router-dom";
import {doSave} from "../../common/form/FormHelpers";

const messages = buildMessages(defineMessages({
    email: {
        id: 'RegistrationPage.Email.Placeholder',
        defaultMessage: 'E-mail'
    },
    password: {
        id: 'RegistrationPage.Password.Placeholder',
        defaultMessage: 'Password'
    },
    confirmPassword: {
        id: 'RegistrationPage.ConfirmPassword.Placeholder',
        defaultMessage: 'Confirm password'
    },
    signUp: {
        id: 'RegistrationPage.SignUp.Button',
        defaultMessage: 'Sign up'
    },
    signIn: {
        id: 'RegistrationPage.SignIn.Link',
        defaultMessage: 'SIGN IN'
    },
    alreadyHaveAccount: {
        id: 'RegistrationPage.alreadyHaveAccount.Text',
        defaultMessage: 'Already have an account ?'
    },
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true, unique: '/check_email_uniqueness'}),
    password: addValidation({required: true, min: 8, max: 255}),
    confirmPassword: addValidation({required: true, min: 8, max: 255, sameAs: 'password'}),
})

const RegistrationPage = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();
    const [registeredSuccessfully, setRegisteredSuccessfully] = useState(false);

    const signUp = (callback) => post('/sign_up', {
        user: {
            email: formik.values.email,
            password: formik.values.password
        }
    }, callback);

    const registerUser = e => {
        e.preventDefault()

        doSave(formik, (values) => {
            signUp(() => {
                setRegisteredSuccessfully(true)
                formik.setSubmitting(false);
            })
        })
    }

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img onClick={() => history.push('/login')} src={logo}/>
                <h2 className='app-name'>{formatMessage(messages.appName)}</h2>
                <form className='auth-form' onSubmit={e => registerUser(e)}>
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
                            name: 'confirmPassword',
                            placeholder: formatMessage(messages.confirmPassword)
                        },
                    ], formik, validationSchema)}
                    <button className='primary-btn' type="submit">{formatMessage(messages.signUp)}</button>
                    <div className='labeled-link'>
                        {formatMessage(messages.alreadyHaveAccount)}
                        <Link className='auth-link' to='/login'>{formatMessage(messages.signIn)}</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegistrationPage;