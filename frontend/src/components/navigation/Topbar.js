import React, {useState} from 'react';
import './Topbar.scss';
import Avatar from "../../common/avatar/Avatar";
import {useSelector} from "react-redux";
import {useLocation} from "react-router";
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import {post} from "../../shared/ApiClientBuilder";
import * as Yup from "yup";
import {addValidation} from "../../common/form/FromSchemaBuilder";
import {doSave} from "../../common/form/FormHelpers";
import FormFeedback from "../../common/form/FormFeedback";

const validationSchema = Yup.object().shape({
    invitee_email: addValidation({email: true, required: true, unique: '/invitations/check'}),
})

const Topbar = () => {
    const {pathname} = useLocation();
    const [showInviteInput, setShowInviteInput] = useState(false);
    const [invitationSent, setInvitationSent] = useState(false);
    const profile = useSelector(state => state.persistentState.profile);
    const title = pathname.split('/')[1]

    const formik = useDefaultFormik({
        initialValues: {invitee_email: ''},
        validationSchema
    })

    const actions = {
        sendInvitation: (params, callback) => post('/invitations', params, callback)
    }

    const sendInvitation = async event => {
        event.preventDefault();

        doSave(formik, (values) => {
            actions.sendInvitation({invitee_email: values.invitee_email}, () => {
                setShowInviteInput(false);
                setInvitationSent(true);
                formik.setFieldValue('invitee_email', '')
                setTimeout(() => setInvitationSent(false), 5000)
            })
        })
    }

    const inviteButtonFunction = (e) => {
        if (showInviteInput && formik.values.invitee_email.length === 0) {
            setShowInviteInput(false);
            formik.setErrors({})
        }
        else if (!showInviteInput)
            setShowInviteInput(true);
        else sendInvitation(e)
    }

    return (
        <div className='topbar'>
            <span className='title'>{title}</span>
            <div className='right-side'>
                {showInviteInput && <form>
                    {buildFields([
                        {
                            fieldType: 'input',
                            name: 'invitee_email',
                            placeholder: 'email',
                        }
                    ], formik, validationSchema)}
                </form>}
                {invitationSent && <FormFeedback success>Invitation sent!</FormFeedback>}
                <button className='invite-btn' onClick={inviteButtonFunction}>{!showInviteInput || formik.values.invitee_email ? 'Invite new friend' : 'Hide'}</button>
                <span>{profile.username}</span>
                <Avatar color='#000000' name={profile.email}/>
            </div>
        </div>
    );
};

export default Topbar;