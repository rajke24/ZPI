import React, {useEffect, useState} from 'react';
import {buildFields, useDefaultFormik} from "../../common/form/FromItemBuilder";
import {get, post} from "../../shared/ApiClientBuilder";
import ReceivedInvitation from "./ReceivedInvitation";
import SentInvitation from "./SentInvitation";
import * as classnames from "classnames";
import './Invitations.scss';

const Invitations = () => {
    const formik = useDefaultFormik({
        initialValues: {},
    })
    const [invitations, setInvitations] = useState();
    const [activeTab, setActiveTab] = useState('received');

    const actions = {
        fetchInvitations: (callback) => get('/invitations', null, callback)
    }

    useEffect(() => actions.fetchInvitations(data => setInvitations(data)) ,[activeTab])

    return (
        <div className='invitations'>
            <div className='tabs'>
                <button id='receivedTab' className={classnames('tab', {active: activeTab === 'received'})} onClick={() => setActiveTab('received')}>Received</button>
                <button id='sentTab' className={classnames('tab', {active: activeTab === 'sent'})} onClick={() => setActiveTab('sent')}>Sent</button>
            </div>
            {invitations && <div>
                {activeTab === 'received' ?
                    invitations[activeTab].map(invitation => <ReceivedInvitation invitation={invitation}/>) :
                    invitations[activeTab].map(invitation => <SentInvitation invitation={invitation}/>)
                }
            </div>}
        </div>
    );
};

export default Invitations;