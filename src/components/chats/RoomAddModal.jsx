import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import Card from "react-bootstrap/Card";
import Badge from "react-bootstrap/Badge";
import InfoModal from '../modals/InfoModal';
import axios from 'axios';
import { getMyUserId } from '../../shared/shared-methods.util';
import ParticipantsAddModal from '../modals/ParticipantsAddModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { userIsInArray } from '../../shared/shared-methods.util';
import { imageResize } from '../../shared/imageResizer';
import DropFileInput from '../drag-drop-file-input/DropFileInput';
import LoadingModal from '../modals/LoadingModal';
import CroppingModal from '../modals/CroppingModal';
import CropEasy from '../crop/CropEasy';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";
import { toast } from "react-toastify";

export default function RoomAddModal (props) {

    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(0);
    const [ modalLoading, setModalLoading] = useState(0);
    const [ roomAdd, setRoomAdd ] = useState({});
    const [ infoModal, setInfoModal ] = useState({show: false});
    const [ showParticipantsAddModal, setShowParticipantsAddModal ] = useState(false);
    
    const [ fileList, setFileList ] = useState([]);
    const [ photo, setPhoto ] = useState('');
    const [ openCrop, setOpenCrop ] = useState(false);
    const [ photoURL, setPhotoURL ] = useState(null);
    const [ cropping, setCropping ] = useState(0);

    const myUserId = getMyUserId();

    const getRoomParticipants = () => {
        return props.participants.filter(participant => (userIsInArray(participant, roomAdd.participants)))
    } 

    const getMyUser = () => {
        return props.participants.filter(participant => participant.user_id === myUserId)
    }

    const findErrors = () => {
        const newErrors = {};
        
        if (!roomAdd.name) newErrors.name = "Por favor ingrese un nombre de sala";

        if (!roomAdd.participants || !roomAdd.participants.length) newErrors.participants = "Debe agregar al menos un participante para crear la sala";

        return newErrors;
    }

    const setResponseErrors = (axiosError) => {
        try {
            const messages = axiosError.response.data.message;
            messages.forEach(message => {
                const messageArr = message.split('#');
                const field = messageArr[0];
                const errorMsg = messageArr[1];
                setErrors(prev => ({...prev, [field]: errorMsg}));
            });
        } catch (error) {}
    }

    const handleCancel = () => {
        setRoomAdd({});
        setErrors({});
        props.handleCloseModal();
    }

    const handleOnChange = (e) =>{
        const name = e.target.name; // Acá el nombre del target sería el task, el nombre del Control.
        const value = e.target.value; // Acá el valor que va tomando ese target es el texto dentro del Control.
        setRoomAdd(prev=> ({...prev, [name]: value}));
        if ( !! errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleSetParticipants = (participants) => {
        const participantsAux = participants.map(participant => ({user_id: participant.user_id}));
        setRoomAdd(prev => ({...prev, participants: participantsAux}));
        if (errors.participants) setErrors(prev => ({...prev, participants: null}));
    }

    const openParticipantsAddModal = () => {
        props.handleCloseModal();
        setShowParticipantsAddModal(true);
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const submitPhoto = async(file) => {
        setCropping(prev=>prev+1);
        let servicePhoto = file

        servicePhoto = await imageResize(file, 100);

        servicePhoto = await toBase64(servicePhoto);

        setRoomAdd({...roomAdd, photo: servicePhoto})
        setCropping(prev=>prev-1);
    }

    const onFileChange = async (files) => {
        const file = files[0];
        if (!validFilesFormat(file)) return;
        setPhotoURL(URL.createObjectURL(file));
        setOpenCrop(true);
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

    const handleConfirm = async (e) => {
        // Cuando se hace un submit de un form, hay comportamientos por defecto que se realizan al ejecutarse dicho submit. Estas dos líneas previenen algunos de esos comportamientos.
        e.preventDefault(); 
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors();
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        }
        else {
            setLoading(prev => prev + 1);
            const participants = [{user_id: myUserId}, ...roomAdd.participants];
            try{
                const params = { 
                    event_id: props.event_id,
                    name: roomAdd.name,
                    participants: participants.map(participant => (participant.user_id)),
                    room_photo: roomAdd.photo
                };
                await axios.post('../api/chats/startEventChatRoom', params); 
                handleCancel();
                setInfoModal({show: true, message: '¡Sala creada con éxito!'});
            } catch (error){
                setResponseErrors(error);
            }
            setLoading(prev => prev - 1);
        }
    }

    return(
        <>
        <Modal show={props.showModal} onHide={handleCancel} size="lg" backdrop="static" className='Modal'>
            <Modal.Header>
                <Modal.Title>Agregar sala</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {/* <h5 className="text-center">{props.message}</h5> */}
                <Form style={{width: '90%'}} onSubmit={handleConfirm}>
                    <Form.Group>
                        <Form.Label>Nombre <span className="text-tertiary">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            name="name" autoComplete="off"
                            isInvalid={ !!errors.name}
                            placeholder="Ingresá el nombre de la sala"
                            value={roomAdd.name}
                            onChange={handleOnChange}
                            maxLength={50}
                        />
                        <Form.Control.Feedback 
                            type="invalid">
                                {errors.name}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className="mb-6" controlId="photo">
                        <Form.Label>{roomAdd.photo? 'Foto de sala' : "Agregar foto de sala"}</Form.Label>
                            {roomAdd.photo? 
                                <div className='w-100 d-flex justify-content-center'>
                                    <img 
                                        src={photoURL} 
                                        alt="Foto de sala" 
                                        style={{width: '200px', borderRadius: '50%', marginBottom: '1rem'}}
                                    />
                                </div>
                                : 
                                null
                            }
                        <DropFileInput 
                            onFileChange={(files) => onFileChange(files)} 
                            fileList={fileList} 
                            onFileDrop={onFileDrop} 
                            fileRemove={fileRemove} 
                            modify={true}
                        />
                    </Form.Group>
                </Form>
                <Card className='mx-3 w-100 mt-4'>
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                            <h5>Participantes</h5>
                            {errors.participants?
                                <span className='text-danger'>{errors.participants}</span>
                                : null
                            }
                        </div>
                        <Button className="btn btn-primary-body gap-2 btn-add d-flex align-items-center py-2" 
                                title="Editar participantes" onClick={openParticipantsAddModal}>
                            <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                            <FontAwesomeIcon size="lg" icon={faUser}/>
                        </Button>
                    </Card.Header>
                    <Card.Body className="list-container">
                        <div className="expense-card" style={{maxHeight: "40vh", overflow: "auto"}}>
                            {getMyUser().map((participant, key)=> (
                                <div className='d-flex flex-row align-items-center card mb-2 py-1 px-2 ' style={{gap: '0.5rem'}} key={key}>
                                    <div className="d-flex flex-grow-1 justify-content-between align-items-center px-2 ">
                                        <div>
                                            <h5>{participant.name} {participant.lastname}</h5>
                                            <span>{participant.username}</span>
                                        </div>
                                        <Badge pill style={{color: 'var(--text-title)'}}>Tú</Badge>
                                    </div>
                                </div>
                            ))}
                            {roomAdd.participants && roomAdd.participants.length?
                                getRoomParticipants().map((participant, key) => (
                                    <div className='d-flex flex-row align-items-center card mb-2 py-1 px-2 ' style={{gap: '0.5rem'}} key={key}>
                                        <div className="d-flex flex-grow-1 justify-content-between align-items-center px-2 ">
                                            <div>
                                                <h5>{participant.name} {participant.lastname}</h5>
                                                <span>{participant.username}</span>
                                            </div>
                                        </div>
                                    </div>
                            )) : null}
                        </div> 
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleCancel}>
                    Cancelar
                </Button>
                {!loading?
                    <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                        Confirmar
                    </Button> : 
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer>
        </Modal>
        <InfoModal
            showModal={infoModal.show}
            handleCloseModal={()=>setInfoModal({show: false})}
            message={infoModal.message}
            img={SuccessPhoneGirl}
        />
        <LoadingModal 
            showModal={modalLoading}
        />
        <ParticipantsAddModal
            title={`Agregar participantes a sala`}
            subtitle="Sala de chat"
            showModal={showParticipantsAddModal}
            setSubscribers={handleSetParticipants}
            handleCloseModal={()=>{setShowParticipantsAddModal(false); props.handleOpenModal()}}
            participants={props.participants}
            currentSubscribers={roomAdd.participants}
            notEmpty={true}
            notMyself
            name="participantes"
        />
        {openCrop ? 
            <CropEasy 
                {...{ photoURL, setOpenCrop, setPhotoURL, setPhoto, submitPhoto}} 
                aspect_ratio={1/1} 
                round={true} 
                setModalLoading={setCropping}/> 
            : 
            null
            }
        <CroppingModal showModal={cropping} />
        </>
    )
}