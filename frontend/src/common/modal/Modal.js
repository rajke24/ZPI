import React from 'react';
import './Modal.scss';

const Modal = ({title, toggle, onSave, onCancel, children}) => {
    return (
        <div className='modal-overlay'>
            <div className='modal'>
                <div className='modal-header'>
                    <span className='modal-title'>{title}</span>
                </div>
                <div className='modal-body'>
                    {children}
                </div>
                <div className='modal-footer'>
                    {onSave && <button className='save-btn' onClick={onSave}>Save</button>}
                    {onCancel && <button className='cancel-btn' onClick={onCancel}>Cancel</button>}
                </div>
            </div>
        </div>
    );
};

export default Modal;