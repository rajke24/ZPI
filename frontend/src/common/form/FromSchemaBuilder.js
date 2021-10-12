import {defineMessages} from "react-intl";
import {buildMessages} from "../commonMessages";
import axios from "axios";
import * as Yup from "yup";

const messages = buildMessages(defineMessages({
    required: {
        id: "Validation.IsRequired.Message",
        defaultMessage: "is required"
    },
    minLength: {
        id: "Validation.MinLength.Message",
        defaultMessage: "min length: {min}"
    },
    maxLength: {
        id: "Validation.MaxLength.Message",
        defaultMessage: "max length: {max}"
    },
    email: {
        id: "Validation.Email.Message",
        defaultMessage: "is not email"
    },
    alreadyExists: {
        id: "Validation.AlreadyExists.Message",
        defaultMessage: "already exists"
    },
    same: {
        id: "Validation.NotTheSame.Message",
        defaultMessage: "don't match"
    },
    number: {
        id: "Validation.Number.Message",
        defaultMessage: "must be a number"
    },
    invalid: {
        id: "Validation.IsInvalid.Message",
        defaultMessage: "is invalid"
    }
}));


export const unique = (url, id, value) => {
    const config = {
        url: url,
        params: {id, value}
    };
    return axios.request(config).then(t => t.data);
};

export const addValidation = (attributes) => {
    let yup = Yup.string().nullable();
    if (attributes.type === 'number') {
        yup = Yup.number().typeError({message: messages.number}).nullable();
    }
    if (attributes.required) {
        yup = yup.required({message: messages.required});
    }
    if (attributes.min) {
        yup = yup.min(attributes.min, {message: messages.minLength, params: {min: attributes.min}});
    }
    if (attributes.max) {
        yup = yup.max(attributes.max, {message: messages.minLength, params: {max: attributes.max}});
    }
    if (attributes.email) {
        yup = yup.email({message: messages.email});
    }
    if (attributes.emails) {
        yup = Yup.array().test({
            name: "emails",
            test: function (val) {
                let invalid = val.some(v => !Yup.string().email().isValidSync(v.email));
                return invalid ? this.createError({message: {message: messages.email}}) : true;
            }
        })

    }
    if (attributes.unique) {
        yup = yup.test('unique', {message: messages.alreadyExists}, function (val) {
                // don't change to arrow function - there won't be this
                const id = this.resolve(Yup.ref('id')) ? this.resolve(Yup.ref('id')) : attributes.id;
                return unique(attributes.unique, id, val);
            }
        );
    }
    if (attributes.sameAs) {
        yup = yup.oneOf(
            [Yup.ref(attributes.sameAs)],
            {message: messages.same},
        )
    }

    return yup;
}