import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Button from 'react-bootstrap/Button';
import CloseButton from 'react-bootstrap/CloseButton';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import Form from "react-bootstrap/Form";
import { toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import MapModal from './MapModal';
import { getCityAndProvnice } from '../../services/map.service';
import YesNoConfirmationModal from './YesNoConfirmationModal';


export default function TransportRequestReplyModal( props ) {

    const [ loading, setLoading ] = useState(0);
    const [ errors, setErrors ] = useState({});
    const [ reply, setReply ] = useState('');
    const [ city, setCity ] = useState('');
    const [ province, setProvince ] = useState('');
    const [ showMapModal, setShowMapModal ] = useState(false);
    const [ replyConfirmationModal, setReplyConfirmationModal] = useState({show: false});
    
    let address = props.request? props.request.address : null;

    useEffect(()=>{
        if (!props.showModal) return;
        if (!props.noRefresh){
            setLoading(0);
            setReply('');
            setErrors({});
        }
        address = props.request? props.request.address : null
        if (!address) return;
        getLocationNames();
    }, [props.showModal])

    const getLocationNames = async () => {
        const {city, province} = await getCityAndProvnice(address);
        setCity(city);
        setProvince(province);
    }

    const handleOnChange = e => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;    

        setReply(value)
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const findErrors = () => {
        let newErrors = {};
        
        if (!reply || reply === '') newErrors.reply = "Debe ingresar un mensaje de respuesta."
        if (reply && reply.length > 500) newErrors.reply = "El mensaje de respuesta no puede superar los 500 caracteres.";

        return newErrors;
    }

    const handleClose = () => {
        setLoading(0);
        setReply('');
        setErrors({});
        props.handleCloseModal();
        props.getTransport();
        props.reloadEvent();
    }

    const handleReplyConfirmation = (accept) => {
        const message = `¿Está seguro/a que desea ${accept? 'aceptar': 'rechazar'} esta solicitud? Esta acción es permanente.`;
        const title = `${accept? 'Aceptar': 'Rechazar'} solicitud de transporte`;
        props.setReplyModal(prev => ({...prev, showModal: false}));
        setReplyConfirmationModal({show: true, message: message, title: title, callback: ()=>handleReply(accept)});
    }

    const handleReply = async (accept) => {
        const message = accept? 'aceptada' : 'rechazada';

        const newErrors = findErrors()
        // Conditional logic:
        setReplyConfirmationModal({show: false});
        props.setReplyModal(prev => ({...prev, showModal: true, noRefresh: true}));
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
            console.log(newErrors);
        } else {
            setLoading(prev=>prev+1);
            try {
                const params = {
                    transport_id: props.transport.transport_id,
                    event_id: props.event_id,
                    subscriber_user_id: props.request.user_id,
                    subscriber_message: props.request.message,
                    subscriber_address: address,
                    message: reply,
                    accept: accept
                }
                await axios.post('../api/transport/answerApplicationSubscriber', params);
                toast.success(`Solicitud ${message} con éxito`);
                handleClose();
            } catch (error) {}
            setLoading(prev=>prev-1);
        }
    }

    return (
        <>
        <Modal show={props.showModal} onHide={props.handleClose} backdrop="static" className='Modal'>
            {props.request? <>
            <Modal.Header className="d-flex">
                <div>
                    <h4 className="text-primary-eventually">{props.reply? 'Aplicación' : 'Suscripción'} a transporte - {props.request.username}</h4>
                    {props.transport? <span>{props.transport.name}</span>: null}
                </div>
                <CloseButton className="me-2" onClick={handleClose}/>
            </Modal.Header>
            <Modal.Body>
                {props.reply? 
                <Form onSubmit={()=>{}}>
                    <Form.Group className="mb-2 d-flex flex-column" controlId="description">
                        <Form.Label>Mensaje de respuesta</Form.Label>
                        <Form.Control as="textarea" isInvalid={ !!errors.reply} placeholder="" name="reply" 
                            value={reply} maxLength={500} onChange={(e)=>handleOnChange(e)}/>
                        <Form.Control.Feedback type="invalid">{errors.reply}</Form.Control.Feedback>
                        <Form.Text className="text-end">{reply? reply.length: 0} de 500</Form.Text>
                    </Form.Group>
                </Form> : null}
                {props.reply?
                    <>
                        <h4>Mensaje:</h4>
                        <p className="ms-1">{props.request.message}</p>
                    </>
                :null}
                <h4>Dirección de búsqueda:</h4>
                <div className="d-flex gap-3 align-items-center">
                    <p className="m-0 ms-1">{address.street} {address.number}, {city}, {province}, Argentina</p>
                    <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={()=>setShowMapModal(true)}>
                        <FontAwesomeIcon icon={faLocationDot}/>
                    </Button>
                </div>
            </Modal.Body>
            {props.reply? 
                <Modal.Footer>
                    <Button className="btn-secondary-modal px-3" onClick={()=>handleReplyConfirmation(false)}>
                        Rechazar
                    </Button>
                    {!loading?
                        <Button className="btn-primary-modal px-3" onClick={()=>handleReplyConfirmation(true)}>
                            Aceptar
                        </Button> : 
                        <Button className="btn-primary-modal px-3" disabled>
                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                        </Button>
                    }
                </Modal.Footer> 
            : null}
            </> : null}
            <MapModal showModal={showMapModal} handleCloseModal={()=>setShowMapModal(false)} address={address} eventAddress={props.eventAddress} startingPointAddress={props.transport.starting_place}/>
        </Modal>
        <YesNoConfirmationModal
            showModal={replyConfirmationModal.show}
            title={replyConfirmationModal.title}
            message={replyConfirmationModal.message}
            handleCloseModal={()=>{setReplyConfirmationModal({show: false}); props.setReplyModal(prev => ({...prev, showModal: true, noRefresh: true}))}}
            handleConfirm={replyConfirmationModal.callback}
        />
        </>
    )
}
