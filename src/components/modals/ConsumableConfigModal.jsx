import React, {useState, useEffect} from 'react';
import axios from "axios";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Spinner from "react-bootstrap/Spinner";
import CloseButton from "react-bootstrap/CloseButton";
import Placeholder from "react-bootstrap/Placeholder";
import BootstrapSwitchButton from 'bootstrap-switch-button-react'
import InfoModal from './InfoModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import Snackbar from '@mui/material/Snackbar';
import Alert from '../Alert';
import { toast } from 'react-toastify';
import { getMyUserId } from '../../shared/shared-methods.util';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function ConsumableConfigModal( props ) {
    const [ consumable, setConsumable ] = useState({...props.consumable});
    const [ errors, setErrors ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ subscribeQuantity, setSubscribeQuantity] = useState(1);
    const [ showSuccessModal, setShowSuccessModal] = useState(false);
    const [ showSubscribeAlert, setShowSubscribeAlert ] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('');

    useEffect(()=>{
        if (!props.showModal) return;
        getConsumable();
        setErrors({});
        setSubscribeQuantity(1);
    },[props.showModal]);

    const myUser = getMyUserId();

    const getConsumable = async () => {
        setLoading(prev=>prev+1);
        setConsumable({name: props.consumable.name, description: props.consumable.description});
        if (props.event_id && props.consumable.consumable_id){
            try{
                const res = await axios.get(`../api/consumable/getConsumable?event_id=${props.event_id}&consumable_id=${props.consumable.consumable_id}`);
                const resConsumable = res.data;
                setConsumable(resConsumable);
            } catch (error){}
        }
        setLoading(prev=>prev-1);
    }

    const findErrors = () => {
        const newErrors = {};

        if (!consumable.name || consumable.name === '') newErrors.name = "Debe ingresar un nombre."
        else if (consumable.name.length > 30) newErrors.name = "El nombre no puede superar los 30 caracteres."

        if (consumable.description && consumable.description.length > 300) newErrors.description = "La descripción no puede superar los 300 caracteres.";

        if (subscribeQuantity && !Number.isInteger(subscribeQuantity)) newErrors.subscribeQuantity = "La cantidad sólo puede ser un número entero.";
        else if (!subscribeQuantity) newErrors.subscribeQuantity = "La cantidad no puede ser 0.";

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

    const isSubscriber = () => {
        return (consumable.subscribers && consumable.subscribers.filter(c => c.user_id === myUser).length);
    }

    const handleOnChange = (e) => {
        const name = e.target.name;
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;

    
        setConsumable({...consumable, [name]: value});
        if ( !!errors[name] ) setErrors({...errors, [name]: null});
    }

    const handleChangeQuantity = (e) => {
        const value = e.target.value;

        if(!Number.isNaN(value) && value >= 0 && value <100) {
            setSubscribeQuantity(Number(value));
            setErrors({...errors, subscribeQuantity: null});
        }
    }

    const handleSubscribe = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {
                event_id: props.event_id,
                consumable_id: consumable.consumable_id,
                // quantity: subscribeQuantity
            };
            if (consumable.quantifiable) params.quantity = subscribeQuantity;
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.post('../api/consumable/subscribeToConsumable', params);
                toast.success('Te suscribiste a ' + consumable.name);
                getConsumable();
                props.reloadEvent();
            } catch (error) {}
            setLoading(prev=>prev-1);
        }
    }

    const handleUnsubscribe = async (e, user_id = null) => {
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = {
                event_id: props.event_id,
                consumable_id: consumable.consumable_id,
                user_id: user_id? user_id : myUser, 
            };
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.post('../api/consumable/unsubscribeToConsumable', params);
                if (!user_id) toast.success('Te desuscribiste a ' + consumable.name)
                getConsumable();
                props.reloadEvent();
            } catch (error) {}
            setLoading(prev=>prev-1);
        }
    }

    const handleSubmit = async (e) => {
        if (!props.modify){
            props.handleCloseModal();
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        // get our new errors
        const newErrors = findErrors()
        // Conditional logic:
        if ( Object.keys(newErrors).length > 0 ) {
          // We got errors!
            setErrors(newErrors);
        } else {
            const params = consumable;
            params.event_id = props.event_id;
            delete params.subscribers;
            try {
                setLoading(prev=>prev+1);
                setErrors({});
                await axios.put('../api/consumable/updateConsumable', params);
                props.handleCloseModal();
                setModalMesage('¡Consumible modificado con éxito!')
                setShowSuccessModal(true);
            } catch (error) {
                setResponseErrors(error);
            }
            setLoading(prev=>prev-1);
        }
    }


    return (
        <>
        <Modal show={props.showModal} onHide={props.handleCloseModal} backdrop="static" size="lg" className='Modal'>
            <Modal.Header className="d-flex justify-content-between mx-3">
                <div>
                    <span>Consumible</span>
                    <Modal.Title>{consumable.name}</Modal.Title>
                    <p style={{wordBreak: "break-word", marginBottom: "0"}}>{consumable.description}</p>
                </div>
                {!props.modify? 
                    loading?
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>
                        :
                        <CloseButton className="me-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}></CloseButton> 
                    :null}
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                {loading ?
                    <div className="d-flex flex-column align-items-center gap-2" style={{width: '90%'}}>
                        {props.modify?
                            <>
                                <Placeholder animation="wave" className="m-1 rounded"
                                    style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                                />
                                <Placeholder animation="wave" className="m-1 rounded"
                                    style={{backgroundColor: 'var(--text-ultra-muted)', height: '6rem', width: '100%'}}
                                />
                            </>
                        :null}
                        <div className="d-flex flex-column w-80-sm gap-1 mt-3">
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                            />
                            <Placeholder animation="wave" className="m-1 rounded" 
                                style={{backgroundColor: 'var(--text-ultra-muted)', height: '3rem', width: '100%'}}
                            />
                        </div>
                    </div>
                    :
                    <Form style={{width: '90%'}} onSubmit={handleSubmit}>
                        {props.modify? 
                        <>
                            <Form.Group className="mb-1 d-flex flex-column" controlId="name">
                                <Form.Label className="mb-1">Nombre <span className="text-tertiary">*</span></Form.Label>
                                <Form.Control 
                                    isInvalid={ !!errors.name } 
                                    placeholder="" 
                                    name="name" 
                                    autoComplete="off" 
                                    disabled={!props.modify} 
                                    value={consumable.name} 
                                    maxLength={30} 
                                    onChange={handleOnChange}
                                />
                                <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-1 d-flex flex-column" controlId="description">
                                <Form.Label className="mb-1">Descripción</Form.Label>
                                <Form.Control as="textarea" isInvalid={ !!errors.description } placeholder="" name="description" disabled={!props.modify} 
                                            value={consumable.description} onChange={handleOnChange} maxLength={300}/>
                                {props.modify? <Form.Text className="text-end">{consumable.description?  consumable.description.length: 0} de 300</Form.Text> : null}
                                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                            </Form.Group>
                        </>
                        : null}
                        {consumable.subscribers && consumable.subscribers.length? 
                        <>
                            <h3>Suscriptores</h3>
                            <div className="mb-1 events-card px-4 py-2" style={{maxHeight: "40vh", overflow: "auto"}}>
                                {consumable.subscribers.map((subscriber, key) => {
                                    return (
                                        <Card className='participant-info card mb-2' style={{gap: '0.5rem'}} key={key}>
                                            <Card.Body className="d-flex align-items-center gap-3">
                                                <div className='flex-grow-1'>
                                                    <h5>{subscriber.name} {subscriber.lastname}</h5>
                                                    <span>{subscriber.username}</span>
                                                </div>
                                                <h2 className="text-tertiary mb-0">{subscriber.quantity}</h2>
                                                {props.modify?<Button className="delete-btn d-flex" onClick={(e)=>handleUnsubscribe(e, subscriber.user_id)}><FontAwesomeIcon icon={faTimesCircle}/></Button>:null}
                                            </Card.Body>
                                        </Card>
                                )})}
                            </div> 
                        </>
                        : 
                        <h4 className="mb-3">{loading? "Cargando suscriptores" :"No hay suscriptores todavía"}</h4>
                        }
                        <div className="d-flex flex-column justify-content-center align-items-center m-2 add-button" style={{gap: '0.5rem'}}>
                            {!isSubscriber() && props.permissions.SUBSCRIBE_TO_CONSUMABLE?
                            <>
                                {consumable.quantifiable? 
                                    <Form.Group className="mb-1 d-flex flex-column" controlId="formGridAddress2">
                                        <div className="d-flex align-items-center" style={{gap: '0.5rem'}}>
                                            <Form.Label className="m-0">¿Cuántos/as vas a consumir?</Form.Label>
                                            <Form.Control className="form-input" type="text" autoComplete="off" 
                                                isInvalid={!!errors.subscribeQuantity} 
                                                placeholder="" 
                                                name="subscribeQuantity" 
                                                value={subscribeQuantity} 
                                                onChange={(e)=>{handleChangeQuantity(e)}}  
                                                style={{maxWidth: !errors.subscribeQuantity? '3rem': '6rem', margin: 'auto'}}/>
                                        </div>
                                        <span className='text-danger'>{errors.subscribeQuantity}</span>
                                    </Form.Group>: null}
                                <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={handleSubscribe}>
                                    <FontAwesomeIcon size="lg" icon={faPlusCircle}/>
                                    &nbsp;Suscribirse
                                </Button> 
                            </>
                            :
                            <>
                                {props.permissions.UNSUBSCRIBE_TO_CONSUMABLE? 
                                    <Button className="btn btn-primary-body btn-add d-flex align-items-center py-1" onClick={handleUnsubscribe}>
                                        <FontAwesomeIcon size="lg" icon={faMinusCircle}/>
                                        &nbsp;Desuscribirse
                                    </Button> : null}
                            </>
                            }
                        </div>
                    </Form>
                }
            </Modal.Body>
            {props.modify?
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={()=>{props.handleCloseModal(); props.reloadEvent()}}>
                    Cancelar
                </Button>
                {!loading?
                    <Button className="btn-primary-modal px-3" onClick={handleSubmit}>
                        Guardar
                    </Button> :
                    <Button className="btn-primary-modal px-3" disabled>
                        <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                    </Button>
                }
            </Modal.Footer> 
            : null}
        </Modal>
        <InfoModal
            showModal={showSuccessModal}
            handleCloseModal={()=>{setShowSuccessModal(false); props.reloadEvent();}}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        </>
    );
}
