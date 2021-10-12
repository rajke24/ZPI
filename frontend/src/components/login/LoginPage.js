import React from 'react';
import './LoginPage.scss';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";

const messages = buildMessages(defineMessages({
    email: {
        id: 'LoginPage.Email.Label',
        defaultMessage: 'E-mail'
    },
    password: {
        id: 'LoginPage.Password.Label',
        defaultMessage: 'Password'
    },
    signIn: {
        id: 'LoginPage.SignIn.Button',
        defaultMessage: 'Sign in'
    },
    signUp: {
        id: 'LoginPage.SignUp.Button',
        defaultMessage: 'Sign up'
    },
    invalidEmailOrPassword: {
        id: "LoginPage.InvalidEmailOrPassword.Message",
        defaultMessage: "E-mail or password is invalid."
    },
    welcome: {
        id: "LoginPage.InvalidEmailOrPassword.Header",
        defaultMessage: 'Welcome in ByeSpy'
    }
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true}),
    // password: addValidation({required: true}),
})

const LoginPage = () => {
    const formik = useDefaultFormik({
        validationSchema,
        initialState: {}
    })
    const {formatMessage} = useIntl();
    return (
        <div className='login-page'>
            <h2>{formatMessage(messages.welcome)}</h2>
            <form>
                {buildFields([
                    {
                        fieldType: 'input',
                        name: 'email',
                        label: formatMessage(messages.email)
                    },
                    // {
                    //     fieldType: 'password',
                    //     name: 'password',
                    //     label: formatMessage(messages.password)
                    // },
                ], formik, validationSchema)}
                <button>{formatMessage(messages.signIn)}</button>
                <button>{formatMessage(messages.signUp)}</button>
            </form>
        </div>
    );
};

export default LoginPage;