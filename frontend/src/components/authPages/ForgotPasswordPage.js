import React, {useState} from 'react';
import './AuthPages.scss';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory} from "react-router";
import logo from '../../common/images/logo.svg';
import Icon, {lockIcon, mailIcon} from "../../common/icons/Icon";
import {save} from "../../shared/ApiClientBuilder";
import {doSave} from "../../common/form/FormHelpers";
import FormFeedback from "../../common/form/FormFeedback";
import {Link} from "react-router-dom";

const messages = buildMessages(defineMessages({
    email: {
        id: 'ForgotPasswordPage.Email.Placeholder',
        defaultMessage: 'E-mail'
    },
    requestPasswordChange: {
        id: 'ForgotPasswordPage.RequestPasswordChange.Button',
        defaultMessage: 'Request password change'
    },
    changedMind: {
        id: 'ForgotPasswordPage.ChangedMind.Label',
        defaultMessage: 'Changed your mind ?'
    },
    signIn: {
        id: 'ForgotPasswordPage.SignIn.Link',
        defaultMessage: 'SIGN IN'
    }
}));

const validationSchema = Yup.object().shape({
    email: addValidation({email: true, required: true}),
})

const ForgotPasswordPage = () => {
    const {formatMessage} = useIntl();
    const [notification, setNotification] = useState();
    const history = useHistory();

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    });

    const actions = {
        requestPasswordChange: (params, callback) => save('/forgot_password', 'POST', params, callback)
    }

    const requestPasswordChange = e => {
        e.preventDefault();

        doSave(formik, (values) => {
            actions.requestPasswordChange({email: values.email}, (notification) => setNotification(notification));
        })
    }

    return (
        <div className='auth-page'>
            <div className='auth-panel'>
                <img onClick={() => history.push('/login')} src={logo} alt={formatMessage(messages.appName)}/>
                <h1 style={{marginBottom: notification ? '20px' : '50px'}} className='app-name'>{formatMessage(messages.appName)}</h1>
                {notification && <FormFeedback success={notification.success} full={true}>{notification.message}</FormFeedback>}
                <form className='auth-form' onSubmit={e => requestPasswordChange(e)}>
                    {buildFields([
                        {
                            fieldType: 'input',
                            name: 'email',
                            placeholder: formatMessage(messages.email),
                            icon: <Icon icon={mailIcon}/>
                        }
                    ], formik, validationSchema)}
                    <button className='primary-btn' type="submit">{formatMessage(messages.requestPasswordChange)}</button>
                    <div className='labeled-link'>
                        {formatMessage(messages.changedMind)}
                        <Link className='auth-link' to='/login'>{formatMessage(messages.signIn)}</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;