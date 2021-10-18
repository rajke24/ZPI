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
import {Link} from "react-router-dom";
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";
import {doSave} from "../../common/form/FormHelpers";
import FormFeedback from "../../common/form/FormFeedback";

const messages = buildMessages(defineMessages({
    email: {
        id: 'LoginPage.Email.Placeholder',
        defaultMessage: 'E-mail'
    },
    password: {
        id: 'LoginPage.Password.Placeholder',
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
    forgotPassword: {
        id: "LoginPage.ForgotPassword.Link",
        defaultMessage: 'FORGOT PASSWORD ?'
    },
    successfulAccountActivation: {
        id: "LoginPage.SuccessfulAccountActivation.Link",
        defaultMessage: 'Account has been activated successfully'
    },
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

    console.log(formik.errors)

    useEffect(() => {
        if (activationToken) actions.activateAccount(() => {
            setAccountActivated(true)
        })
        setTimeout(() => setAccountActivated(false), 3000)
    }, [activationToken])

    const saveUser = (e) => {
        e.preventDefault()
        doSave(formik, (values) => {
            setError(null);
            const {email, password} = values;
            actions.login(email, password, () => {
                setError(formatMessage(messages.invalidEmailOrPassword))
                formik.setSubmitting(false);
            })
        })
    };

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img src={logo} alt={formatMessage(messages.appName)}/>
                <h1 className='app-name'>{formatMessage(messages.appName)}</h1>
                {accountActivated && <FormFeedback success={true} full={true}>{formatMessage(messages.successfulAccountActivation)}</FormFeedback>}
                {error && <FormFeedback error={true} full={true}>{error}</FormFeedback>}
                <form className='auth-form' onSubmit={e => saveUser(e)}>
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
                    ], formik, validationSchema)}
                    <Link className='auth-link'
                          to='/forgot_password'>{formatMessage(messages.forgotPassword)}</Link>
                    <button className='auth-general-btn' type="submit">{formatMessage(messages.signIn)}</button>
                    <button className='auth-side-btn'
                            onClick={() => history.push('/registration')}>{formatMessage(messages.signUp)}</button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;