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

const validationSchema = Yup.object().shape({
    invitee_email: addValidation({email: true, required: true, unique: '/invitations/check'}),
})

const Topbar = () => {
    const {pathname} = useLocation();
    const [showInviteInput, setShowInviteInput] = useState(false);
    const profile = useSelector(state => state.persistentState.profile);
    const title = pathname.split('/')[1]

    const formik = useDefaultFormik({
        initialValues: {},
        validationSchema
    })

    const actions = {
        sendInvitation: (params, callback) => post('/invitations', params, callback)
    }

    const sendInvitation = async event => {
        event.preventDefault();

        doSave(formik, (values) => {
            actions.sendInvitation({invitee_email: values.invitee_email})
        })
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
                <button className='invite-btn' onClick={showInviteInput ? sendInvitation : () => setShowInviteInput(true)}>Invite new friend</button>
                <span>{profile.email}</span>
                <Avatar color='#000000' name='Jarek A'/>
            </div>
        </div>
    );
};

export default Topbar;