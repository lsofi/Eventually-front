import React, { useState, useEffect } from 'react';
import { userIsInArray } from '../../shared/shared-methods.util';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faMinusCircle, faPlusCircle, faCheckCircle} from '@fortawesome/free-solid-svg-icons';
import InfoModal from './InfoModal';
import { toast } from 'react-toastify';
import { getMyUserId } from '../../shared/shared-methods.util';

import DefaultProfilePhotoDog from "../../resources/images/DefaultProfilePhotoDog.png"
import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png"

export default function TaskAddModal (props) {

    const [ errors, setErrors ] = useState({});
    const [ loadingAdd, setLoadingAdd ] = useState(false);
    const [ showSuccessModal, setShowSuccessModal ] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('¡Tarea agregada con éxito!');
    const [ participantsList, setParticipantsList] = useState([]);

    const myUserId = getMyUserId();
    
    useEffect(()=>{
        if (!props.showModal) return;
        const participantsAux = props.participants.map(element => { 
            if (props.expense) 
                return (
                    props.expense.subscribers && userIsInArray(element, props.expense.subscribers)? {...element, isSubscriber: true, quantity: getQuantity(element)} : {...element, isSubscriber: false, quantity: 1}
                )
            else if (props.currentSubscribers)
                return (
                    props.currentSubscribers && userIsInArray(element, props.currentSubscribers)? {...element, isSubscriber: true, quantity: 1} : {...element, isSubscriber: false, quantity: 1}
                )
            else 
                return (
                    {...element, isSubscriber: false, quantity: 1}
                )
        });
        setParticipantsList(participantsAux);
    },[props.showModal])

    const getQuantity = (participant) => {
        const quantity = props.expense.subscribers.filter(element => {return element.user_id === participant.user_id})[0].quantity
        return quantity > 1? quantity : 1;
    }

    const handleCancel = () => {
        props.handleCloseModal();
    }

    const handleConfirm = () => {
        const name = props.name? props.name : 'suscriptores';
        const subscribersList = []
        participantsList.forEach(element => {
            if (element.isSubscriber) subscribersList.push({user_id: element.user_id, quantity: element.quantity});
        });
        if (props.notEmpty && !subscribersList.length) {
            toast.error(`La lista de ${name} no puede estar vacía.`);
            return;
        };
        props.setSubscribers(subscribersList);
        props.handleCloseModal();
    }

    const addSubscriber = (participant) => {
        const participantsAux = participantsList.map(element => {
            return (
                element.user_id === participant.user_id? {...element, isSubscriber: !element.isSubscriber}: element
            )
        });
        setParticipantsList(participantsAux);
    }

    const removeSubscriber = (participant) => {
        const participantsAux = participantsList.map(element => {
            return (
                element.user_id === participant.user_id? {...element, isSubscriber: false}: element
            )
        });
        setParticipantsList(participantsAux);
    }

    const addQuantity = (participant) => {
        const newQuantity = participant.quantity + 1;
        const participantsAux = participantsList.map(element => {
            return (
                element.user_id === participant.user_id? {...element, quantity: newQuantity}: element
            )
        });
        setParticipantsList(participantsAux);
    }

    const substractQuantity = (participant) => {
        const newQuantity = participant.quantity > 1?  participant.quantity - 1 : 1;
        const participantsAux = participantsList.map(element => {
            return (
                element.user_id === participant.user_id? {...element, quantity: newQuantity}: element
            )
        });
        setParticipantsList(participantsAux);
    }

    const handleImportSubscribersFromConsumable = (e) => {
        try {
            const value = e.target.value;
            const consumable = props.consumables.find(consumable => (consumable.consumable_id === value));

            props.setSubscribers(consumable.subscribers)
            props.handleCloseModal();
        } catch (error){
            toast.error('Hubo un error al importar los suscriptores');
        }
        
    }

    return(
        <>
        <Modal show={props.showModal} onHide={handleCancel} backdrop="static" className="Modal" size="lg">
            <Modal.Header className="d-flex flex-column align-items-start">
                <span>{props.subtitle}</span>
                <Modal.Title>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                <Row className="w-100">
                    <Col md={6}>
                        <span>Suscriptores</span>
                        {participantsList.filter(element => {return element.isSubscriber}).map((participant, key)=>{
                            return(
                                <Card key={key} className='m-1 participant-info'>
                                <Card.Body style={{borderRadius: "0.5rem"}}>
                                    <Row>
                                        <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                            <div className={`${participant.subscriptionType === 'premium'? 'premium-subscription-img-container img-outline-sm':''}`}
                                                title={`${participant.subscriptionType === 'premium'? 'Usuario premium':''}`}>
                                                <img src={participant.profile_photo? participant.profile_photo : DefaultProfilePhotoDog} className="organizer-photo"></img>
                                            </div>
                                        </Col>
                                        <Col className='col-participant flex-grow-1'>
                                            <h6 className='m-0'>{participant.username}</h6>
                                            <span>{participant.name + ' ' + participant.lastname}</span>
                                        </Col>
                                        {props.expense && props.expense.quantifiable?<Col className="flex-grow-0 d-flex align-items-center">
                                            <div className="d-flex flex-column" style={{gap: "0.5rem"}}>
                                                <FontAwesomeIcon size="md" icon={faPlusCircle} onClick={()=>addQuantity(participant)}/>
                                                <FontAwesomeIcon size="md" icon={faMinusCircle} onClick={()=>substractQuantity(participant)}/>
                                            </div>
                                        </Col>: null}
                                        {props.expense && props.expense.quantifiable?<Col className="flex-grow-0 d-flex align-items-center">
                                            <h4 className="text-tertiary m-0">{participant.quantity}</h4>
                                        </Col>: null}
                                        <Col className="d-flex flex-grow-0 align-items-center">
                                            <Button className="delete-btn d-flex" onClick={()=>removeSubscriber(participant)}>
                                                <FontAwesomeIcon icon={faTimesCircle}/>
                                            </Button>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            );
                        })}
                    </Col>
                    <Col md={6}>
                        <span>Participantes</span>
                        {participantsList.map((participant, key)=>{
                            if (props.notMyself && participant.user_id === myUserId) return null;
                            return(
                                <Card key={key} className='m-1 participant-info' onClick={()=>addSubscriber(participant)}>
                                    <Card.Body style={{borderRadius: "0.5rem"}}>
                                        <Row>
                                            <Col className='d-flex align-items-center col-participant flex-grow-0'>
                                                <div className={`${participant.subscriptionType === 'premium'? 'premium-subscription-img-container':''}`}
                                                    title={`${participant.subscriptionType === 'premium'? 'Usuario premium':''}`}>
                                                    <img src={participant.profile_photo? participant.profile_photo : DefaultProfilePhotoDog} className="organizer-photo"></img>
                                                </div>
                                            </Col>
                                            <Col className='col-participant flex-grow-1' onClick={()=>addSubscriber(participant)}>
                                                <h6 className='m-0'>{participant.username}</h6>
                                                <span>{participant.name + ' ' + participant.lastname}</span>
                                            </Col>
                                            {participant.isSubscriber?
                                                <Col className="flex-grow-0 d-flex align-items-center px-3">
                                                    <FontAwesomeIcon icon={faCheckCircle} style={{fontSize: '1.5rem', color: 'green'}}/>
                                                </Col>
                                            : null}
                                        </Row>
                                    </Card.Body>
                                </Card>
                            );
                        })}
                    </Col>
                </Row>
                { props.consumables?
                    <div className="d-flex flex-column justify-content-center">
                        <h4 className="text-center">O</h4>
                        <Form.Group className="mb-6 d-flex flex-column" controlId="import_subscribers">
                            <Form.Label>Importar suscriptores de consumible:</Form.Label>
                            <Form.Select name="import_subscribers"
                                    onChange={(e)=>handleImportSubscribersFromConsumable(e)}>
                                        <option value={''}> Elegí un consumible...</option>
                                        {props.consumables.map((consumable, key) =>{
                                            const quantifiable = consumable.quantifiable? true : false;
                                            if (consumable.subscribers && consumable.subscribers.length && quantifiable == props.expense.quantifiable)
                                            return(
                                                <option key={key} value={consumable? consumable.consumable_id: undefined}>{consumable? consumable.name: ''}</option>
                                            )
                                        })}
                            </Form.Select>
                        </Form.Group>
                    </div> :null}
            </Modal.Body>
            <Modal.Footer>
                <Button className="btn-secondary-modal px-3" onClick={handleCancel}>
                    Cancelar
                </Button>
                <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                    Confirmar
                </Button> 
            </Modal.Footer>
        </Modal>
        <InfoModal
            showModal={showSuccessModal}
            handleCloseModal={()=>setShowSuccessModal(false)}
            message={modalMessage}
            img={SuccessPhoneGirl}
        />
        </>
    )
}