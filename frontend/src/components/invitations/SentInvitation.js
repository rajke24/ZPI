import React, {useEffect, useState} from 'react';
import './Invitation.scss';
import Avatar from "../../common/avatar/Avatar";
import {remove} from '../../shared/ApiClientBuilder';
import {useSelector} from "react-redux";
import db, {createConversation} from "../../storage/db";

const get_invitee_avatar = async (invitation) => {
    const needed_id = invitation.invitee.id
    db.avatarData.get(needed_id).then(result => {
        if(result === undefined) {
            console.log("No avatar for this user");
            return null
        } else {
            return result.avatar
        }
    });
}

const SentInvitation = ({invitation}) => {
    const [deleted, setDeleted] = useState(false);
    const isPendingInvitation = invitation.status === 'pending'
    const profile = useSelector(state => state.persistentState.profile)

    const actions = {
        deleteInvitation: (callback) => remove(`/invitations/${invitation.id}`, callback)
    };

    useEffect(() => {
        return () => {
            if (!isPendingInvitation) actions.deleteInvitation();
        }
    }, [])

    return (
        <div className='invitation'>
            <div className='left-side'>
                <Avatar image={get_invitee_avatar(invitation)} color='#000000' name='zaproszony'/>
                <p className='username'>{invitation.invitee.email}</p>
            </div>
            <div className='right-side'>
                {!deleted && <div className={`status ${invitation.status}`}>
                    {invitation.status}
                </div>}
                {isPendingInvitation && <div className='action-buttons'>
                    {!deleted ?
                        <button className='reject-btn' onClick={() => actions.deleteInvitation(() => setDeleted(true))}>
                            Cancel
                        </button> :
                        <div className={`status rejected`}>
                            Canceled
                        </div>}
                </div>}
            </div>
        </div>
    );
};

export default SentInvitation;