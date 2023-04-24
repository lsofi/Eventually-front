import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Spinner from "react-bootstrap/Spinner";
import InfoModal from './InfoModal';
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from 'react-bootstrap/Card';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { mongoDateToLocalDate } from '../../shared/shared-methods.util';

import SuccessPhoneGirl from "../../resources/images/SuccessPhoneGirl.png";

export default function ServiceAddToEventModal(props) {

    const [ errors, setErrors ] = useState({});
    const [ loadingAdd, setLoadingAdd ] = useState(false);
    const [ showSuccessModal, setShowSuccessModal ] = useState(false);
    const [ modalMessage, setModalMesage ] = useState('¡Solicitud realizada con éxito!');
    const [ selectedEvent, setSelectedEvent ] = useState({});
    const [ selectedService, setSelectedService ] = useState({});
    const [ eventsToAddService, setEventsToAddService ] = useState([]);
    const [ addRequest, setAddRequest ] = useState({});

    useEffect(() => {
        setAddRequest({});
        setErrors({});
        setSelectedEvent({});
        if(props.showModal){
            // //console.log("Show modal de serviceAddToEvent", props.showModal);
            setSelectedService(props.service);
            getEventsToAdd();
        }
    }, [props.showModal])

    const getEventsToAdd = async () => {
        try{
            setLoadingAdd(true);
            const res = await axios.get('../api/event/getEventsToAddService');
            const events = res.data;
            setEventsToAddService(events);
        }catch(error){
            setEventsToAddService([]);
        }
        setLoadingAdd(false)
    }

    const findErrors = () => {
        const newErrors = {};
        if (!addRequest.date_service) newErrors.date_service = "Debe ingresar una fecha estimada para el servicio."
        if (!addRequest.time_service) newErrors.time_service = "Debe ingresar una hora estimada para el servicio."
        if (!selectedEvent.event_id) newErrors.event_id = "Debe seleccionar un evento a solicitarle servicios."
        return newErrors;
    }

    const handleSelectEvent = (e) => {
        const value = e.target.value;
        const event = eventsToAddService.filter(event => {return event.event_id === value})[0]; 

        // //console.log('Event', event)
        setSelectedEvent(event);

        setAddRequest({...addRequest, time_service: event.start_time, date_service: event.start_date})
        // //console.log(addRequest)
        setErrors({ ...errors, event_id: null });
    }

    const handleRemoveEvent = () => {
        setSelectedEvent({});
    }

    const handleCancel = () => {
        setSelectedService({});
        setSelectedEvent({});
        setAddRequest({});
        setErrors({});
        props.handleCloseModal();
    }

    const handleOnChange = (e) => {
        const name = e.target.name; // Acá el nombre del target sería el task, el nombre del Control.
        const value = e.target.value; // Acá el valor que va tomando ese target es el texto dentro del Control.
        // //console.log('Request antes de cambiar', addRequest)
        setAddRequest({ ...addRequest, [name]: value });
        if (!!errors[name]) setErrors({ ...errors, [name]: null });
    }

    const handleConfirm = async (e) => {
        // Cuando se hace un submit de un form, hay comportamientos por defecto que se realizan al ejecutarse dicho submit. Estas dos líneas previenen algunos de esos comportamientos.
        e.preventDefault();
        e.stopPropagation();
        // //console.log('Servicio apenas apreto confirmar: ', addRequest)
        // get our new errors
        const newErrors = findErrors();
        // Conditional logic:
        if (Object.keys(newErrors).length > 0) {
            // We got errors!
            setErrors(newErrors);
        }
        else {
            try {
                setLoadingAdd(true);
                const params = {
                    service_id: selectedService._id,
                    event_id: selectedEvent.event_id,
                    date_service: addRequest.date_service,
                    time_service: addRequest.time_service
                };
                // //console.log('Service', props.service)
                // //console.log('Params', params)
                // //console.log('addRequest', addRequest)
                // Cambiar el link por la API para registrar tarea
                const res = await axios.post('../api/service/addServiceToEvent', params);
                props.handleCloseModal();
                setModalMesage('¡Solicitud realizada con éxito!');
                setShowSuccessModal(true);
            } catch (error) {
                // //console.log(error)
            }
            setLoadingAdd(false);
        }
    }

    return (
        <>
            <Modal show={props.showModal} onHide={handleCancel} backdrop="static" className='Modal' style={{zIndex: '10000'}}>
                <Modal.Header>
                    <Modal.Title>Agregar a Evento</Modal.Title>
                </Modal.Header>
                <Modal.Body className="d-flex flex-column justify-content-center align-items-center">
                    <Form style={{ width: '90%' }} onSubmit={handleConfirm}>
                        <Form.Group className="mb-6 d-flex flex-column" controlId="event">
                            <Form.Label>Evento <span className="text-tertiary">*</span></Form.Label>
                            {selectedEvent && selectedEvent.event_id ?
                                <Card className='participant-info'>
                                    <Card.Body>
                                        <Row className="px-3">
                                            <Col className='col-participant'>
                                                <h6 className='m-0'>{selectedEvent.title}</h6>
                                                <span>{`Inicio: ${mongoDateToLocalDate(selectedEvent.start_date)} ${selectedEvent.start_time} hs `}</span>
                                            </Col>
                                            <Col className='col-participant d-flex align-items-center' xs={2} md={1}>
                                                <Button className="delete-btn d-flex" onClick={handleRemoveEvent}><FontAwesomeIcon icon={faTimesCircle} /></Button>
                                            </Col>
                                        </Row>
                                    </Card.Body>
                                </Card>
                                :
                                <>
                                    <Form.Select 
                                        defaultValue="" 
                                        name="event" 
                                        isInvalid={!!errors.event_id} 
                                        value={selectedEvent ? selectedEvent.event_id : ''} 
                                        onChange={handleSelectEvent}
                                    >
                                        <option value={''}>Elegí el evento a agregar el servicio...</option>
                                        {eventsToAddService.map((event, key) => {
                                            return (
                                                <option key={key} value={event ? event.event_id : null}>{event ? event.title : ''}</option>
                                            )
                                        })}
                                    </Form.Select>
                                </>
                            }
                            <span className="text-danger mt-1" style={{fontSize: '0.9rem'}}>{errors.event_id}</span>
                        </Form.Group>
                        <Row className="d-flex align-items-start">
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="date_service">
                                    <Form.Label className='m-1'>Fecha del servicio <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control 
                                        name="date_service" 
                                        isInvalid={!!errors.date_service} 
                                        value={addRequest.date_service}
                                        type="date" 
                                        placeholder="Ingresá la fecha del servicio"
                                        onChange={handleOnChange}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.date_service}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col xs={12} md={6}>
                                <Form.Group className="mb-3" controlId="time_service">
                                    <Form.Label className='m-1'>Hora del servicio <span className="text-tertiary">*</span></Form.Label>
                                    <Form.Control 
                                        name="time_service" 
                                        isInvalid={!!errors.time_service} 
                                        value={addRequest.time_service} 
                                        type="time" 
                                        placeholder="Ingresá la hora del servicio"
                                        onChange={handleOnChange}>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">{errors.time_service}</Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                    </Form>
                    <p>¡Se enviará un email al prestador de servicio!</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button className="btn-secondary-modal px-3" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    {!loadingAdd ?
                        <Button className="btn-primary-modal px-3" onClick={handleConfirm}>
                            Enviar
                        </Button> :
                        <Button className="btn-primary-modal px-3" disabled>
                            <Spinner as="span" animation="border" role="status" size='sm' aria-hidden="true"/>&nbsp;Cargando...
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
            <InfoModal
                showModal={showSuccessModal}
                handleCloseModal={() => setShowSuccessModal(false)}
                message={modalMessage}
                img={SuccessPhoneGirl}
            />
        </>
    )
}