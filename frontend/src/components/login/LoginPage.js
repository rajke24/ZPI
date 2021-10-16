import React, {useEffect, useState} from 'react';
import './LoginPage.scss';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory, useParams} from "react-router";
import {login} from "./LoginPageActions";
import {useDispatch} from "react-redux";
import {save} from "../../shared/ApiClientBuilder";

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
    password: addValidation({required: true}),
})

const LoginPage = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();
    const dispatch = useDispatch();
    const params = useParams();
    const [error, setError] = useState(null);
    const [accountActivated, setAccountActivated] = useState(false);
    const activationToken = params.activation_token

    const actions = {
        login: login(dispatch),
        activateAccount: (callback) => save('/activate_account', "PUT", {activation_token: activationToken}, callback)
    };

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    useEffect(() => {
        if (activationToken) actions.activateAccount(() => {
            setAccountActivated(true)
        })
    }, [activationToken])

    const saveUser = (e) => {
        e.preventDefault()
        setError(null);
        const {email, password} = formik.values;
        actions.login(email, password, () => {
            setError(formatMessage(messages.invalidEmailOrPassword))
            formik.setSubmitting(false);
        })
    };

    return (
        <div className='login-page'>
            <h2>{formatMessage(messages.welcome)}</h2>
            {accountActivated && <span>Account has been activated successfully</span>}
            <form onSubmit={e => saveUser(e)}>
                {buildFields([
                    {
                        fieldType: 'input',
                        name: 'email',
                        label: messages.email
                    },
                    {
                        fieldType: 'password',
                        name: 'password',
                        label: messages.password
                    },
                ], formik, validationSchema)}
                {error && <span className='text-error'>{error}</span>}
                <button type="submit">{formatMessage(messages.signIn)}</button>
                <button onClick={() => history.push('/registration')}>{formatMessage(messages.signUp)}</button>
            </form>
        </div>
    );
};

export default LoginPage;