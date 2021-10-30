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
import {get, save} from "../../shared/ApiClientBuilder";
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
    sixDigitCode: {
        id: 'LoginPage.SixDigitCode.Placeholder',
        defaultMessage: '6-digit code'
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
    invalidCode: {
        id: "LoginPage.InvalidEmailOrPassword.Message",
        defaultMessage: "Code is invalid."
    },
    forgotPassword: {
        id: "LoginPage.ForgotPassword.Link",
        defaultMessage: 'FORGOT PASSWORD ?'
    },
    successfulAccountActivation: {
        id: "LoginPage.SuccessfulAccountActivation.Link",
        defaultMessage: 'Account has been activated successfully'
    },
    verify: {
        id: "LoginPage.Verify.Button",
        defaultMessage: 'Verify'
    },
    verifying: {
        id: "LoginPage.Verifying.Button",
        defaultMessage: 'Verifying...'
    },
    codeNotReceived: {
        id: "LoginPage.CodeNotReceived.Label",
        defaultMessage: "Didn't receive code ?"
    },
    resendCode: {
        id: "LoginPage.ResendCode.Link",
        defaultMessage: 'RE-SEND CODE'
    },
    twoFactorAuthInfo: {
        id: "LoginPage.TwoFactorAuthInfo.Text",
        defaultMessage: 'We just sent you a message via email with your authentication code. Enter the code in the form below to verify your identity. \n'
    }
}));

const validationSchemas = [
    Yup.object().shape({
        email: addValidation({email: true, required: true}),
        password: addValidation({required: true, min: 8, max: 255}),
    }),
    Yup.object().shape({
        authenticationCode: addValidation({required: true, min: 6, max: 6})
    })
];

const LoginPage = () => {
    const {formatMessage} = useIntl();
    const history = useHistory();
    const dispatch = useDispatch();
    const params = useParams();

    const [error, setError] = useState(null);
    const [verifyingCode, setVerifyingCode] = useState(false);
    const [page, setPage] = useState(1);
    const [accountActivated, setAccountActivated] = useState(false);
    const activationToken = params.activation_token;

    const actions = {
        login: login(dispatch),
        activateAccount: (callback) => save('/activate_account', "PUT", {activation_token: activationToken}, callback),
        authorizeUserFirstStep: (params, callback) => get('/authorize_user_first_step', params, callback),
        resendAuthCode: () => get('/resend_auth_code', {
            email: formik.values.email,
            password: formik.values.password
        }, () => setVerifyingCode(false))
    };

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema: validationSchemas[page - 1]
    });

    useEffect(() => {
        if (activationToken) actions.activateAccount(() => {
            setAccountActivated(true)
        })
        setTimeout(() => setAccountActivated(false), 3000)
    }, [activationToken])

    const firstStepVerification = e => {
        e.preventDefault();

        doSave(formik, (values) => {
            const {email, password} = values;
            actions.authorizeUserFirstStep({email, password}, (response) => {
                if (response.user_exists) {
                    setError(null);
                    setPage(2);
                }
                else setError(formatMessage(messages.invalidEmailOrPassword));
                formik.setSubmitting(false);
            })
        });
    }

    const loginUser = (e) => {
        e.preventDefault();
        setVerifyingCode(true);

        doSave(formik, (values) => {
            setError(null);
            const {email, password, authenticationCode} = values;
            actions.login(email, password, authenticationCode, () => {
                setError(formatMessage(messages.invalidCode))
                formik.setSubmitting(false);
            })
        })
    };

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img src={logo} alt={formatMessage(messages.appName)} onClick={() => setPage(1)}/>
                <h1 className='app-name'>{formatMessage(messages.appName)}</h1>
                {accountActivated && <FormFeedback success={true}
                                                   full={true}>{formatMessage(messages.successfulAccountActivation)}</FormFeedback>}
                {error && <FormFeedback error={true} full={true}>{error}</FormFeedback>}
                {page === 1 ? <form className='auth-form' onSubmit={e => firstStepVerification(e)}>
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
                        ], formik, validationSchemas[0])}
                        <Link className='auth-link'
                              to='/forgot_password'>{formatMessage(messages.forgotPassword)}</Link>
                        <button className='primary-btn' type="submit">{formatMessage(messages.signIn)}</button>
                        <button className='secondary-btn'
                                onClick={() => history.push('/registration')}>{formatMessage(messages.signUp)}</button>
                    </form> :
                    <form className='auth-form'>
                        <p className='two-factor-auth-info'>{formatMessage(messages.twoFactorAuthInfo)}</p>
                        {buildFields([
                            {
                                fieldType: 'input',
                                name: 'authenticationCode',
                                placeholder: formatMessage(messages.sixDigitCode)
                            }
                        ], formik, validationSchemas[1])}
                        <button className='primary-btn'
                                onClick={e => loginUser(e)}>{verifyingCode ? formatMessage(messages.verifying) : formatMessage(messages.verify)}</button>
                        <div className='labeled-link'>
                            {formatMessage(messages.codeNotReceived)}
                            <Link className='auth-link' to='/login'
                                  onClick={actions.resendAuthCode}>{formatMessage(messages.resendCode)}</Link>
                        </div>
                    </form>}
            </div>
        </div>
    );
};

export default LoginPage;