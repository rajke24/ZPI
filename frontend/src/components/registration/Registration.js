import React from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import * as Yup from "yup";
import {buildMessages} from "../../common/commonMessages";
import {defineMessages, useIntl} from "react-intl";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {useHistory} from "react-router";
import {post} from "../../shared/ApiClientBuilder";

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
    welcome: {
        id: "Registration.InvalidEmailOrPassword.Header",
        defaultMessage: 'Welcome in ByeSpy'
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
        <div className='registration'>
            <h2>{formatMessage(messages.welcome)}</h2>
            <form onSubmit={e => {
                e.preventDefault();
                signUp(() => history.push('/login'));
            }}>
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
                    {
                        fieldType: 'password',
                        name: 'confirm_password',
                        label: messages.confirmPassword
                    },
                ], formik, validationSchema)}
                <button type="submit">{formatMessage(messages.signUp)}</button>
            </form>
        </div>
    );
};

export default Registration;