import React, {useState} from 'react';
import * as classnames from "classnames";
import Profile from "./Profile";

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className='settings'>
            <div className='tabs'>
                <button className={classnames('tab', {active: activeTab === 'profile'})} onClick={() => setActiveTab('profile')}>Profile</button>
            </div>
            <div>
                {activeTab === 'profile' && <Profile />}
            </div>
        </div>
    );
};

export default Settings;