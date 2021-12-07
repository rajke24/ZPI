import React, {useCallback, useState} from "react";
import {useDropzone} from 'react-dropzone'
import * as dropzoneActions from './FormHelpers';
import {defineMessages, useIntl} from "react-intl";
import {buildMessages} from "../commonMessages";
import './FormAvatar.scss';
import * as classnames from 'classnames';
import Icon, {deleteIcon} from "../icon/Icon";
import formField from "./FormField";
import Avatar from "../avatar/Avatar";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {getCroppedImg} from "../utils";
import Modal from "../modal/Modal";
import {useSelector} from "react-redux";


const messages = buildMessages(defineMessages({
    tapHere: {
        id: 'FormAvatar.TapHere.Label',
        defaultMessage: 'Tap here'
    },
    toUpload: {
        id: 'FormAvatar.ToUpload.Label',
        defaultMessage: 'to upload {object}'
    }
}));

const FormAvatar = ({value, label, name, crop, onChange}) => {
    const actions = dropzoneActions;
    const [cropImage, setCropImage] = useState(null)
    const [cropAspect, setCropAspect] = useState({width: 350, height: 350, aspect: 1});
    const [croppedImageElement, setCroppedImageElement] = useState(null)
    const profile = useSelector(state => state.persistentState.profile);

    const {formatMessage} = useIntl();

    const uploadCroppedImage = async e => {
        e.preventDefault()
        const croppedImg = await getCroppedImg(croppedImageElement, cropAspect, cropImage.fileName)
        console.log(croppedImg)
        actions.upload([croppedImg], () => {
        }, file => {
            onChange(name, file);
            setCropImage(null)
        });
    }

    const onDrop = useCallback(files => {
        if (crop) {
            setCropImage({url: URL.createObjectURL(files[0]), fileName: files[0].path})
        } else {
            actions.upload(files, () => {
            }, file => {
                onChange(name, file);
            });
        }
    }, [])

    const onDelete = e => {
        e.stopPropagation();
        onChange(name, null);
    };

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

    return <>
        <div {...getRootProps()}
             className={classnames("avatar-dropzone", {'active': isDragActive})}>
            <input {...getInputProps()} />
            {value ? <Avatar big url={value.small_url} avatar_id={"drop_zone_avatar_" + profile.id} user_id={profile.id}/> : <div className="empty-avatar">
                <b>{formatMessage(messages.tapHere)}</b>
                <div>{formatMessage(messages.toUpload, {object: label && formatMessage(label)})}</div>
            </div>
            }
            {value && <button onClick={onDelete} className="delete-button">
                <Icon icon={deleteIcon}/>
            </button>}
        </div>

        {cropImage && <Modal onSave={uploadCroppedImage} onCancel={() => setCropImage(null)}>
            <div>
                <ReactCrop
                    src={cropImage.url}
                    crop={cropAspect}
                    minWidth={350}
                    minHeight={350}
                    keepSelection={true}
                    onImageLoaded={(image) => setCroppedImageElement(image)}
                    onChange={newCrop => setCropAspect(newCrop)}
                />
            </div>
        </Modal>
        }
    </>
};

export default formField(FormAvatar);