import React, {useState} from 'react';
import './Invitation.scss';
import Avatar from "../../common/avatar/Avatar";
import {remove, save} from "../../shared/ApiClientBuilder";
import {useSelector} from "react-redux";
import {createConversation, downloadAndStoreImage} from "../../storage/db";

const ReceivedInvitation = ({invitation}) => {
    const [invitationStatus, setInvitationStatus] = useState();
    const profile = useSelector(state => state.persistentState.profile);

    downloadAndStoreImage(invitation.inviter.id)

    const actions = {
        manageInvitation: (data, callback) => save(`/invitations/${invitation.id}`, 'PUT', data, callback)
    }

    const acceptInvitation = () => {
        const {inviter} = invitation;
        actions.manageInvitation({status: 'accepted'}, () => setInvitationStatus('accepted'));
        createConversation(profile, inviter);
    }

    const rejectInvitation = () => {
        actions.manageInvitation({status: 'rejected'}, () => setInvitationStatus('rejected'))
    }

    return (
        <div className='invitation'>
            <div className='left-side'>
                <Avatar color='#000000' name='zaproszony' avatar_id={"zaproszenie_od_" + invitation.inviter.id} user_id={invitation.inviter.id}/>
                <p className='username'>{invitation.inviter.email}</p>
            </div>
            <div className='right-side'>
                {invitationStatus ?
                    <div className={`status ${invitationStatus}`}>
                        {invitationStatus}
                    </div> :
                    <div className='action-buttons'>
                        <button className='accept-btn' onClick={acceptInvitation}>
                            Accept
                        </button>
                        <button className='reject-btn' onClick={rejectInvitation}>
                            Reject
                        </button>
                    </div>}
            </div>
        </div>
    );
};

export default ReceivedInvitation;