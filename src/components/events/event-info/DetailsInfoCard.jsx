import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { faInfoCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import DropFileInput from "../../drag-drop-file-input/DropFileInput";
import CropEasy from "../../crop/CropEasy";
import { imageResize } from '../../../shared/imageResizer';
import InfoModal from '../../modals/InfoModal';
import CroppingModal from '../../modals/CroppingModal';

import SuccessPhoneGirl from "../../../resources/images/SuccessPhoneGirl.png";
import { toast } from "react-toastify";

export default function DetailsInfoCard(props) {

    const [ photo, setPhoto ] = useState('');
    const [ openCrop, setOpenCrop ] = useState(false);
    const [ photoURL, setPhotoURL ] = useState(null);
    const [ showInfoModal, setShowInfoModal ] = useState(false);
    const [ cropping, setCropping ] = useState(0);
    
    const helpText = 'En esta tarjeta podrás modificar la foto de portada del evento.';

    const currentFileList = () => {
        if (props.event.details && props.event.details.photo && Array.isArray(props.event.details.photo))
            return props.event.details.photo;
        else return [];
    }

    const [fileList, setFileList] = useState(currentFileList);

    const onFileChange = (files) => {
        const file = files[0];
        if(!validFilesFormat(file)) return;
        setPhotoURL(URL.createObjectURL(file));
        setOpenCrop(true);
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const onFileDrop = (e) => {
        const newFile = e.target.files[0];
        if (newFile) {
            const updatedList = [newFile];
            setFileList(updatedList);
            onFileChange(updatedList);
        }
    }

    const fileRemove = (file) => {
        const updatedList = [...fileList];
        updatedList.splice(fileList.indexOf(file), 1);
        setFileList(updatedList);
        onFileChange(updatedList);
    }

    const submitPhoto = async(file) => {
        setCropping(prev=>prev+1);
        let eventPhoto = await imageResize(file, 200);
        eventPhoto = await toBase64(eventPhoto);
        props.handleOnChangePhoto(eventPhoto);
        const params = {photo: eventPhoto, event_id:props.event.event_id}
        try{
            const res = await axios.post('../api/photos/updloadEventPhoto', params);
            setShowInfoModal(true);
            props.setModify(false);
            props.reloadEvent();
        } catch (error){}
        setCropping(prev=>prev-1)
    }

    const isValidExtension = (file)=> {
        const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
        return allowedExtensions.exec(file.name);
    }
    
    const isValidSize = (file)=> {
        return file.size <= 1e7
    }

    const validFilesFormat = (file) => {
        if(!isValidExtension(file)) {
            toast.error('El formato del archivo elegido no es el correcto.')
            return false
        }
        if(!isValidSize(file)) {
            toast.error('El tamaño máximo de la foto es de 10 MB.');
            return false
        }
        return true;
    }

    return (
        <div className="info-card">
            <div>
                <div className='d-flex justify-content-between'>
                    <div className='d-flex gap-3 align-items-center'>
                        <h4 className="mb-0">Foto de Portada</h4>
                        <OverlayTrigger placement='bottom-start' overlay={<Popover bsPrefix="popover-help">{helpText}</Popover>}>
                            <FontAwesomeIcon icon={faInfoCircle} className="expand-icon"/>
                        </OverlayTrigger>
                    </div>
                    {props.event.details && props.modify? <CloseButton onClick={()=>{props.handleOnRemove('details'); setFileList([])}}/>: null}
                </div>
                    <hr className="mx-0 my-1" style={{height: '2px'}}/>
                <form>
                    {!props.event.photo?<Form.Group className="mb-6" controlId="">
                        <Form.Label>Agregar foto de portada</Form.Label>
                        <DropFileInput onFileChange={(files) => onFileChange(files)} fileList={fileList} onFileDrop={onFileDrop} fileRemove={fileRemove} modify={props.modify}/>
                    </Form.Group> :
                    <div className="d-flex flex-column align-items-center py-3 gap-3">
                        <img src={props.event.photo} alt="Foto de evento" style={{borderRadius: '1rem'}} />
                        {props.modify? <DropFileInput onFileChange={(files) => onFileChange(files)} fileList={fileList} onFileDrop={onFileDrop} fileRemove={fileRemove} modify={props.modify}/> : null}
                    </div>
                    }
                </form>
            </div>
            {openCrop ? <CropEasy {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} aspect_ratio={16/9} round={false}/> : null}
            <InfoModal 
                showModal={showInfoModal}
                handleCloseModal={()=>setShowInfoModal(false)}
                title="Cambiar foto de evento"
                message="Foto de evento actualizada con éxito"
                img={SuccessPhoneGirl}
            />
            <CroppingModal showModal={cropping} />        
        </div>
    );
} 