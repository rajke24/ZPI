import React from 'react';
import * as classnames from "classnames";
import './FormFeedback.scss';

const FormFeedback = ({children, success, full}) => {
    return (
        <div className={classnames('feedback', {'success': success, 'error': !success, 'full': full})}>
            {children}
        </div>
    );
};

export default FormFeedback;