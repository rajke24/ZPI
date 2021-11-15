import React from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import {post} from "../../shared/ApiClientBuilder";

const Invitations = () => {
    const formik = useDefaultFormik({
        initialValues: {},
    })

    const actions = {
        sendInvitation: (params, callback) => post('/invitation', params, callback)
    }

    const sendInvitation = async event => {
        event.preventDefault();
        const {invitee_email} = formik.values;
        actions.sendInvitation({invitee_email})
    }

    return (
        <div style={{background: '#fff'}}>
            {buildFields([
                {
                    fieldType: 'input',
                    name: 'invitee_email',
                    placeholder: 'email',
                }
            ], formik, null)}
            <button onClick={sendInvitation}>send invitation</button>
        </div>
    );
};

export default Invitations;